import { useDojo } from "./useDojo";
import { getComponentValueStrict } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { Monster } from "../../phaser/config/constants";
import { ClientComponents } from "../../dojo/createClientComponents";
import { getPieceEntity } from "../lib/utils";
import { getOrder, getOrigins } from "../../utils";

export const SELL_PRICE: Record<number, Record<number, number>> = {
    1: {
        1: 1,
        2: 3,
        3: 8,
    },
    2: {
        1: 3,
        2: 7,
        3: 20,
    },
    3: { 1: 5, 2: 11, 3: 32 },
};

export interface HeroBaseAttr {
    attack: number;
    cost: number;
    sellPrice: number;
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
    owner: bigint;
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

export function getSellPrice({
    rarity,
    level,
}: {
    rarity: number;
    level: number;
}) {
    return SELL_PRICE[rarity][level];
}

export function getPieceAttr(Piece: ClientComponents["Piece"], gid?: number) {
    if (!gid) {
        return undefined;
    }
    const piece = getComponentValueStrict(Piece, getPieceEntity(gid));
    return {
        owner: piece.owner,
        gid: piece.gid,
        isOverride: Piece.isEntityOverride(getPieceEntity(gid)),
    };
}

export function getHeroAttr(
    creatureProfile: ClientComponents["CreatureProfile"],
    creature: CreatureKey
): HeroBaseAttr | undefined {
    if (!creature.id || !creature.level) {
        return undefined;
    }

    // logDebug("get creature profile", creature.id, creature.level);

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
        cost: 2 * profile.rarity - 1,
        sellPrice: getSellPrice({
            rarity: profile.rarity,
            level: profile.level,
        }),
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

export function useHeroesAttr(creature: CreatureKey): HeroBaseAttr | undefined {
    const {
        clientComponents: { CreatureProfile },
    } = useDojo();

    const attr = getHeroAttr(CreatureProfile, creature);

    return attr;
}
