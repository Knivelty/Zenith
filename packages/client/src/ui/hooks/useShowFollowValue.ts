import { useMemo } from "react";
import { ShowItem, useUIStore } from "../../store";
import { useDojo } from "./useDojo";
import { useComponentValue } from "@dojoengine/react";
import { zeroEntity } from "../../utils";

export function useShowFollowValue() {
    const {
        clientComponents: { UserOperation },
    } = useDojo();
    const setShow = useUIStore((state) => state.setShow);

    const userOp = useComponentValue(UserOperation, zeroEntity);

    // SynergyDetail shows follow the userOp.selectedTrait
    useMemo(() => {
        if (userOp?.selectedTrait) {
            setShow(ShowItem.SynergyDetail, true);
        } else {
            setShow(ShowItem.SynergyDetail, false);
        }
    }, [setShow, userOp]);
}
