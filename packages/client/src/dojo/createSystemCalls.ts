import { ClientComponents } from "./createClientComponents";
import { IWorld } from "./generated/generated";
import { Account } from "starknet";
import { ContractComponents } from "./generated/contractComponents";
import { getComponentValueStrict, updateComponent } from "@dojoengine/recs";
import { zeroEntity } from "../utils";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { isBoolean, isEqual, isNull, isUndefined } from "lodash";
import { PieceChange } from "./types";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
    { client }: { client: IWorld },
    contractComponents: ContractComponents,
    {
        Position,
        GameStatus,
        LocalPiecesChangeTrack,
        Piece,
        LocalPiece,
    }: ClientComponents
) {
    const spawn = async (account: Account) => {
        try {
            const { transaction_hash: txHash } = await client.actions.spawn({
                account,
            });

            // const result =
            // await client.provider.provider.waitForTransaction(txHash);
        } catch (e) {
            console.error(e);
        }
    };

    const startBattle = async (account: Account) => {
        try {
            return await client.actions.startBattle({ account });
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const commitPreparation = async (account: Account) => {
        try {
            // calculate the diff

            const playerEntity = getEntityIdFromKeys([BigInt(account.address)]);

            const piecesTrack = getComponentValueStrict(
                LocalPiecesChangeTrack,
                playerEntity
            );

            const changes: PieceChange[] = piecesTrack.gids
                .map((gid) => {
                    const entity = getEntityIdFromKeys([BigInt(gid)]);
                    const local = getComponentValueStrict(LocalPiece, entity);
                    const remote = getComponentValueStrict(Piece, entity);

                    if (isEqual(local, remote)) {
                        return undefined;
                    } else {
                        return {
                            gid: gid,
                            idx: local.idx,
                            slot: local.slot,
                            x: local.x,
                            y: local.y,
                        };
                    }
                })
                .filter(Boolean) as PieceChange[];

            console.log("changes:", changes);

            return await client.actions.commitPreparation({ account, changes });
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const nextRound = async (account: Account) => {
        try {
            return await client.actions.nextRound({ account });
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const refreshAltar = async (account: Account) => {
        try {
            return await client.actions.refreshAltar({ account });
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const getCoin = async (account: Account) => {
        try {
            return await client.actions.getCoin({ account });
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const buyHero = async (
        account: Account,
        altarSlot: number,
        invSlot: number
    ) => {
        try {
            return await client.actions.buyHero({
                account,
                altarSlot,
                invSlot,
            });
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const sellHero = async (account: Account, gid: number) => {
        try {
            return await client.actions.sellHero({ account, gid });
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const playAnimation = async () => {
        updateComponent(GameStatus, zeroEntity, {
            shouldPlay: true,
        });
    };

    return {
        spawn,
        startBattle,
        playAnimation,
        nextRound,
        refreshAltar,
        getCoin,
        buyHero,
        sellHero,
        commitPreparation,
    };
}
