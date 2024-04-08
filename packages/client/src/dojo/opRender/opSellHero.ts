import { Account, RpcProvider } from "starknet";
import { IWorld } from "../generated/typescript/contracts.gen";
import { ClientComponents } from "../createClientComponents";
import { getComponentValueStrict } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { uuid } from "@latticexyz/utils";

export const opSellHero = async (
    { client }: { client: IWorld },
    { Player, Piece, PlayerInvPiece }: ClientComponents,
    rpcProvider: RpcProvider,
    account: Account,
    gid: number
) => {
    const playerEntity = getEntityIdFromKeys([BigInt(account.address)]);
    const player = getComponentValueStrict(Player, playerEntity);
    const pieceEntity = getEntityIdFromKeys([BigInt(gid)]);
    const piece = getComponentValueStrict(Piece, pieceEntity);
    const playerInvEntity = getEntityIdFromKeys([
        BigInt(account.address),
        BigInt(piece.slot),
    ]);
    const playerInvPiece = getComponentValueStrict(
        PlayerInvPiece,
        playerInvEntity
    );

    // check
    player.coin += 1;
    player.inventoryCount -= 1;

    const pieceOverUuid = uuid();
    Piece.addOverride(pieceOverUuid, {
        entity: pieceEntity,
        value: {
            ...piece,
            owner: 0n,
            slot: 0,
        },
    });

    // player inv piece override
    const playerInvOverride = uuid();
    PlayerInvPiece.addOverride(playerInvOverride, {
        entity: playerInvEntity,
        value: {
            ...playerInvPiece,
            gid: 0,
        },
    });

    // player override
    const playerOverride = uuid();
    Player.addOverride(playerOverride, {
        entity: playerEntity,
        value: player,
    });

    try {
        const tx = await client.home.sellHero({
            account,
            gid,
        });
        await rpcProvider.waitForTransaction(tx.transaction_hash, {
            retryInterval: 1000,
        });
    } catch (e) {
        console.error(e);
        throw e;
    } finally {
        Piece.removeOverride(pieceOverUuid);
        PlayerInvPiece.removeOverride(playerInvOverride);
        Player.removeOverride(playerOverride);
    }
};
