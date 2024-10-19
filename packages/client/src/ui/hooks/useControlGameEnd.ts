import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "./useDojo";
import { zeroEntity } from "../../utils";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useEffect, useMemo } from "react";
import { ShowItem, useUIStore } from "../../store";
import { logDebug } from "../lib/utils";

export function useGameEnd() {
    const {
        clientComponents: { GameStatus, MatchResult, Player },
        account: { playerEntity },
    } = useDojo();

    const s = useComponentValue(GameStatus, zeroEntity);
    const playerValue = useComponentValue(Player, playerEntity);

    const result = useComponentValue(
        MatchResult,
        getEntityIdFromKeys([BigInt(s?.currentMatch ?? 0)])
    );

    logDebug(
        "check player in match and game end",
        playerValue,
        s?.currentMatch,
        result
    );

    const end = useMemo(() => {
        let e = false;

        if (result?.index === playerValue?.inMatch && s?.played === true) {
            e = true;
        }
        return e;
    }, [playerValue?.inMatch, result?.index, s?.played]);

    return { end, result };
}

export function useControlGameEnd() {
    const setShow = useUIStore((state) => state.setShow);
    const { end } = useGameEnd();

    useEffect(() => {
        setShow(ShowItem.GameOverDialog, end);
    }, [end, setShow]);
}
