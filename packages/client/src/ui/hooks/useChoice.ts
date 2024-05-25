import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "./useDojo";
import { ClientComponents } from "../../dojo/createClientComponents";
import { getComponentValueStrict } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useMemo } from "react";

export function useChoice() {
    const {
        clientComponents: { ChoiceProfile, Player },
        account: { playerEntity },
    } = useDojo();

    const player = useComponentValue(Player, playerEntity);

    const choices = useMemo(() => {
        return getChoices(ChoiceProfile, player?.choiceType || 1);
    }, [player?.choiceType, ChoiceProfile]);

    return choices;
}

export function getChoices(
    ChoiceProfile: ClientComponents["ChoiceProfile"],
    t: number
) {
    return Array.from({ length: 5 }, (_, i: number) => i + 1).map((i) => {
        return getComponentValueStrict(
            ChoiceProfile,
            getEntityIdFromKeys([BigInt(t), BigInt(i)])
        );
    });
}
