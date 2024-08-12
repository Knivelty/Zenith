import { useDojo } from "../hooks/useDojo";
import { useComponentValue } from "@dojoengine/react";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { ProgressBar } from "./ProgressBar";
import { useCallback } from "react";
import { usePlaySound } from "../hooks/usePlaySound";

export function ExpButton() {
    const {
        account: { playerEntity, account },
        clientComponents: { Player, LevelConfig },
        systemCalls: { buyExp },
    } = useDojo();

    const player = useComponentValue(Player, playerEntity);
    const levelConfig = useComponentValue(
        LevelConfig,
        getEntityIdFromKeys([BigInt(player?.level || 0)])
    );

    const { play } = usePlaySound("click");

    const handleClick = useCallback(() => {
        play();
        buyExp(account);
    }, [buyExp, account, play]);

    const percent = ((player?.exp || 0) / (levelConfig?.expForNext || 1)) * 100;

    return (
        <div className="absolute flex  flex-col left-[10%] bottom-[10%] select-none z-20">
            <div className="mb-2 self-center">
                EXP : {player?.exp} / {levelConfig?.expForNext}
            </div>
            <div className="flex justify-center w-32 h-32  bg-black border border-[#06FF00]  transition duration-300 rounded-full ">
                <div className="flex flex-col justify-center">
                    <div className="flex self-center text-lg mb-1 -mt-2">
                        <div className="bg-[url('/assets/ui/gold.png')] bg-contain bg-no-repeat w-6 h-6"></div>
                        <div className="self-center">4</div>
                    </div>

                    <div className="self-center text-sm ">Buy 4 exp</div>
                </div>
            </div>
            <div
                onClick={handleClick}
                className="-mt-[8.75rem] -ml-[0.75rem] cursor-pointer"
            >
                <ProgressBar size={152} strokeWidth={8} percentage={percent} />
            </div>
            <div className="absolute flex justify-center -right-2 -bottom-6 rounded-full h-12 w-12 border border-[#06FF00] ">
                <div className="self-center text-xs">Lv {player?.level}</div>
            </div>
        </div>
    );
}
