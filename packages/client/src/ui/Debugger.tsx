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
        systemCalls: { nextRound, startBattle, playAnimation },
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
            {/* <Tour open={open} onClose={() => setOpen(false)} steps={steps} />
    
          <div className="fixed left-4 bottom-32">
            <Button type="primary" onClick={() => setOpen(true)}>
              How To Play
            </Button>
          </div> */}
            {/* <GameStatusBar />
            <ShopCom />
            <div className="handle-area">
                <Chessboard setAcHeroFn={setAcHeroFn} />
                <Inventory setAcHeroFn={setAcHeroFn} />
            </div> */}
            <Button
                onClick={async () => {
                    const { receipt } = await startBattle(account);
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
            <Button>status: {numToStatus(gameStatus?.status)}</Button>
            <Button
                onClick={async () => {
                    location.reload();
                }}
            >
                refresh
            </Button>
        </div>
    );
}
