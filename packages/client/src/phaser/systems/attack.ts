import {
    Entity,
    Has,
    getComponentValueStrict,
    setComponent,
    updateComponent,
} from "@dojoengine/recs";
import { defineSystemST } from "../../utils";
import { PhaserLayer } from "..";
import { getEntityIdFromKeys } from "@dojoengine/utils";

export const attack = (layer: PhaserLayer) => {
    const {
        world,
        scenes: {
            Main: { config, objectPool },
        },
        networkLayer: {
            clientComponents: { Attack, Piece, CreatureProfile, Health },
        },
    } = layer;

    defineSystemST<typeof Attack.schema>(
        world,
        [Has(Attack)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }

            const attacker = getComponentValueStrict(
                Piece,
                v.attacker as Entity
            );

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

            const damage =
                attackerCreature.attack *
                (attackedCreature.armor / (attackedCreature.armor + 1));

            const attackedHealth = getComponentValueStrict(
                Health,
                `${v.attacked}-health` as Entity
            );

            const modifiedHealth = attackedHealth.current - damage;

            updateComponent(Health, `${v.attacked}-health` as Entity, {
                current: modifiedHealth,
            });
        }
    );
};
