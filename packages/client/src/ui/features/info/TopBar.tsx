import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "../../hooks/useDojo";
import { zeroEntity } from "../../../utils";
import { numToStatus } from "../../../dojo/types";
import { cn, logDebug } from "../../lib/utils";
import { ShowItem, UIStore, useUIStore } from "../../../store";
import { useHotkeys } from "react-hotkeys-hook";

export function TopBar() {
    const {
        clientComponents: { GameStatus, Player },
        account: { playerEntity },
    } = useDojo();

    const setShow = useUIStore((state: UIStore) => state.setShow);
    const getShow = useUIStore((state: UIStore) => state.getShow);

    const gameStatus = useComponentValue(GameStatus, zeroEntity);
    const player = useComponentValue(Player, playerEntity);

    useHotkeys("esc", () => {
        Object.values(ShowItem).map((v) => {
            setShow(v as ShowItem, false);
        });
    });

    logDebug("player value: ", player);

    return (
        <div className="flex flex-col justify-center items-center">
            <div
                className={cn(
                    "flex justify-between items-center align-middle px-2 py-1 w-[40rem] h-12 bg-black border-x-2 border-t-2 border-[#06FF00] font-bold ",
                    { "text-[#FF3D00] border-[#FF3D00]": gameStatus?.dangerous }
                )}
            >
                <div className="">Round {gameStatus?.currentRound}</div>
                <div className="">{numToStatus(gameStatus?.status)}</div>
            </div>
            <div className="flex justify-between items-center align-middle top-1 w-[40rem] h-8 bg-black border-x-2 border-b-2 border-[#FF3D00] border-2  ">
                <div className="bg-[#FF3D00] h-full flex items-center justify-center w-40 hover:cursor-pointer">
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
                {gameStatus?.dangerous ? (
                    <div className="flex flex-row justify-center items-center w-full h-full ml-2">
                        <img className="h-4" src="/assets/ui/skull.png"></img>
                        <div className="text-[#FF3D00] text-xs ml-2">
                            Dangerous Stage
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-row justify-start items-center w-full h-full ml-2">
                        <img className="h-4" src="/assets/ui/skull.png"></img>
                        <div className=" text-[#FF3D00] text-[0.6rem] ml-2">
                            Danger value: {player?.danger}/100
                        </div>
                        <img
                            className="ml-4 -mt-0.5 h-6 object-cover object-right"
                            src="/assets/ui/danger_progress.png"
                            style={{
                                width: `${18 * Math.min(1, (player?.danger ?? 0) / 100)}rem`,
                            }}
                        ></img>
                    </div>
                )}
            </div>
        </div>
    );
}
