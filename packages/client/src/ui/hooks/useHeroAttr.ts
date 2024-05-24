import { useEffect, useState } from "react";
import { useDojo } from "./useDojo";
import { getComponentValueStrict } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { Monster } from "../../phaser/config/constants";
import { ClientComponents } from "../../dojo/createClientComponents";

export interface HeroBaseAttr {
    attack: number;
    cost: number;
    level: number;
    creature: number;
    armor: number;
    health: number;
    speed: number;
    range: number;
    thumb: string;
    rarity: number;
    name: string;
}

export interface PieceAttr extends HeroBaseAttr {
    gid: number;
}

export type CreatureKeys = {
    id?: number;
    level: number;
};

export function getHeroThumb(creatureIdx: number) {
    return `/assets/sprites/${Monster[creatureIdx].toLowerCase()}/0.png`;
}

export function getHeroName(creatureIdx: number) {
    return Monster[creatureIdx];
}

export function getHeroAttr(
    creatureProfile: ClientComponents["CreatureProfile"],
    creature: CreatureKeys
): HeroBaseAttr | undefined {
    if (!creature.id) {
        return undefined;
    }

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
        thumb: getHeroThumb(profile.creature_index),
        rarity: profile.rarity,
        name: getHeroName(profile.creature_index),
    };
}

export function useHeroesAttr(creatures: CreatureKeys[]): HeroBaseAttr[] {
    const {
        clientComponents: { CreatureProfile },
    } = useDojo();
    const [attrs, setAttrs] = useState<HeroBaseAttr[]>([]);

    useEffect(() => {
        setAttrs(
            creatures.map((c) => {
                const creatureProfile = getComponentValueStrict(
                    CreatureProfile,
                    getEntityIdFromKeys([BigInt(c.id || 0), BigInt(c.level)])
                );

                return {
                    attack: creatureProfile.attack,
                    creature: creatureProfile.creature_index,
                    armor: creatureProfile.armor,
                    health: creatureProfile.health,
                    speed: creatureProfile.speed,
                    range: creatureProfile.range,
                    cost: creatureProfile.level,
                    level: creatureProfile.level,
                    thumb: getHeroThumb(creatureProfile.creature_index),
                };
            }) as HeroBaseAttr[]
        );
    }, [creatures, CreatureProfile]);

    return attrs;
}
