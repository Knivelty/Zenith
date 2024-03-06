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
            clientComponents: { Attack, Piece, Creature, Health },
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
                Creature,
                getEntityIdFromKeys([BigInt(attacker.internal_index)])
            );

            const attacked = getComponentValueStrict(
                Piece,
                v.attacked as Entity
            );

            const attackedCreature = getComponentValueStrict(
                Creature,
                getEntityIdFromKeys([BigInt(attacked.internal_index)])
            );

            const damage =
                attackerCreature.attack * attacker.tier -
                attackedCreature.armor;

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
