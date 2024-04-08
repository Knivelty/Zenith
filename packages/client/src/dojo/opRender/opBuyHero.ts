import { Account, RpcProvider } from "starknet";
import { IWorld } from "../generated/typescript/contracts.gen";
import { ClientComponents } from "../createClientComponents";
import { getComponentValueStrict } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { poseidonHashMany } from "micro-starknet";
import { logDebug } from "../../ui/lib/utils";
import { uuid } from "@latticexyz/utils";

export const opBuyHero = async (
    { client }: { client: IWorld },
    { Player, Altar, Piece, PlayerInvPiece, PlayerProfile }: ClientComponents,
    rpcProvider: RpcProvider,
    account: Account,
    altarSlot: number,
    invSlot: number
) => {
    const playerEntity = getEntityIdFromKeys([BigInt(account.address)]);
    const playerProfile = getComponentValueStrict(PlayerProfile, playerEntity);
    const player = getComponentValueStrict(Player, playerEntity);
    const altar = getComponentValueStrict(Altar, playerEntity);
    const playerInvEntity = getEntityIdFromKeys([
        BigInt(account.address),
        BigInt(invSlot),
    ]);

    // check
    if (player.coin <= 0 || player.inventoryCount >= 6) {
        alert("cannot buy");
        return;
    }

    playerProfile.pieceCounter += 1;

    const pieceGid = Number(
        poseidonHashMany([
            BigInt(account.address),
            BigInt(playerProfile.pieceCounter),
        ]) & BigInt(0xffffffff)
    );
    const pieceEntity = getEntityIdFromKeys([BigInt(pieceGid)]);

    const creatureId = Number(Object.entries(altar)[altarSlot][1]);

    player.coin -= 1;
    player.inventoryCount += 1;

    logDebug(`generate gid ${pieceGid}`);

    const pieceOverUuid = uuid();
    Piece.addOverride(pieceOverUuid, {
        entity: pieceEntity,
        value: {
            gid: pieceGid,
            owner: BigInt(account.address),
            idx: 0,
            slot: invSlot,
            level: 1,
            creature_index: creatureId,
            x: 0,
            y: 0,
        },
    });

    // altar override
    const altarOverride = uuid();
    const altarArray = Object.entries(altar);
    altarArray[altarSlot][1] = 0;
    Altar.addOverride(altarOverride, {
        entity: playerEntity,
        value: altarArray.reduce(
            (accumulator, [key, value]) => {
                accumulator[key] = value;
                return accumulator;
            },
            {} as { [key: string]: any }
        ),
    });

    // player inv piece override
    const playerInvOverride = uuid();
    PlayerInvPiece.addOverride(playerInvOverride, {
        entity: playerInvEntity,
        value: {
            owner: BigInt(account.address),
            slot: invSlot,
            gid: pieceGid,
        },
    });

    // player override
    const playerOverride = uuid();
    Player.addOverride(playerOverride, {
        entity: playerEntity,
        value: player,
    });

    // player profile override
    const playerProfileOverride = uuid();
    PlayerProfile.addOverride(playerProfileOverride, {
        entity: playerEntity,
        value: playerProfile,
    });

    try {
        const tx = await client.home.buyHero({
            account,
            altarSlot,
            invSlot,
        });
        await rpcProvider.waitForTransaction(tx.transaction_hash, {
            retryInterval: 1000,
        });
    } catch (e) {
        console.error(e);
        throw e;
    } finally {
        Piece.removeOverride(pieceOverUuid);
        Altar.removeOverride(altarOverride);
        PlayerInvPiece.removeOverride(playerInvOverride);
        Player.removeOverride(playerOverride);
        PlayerProfile.removeOverride(playerProfileOverride);
    }
};
