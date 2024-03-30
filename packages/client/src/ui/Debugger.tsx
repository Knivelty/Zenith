import { useComponentValue } from "@dojoengine/react";
import { Button } from "./button";
import { useDojo } from "./hooks/useDojo";
import { useEffect } from "react";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useUIStore } from "../store";
import { numToStatus } from "../dojo/types";
import { zeroEntity } from "../utils";

export function Debugger() {
    const {
        account: { account },
        systemCalls: {
            nextRound,
            startBattle,
            commitPreparation,
            playAnimation,
            getCoin,
            refreshAltar,
        },
        clientComponents: { MatchState, Player, GameStatus },
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
                    const { receipt } = await commitPreparation(account);
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
                    const { receipt } = await nextRound(account);
                }}
            >
                next round
            </Button>
            <Button>current Round: {matchState?.round}</Button>
            <Button>coin: {player?.coin}</Button>
            <Button
                onClick={async () => {
                    getCoin(account);
                }}
            >
                Get Coin
            </Button>
            <Button>status: {numToStatus(gameStatus?.status)}</Button>
            <Button
                onClick={async () => {
                    refreshAltar(account);
                }}
            >
                refresh altar
            </Button>
            <Button
                onClick={async () => {
                    location.reload();
                }}
            >
                refresh
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
        </div>
    );
}
