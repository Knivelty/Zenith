import {
    Has,
    getComponentValueStrict,
    getComponentValue,
    setComponent,
    updateComponent,
} from "@dojoengine/recs";
import { PhaserLayer } from "..";

import { getEntityIdFromKeys } from "@dojoengine/utils";
import { defineSystemST, zeroEntity } from "../../utils";
import { GameStatusEnum } from "../../dojo/types";
import { pieceManage } from "./utils/pieceManage";
import { getComponentValueUtilNotNull, logDebug } from "../../ui/lib/utils";

export const prepare = (layer: PhaserLayer) => {
    const {
        world,
        scenes: {
            Main: { config, objectPool },
        },
        networkLayer: {
            clientComponents: {
                Player,
                Piece,
                InningBattle,
                GameStatus,
                HealthBar,
                Health,
                CreatureProfile,
                MatchState,
                PlayerPiece,
            },
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
                const player = getComponentValueStrict(
                    Player,
                    getEntityIdFromKeys([BigInt(account.address)])
                );

                // spawn players piece
                for (let i = 1; i <= player.heroesCount; i++) {
                    spawnPiece(player.player, BigInt(i), true);
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

                console.log("enemy: ", enemy.heroesCount, enemy.player);

                // spawn enemy's piece
                for (let i = 1; i <= enemy.heroesCount; i++) {
                    spawnPiece(enemy.player, BigInt(i), true);
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
};
