import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "../../hooks/useDojo";
import { zeroEntity } from "../../../utils";
import { numToStatus } from "../../../dojo/types";
import { cn, logDebug } from "../../lib/utils";
import { ShowItem, UIStore, useUIStore } from "../../../store";
import { useHotkeys } from "react-hotkeys-hook";
import CountUp from "react-countup";

export function TopBar() {
    const {
        clientComponents: { GameStatus, Player },
        account: { playerEntity },
    } = useDojo();

    const setShow = useUIStore((state: UIStore) => state.setShow);
    const getShow = useUIStore((state: UIStore) => state.getShow);

    const gameStatus = useComponentValue(GameStatus, zeroEntity);
    const player = useComponentValue(Player, playerEntity);

    logDebug("game status:", gameStatus);

    const hasCurse = (gameStatus?.currentRound ?? 0) >= 4;

    return (
        <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col justify-center items-center w-[40rem] z-10">
            <div
                className={cn(
                    "flex justify-between items-center align-middle px-2 py-1 w-[40rem] h-12 bg-black border-x-2 border-t-2 border-[#06FF00] font-bold",
                    {
                        "text-[#FF3D00] border-[#FF3D00]":
                            gameStatus?.dangerous,
                    },
                    { "border-b-2 h-16": !hasCurse }
                )}
            >
                <div className="">Round {gameStatus?.currentRound}</div>
                <div className="">{numToStatus(gameStatus?.status)}</div>
            </div>
            <div
                className={cn(
                    "flex justify-start items-center align-middle top-1 w-[40rem] h-8 bg-black border-x-2 border-b-2 border-[#FF3D00] border-2",
                    { invisible: !hasCurse }
                )}
            >
                <div className="guide-step-7  bg-[#FF3D00] h-full flex items-center justify-center w-40 hover:cursor-pointer">
                    <img
                        className="h-4 filter grayscale brightness-[0.2] "
                        src="/assets/ui/curse.png"
                    ></img>
                    <div
                        className=" text-black text-xs ml-1 font-bold"
                        onClick={() => {
                            setShow(
                                ShowItem.CurseDetail,
                                !getShow(ShowItem.CurseDetail)
                            );
                        }}
                    >
                        Curse {player?.curse}
                    </div>
                </div>

                <div
                    className={cn(
                        "guide-step-9 absolute flex flex-row justify-center items-center transform left-1/2 h-full ml-2 transition-all opacity-100 duration-2000 delay-3000 ",
                        {
                            "opacity-0 delay-500 duration-500":
                                !gameStatus?.dangerous,
                        }
                    )}
                >
                    <img className="h-4" src="/assets/ui/skull.png"></img>
                    <div className="text-[#FF3D00] text-xs ml-2">
                        Dangerous Stage
                    </div>
                </div>

                <div
                    className={cn(
                        "guide-step-8 absolute flex flex-row justify-start items-center transform left-40 h-full ml-2 transition-all opacity-100 scale-100 delay-500 duration-500 ",
                        {
                            "opacity-0  animate-[wiggle_0.1s_ease-in-out_20] duration-2000 delay-2000":
                                !!gameStatus?.dangerous,
                        }
                    )}
                    style={{ animationDuration: "0.05s" }}
                >
                    <img className="h-4" src="/assets/ui/skull.png"></img>
                    <div className=" text-[#FF3D00] text-[0.6rem] ml-2">
                        Danger value:
                        <CountUp
                            preserveValue={true}
                            end={Math.min(100, player?.danger || 0)}
                            delay={2}
                            duration={3}
                        ></CountUp>
                        /100
                    </div>
                    <img
                        className="ml-4 -mt-0.5 h-6 object-cover object-right  transition-all duration-2000 ease-in-out delay-500"
                        src="/assets/ui/danger_progress.png"
                        style={{
                            width: `${16 * Math.min(1, (player?.danger ?? 0) / 100)}rem`,
                        }}
                    ></img>
                </div>
            </div>
        </div>
    );
}
