import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "./useDojo";
import { hexStringToUtf8 } from "../../utils";

export function usePlayerProfile() {
    const {
        clientComponents: { PlayerProfile },
        account: { playerEntity },
    } = useDojo();

    const playerProfile = useComponentValue(PlayerProfile, playerEntity);

    const playerName = hexStringToUtf8(playerProfile?.name);

    return { playerName };
}
