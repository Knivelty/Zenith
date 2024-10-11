import {
    Has,
    getComponentValueStrict,
    getComponentValue,
    setComponent,
    updateComponent,
} from "@dojoengine/recs";
import { PhaserLayer } from "..";

import { getEntityIdFromKeys } from "@dojoengine/utils";
import {
    defineSystemST,
    getLocalPlayerBoardPieceEntities,
    zeroEntity,
} from "../../utils";
import { GameStatusEnum } from "../../dojo/types";
import { pieceManage } from "./utils/pieceManage";
import { getComponentValueUtilNotNull, logDebug } from "../../ui/lib/utils";
import { Game } from "phaser";

export const prepare = (layer: PhaserLayer) => {
    const {
        world,
        scenes: {
            Main: { objectPool },
            Main,
        },
        networkLayer: {
            clientComponents: {
                Player,
                InningBattle,
                GameStatus,
                LocalPiece,
                MatchResult,
            },
            account: { address },
            account,
        },
    } = layer;

    const { spawnPiece } = pieceManage(layer);

    // listen match update
    defineSystemST<typeof Player.schema>(
        world,
        [Has(Player)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }

            if (v.player !== BigInt(address)) {
                return;
            }

            const s = getComponentValueStrict(GameStatus, zeroEntity);

            if (v.inMatch > s.currentMatch) {
                updateComponent(GameStatus, zeroEntity, {
                    currentMatch: v.inMatch,
                });
            }
        }
    );

    // listen whether the match is end
    defineSystemST<typeof MatchResult.schema>(
        world,
        [Has(MatchResult)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }

            if (v.player !== BigInt(address)) {
                return;
            }

            // const gameStatus = getComponentValueStrict(GameStatus, zeroEntity);
            //
            // if (v.index === gameStatus.currentMatch) {
            //     updateComponent(GameStatus, zeroEntity, {
            //         status: GameStatusEnum.WaitForConfirmEnd,
            //         ended: true,
            //     });
            // }
        }
    );

    // spawn piece according to game status
    defineSystemST<typeof GameStatus.schema>(
        world,
        [Has(GameStatus)],
        async ({ entity, type, value: [v, preV] }) => {
            logDebug("incoming game status change: ", v, "preV: ", preV);
            // if switch to prepare, recover all piece to initial place
            if (
                preV?.status !== GameStatusEnum.Prepare &&
                v?.status === GameStatusEnum.Prepare
            ) {
                //
                //
                //
                //
                logDebug("trigger init");
                // clear all existing sprite
                clearAllObject();

                // spawn players piece
                const playerOnBoardPieceEntities =
                    getLocalPlayerBoardPieceEntities(
                        LocalPiece,
                        BigInt(account.address)
                    );

                for (const entity of playerOnBoardPieceEntities) {
                    spawnPiece(entity, true);
                }

                if (v.currentMatch === 0) {
                    logDebug(`not in match`);
                    return;
                }

                // spawn enemy's piece
                const inningBattle = await getComponentValueUtilNotNull(
                    InningBattle,
                    getEntityIdFromKeys([
                        BigInt(v.currentMatch),
                        BigInt(v.currentRound),
                    ])
                );

                const enemy = getComponentValueStrict(
                    Player,
                    getEntityIdFromKeys([inningBattle.awayPlayer])
                );

                logDebug("enemy: ", enemy.heroesCount, enemy.player);

                const enemyOnBoardPieceEntities =
                    getLocalPlayerBoardPieceEntities(
                        LocalPiece,
                        inningBattle.awayPlayer
                    );
                // spawn enemy's piece
                for (const enemyEntity of enemyOnBoardPieceEntities) {
                    spawnPiece(enemyEntity, true);
                }
            }

            // it means user exit game, need refresh to clear local component
            if (
                preV &&
                preV?.status !== GameStatusEnum.Invalid &&
                v?.status === GameStatusEnum.Invalid
            ) {
                location.reload();
            }
        }
    );

    function clearAllObject() {
        const objects = Main.phaserScene.children.list;

        objects.forEach((v) => {
            objectPool.remove(v.data?.list.objectPoolId);
        });
    }
};
