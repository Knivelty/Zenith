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
// import { BattleLog, BattleLogsType } from "../../dojo/generated/setup";
import { Coord, deferred, sleep } from "@latticexyz/utils";
import { GameStatusEnum } from "../../dojo/types";
import {
    BattleLogs,
    PieceAction,
    PieceInBattle,
    calculateBattleLogs,
    manhattanDistance,
} from "../../utils/jps";

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
                Creature,
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

                // calculate battle log in the frontend

                // get all piece
                const allPieceInBattle = new Array<PieceInBattle>();

                // get player piece
                const player = getComponentValueStrict(
                    Player,
                    getEntityIdFromKeys([v.homePlayer])
                );

                for (let i = 1; i <= player.heroesCount; i++) {
                    const pieceEntity = getEntityIdFromKeys([
                        v.homePlayer,
                        BigInt(i),
                    ]);
                    const piece = getComponentValueStrict(Piece, pieceEntity);

                    const creature = getComponentValueStrict(
                        Creature,
                        getEntityIdFromKeys([BigInt(piece.internal_index)])
                    );

                    allPieceInBattle.push({
                        player: getEntityIdFromKeys([v.homePlayer]),
                        entity: pieceEntity,
                        x: piece.x_board,
                        y: piece.y_board,
                        health: creature.health * piece.tier,
                        attack: creature.attack * piece.tier,
                        armor: creature.armor * piece.tier,
                        speed: creature.speed * piece.tier,
                        range: creature.range * piece.tier,
                        isInHome: true,
                        dead: false,
                    });
                }

                // get enemy piece
                const enemy = getComponentValueStrict(
                    Player,
                    getEntityIdFromKeys([v.awayPlayer])
                );

                for (let i = 1; i <= enemy.heroesCount; i++) {
                    const pieceEntity = getEntityIdFromKeys([
                        v.awayPlayer,
                        BigInt(i),
                    ]);
                    const piece = getComponentValueStrict(Piece, pieceEntity);

                    const creature = getComponentValueStrict(
                        Creature,
                        getEntityIdFromKeys([BigInt(piece.internal_index)])
                    );

                    allPieceInBattle.push({
                        player: getEntityIdFromKeys([v.awayPlayer]),
                        entity: pieceEntity,
                        x: 7 - piece.x_board,
                        y: 7 - piece.y_board,
                        health: creature.health,
                        attack: creature.attack,
                        armor: creature.armor,
                        speed: creature.speed,
                        range: creature.range,
                        isInHome: false,
                        dead: false,
                    });
                }

                const logs = calculateBattleLogs(allPieceInBattle);

                console.log("logs: ", logs.logs);

                setComponent(
                    BattleLogs,
                    getEntityIdFromKeys([
                        BigInt(v.currentMatch),
                        BigInt(v.round),
                    ]),
                    {
                        matchId: v.currentMatch,
                        inningBattleId: v.round,
                        logs: JSON.stringify(logs),
                    }
                );
            }
        }
    );

    async function playBattle(logs: PieceAction[]) {
        console.log("logs: ", logs);
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

    async function playSingleBattle(v: PieceAction) {
        // const [resolve, , promise] = deferred<void>();

        // move first
        await moveByPaths(v.entity, v.paths);

        // then attack
        if (v.attackPiece) {
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

            const attacked = v.attackPiece as Entity;

            console.log("v.player", v.player, inningBattle.homePlayer);
            console.log("attacked: ", attacked);

            setComponent(Attack, `${inningBattle}-${v.order}` as Entity, {
                attacker: v.entity,
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
                    ) as {
                        matchId: number;
                        inningBattleId: number;
                        logs: string;
                    };

                    const logs = JSON.parse(battleLogs.logs) as BattleLogs;

                    console.log("battleLogs: ", logs);

                    playBattle(logs.logs).then(() => {
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
