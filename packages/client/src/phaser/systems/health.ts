import { Has, updateComponent } from "@dojoengine/recs";
import { defineSystemST } from "../../utils";
import { PhaserLayer } from "..";
import { HealthBarOffSetY, Sprites } from "../config/constants";
import { Assets, Sprite } from "@latticexyz/phaserx/src/types";

export const health = (layer: PhaserLayer) => {
    const {
        world,
        scenes: {
            Main: { config, objectPool },
        },
        networkLayer: {
            clientComponents: { HealthBar, Health },
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

            const healthBarEntity = `${entity}-bar`;

            // update health bar length
            const healthBar = objectPool.get(healthBarEntity, "Sprite");
            healthBar.setComponent({
                id: healthBarEntity,
                once: async (rec: Phaser.GameObjects.Sprite) => {
                    const percentage =
                        Math.floor((v.current / v.max) * 100) / 100;
                    rec.setScale(percentage * 10, 10);
                },
            });

            // if health smaller than zero, despwan
            if (v.current <= 0) {
                const piece = objectPool.get(v.pieceEntity, "Sprite");

                console.warn(`${v.pieceEntity} removed`);

                // TODO: delete ecs component and let a system to despawn
                // healthBar.despawn();
                // piece.despawn();
                healthBar.setComponent({
                    id: healthBarEntity,
                    once: async (rec: Phaser.GameObjects.Sprite) => {
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

            const healthBar = objectPool.get(entity, "Sprite");

            // spawn health bar
            healthBar.setComponent({
                id: entity,
                once: async (rec: Phaser.GameObjects.Sprite) => {
                    rec.setVisible(true);

                    let healthBar: Sprite<Assets>;
                    if (v.isPlayer) {
                        healthBar = config.sprites[Sprites.PlayerHealthBar];
                    } else {
                        healthBar = config.sprites[Sprites.EnemyHealthBar];
                    }

                    rec.setTexture(healthBar.assetKey, healthBar.frame);
                    rec.setPosition(v.x, v.y - HealthBarOffSetY);
                    // rec.setDepth(10);

                    rec.setScale(v.percentage / 10, 10);
                },
            });
        }
    );
};
