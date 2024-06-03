import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "../hooks/useDojo";
import { zeroEntity } from "../../utils";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { cn } from "../lib/utils";
import { ChoiceList } from "./Choice";
import { useMemo } from "react";
import { useUIStore } from "../../store";

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

    const setShadeShow = useUIStore((state) => state.setShadeShow);

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
        setShadeShow(visible);
    }, [visible, setShadeShow]);

    const win = battleResult?.winner === BigInt(address);

    const text = win ? "VICTORY" : "LOSE";

    return (
        <div
            className={cn(
                "absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border bg-black border-[#06FF00] flex flex-col items-center justify-center w-4/5 z-30",
                { invisible: !visible }
            )}
        >
            <div className="text-[#FF3D00] text-xl mt-12">{text}</div>
            <ChoiceList />
            <div className="text-white mb-12">
                Choose any option to proceed to the next level
            </div>
        </div>
    );
}
