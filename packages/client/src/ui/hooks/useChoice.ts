import { useDojo } from "./useDojo";
import { ClientComponents } from "../../dojo/createClientComponents";
import { getComponentValue } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useEffect, useMemo, useState } from "react";
import { logDebug } from "../lib/utils";

export function useChoice() {
    const {
        clientComponents: { ChoiceProfile, Player, CurseOption, GameStatus },
        account: {
            account: { address },
        },
    } = useDojo();

    const [value, setValue] = useState<any>();
    useEffect(() => {
        const subscription = CurseOption.update$.subscribe((newValue) => {
            setValue(newValue);
        });

        return () => subscription.unsubscribe();
    }, [CurseOption.update$, setValue]);

    const choices = useMemo(() => {
        return getChoices(ChoiceProfile, CurseOption, address);
    }, [address, ChoiceProfile, CurseOption]);

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
