import { useDojo } from "./useDojo";
import { getComponentValueStrict } from "@dojoengine/recs";
import { toUtf8String } from "ethers/lib/utils";
import { groupBy, prop, sortBy } from "ramda";
import { ClientComponents } from "../../dojo/createClientComponents";

export interface ISynergyStatus {
    synergyEntity: string;
}

export function useAllSynergies() {
    const {
        clientComponents: { SynergyProfile },
    } = useDojo();

    return getAllSynergies(SynergyProfile);
}

export function getAllSynergies(
    SynergyProfile: ClientComponents["SynergyProfile"]
) {
    const allEntities = SynergyProfile.entities();

    const allSynergies: {
        trait_name: string;
        requiredPieces: number;
    }[] = [];

    for (const entity of allEntities) {
        const profile = getComponentValueStrict(SynergyProfile, entity);

        allSynergies.push({
            trait_name: toUtf8String("0x" + profile.trait_name.toString(16)),
            requiredPieces: profile.requiredPieces,
        });
    }

    const sortedGroupedSynergy = groupBy(
        prop("trait_name"),
        sortBy(prop("requiredPieces"), allSynergies)
    );

    return sortedGroupedSynergy;
}
