import { Button, Progress } from "antd";
import { UIStore, useUIStore } from "../../store";
import { useDojo } from "../hooks/useDojo";
import { useComponentValue } from "@dojoengine/react";
import { getEntityIdFromKeys } from "@dojoengine/utils";

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

    return (
        <div className="absolute flex  flex-col left-[10%] bottom-[10%]">
            <div className="mb-2">
                EXP : {player?.exp} / {levelConfig?.expForNext}
            </div>
            <Button
                onClick={() => {
                    buyExp(account);
                }}
                className="flex justify-center w-20 h-20  bg-white border-black border  transition duration-300 rounded-full"
            >
                <Progress
                    className="rotate-180 absolute -top-0.5"
                    size={80}
                    strokeColor="#0299CC"
                    type="circle"
                    showInfo={false}
                    strokeWidth={3}
                    percent={percent}
                />
                <div className="flex flex-col justify-center">
                    <div className="flex self-center text-xs mb-1 mt-2">
                        <div className="bg-[url('/assets/ui/gold.png')] bg-contain bg-no-repeat w-6 h-6"></div>
                        <div className="self-center">4</div>
                    </div>

                    <div className="self-center text-xs">Buy 4 exp</div>
                </div>
            </Button>
            <div className="absolute flex justify-center  -right-6 -bottom-6 rounded-full w-8 h-8 border border-black">
                <div className=" text-black self-center text-xs">
                    Lv {player?.level}
                </div>
            </div>
        </div>
    );
}
