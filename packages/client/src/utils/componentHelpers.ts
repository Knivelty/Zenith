import { Entity, getComponentValueStrict } from "@dojoengine/recs";
import { ClientComponents } from "../dojo/createClientComponents";
import { getAbility, getOrder, getOrigins } from ".";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { logDebug } from "../ui/lib/utils";

export function getCreatureProfile(
    CreatureProfile: ClientComponents["CreatureProfile"],
    creature_index: number,
    level: number
) {
    const entity = getEntityIdFromKeys([BigInt(creature_index), BigInt(level)]);
    logDebug(
        `try get creature profile with creature idx ${creature_index} level ${level}`
    );
    const profile = getComponentValueStrict(CreatureProfile, entity);

    return {
        ...profile,
        order: getOrder(profile.order),
        origins: getOrigins(profile.origins),
        ability: getAbility(profile.ability),
    };
}
