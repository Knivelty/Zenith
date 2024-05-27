import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "./hooks/useDojo";
import { zeroEntity } from "../utils";
import { numToStatus } from "../dojo/types";

export function TopBar() {
    const {
        clientComponents: { GameStatus, Player },
        account: { playerEntity },
    } = useDojo();

    const gameStatus = useComponentValue(GameStatus, zeroEntity);
    const player = useComponentValue(Player, playerEntity);

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="flex justify-between items-center align-middle px-2 py-1 w-[40rem] h-12 bg-black border-x-2 border-b-2 border-[#06FF00] font-bold text-[#06FF00]">
                <div className="">Round {gameStatus?.currentRound}</div>
                <div className="">{numToStatus(gameStatus?.status)}</div>
            </div>
            <div className="flex justify-between items-center align-middle top-1 w-[40rem] h-8 bg-black border-x-2 border-b-2 border-[#FF3D00] font-bold ">
                <div className="bg-[#FF3D00] h-full flex items-center justify-center w-40">
                    <div className=" text-black text-xs">
                        Curse {player?.curse}
                    </div>
                </div>
                <div className="flex flex-row justify-start items-center w-full h-full">
                    <div className=" text-[#F2A316] text-xs ml-2">
                        Danger value: {player?.danger }/100
                    </div>
                </div>
            </div>
        </div>
    );
}
