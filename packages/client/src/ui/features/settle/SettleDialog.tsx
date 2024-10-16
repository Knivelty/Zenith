import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "../../hooks/useDojo";
import { zeroEntity } from "../../../utils";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { cn, logDebug } from "../../lib/utils";
import { ChoiceList } from "./ChoiceList";
import { useCallback, useMemo, useState } from "react";
import { ShowItem, UIStore, useUIStore } from "../../../store";
import { useHotkeys } from "react-hotkeys-hook";
import { GreenButton } from "../../components/GreenButton";
import useCountdown from "ahooks/lib/useCountDown";
import { useCountDown } from "ahooks";
import { LoadingShade } from "../../components/LoadingShade";

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
            setShow(ShowItem.SettleDialog, true);
        } else {
            setShow(ShowItem.SettleDialog, false);
            setShow(ShowItem.MakeChoice, false);
        }
    }, [status?.status, setShow]);

    const win = battleResult?.winner === BigInt(address);

    const text = win ? "VICTORY" : "LOSE";

    const descText = win
        ? "Oh, Adventurer, so you do have some skill after all. But don't celebrate too soon. The next beasts are fiercer. Do you dare to continue?"
        : "You couldn't make it, Adventurer. Your strength isn't enough. Better leave now before you die. The beasts ahead are even more dangerous.";

    if (!getShow(ShowItem.SettleDialog)) {
        return <div></div>;
    }

    return (
        <div
            className={cn(
                "absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border bg-black border-[#06FF00] flex flex-col items-center justify-start w-1/2 h-[53%] z-30",
                { "text-white": !win }
            )}
        >
            <div className="text-2xl font-bold mt-20">{text}</div>
            <div className="text-l mt-12 w-4/5">{descText}</div>

            <div className="text-xl mt-12 flex flex-row whitespace-pre">
                <div></div>
                <div className="">
                    {inningBattle?.healthDecrease
                        ? `You lose ${inningBattle?.healthDecrease} HP,`
                        : ""}
                </div>
                <div> + {inningBattle?.homePlayerCoinInc || 0} gold</div>
            </div>
            {status?.currentRound && status?.currentRound > 3 ? (
                <GotoMakeChoice />
            ) : (
                <DirectNextRound />
            )}
        </div>
    );
}

function GotoMakeChoice() {
    const setShow = useUIStore((store) => store.setShow);

    const gotoChoiceFn = useCallback(() => {
        setShow(ShowItem.MakeChoice, true);
        setShow(ShowItem.SettleDialog, false);
    }, [setShow]);

    const [countdown, formattedRes] = useCountDown({
        leftTime: 4000,
        targetDate: "s",
        onEnd: () => {
            gotoChoiceFn();
        },
    });

    useHotkeys("enter", gotoChoiceFn);

    return (
        <div className="mt-8 border">
            <GreenButton onClick={gotoChoiceFn}>
                Go Make Choice {formattedRes.seconds}
            </GreenButton>
        </div>
    );
}

function DirectNextRound() {
    const {
        systemCalls: { nextRound },
        account: { account },
    } = useDojo();

    const [loading, setLoading] = useState(false);

    const nextRoundFn = useCallback(() => {
        setLoading(true);
        nextRound(account, 0).finally(() => {
            setLoading(false);
        });
    }, [nextRound, account]);

    useHotkeys("enter", nextRoundFn);

    return (
        <div className="mt-8 border relative">
            <GreenButton onClick={nextRoundFn}>
                <div>Next Round</div>{" "}
                <LoadingShade
                    className=""
                    gifClassName="h-2/3"
                    loading={loading}
                />
            </GreenButton>
        </div>
    );
}
