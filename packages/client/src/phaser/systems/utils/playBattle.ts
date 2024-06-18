import {
    Entity,
    getComponentValueStrict,
    setComponent,
    updateComponent,
} from "@dojoengine/recs";
import { tileCoordToPixelCoord, tween } from "@latticexyz/phaserx";
import {
    MOVE_TIME_PER_LENGTH,
    TILE_HEIGHT,
    TILE_WIDTH,
} from "../../config/constants";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { zeroEntity } from "../../../utils";
import { Coord, deferred, sleep } from "@latticexyz/utils";
import { PhaserLayer } from "../..";
import { manhattanDistance } from "@zenith/simulator";
import {
    EventMap,
    EventWithName,
} from "@zenith/simulator/src/event/createEventSystem";

export const battleAnimation = (layer: PhaserLayer) => {
    const {
        scenes: {
            Main: { objectPool },
        },
        networkLayer: {
            clientComponents: { GameStatus, InningBattle, Attack, HealthBar },
        },
    } = layer;

    async function playBattle(events: EventWithName<keyof EventMap>[]) {
        console.log("logs: ", events);
        for (const e of events) {
            await playSingleEvent(e);
            // await new Promise((resolve) => setTimeout(resolve, 500));
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

            const [resolve, , promise] = deferred<void>();

            hero.setComponent({
                id: pieceEntity,
                now: async (sprite: Phaser.GameObjects.Sprite) => {
                    await tween(
                        {
                            targets: sprite,
                            duration: moveLength * MOVE_TIME_PER_LENGTH,
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

                                updateComponent(
                                    HealthBar,
                                    `${pieceEntity}-health-bar` as Entity,
                                    {
                                        x: sprite.x,
                                        y: sprite.y,
                                    }
                                );
                            },
                        },
                        { keepExistingTweens: true }
                    );
                },
            });

            await promise;
        }
    }

    async function playSingleEvent(v: EventWithName<keyof EventMap>) {
        switch (v.name) {
            case "pieceMove":
                await handlePieceMove(v as EventWithName<"pieceMove">);
                break;
            case "pieceAttack":
                await handleAttack(v as EventWithName<"pieceAttack">);
                break;
        }
    }

    async function handlePieceMove({
        pieceId,
        paths,
    }: EventWithName<"pieceMove">) {
        // move first
        await moveByPaths(pieceId, paths);
    }

    async function handleAttack({
        pieceId,
        targetPieceId,
    }: EventWithName<"pieceAttack">) {
        // attack wait 0.2s
        await sleep(1000);

        // if have attack piece, run attack
        const game = getComponentValueStrict(GameStatus, zeroEntity);
        const inningBattle = getComponentValueStrict(
            InningBattle,
            getEntityIdFromKeys([
                BigInt(game.currentMatch),
                BigInt(game.currentRound),
            ])
        );

        const attacked = targetPieceId as Entity;

        console.log("attacked: ", attacked);

        // OLD value
        // ${inningBattle}-${v}
        setComponent(
            Attack,
            `${inningBattle}-${pieceId}-${attacked}` as Entity,
            {
                attacker: pieceId,
                attacked: attacked,
            }
        );
    }

    return { playBattle };
};
