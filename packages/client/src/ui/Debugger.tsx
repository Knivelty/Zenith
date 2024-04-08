import { useComponentValue } from "@dojoengine/react";
import { Button } from "./button";
import { useDojo } from "./hooks/useDojo";
import { useEffect } from "react";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useUIStore } from "../store";
import { numToStatus } from "../dojo/types";
import { zeroEntity } from "../utils";
import { getComponentValueStrict } from "@dojoengine/recs";

export function Debugger() {
    const {
        account: { account, playerEntity },
        systemCalls: {
            nextRound,
            startBattle,
            commitPreparation,
            playAnimation,
            getCoin,
            refreshAltar,
        },
        clientComponents: { MatchState, Player, GameStatus, LocalPlayer },
    } = useDojo();

    const player = useComponentValue(
        Player,
        getEntityIdFromKeys([BigInt(account.address)])
    );

    const gameStatus = useComponentValue(GameStatus, zeroEntity);
    const setLoggedIn = useUIStore((state: any) => state.setLoggedIn);

    useEffect(() => {
        if (player?.inMatch && player?.inMatch > 0) {
            setLoggedIn();
        }
    }, [player?.inMatch, setLoggedIn]);

    const matchState = useComponentValue(
        MatchState,
        getEntityIdFromKeys([BigInt(player?.inMatch || 0)])
    );

    return (
        <div className="flex absolute gap-4 flex-wrap flex-col justify-between p-2 space-x-3 z-10">
            <Button>Debug Buttons</Button>
            <Button
                onClick={async () => {
                    await commitPreparation(account);
                }}
            >
                start battle
            </Button>
            <Button
                onClick={async () => {
                    playAnimation();
                }}
            >
                Play Animation
            </Button>
            <Button
                onClick={async () => {
                    await nextRound(account);
                }}
            >
                next round
            </Button>
            <Button
                onClick={async () => {
                    getCoin(account);
                }}
            >
                Get Coin
            </Button>
            <Button
                onClick={async () => {
                    const keyJson = localStorage.getItem("burners");
                    if (keyJson) {
                        navigator.clipboard.writeText(keyJson);
                        alert("private key copied");
                    }
                }}
            >
                copy private key
            </Button>
            <Button
                onClick={async () => {
                    const player = getComponentValueStrict(
                        LocalPlayer,
                        playerEntity
                    );
                }}
            >
                log values
            </Button>
        </div>
    );
}
