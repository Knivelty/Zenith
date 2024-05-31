import {
    Entity,
    Has,
    getComponentValueStrict,
    updateComponent,
} from "@dojoengine/recs";
import { defineSystemST, zeroEntity } from "../../utils";
import { PhaserLayer } from "..";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { tween } from "@latticexyz/phaserx";

export const attack = (layer: PhaserLayer) => {
    const {
        world,
        scenes: {
            Main: { config, objectPool },
        },
        networkLayer: {
            clientComponents: {
                Attack,
                Piece,
                CreatureProfile,
                Health,
                GameStatus,
            },
            account: { address },
        },
    } = layer;

    defineSystemST<typeof Attack.schema>(
        world,
        [Has(Attack)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }

            const status = getComponentValueStrict(GameStatus, zeroEntity);

            const attacker = getComponentValueStrict(
                Piece,
                v.attacker as Entity
            );

            const isEnemy = attacker.owner === BigInt(address);

            const attackerCreature = getComponentValueStrict(
                CreatureProfile,
                getEntityIdFromKeys([
                    BigInt(attacker.creature_index),
                    BigInt(attacker.level),
                ])
            );

            const attacked = getComponentValueStrict(
                Piece,
                v.attacked as Entity
            );

            const attackedCreature = getComponentValueStrict(
                CreatureProfile,
                getEntityIdFromKeys([
                    BigInt(attacked.creature_index),
                    BigInt(attacked.level),
                ])
            );

            // boost attack here
            const boost = status.dangerous && isEnemy ? 1.2 : 1;

            const damage =
                attackerCreature.attack *
                boost *
                (attackedCreature.armor / (attackedCreature.armor + 1));

            const attackedHealth = getComponentValueStrict(
                Health,
                `${v.attacked}-health` as Entity
            );

            const modifiedHealth = attackedHealth.current - damage;

            updateComponent(Health, `${v.attacked}-health` as Entity, {
                current: modifiedHealth,
            });

            // play animation

            // attacker swing
            const attackerSprite = objectPool.get(v.attacker, "Sprite");
            attackerSprite.setComponent({
                id: v.attacker,
                now: async (sprite: Phaser.GameObjects.Sprite) => {
                    await tween(
                        {
                            targets: sprite,
                            duration: 300,
                            props: {
                                x: "+=50",
                            },
                            ease: Phaser.Math.Easing.Linear,
                            yoyo: true,
                            onComplete: async () => {
                                // resolve to allow next tween
                                // resolve();
                            },
                            onUpdate: () => {
                                //
                            },
                        },
                        { keepExistingTweens: true }
                    );
                },
            });

            // attacked blink

            const attackedSprite = objectPool.get(v.attacked, "Sprite");
            attackedSprite.setComponent({
                id: v.attacker,
                now: async (sprite: Phaser.GameObjects.Sprite) => {
                    await tween(
                        {
                            targets: sprite,
                            duration: 300,
                            props: {
                                alpha: 0,
                            },
                            ease: Phaser.Math.Easing.Linear,
                            yoyo: true,
                            onComplete: async () => {
                                // resolve to allow next tween
                                // resolve();
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
