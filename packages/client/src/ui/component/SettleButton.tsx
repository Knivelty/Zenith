import { useComponentValue } from "@dojoengine/react";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useDojo } from "../hooks/useDojo";
import { zeroEntity } from "../../utils";
import { cn } from "../lib/utils";

export function SettleButton() {
    const {
        systemCalls: { nextRound },
        account: {
            account,
            account: { address },
        },
        clientComponents: { GameStatus, BattleLogs },
    } = useDojo();

    const status = useComponentValue(GameStatus, zeroEntity);

    const battleResult = useComponentValue(
        BattleLogs,
        getEntityIdFromKeys([
            BigInt(status?.currentMatch || 0),
            BigInt(status?.currentRound || 0),
        ])
    );

    const visible = status?.status === 3;

    const win = battleResult?.winner === BigInt(address);

    const bg_url = win
        ? "/assets/ui/win_settle.png"
        : "/assets/ui/lose_settle.png";

    const text = win ? "BATTLE VICTORY" : "BATTLE LOSE";

    return (
        <div
            className={cn(
                "absolute flex justify-center select-none left-1/2 transform -translate-x-1/2 top-1/3 mt-5",
                {
                    invisible: !visible,
                }
            )}
        >
            <div
                className={cn(
                    "bg-no-repeat bg-cover pixelated w-80 h-40 flex flex-col justify-center items-center"
                )}
                style={{ backgroundImage: `url(${bg_url})` }}
            >
                <div className="font-bold  text-xl text-black">{text}</div>
                <div
                    className="bg-black text-white p-2 mt-8 cursor-pointer"
                    onClick={() => {
                        // nextRound(account);
                    }}
                >
                    <div className="text-xs"> Next Round</div>
                </div>
            </div>
        </div>
    );
}
