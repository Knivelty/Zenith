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
import { battleAnimation } from "./utils/playBattle";
import { Game } from "phaser";

export const battle = (layer: PhaserLayer) => {
    const {
        world,
        scenes: {
            Main: { config, objectPool },
        },
        networkLayer: {
            clientComponents: {
                GameStatus,
                InningBattle,
                Player,
                LocalPlayer,
                Piece,
                LocalPiece,
                LocalPlayerPiece,
                BattleLogs,
                Attack,
                CreatureProfile,
            },
            account,
            playerEntity,
            graphqlClient,
        },
    } = layer;

    const { playBattle } = battleAnimation(layer);

    defineSystemST<typeof InningBattle.schema>(
        world,
        [Has(InningBattle)],
        ({ entity, type, value: [v, preV] }) => {
            console.log("update: ", entity, type, [v, preV]);
            if (!v) {
                return;
            }

            // sync current round
            updateComponent(GameStatus, zeroEntity, {
                // shouldPlay: false,
                // played: false,
                // status: GameStatusEnum.Prepare,
                currentRound: v.round,
            });

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
                    LocalPlayer,
                    getEntityIdFromKeys([v.homePlayer])
                );

                for (let i = 1; i <= player.heroesCount; i++) {
                    const playerPiece = getComponentValueStrict(
                        LocalPlayerPiece,
                        getEntityIdFromKeys([v.homePlayer, BigInt(i)])
                    );

                    const pieceEntity = getEntityIdFromKeys([
                        BigInt(playerPiece.gid),
                    ]);

                    const piece = getComponentValueStrict(
                        LocalPiece,
                        pieceEntity
                    );

                    const creature = getComponentValueStrict(
                        CreatureProfile,
                        getEntityIdFromKeys([
                            BigInt(piece.creature_index),
                            BigInt(piece.level),
                        ])
                    );

                    allPieceInBattle.push({
                        player: getEntityIdFromKeys([v.homePlayer]),
                        entity: pieceEntity,
                        x: piece.x,
                        y: piece.y,
                        health: creature.health,
                        attack: creature.attack,
                        armor: creature.armor,
                        speed: creature.speed,
                        range: creature.range,
                        isInHome: true,
                        dead: false,
                    });
                }

                // TODO: reverse home and player on PvP
                // get enemy piece
                const enemy = getComponentValueStrict(
                    LocalPlayer,
                    getEntityIdFromKeys([v.awayPlayer])
                );

                for (let i = 1; i <= enemy.heroesCount; i++) {
                    const playerPiece = getComponentValueStrict(
                        LocalPlayerPiece,
                        getEntityIdFromKeys([v.awayPlayer, BigInt(i)])
                    );

                    const pieceEntity = getEntityIdFromKeys([
                        BigInt(playerPiece.gid),
                    ]);

                    console.log("piece: ", playerPiece);
                    const piece = getComponentValueStrict(
                        LocalPiece,
                        pieceEntity
                    );

                    const creature = getComponentValueStrict(
                        CreatureProfile,
                        getEntityIdFromKeys([
                            BigInt(piece.creature_index),
                            BigInt(piece.level),
                        ])
                    );

                    allPieceInBattle.push({
                        player: getEntityIdFromKeys([v.awayPlayer]),
                        entity: pieceEntity,
                        x: 7 - piece.x,
                        y: 7 - piece.y,
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

                console.log(
                    "set battle logs: ",
                    v.currentMatch,
                    v.round,
                    logs.logs
                );

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

                setTimeout(() => {
                    // play animation after calculate successfully
                    updateComponent(GameStatus, zeroEntity, {
                        shouldPlay: true,
                    });
                }, 1000);
            }
        }
    );

    defineSystemST<typeof GameStatus.schema>(
        world,
        [Has(GameStatus)],
        ({ entity, type, value: [v, preV] }) => {
            // if change from false to true, play the animation
            if (v?.shouldPlay === true && preV?.shouldPlay == false) {
                const inningBattle = getComponentValueStrict(
                    InningBattle,
                    getEntityIdFromKeys([
                        BigInt(v.currentMatch),
                        BigInt(v.currentRound),
                    ])
                );

                console.log(
                    "get logs: ",
                    inningBattle.currentMatch,
                    inningBattle.round
                );

                const battleLogs = getComponentValueStrict(
                    BattleLogs,
                    getEntityIdFromKeys([
                        BigInt(inningBattle.currentMatch),
                        BigInt(inningBattle.round),
                    ])
                );

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
    );
};
