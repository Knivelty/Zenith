import { useDojo } from "./useDojo";
import { ClientComponents } from "../../dojo/createClientComponents";
import { getComponentValue, getComponentValueStrict } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useMemo } from "react";
import { logDebug } from "../lib/utils";
import { useComponentValue } from "@dojoengine/react";
import { zeroEntity } from "../../utils";

export function useChoice() {
    const {
        clientComponents: { ChoiceProfile, Player, CurseOption, GameStatus },
        account: {
            account: { address },
        },
    } = useDojo();

    const status = useComponentValue(GameStatus, zeroEntity);

    const choices = useMemo(() => {
        return getChoices(ChoiceProfile, CurseOption, address);
    }, [address, ChoiceProfile, status?.status, CurseOption]);

    return choices;
}

export function getChoices(
    ChoiceProfile: ClientComponents["ChoiceProfile"],
    CurseOption: ClientComponents["CurseOption"],
    address: string
) {
    return Array.from({ length: 3 }, (_, i: number) => i + 1).map((i) => {
        const co = getComponentValue(
            CurseOption,
            getEntityIdFromKeys([BigInt(address), BigInt(i)])
        );

        logDebug(`choice profile: ${i} ${co?.order}`, co);
        return getComponentValue(
            ChoiceProfile,
            getEntityIdFromKeys([BigInt(i), BigInt(co?.order || 0)])
        );
    });
}
