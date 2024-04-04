import { Button, Progress } from "antd";
import { UIStore, useUIStore } from "../../store";
import { useDojo } from "../hooks/useDojo";
import { useComponentValue } from "@dojoengine/react";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { ProgressBar } from "./ProgressBar";

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

    const percent = ((player?.exp || 0) / (levelConfig?.expForNext || 1)) * 100;

    console.log("percent: ", percent);

    return (
        <div className="absolute flex  flex-col left-[10%] bottom-[10%]">
            <div className="mb-2 self-center">
                EXP : {player?.exp} / {levelConfig?.expForNext}
            </div>
            <div className="flex justify-center w-32 h-32  bg-white border border-[#0299CC]  transition duration-300 rounded-full ">
                <div className="flex flex-col justify-center">
                    <div className="flex self-center text-lg mb-1 mt-2">
                        <div className="bg-[url('/assets/ui/gold.png')] bg-contain bg-no-repeat w-6 h-6"></div>
                        <div className="self-center">4</div>
                    </div>

                    <div className="self-center text-base ">Buy 4 exp</div>
                </div>
            </div>
            <div
                onClick={() => {
                    buyExp(account);
                    console.log(111);
                }}
                className="-mt-[8.75rem] -ml-[0.75rem] cursor-pointer"
            >
                <ProgressBar size={152} strokeWidth={8} percentage={percent} />
            </div>
            <div className="absolute flex justify-center  -right-6 -bottom-6 rounded-full h-10 w-10 border border-black ">
                <div className=" text-black self-center text-xs">
                    Lv {player?.level}
                </div>
            </div>
        </div>
    );
}
