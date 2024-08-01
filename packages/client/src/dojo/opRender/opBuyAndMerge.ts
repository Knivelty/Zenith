import { Account, RpcProvider } from "starknet";
import { IWorld } from "../generated/typescript/contracts.gen";
import { ClientComponents } from "../createClientComponents";
import { getComponentValueStrict } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import {
    getPieceEntity,
    logDebug,
    waitForComponentOriginValueCome,
    waitForPromiseOrTxRevert,
} from "../../ui/lib/utils";
import { poseidonHashMany } from "micro-starknet";
import { uuid } from "@latticexyz/utils";

export const opBuyAndMerge = async ({
    clientComponents: { Player, PlayerProfile, Altar, Piece, CreatureProfile },
    client,
    rpcProvider,
    account,
    gid2,
    gid3,
    altarSlot,
    onBoardIdx,
    x,
    y,
    invSlot,
}: {
    rpcProvider: RpcProvider;
    clientComponents: ClientComponents;
    client: IWorld;
    account: Account;
} & {
    altarSlot: number;
    gid2: number;
    gid3: number;
    onBoardIdx: number;
    x: number;
    y: number;
    invSlot: number;
}) => {
    const playerEntity = getEntityIdFromKeys([BigInt(account.address)]);
    const playerProfile = getComponentValueStrict(PlayerProfile, playerEntity);
    const player = getComponentValueStrict(Player, playerEntity);
    const altar = getComponentValueStrict(Altar, playerEntity);

    // plus 2 bsc buy consume one and merge consume another
    playerProfile.pieceCounter += 2;

    const pieceGid = Number(
        poseidonHashMany([
            BigInt(account.address),
            BigInt(playerProfile.pieceCounter),
        ]) & BigInt(0xffffffff)
    );
    const pieceEntity = getEntityIdFromKeys([BigInt(pieceGid)]);

    const creatureId = Number(Object.entries(altar)[altarSlot][1]);
    const creatureProfile = getComponentValueStrict(
        CreatureProfile,
        getEntityIdFromKeys([BigInt(creatureId), 1n])
    );

    const piecePrice = creatureProfile.rarity * 2 - 1;

    player.coin -= piecePrice;

    const piece2 = getComponentValueStrict(Piece, getPieceEntity(gid2));
    const piece3 = getComponentValueStrict(Piece, getPieceEntity(gid3));

    if (onBoardIdx != 0) {
        player.heroesCount += 1;
    } else {
        player.inventoryCount += 1;
    }

    if (piece2.idx != 0) {
        player.heroesCount -= 1;
    } else {
        player.inventoryCount -= 1;
    }
    if (piece3.idx != 0) {
        player.heroesCount -= 1;
    } else {
        player.inventoryCount -= 1;
    }

    // // check
    if (player.inventoryCount > 6) {
        alert("inventory full");
        return;
    }

    if (player.coin < 0) {
        alert("no enough coin");
        return;
    }

    logDebug(`generate gid ${pieceGid}`);

    // piece2 override
    const piece2OverUuid = uuid();
    Piece.addOverride(piece2OverUuid, {
        entity: getPieceEntity(gid2),
        value: {
            gid: gid2,
            owner: 0n,
            idx: 0,
            slot: 0,
            x: 0,
            y: 0,
        },
    });

    const piece3OverUuid = uuid();
    Piece.addOverride(piece3OverUuid, {
        entity: getPieceEntity(gid3),
        value: {
            gid: gid3,
            owner: 0n,
            idx: 0,
            slot: 0,
            x: 0,
            y: 0,
        },
    });

    // new piece override
    const pieceOverUuid = uuid();
    Piece.addOverride(pieceOverUuid, {
        entity: pieceEntity,
        value: {
            gid: pieceGid,
            owner: BigInt(account.address),
            idx: onBoardIdx,
            slot: invSlot,
            level: piece2.level + 1,
            creature_index: creatureId,
            x: x,
            y: y,
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
        const tx = await client.home.buyAndMerge({
            account,
            altarSlot,
            gid2,
            gid3,
            onBoardIdx,
            x,
            y,
            invSlot,
        });

        await waitForPromiseOrTxRevert(rpcProvider, tx, [
            waitForComponentOriginValueCome(Altar, playerEntity, {
                [`slot${altarSlot}`]: 0,
            }),
        ]);
    } catch (e) {
        console.error(e);
        throw e;
    } finally {
        Piece.removeOverride(pieceOverUuid);
        Piece.removeOverride(piece2OverUuid);
        Piece.removeOverride(piece3OverUuid);
        Altar.removeOverride(altarOverride);
        Player.removeOverride(playerOverride);
        PlayerProfile.removeOverride(playerProfileOverride);
    }
};
