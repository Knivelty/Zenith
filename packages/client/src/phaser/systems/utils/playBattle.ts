import {
    Entity,
    getComponentValueStrict,
    updateComponent,
} from "@dojoengine/recs";
import { tileCoordToPixelCoord, tween } from "@latticexyz/phaserx";
import {
    AbilityAnimations,
    AnimationIndex,
    GroundAnimations,
    TILE_HEIGHT,
    TILE_WIDTH,
} from "../../config/constants";

import { Coord, deferred, sleep } from "@latticexyz/utils";
import { PhaserLayer } from "../..";
import { manhattanDistance } from "@zenith/simulator";
import {
    EventMap,
    EventWithName,
} from "@zenith/simulator/src/event/createEventSystem";
import { getAnimation, getAnimationIndex } from "./animationHelper";
import { logDebug } from "../../../ui/lib/utils";
import { encodeGroundEntity } from "./entityEncoder";
import { pieceManage } from "./pieceManage";
import { zeroEntity } from "../../../utils";
import { animationTime } from "../animation/animationTime";

export const battleAnimation = (layer: PhaserLayer) => {
    const {
        scenes: {
            Main: { config, objectPool },
        },
        networkLayer: {
            clientComponents: { HealthBar, LocalPiece, Health, UserOperation },
        },
    } = layer;

    const { phaserSpawnPiece } = pieceManage(layer);

    const { getAnimationTime, getAnimationSpeed } = animationTime(layer);

    async function playBattle(events: EventWithName<keyof EventMap>[]) {
        console.log("logs: ", events);
        for (const e of events) {
            await playSingleEvent(e);
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

            const hero = objectPool.get(pieceEntity, "Sprite");

            const [resolve, , promise] = deferred<void>();

            hero.setComponent({
                id: pieceEntity,
                now: async (sprite: Phaser.GameObjects.Sprite) => {
                    await tween(
                        {
                            targets: sprite,
                            duration:
                                moveLength *
                                getAnimationTime("MOVE_PER_LENGTH_TIME"),
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
        const userO = getComponentValueStrict(UserOperation, zeroEntity);
        if (userO.skipAnimation) {
            return;
        }

        switch (v.name) {
            case "pieceMove":
                await handlePieceMove(v as EventWithName<"pieceMove">);
                await sleep(getAnimationTime("STEP_INTERVAL_TIME"));

                break;
            case "pieceAttack":
                await handleAttack(v as EventWithName<"pieceAttack">);
                await sleep(getAnimationTime("STEP_INTERVAL_TIME"));

                break;
            case "abilityCast":
                await handleAbilityCast(v as EventWithName<"abilityCast">);
                await sleep(getAnimationTime("STEP_INTERVAL_TIME"));

                break;
            case "healthDecrease":
                await handleHealthDecrease(
                    v as EventWithName<"healthDecrease">
                );
                await sleep(getAnimationTime("STEP_INTERVAL_TIME"));

                break;
            case "pieceSpawn":
                await handlePieceSpawn(v as EventWithName<"pieceSpawn">);
                await sleep(getAnimationTime("STEP_INTERVAL_TIME"));

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
        const [resolve, , promise] = deferred<void>();

        const attackerSprite = objectPool.get(pieceId, "Sprite");
        attackerSprite.setComponent({
            id: pieceId,
            now: async (sprite: Phaser.GameObjects.Sprite) => {
                await tween(
                    {
                        targets: sprite,
                        duration: getAnimationTime("ATTACK_SWING_TIME"),
                        props: {
                            x: "+=15",
                        },
                        ease: Phaser.Math.Easing.Linear,
                        yoyo: true,
                        onComplete: async () => {
                            // resolve to allow next tween
                            resolve();
                        },
                        onUpdate: () => {
                            //
                        },
                    },
                    { keepExistingTweens: true }
                );
            },
        });

        // return await sleep(200);
    }

    async function handleHealthDecrease({
        pieceId,
        value,
    }: EventWithName<"healthDecrease">) {
        const attackedHealth = getComponentValueStrict(
            Health,
            `${pieceId}-health` as Entity
        );

        const modifiedHealth = attackedHealth.current - value;

        updateComponent(Health, `${pieceId}-health` as Entity, {
            current: modifiedHealth,
        });

        const [resolve, , promise] = deferred<void>();

        // attacked blink
        const attackedSprite = objectPool.get(pieceId, "Sprite");
        attackedSprite.setComponent({
            id: pieceId,
            now: async (sprite: Phaser.GameObjects.Sprite) => {
                await tween(
                    {
                        targets: sprite,
                        duration: getAnimationTime("ATTACKED_BLINK_TIME"),
                        props: {
                            alpha: 0,
                        },
                        ease: Phaser.Math.Easing.Linear,
                        yoyo: true,
                        onComplete: async () => {
                            // resolve to allow next tween
                            resolve();
                        },
                        onUpdate: () => {
                            //
                        },
                    },
                    { keepExistingTweens: true }
                );
            },
        });

        return promise;
    }

    async function handlePieceSpawn(data: EventWithName<"pieceSpawn">) {
        //

        // gid does not affected here
        phaserSpawnPiece({ gid: 1, ...data });
    }

    async function handleAbilityCast({
        abilityName,
        data: { actionPieceId },
        affectedGrounds,
    }: EventWithName<"abilityCast">) {
        // attack wait 0.2s
        await sleep(1000);

        const pieceSprite = objectPool.get(actionPieceId, "Sprite");
        const piece = getComponentValueStrict(
            LocalPiece,
            actionPieceId as Entity
        );

        const [resolve, , promise] = deferred<void>();

        pieceSprite.setComponent({
            id: actionPieceId,
            now: async (sprite: Phaser.GameObjects.Sprite) => {
                // TODO:
                const castAnimationKey = getAnimationIndex(
                    abilityName as AbilityAnimations
                );
                const animation = config.animations[castAnimationKey];

                logDebug("cast animation: ", animation);

                sprite.play(animation);
                sprite.anims.timeScale = getAnimationSpeed();
                sprite.stopAfterRepeat(0);

                const onAnimationComplete = () => {
                    const idleAnimation =
                        config.animations[AnimationIndex[piece.creature_index]];
                    sprite.play(idleAnimation);
                    const scale = TILE_HEIGHT / sprite.height;
                    sprite.setScale(scale);
                    resolve();
                };

                sprite.once("animationcomplete", onAnimationComplete);

                const scale = TILE_HEIGHT / sprite.height;
                sprite.setScale(scale);

                // sprite.
            },
        });

        // play ground effect amination
        affectedGrounds.forEach((ag) => {
            // console.log("affectedGrounds: ", affectedGrounds);

            const effectAnimation = getAnimation(
                ag.groundEffect as GroundAnimations
            );
            const groundSpriteEntity = encodeGroundEntity(ag.x, ag.y);
            const groundSprite = objectPool.get(groundSpriteEntity, "Sprite");

            groundSprite.setComponent({
                id: groundSpriteEntity,
                once: async (sprite: Phaser.GameObjects.Sprite) => {
                    sprite.setPosition(ag.x * TILE_HEIGHT, ag.y * TILE_HEIGHT);
                    sprite.play(effectAnimation);

                    const scale = TILE_HEIGHT / sprite.height;
                    sprite.setScale(scale);

                    promise.then(() => {
                        sprite.setVisible(false);
                        sprite.stop();
                    });
                },
            });
        });

        await promise;
    }

    return { playBattle };
};
