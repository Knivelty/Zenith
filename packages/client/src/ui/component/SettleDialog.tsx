import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "../hooks/useDojo";
import { zeroEntity } from "../../utils";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { cn } from "../lib/utils";
import { ChoiceList } from "./ChoiceList";
import { useMemo } from "react";
import { ShowItem, useUIStore } from "../../store";

export function SettleDialog() {
    const {
        systemCalls: { nextRound },
        account: {
            account,
            account: { address },
            playerEntity,
        },
        clientComponents: { GameStatus, BattleLogs, Player },
    } = useDojo();

    const setShow = useUIStore((state) => state.setShow);

    const status = useComponentValue(GameStatus, zeroEntity);
    const player = useComponentValue(Player, playerEntity);

    const battleResult = useComponentValue(
        BattleLogs,
        getEntityIdFromKeys([
            BigInt(status?.currentMatch || 0),
            BigInt(status?.currentRound || 0),
        ])
    );

    const visible = status?.status === 3;

    useMemo(() => {
        setShow(ShowItem.Shade, visible);
    }, [visible, setShow]);

    const win = battleResult?.winner === BigInt(address);

    const text = win ? "VICTORY" : "LOSE";

    return (
        <div
            className={cn(
                "absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border bg-black border-[#06FF00] flex flex-col items-center justify-start w-4/5 z-30 h-[32rem]",
                { invisible: !visible }
            )}
        >
            <div className="text-[#FF3D00] text-xl mt-12">{text}</div>
            {/* <ChoiceList /> */}
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

            <div className="text-white ">
                Choose any option to proceed to the next level
            </div>
        </div>
    );
}

function DirectNextRound() {
    const {
        systemCalls: { nextRound },
        account: { account },
    } = useDojo();
    return (
        <div className="mt-40 border">
            <button
                onClick={() => {
                    nextRound(account, 0);
                }}
            >
                Next Round
            </button>
        </div>
    );
}
