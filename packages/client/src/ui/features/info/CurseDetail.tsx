import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "../../hooks/useDojo";
import { zeroEntity } from "../../../utils";
import { cn } from "../../lib/utils";
import { ShowItem, UIStore, useUIStore } from "../../../store";

export function CurseDetails() {
    const {
        clientComponents: { Player, GameStatus },
        account: { playerEntity },
    } = useDojo();

    const curseDetailShow = useUIStore((state: UIStore) =>
        state.getShow(ShowItem.CurseDetail)
    );

    const playerV = useComponentValue(Player, playerEntity);
    const gameStatus = useComponentValue(GameStatus, zeroEntity);
    const dangerous = gameStatus?.dangerous;

    return (
        <div
            className={cn(
                "absolute bg-black z-50 border w-1/2 h-2/3 left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center justify-start duration-700",
                { "text-[#FF3D00]": dangerous },
                { " border-[#FF3D00]": dangerous },
                { " border-[#03FF00]": !dangerous },
                {
                    "scale-0": !curseDetailShow,
                },
                {
                    "scale-100": curseDetailShow,
                }
            )}
        >
            <div className="text-2xl font-bold mt-20">
                {dangerous ? "Dangerous" : "Normal"} Stage
            </div>
            <div className={cn("mt-2", { invisible: !dangerous })}>
                Enemies' attributes increased by 20%
            </div>
            <div className="flex flex-col items-start mx-20 mt-12">
                <div className="flex justify-center items-center">
                    <img className="w-4 h-4" src="/assets/ui/curse.png"></img>
                    <div className="ml-2 font-bold">
                        Curse: {playerV?.curse}
                    </div>
                </div>

                <div className="text-sm mt-4 leading-loose">
                    Curse: Once you obtain the curse, the Danger Value
                    automatically increases with each round, and the higher the
                    Curse Value, the more the Danger Value increases per round.
                </div>
            </div>

            <div className="flex flex-col items-start mx-20  mt-8">
                <div className="flex justify-center items-center ">
                    <img className="w-4 h-4" src="/assets/ui/danger.png"></img>
                    <div className="ml-2 font-bold">
                        Danger Value: {playerV?.danger}/100
                    </div>
                </div>
                <div className="text-sm mt-4 leading-loose">
                    Danger Value: When the Danger Value accumulates to 100, the
                    next level will definitely enter the Dangerous Stage. The
                    enemies in the Dangerous Stage are more challenging, and the
                    rewards for clearing it are more abundant.
                </div>
            </div>
        </div>
    );
}
