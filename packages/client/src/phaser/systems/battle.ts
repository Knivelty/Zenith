import {
    Entity,
    Has,
    UpdateType,
    defineSystem,
    getComponentValue,
    getComponentValueStrict,
    setComponent,
    updateComponent,
    ComponentValue,
} from "@dojoengine/recs";
import { PhaserLayer } from "..";
import { tileCoordToPixelCoord, tween } from "@latticexyz/phaserx";
import {
    HealthBarOffSetY,
    MOVE_SPEED,
    Sprites,
    TILE_HEIGHT,
    TILE_WIDTH,
} from "../config/constants";
import { Sprite } from "@latticexyz/phaserx/src/types";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { defineSystemST, zeroEntity } from "../../utils";
import { BattleLog, BattleLogsType } from "../../dojo/generated/setup";
import { Coord, deferred, sleep } from "@latticexyz/utils";
import { GameStatusEnum } from "../../dojo/types";
import { manhattanDistance } from "../../utils/jps";

export const battle = (layer: PhaserLayer) => {
    const {
        world,
        scenes: {
            Main: { config, objectPool },
        },
        networkLayer: {
            clientComponents: {
                Piece,
                GameStatus,
                InningBattle,
                Player,
                BattleLogs,
                Attack,
            },
            account,
            graphqlClient,
        },
    } = layer;

    defineSystemST<typeof InningBattle.schema>(
        world,
        [Has(InningBattle)],
        ({ entity, type, value: [v, preV] }) => {
            console.log("update: ", entity, type, [v, preV]);
            if (!v) {
                return;
            }
            if (type == UpdateType.Enter) {
                updateComponent(GameStatus, zeroEntity, {
                    // shouldPlay: false,
                    // played: false,
                    // status: GameStatusEnum.Prepare,
                    currentRound: v.round,
                });
            }

            if (v?.end == false) {
                console.log("prepare: ");
                updateComponent(GameStatus, zeroEntity, {
                    status: GameStatusEnum.Prepare,
                });
            } else if (v.end == true) {
                updateComponent(GameStatus, zeroEntity, {
                    status: GameStatusEnum.InBattle,
                });
            }
        }
    );

    async function playBattle(logs: BattleLog[]) {
        for (const l of logs) {
            await playSingleBattle(l);
            // await new Promise((resolve) => setTimeout(resolve, 500));
            console.log("next");
        }
    }

    async function moveByPaths(pieceEntity: string, paths: Coord[]) {
        for (let i = 1; i < paths.length; i++) {
            const point = paths[i];
            const lastPath = paths[i - 1];
            const moveLength = manhattanDistance(
                lastPath.x,
                lastPath.y,
                point.x,
                point.y
            );

            const pixelPosition = tileCoordToPixelCoord(
                point,
                TILE_WIDTH,
                TILE_HEIGHT
            );

            console.log("move to :", pixelPosition);

            const hero = objectPool.get(pieceEntity, "Sprite");
            const health = objectPool.get(
                `${pieceEntity}-health-bar`,
                "Sprite"
            );

            const [resolve, , promise] = deferred<void>();

            hero.setComponent({
                id: pieceEntity,
                now: async (sprite: Phaser.GameObjects.Sprite) => {
                    await tween(
                        {
                            targets: sprite,
                            duration: moveLength * MOVE_SPEED,
                            props: {
                                x: pixelPosition.x,
                                y: pixelPosition.y,
                            },
                            ease: Phaser.Math.Easing.Linear,
                            onComplete: () => {
                                // console.log("complete");
                                // resolve to allow next tween
                                resolve();
                            },
                            onUpdate: () => {
                                // set health bar follow on tween
                                health.setComponent({
                                    id: `${pieceEntity}-health-bar`,
                                    once: (
                                        health: Phaser.GameObjects.Sprite
                                    ) => {
                                        health.setPosition(
                                            sprite.x,
                                            sprite.y - HealthBarOffSetY
                                        );
                                    },
                                });
                            },
                        },
                        { keepExistingTweens: true }
                    );
                },
            });

            await promise;
        }
    }

    async function playSingleBattle(v: BattleLog) {
        // const [resolve, , promise] = deferred<void>();

        const pieceEntity = getEntityIdFromKeys([
            BigInt(v.player),
            BigInt(v.pieceId),
        ]);

        // move first
        await moveByPaths(pieceEntity, v.paths);

        // then attack
        if (v.attackPieceId !== 0) {
            // attack wait 0.2s
            await sleep(200);

            // if have attack piece, run attack
            const game = getComponentValueStrict(GameStatus, zeroEntity);
            const inningBattle = getComponentValueStrict(
                InningBattle,
                getEntityIdFromKeys([
                    BigInt(game.currentMatch),
                    BigInt(game.currentRound),
                ])
            );

            let attacked: Entity;
            if (BigInt(v.player) === inningBattle.homePlayer) {
                attacked = getEntityIdFromKeys([
                    inningBattle.awayPlayer,
                    BigInt(v.attackPieceId),
                ]);
            } else {
                attacked = getEntityIdFromKeys([
                    inningBattle.homePlayer,
                    BigInt(v.attackPieceId),
                ]);
            }

            console.log("v.player", v.player, inningBattle.homePlayer);
            console.log("attacked: ", attacked);

            setComponent(Attack, `${inningBattle}-${v.order}` as Entity, {
                attacker: pieceEntity,
                attacked: attacked,
            });
        }
        // return promise;
    }

    defineSystemST<typeof GameStatus.schema>(
        world,
        [Has(GameStatus)],
        ({ entity, type, value: [v, preV] }) => {
            // if change from false to true, play the animation
            if (v?.shouldPlay === true && preV?.shouldPlay == false) {
                const play = v;

                if (play?.shouldPlay == true) {
                    const inningBattle = getComponentValueStrict(
                        InningBattle,
                        getEntityIdFromKeys([
                            BigInt(v.currentMatch),
                            BigInt(v.currentRound),
                        ])
                    );

                    console.log(
                        "geted entity: ",
                        getEntityIdFromKeys([
                            BigInt(inningBattle.currentMatch),
                            BigInt(inningBattle.round),
                        ])
                    );

                    const battleLogs = getComponentValueStrict(
                        BattleLogs,
                        getEntityIdFromKeys([
                            BigInt(inningBattle.currentMatch),
                            BigInt(inningBattle.round),
                        ])
                    ) as BattleLogsType;

                    const logs = JSON.parse(battleLogs.logs) as BattleLog[];

                    console.log("battleLogs: ", logs);

                    playBattle(logs).then(() => {
                        console.log("play finish");

                        // after play, set status back
                        updateComponent(GameStatus, entity, {
                            shouldPlay: false,
                            played: true,
                            status: GameStatusEnum.WaitForNextRound,
                        });
                    });
                }
            }
        }
    );
};
