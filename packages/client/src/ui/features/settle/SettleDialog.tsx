import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "../../hooks/useDojo";
import { zeroEntity } from "../../../utils";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { cn, logDebug } from "../../lib/utils";
import { ChoiceList } from "./ChoiceList";
import { useCallback, useMemo } from "react";
import { ShowItem, UIStore, useUIStore } from "../../../store";
import { useHotkeys } from "react-hotkeys-hook";

export function SettleDialog() {
    const {
        systemCalls: { nextRound },
        account: {
            account,
            account: { address },
            playerEntity,
        },
        clientComponents: { GameStatus, BattleLogs, Player, InningBattle },
    } = useDojo();

    const setShow = useUIStore((state) => state.setShow);
    const getShow = useUIStore((state: UIStore) => state.getShow);

    const status = useComponentValue(GameStatus, zeroEntity);
    const player = useComponentValue(Player, playerEntity);

    const inningBattleEntity = getEntityIdFromKeys([
        BigInt(status?.currentMatch || 0),
        BigInt(status?.currentRound || 0),
    ]);

    const battleResult = useComponentValue(BattleLogs, inningBattleEntity);

    const inningBattle = useComponentValue(InningBattle, inningBattleEntity);

    useMemo(() => {
        if (status?.status === 3) {
            setShow(ShowItem.Shade, true);
            setShow(ShowItem.SettleDialog, true);
        } else {
            setShow(ShowItem.SettleDialog, false);
            setShow(ShowItem.Shade, false);
        }
    }, [status?.status, setShow]);

    const win = battleResult?.winner === BigInt(address);

    logDebug("inningBattle: ", inningBattle);

    const text = win ? "VICTORY" : "LOSE";

    if (!getShow(ShowItem.SettleDialog)) {
        return <div></div>;
    }

    return (
        <div
            className={cn(
                "absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border bg-black border-[#06FF00] flex flex-col items-center justify-start w-4/5 z-30 h-[42rem]"
            )}
        >
            <div className="text-[#FF3D00] text-xl mt-12">{text}</div>
            <div className="text-l mt-4 flex flex-row whitespace-pre">
                <div>You </div>
                <div className="">
                    {inningBattle?.healthDecrease
                        ? `lose ${inningBattle?.healthDecrease} health,`
                        : ""}
                </div>
                <div> gain {inningBattle?.homePlayerCoinInc || 0} coin</div>
            </div>
            {status?.currentRound && status?.currentRound > 3 ? (
                <MakeChoice />
            ) : (
                <DirectNextRound />
            )}
        </div>
    );
}

function MakeChoice() {
    return (
        <div className="w-full flex flex-col items-center">
            <ChoiceList />

            <div className="mt-12 text-[#06FF00] ">
                Choose one to affect either the Curse value or the Danger value.
            </div>
            <div className="flex text-[#06FF00] flex-row mt-2">
                <img className="w-6 h-6" src="/assets/ui/warning.png"></img>
                <div className="ml-2">
                    You must choose one before entering the next round
                </div>
            </div>
        </div>
    );
}

function DirectNextRound() {
    const {
        systemCalls: { nextRound },
        account: { account },
    } = useDojo();

    const nextRoundFn = useCallback(() => {
        nextRound(account, 0);
    }, [nextRound, account]);

    useHotkeys("enter", nextRoundFn);

    return (
        <div className="mt-40 border">
            <button onClick={nextRoundFn}>Next Round</button>
        </div>
    );
}
