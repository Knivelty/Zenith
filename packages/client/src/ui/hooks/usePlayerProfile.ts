import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "./useDojo";
import { bigIntToUtf8 } from "../../utils";

export function usePlayerProfile() {
    const {
        clientComponents: { PlayerProfile },
        account: { playerEntity },
    } = useDojo();

    const playerProfile = useComponentValue(PlayerProfile, playerEntity);

    const playerName = bigIntToUtf8(playerProfile?.name);

    return { playerName };
}
