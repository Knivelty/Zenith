import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "./useDojo";
import { bigIntToUtf8 } from "../../utils";
import { ClientComponents } from "../../dojo/createClientComponents";
import { Entity, getComponentValue } from "@dojoengine/recs";

export function usePlayerProfile() {
    const {
        clientComponents: { PlayerProfile },
        account: { playerEntity },
    } = useDojo();

    const playerProfile = useComponentValue(PlayerProfile, playerEntity);

    const playerName = bigIntToUtf8(playerProfile?.name);

    return { playerName };
}

export function getPlayerProfile(
    PlayerProfile: ClientComponents["PlayerProfile"],
    playerEntity: Entity
) {
    const playerProfile = getComponentValue(PlayerProfile, playerEntity);

    const playerName = bigIntToUtf8(playerProfile?.name);

    return { playerName };
}
