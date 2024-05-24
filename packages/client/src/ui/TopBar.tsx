import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "./hooks/useDojo";
import { zeroEntity } from "../utils";
import { numToStatus } from "../dojo/types";

export function TopBar() {
    const {
        clientComponents: { GameStatus },
        // account: {},
    } = useDojo();

    const gameStatus = useComponentValue(GameStatus, zeroEntity);

    return (
        <div className="flex justify-center">
            <div className="flex justify-between items-center align-middle px-2 py-1 w-[40rem] h-12 bg-black border-x-2 border-b-2 border-[#06FF00] font-bold text-[#06FF00]">
                <div className=" font-dogica">
                    Round {gameStatus?.currentRound}
                </div>
                <div className="font-dogica">
                    {numToStatus(gameStatus?.status)}
                </div>
            </div>
        </div>
    );
}
