import {
    Entity,
    getComponentValueStrict,
    setComponent,
} from "@dojoengine/recs";
import { tileCoordToPixelCoord, tween } from "@latticexyz/phaserx";
import {
    HealthBarOffSetY,
    MOVE_SPEED,
    TILE_HEIGHT,
    TILE_WIDTH,
} from "../../config/constants";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { zeroEntity } from "../../../utils";
import { Coord, deferred, sleep } from "@latticexyz/utils";
import { PieceAction, manhattanDistance } from "../../../utils/jps";
import { PhaserLayer } from "../..";

export const battleAnimation = (layer: PhaserLayer) => {
    const {
        scenes: {
            Main: { objectPool },
        },
        networkLayer: {
            clientComponents: { GameStatus, InningBattle, Attack },
        },
    } = layer;

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

    return { playBattle };
};
