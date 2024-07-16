import { useEffect, useState } from "react";
import { useDojo } from "./useDojo";
import { getComponentValueStrict } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { Monster } from "../../phaser/config/constants";
import { ClientComponents } from "../../dojo/createClientComponents";
import { logDebug } from "../lib/utils";
import { getOrder, getOrigins } from "../../utils";

export interface HeroBaseAttr {
    attack: number;
    cost: number;
    level: number;
    creature: number;
    armor: number;
    health: number;
    speed: number;
    initiative: number;
    range: number;
    thumb: string;
    order: string;
    origins: string[];
    ability: string;
    rarity: number;
    name: string;
}

export interface PieceAttr extends HeroBaseAttr {
    gid: number;
    isOverride: boolean;
}

export type CreatureKey = {
    id?: number;
    level?: number;
};

export function getHeroThumb(creatureIdx: number) {
    return `/assets/monsters/${Monster[creatureIdx].toLowerCase()}/0.png`;
}

export function getHeroName(creatureIdx: number) {
    return Monster[creatureIdx];
}

export function getHeroAttr(
    creatureProfile: ClientComponents["CreatureProfile"],
    creature: CreatureKey
): HeroBaseAttr | undefined {
    if (!creature.id || !creature.level) {
        return undefined;
    }

    logDebug("get creature profile", creature.id, creature.level);

    const profile = getComponentValueStrict(
        creatureProfile,
        getEntityIdFromKeys([BigInt(creature.id), BigInt(creature.level)])
    );

    return {
        attack: profile.attack,
        creature: profile.creature_index,
        armor: profile.armor,
        health: profile.health,
        speed: profile.speed,
        range: profile.range,
        cost: profile.level,
        level: profile.level,
        initiative: profile.initiative,
        thumb: getHeroThumb(profile.creature_index),
        order: getOrder(profile.order),
        origins: getOrigins(profile.origins),
        ability: "",
        rarity: profile.rarity,
        name: getHeroName(profile.creature_index),
    };
}

export function useHeroesAttr(
    creature: CreatureKey
): HeroBaseAttr | undefined {
    const {
        clientComponents: { CreatureProfile },
    } = useDojo();

    const attr = getHeroAttr(CreatureProfile, creature);

    return attr;
}
