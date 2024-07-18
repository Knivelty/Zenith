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
import { logDebug, waitForComponentOriginValueCome } from "../../ui/lib/utils";

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
        Player,
        InningBattle,
        GameStatus,
    } = clientComponents;

    const playerEntity = getEntityIdFromKeys([BigInt(account.address)]);

    const piecesTrack = getComponentValue(LocalPiecesChangeTrack, playerEntity);

    logDebug("piecesTrack: ", piecesTrack);

    const changes: PieceChange[] =
        (piecesTrack?.gids
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
            ?.filter(Boolean) as PieceChange[]) || [];

    // validate piece change, it guarantees that the hero idx was not break
    const playerValue = getComponentValueStrict(Player, playerEntity);

    const initIdxArr = Array.from(
        new Array(playerValue.level),
        (v: number, idx: number) => idx + 1
    );

    changes?.forEach((c) => {
        const entity = getEntityIdFromKeys([BigInt(c.gid)]);
        const remote = getComponentValueStrict(Piece, entity);

        if (remote.idx === 0) {
            initIdxArr[c.idx - 1] = c.idx;
        } else {
            initIdxArr[remote.idx - 1] = c.idx;
        }
    });

    const sortedChangedIndexArr = initIdxArr
        .filter(Boolean)
        .sort((a, b) => a - b);

    logDebug("sortedChangedIndexArr: ", sortedChangedIndexArr);

    const { processBattleLogs } = processBattle(clientComponents);

    const { result } = await processBattleLogs();

    logDebug("commit changes: ", changes);

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
        value: {
            ...inningBattleValue,
            end: true,
            winner: result.win
                ? inningBattleValue.homePlayer
                : inningBattleValue.awayPlayer,
        },
    });

    try {
        const tx = await client.home.commitPreparation({
            account,
            changes,
            result: {
                win: result.win!,
                healthDecrease: result.healthDecrease!,
            },
        });

        await waitForComponentOriginValueCome(
            InningBattle,
            inningBattleEntity,
            { end: true }
        );
    } catch (e) {
        console.error(e);
        throw e;
    } finally {
        InningBattle.removeOverride(innitBattleOverride);
    }
};
