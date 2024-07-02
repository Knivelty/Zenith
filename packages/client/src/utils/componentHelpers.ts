import { Entity, getComponentValueStrict } from "@dojoengine/recs";
import { ClientComponents } from "../dojo/createClientComponents";
import { getAbility, getOrder, getOrigins } from ".";

export function getCreatureProfile(
    CreatureProfile: ClientComponents["CreatureProfile"],
    entity: Entity
) {
    const profile = getComponentValueStrict(CreatureProfile, entity);

    return {
        ...profile,
        order: getOrder(profile.order),
        origins: getOrigins(profile.origins),
        ability: getAbility(profile.ability),
    };
}
