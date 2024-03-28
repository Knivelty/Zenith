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
            <div className="flex justify-between rounded px-2 py-1 w-1/4 bg-[#727272] font-bold text-white">
                <div className="self-start">
                    Round {gameStatus?.currentRound}
                </div>
                <div className="self-end">
                    {numToStatus(gameStatus?.status)}
                </div>
            </div>
        </div>
    );
}
