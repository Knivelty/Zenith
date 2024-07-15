import {
    Entity,
    Has,
    getComponentValueStrict,
    setComponent,
    updateComponent,
} from "@dojoengine/recs";
import { defineSystemST } from "../../../utils";
import { PhaserLayer } from "../..";
import {
    DAMAGE_TEXT_FONT_SIZE,
    HEALTH_BAR_BORDER_COLOR,
    HEALTH_BAR_BORDER_WIDTH,
    HEALTH_BAR_EMPTY_COLOR,
    HEALTH_BAR_ENEMY_COLOR,
    HEALTH_BAR_HEIGHT,
    HEALTH_BAR_PLAYER_COLOR,
    HEALTH_BAR_WIDTH,
    HEALTH_PER_SEGMENT,
    HealthBarOffSetY,
    Health_CHANGE_OFFSET_X,
    Health_CHANGE_OFFSET_Y,
} from "../../config/constants";
import { tween } from "@latticexyz/phaserx";
import { logDebug } from "../../../ui/lib/utils";
import { deferred } from "@latticexyz/utils";
import { isEqual } from "lodash";

export const health = (layer: PhaserLayer) => {
    const {
        world,
        scenes: {
            Main: { config, objectPool },
        },
        networkLayer: {
            clientComponents: { HealthBar, Health, HealthChange, LocalPiece },
        },
    } = layer;

    defineSystemST<typeof Health.schema>(
        world,
        [Has(Health)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }
            //

            // update health bar
            const healthBarEntity = `${entity}-bar`;
            const healthBar = objectPool.get(healthBarEntity, "Graphics");

            const filledSegments = Math.ceil(v.current / HEALTH_PER_SEGMENT);
            updateComponent(HealthBar, healthBarEntity as Entity, {
                filledSegments: filledSegments,
                currentHealth: v.current,
            });

            // if health smaller than zero, despawn
            if (v.current <= 0) {
                const piece = objectPool.get(v.pieceEntity, "Sprite");

                console.warn(`${v.pieceEntity} removed`);

                // TODO: delete ecs component and let a system to despawn
                // healthBar.despawn();
                // piece.despawn();
                healthBar.setComponent({
                    id: healthBarEntity,
                    once: async (rec: Phaser.GameObjects.Graphics) => {
                        rec.setVisible(false);
                    },
                });
                piece.setComponent({
                    id: v.pieceEntity,
                    now: (sprite: Phaser.GameObjects.Sprite) => {
                        sprite.setVisible(false);
                    },
                });
            }
        }
    );

    // health bar
    defineSystemST<typeof HealthBar.schema>(
        world,
        [Has(HealthBar)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }

            const healthBar = objectPool.get(entity, "Graphics");
            const pieceEntity = entity.split("-")[0];

            const localPiece = getComponentValueStrict(
                LocalPiece,
                pieceEntity as Entity
            );

            if (localPiece.idx === 0) {
                // it mean piece is not on board
                return;
            }

            // spawn health bar
            healthBar.setComponent({
                id: entity,
                once: async (graphics: Phaser.GameObjects.Graphics) => {
                    graphics.setVisible(true);

                    graphics.clear();

                    const fillColor = v.isPlayer
                        ? HEALTH_BAR_PLAYER_COLOR
                        : HEALTH_BAR_ENEMY_COLOR;

                    const segmentWidth = HEALTH_BAR_WIDTH / v.segments;

                    const segmentInterval = 0.5;

                    for (let i = 0; i < v.segments; i++) {
                        const x = i * segmentWidth;
                        const y = 0;

                        // Draw filled or empty segment
                        graphics.fillStyle(
                            i < v.filledSegments
                                ? fillColor
                                : HEALTH_BAR_EMPTY_COLOR,
                            1
                        );

                        graphics.fillRect(
                            x,
                            y,
                            segmentWidth - segmentInterval,
                            HEALTH_BAR_HEIGHT - HEALTH_BAR_BORDER_WIDTH * 2
                        );

                        // Draw border
                        graphics.lineStyle(
                            HEALTH_BAR_BORDER_WIDTH,
                            HEALTH_BAR_BORDER_COLOR,
                            1
                        );
                        graphics.strokeRect(
                            x,
                            y,
                            segmentWidth,
                            HEALTH_BAR_HEIGHT
                        );
                    }

                    graphics.setPosition(v.x, v.y - HealthBarOffSetY);
                },
            });

            // update health change
            const healthChangeEntity = `${entity.split("-")[0]}-health-change`;
            const change = !preV?.currentHealth
                ? 0
                : v.currentHealth - preV.currentHealth;
            const sign = change > 0 ? true : false;
            setComponent(HealthChange, healthChangeEntity as Entity, {
                x: v.x,
                y: v.y - HealthBarOffSetY,
                change: Math.abs(change),
                sign,
            });
        }
    );

    // health Damage
    defineSystemST<typeof HealthChange.schema>(
        world,
        [Has(HealthChange)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }

            if (v.change === 0) {
                return;
            }

            const healthChange = objectPool.get(entity, "Text");

            const [resolve, , promise] = deferred<void>();

            // spawn health bar
            healthChange.setComponent({
                id: entity,
                once: async (text: Phaser.GameObjects.Text) => {
                    logDebug(`spawn text`, v);
                    text.setText(v.sign ? "+" : "-" + v.change.toFixed(0));
                    text.setVisible(true);
                    text.setFont("Dogica Pixel");
                    text.setColor("#FF3D00");
                    text.setFontSize(DAMAGE_TEXT_FONT_SIZE);
                    text.setPosition(
                        v.x + Health_CHANGE_OFFSET_X,
                        v.y + Health_CHANGE_OFFSET_Y
                    );
                    text.setAlpha(0);
                    await tween(
                        {
                            targets: text,
                            duration: 200,
                            props: {
                                alpha: 1,
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
        }
    );
};
