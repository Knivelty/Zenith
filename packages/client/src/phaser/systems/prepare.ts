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
import {
    getComponentValueUtilNotNull,
    getPlayerBoardPieceEntity,
    logDebug,
} from "../../ui/lib/utils";

export const prepare = (layer: PhaserLayer) => {
    const {
        world,
        scenes: {
            Main: { config, objectPool },
            Main,
        },
        networkLayer: {
            clientComponents: { Player, InningBattle, GameStatus, LocalPiece },
            account: { address },
            account,
            playerEntity,
        },
    } = layer;

    const { spawnPiece } = pieceManage(layer);

    // initialize and sync match status
    defineSystemST<typeof Player.schema>(
        world,
        [Has(Player)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }

            logDebug("incoming player change: ", [v, preV]);

            if (v.player === BigInt(account.address)) {
                if (!getComponentValue(GameStatus, zeroEntity)) {
                    const playerValue = getComponentValueStrict(
                        Player,
                        playerEntity
                    );

                    setComponent(GameStatus, zeroEntity, {
                        played: false,
                        shouldPlay: false,
                        status: GameStatusEnum.Prepare,
                        currentRound: 1,
                        currentMatch: v.inMatch,
                        dangerous: false,
                        homePlayer: BigInt(address),
                        awayPlayer: 1n,
                    });
                } else {
                    const playerValue = getComponentValueStrict(
                        Player,
                        playerEntity
                    );
                    updateComponent(GameStatus, zeroEntity, {
                        currentMatch: playerValue?.inMatch,
                    });
                }

                if (v.inMatch == 0) {
                    logDebug("user exit or not in game");
                    updateComponent(GameStatus, zeroEntity, {
                        currentMatch: 0,
                        status: GameStatusEnum.Invalid,
                        currentRound: 0,
                    });
                }
            }
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
