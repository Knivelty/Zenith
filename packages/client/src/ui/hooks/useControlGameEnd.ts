import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "./useDojo";
import { zeroEntity } from "../../utils";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useEffect } from "react";
import { ShowItem, useUIStore } from "../../store";

export function useGameEnd() {
    const {
        clientComponents: { GameStatus, MatchResult },
    } = useDojo();

    const s = useComponentValue(GameStatus, zeroEntity);

    const result = useComponentValue(
        MatchResult,
        getEntityIdFromKeys([BigInt(s?.currentMatch ?? 0)])
    );

    let end = false;

    if (result?.index == s?.currentMatch) {
        end = true;
    }

    return { end, result };
}

export function useControlGameEnd() {
    const setShow = useUIStore((state) => state.setShow);
    const { end } = useGameEnd();

    useEffect(() => {
        if (end) {
            setShow(ShowItem.GameOverDialog, true);
        }
    }, [end, setShow]);
}
