import {
    Entity,
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
import { getComponentValueUtilNotNull } from "../../ui/lib/utils";

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

            if (v.player === BigInt(account.address)) {
                if (!getComponentValue(GameStatus, zeroEntity)) {
                    setComponent(GameStatus, zeroEntity, {
                        played: false,
                        shouldPlay: false,
                        status: GameStatusEnum.Prepare,
                        currentRound: 1,
                        currentMatch: v.inMatch,
                    });
                } else {
                    updateComponent(GameStatus, zeroEntity, {
                        currentMatch: v.inMatch,
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
                    console.log("trrr");
                    spawnPiece(player.player, BigInt(i), true);
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
        }
    );

    // defineSystem(world, [Has(Piece)], ({ entity, type }) => {
    //     const gameStatus = getComponentValue(GameStatus, zeroEntity);

    //     if (!gameStatus) {
    //         return;
    //     }

    //     if (
    //         type === UpdateType.Enter &&
    //         gameStatus.status === GameStatusEnum.Prepare
    //     ) {
    //         spawnPreparedPiece(entity as Entity);
    //     }
    // });
};
