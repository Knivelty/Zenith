import { Account, RpcProvider } from "starknet";
import { IWorld } from "../generated/typescript/contracts.gen";
import { ClientComponents } from "../createClientComponents";
import { getComponentValue, getComponentValueStrict } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { uuid } from "@latticexyz/utils";
import { processBattle } from "../../phaser/systems/utils/processBattleLogs";
import { PieceChange } from "../types";
import { isEqual } from "lodash";
import { zeroEntity } from "../../utils";
import { logDebug } from "../../ui/lib/utils";

export const opCommitPrepare = async (
    { client }: { client: IWorld },
    clientComponents: ClientComponents,
    rpcProvider: RpcProvider,
    account: Account
) => {
    const {
        Piece,
        LocalPiecesChangeTrack,
        LocalPiece,
        InningBattle,
        GameStatus,
    } = clientComponents;

    const playerEntity = getEntityIdFromKeys([BigInt(account.address)]);

    const piecesTrack = getComponentValue(LocalPiecesChangeTrack, playerEntity);

    logDebug("piecesTrack: ", piecesTrack);

    const changes: PieceChange[] = piecesTrack?.gids
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

    // validate piece change, it guarantees that the hero idx was not break
    const initIndex = new Set(
        changes.map((c) => {
            const entity = getEntityIdFromKeys([BigInt(c.gid)]);
            const remote = getComponentValueStrict(Piece, entity);
            return remote.idx;
        })
    );

    const changedIndex = new Set(changes.map((c) => c.idx));

    if (!isEqual(initIndex, changedIndex)) {
        logDebug("invalid change, block commit");
        return;
    }

    const { processBattleLogs } = processBattle(clientComponents);

    const { result } = processBattleLogs();

    console.log("commit changes: ", changes);

    const gStatus = getComponentValueStrict(GameStatus, zeroEntity);
    const inningBattleEntity = getEntityIdFromKeys([
        BigInt(gStatus.currentMatch),
        BigInt(gStatus.currentRound),
    ]);
    const inningBattleValue = getComponentValueStrict(
        InningBattle,
        inningBattleEntity
    );

    const innitBattleOverride = uuid();
    InningBattle.addOverride(innitBattleOverride, {
        entity: inningBattleEntity,
        value: { ...inningBattleValue, end: true },
    });

    try {
        const tx = await client.home.commitPreparation({
            account,
            changes,
            result: {
                win: result.win,
                healthDecrease: result.healthDecrease,
            },
        });
        const res = await rpcProvider.waitForTransaction(tx.transaction_hash, {
            retryInterval: 1000,
        });

        if (res.revert_reason) {
            logDebug(`commit prepare revert, reason ${res.revert_reason}`);
        }
    } catch (e) {
        console.error(e);
        throw e;
    } finally {
        InningBattle.removeOverride(innitBattleOverride);
    }
};
