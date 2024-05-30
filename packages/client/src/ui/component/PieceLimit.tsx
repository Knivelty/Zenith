import { useDojo } from "../hooks/useDojo";
import { useComponentValue } from "@dojoengine/react";
import { zeroEntity } from "../../utils";
import { GameStatusEnum } from "../../dojo/types";

export function PieceLimit() {
    let visible = "";
    const {
        clientComponents: { LocalPlayer, GameStatus },
        account: { playerEntity },
    } = useDojo();

    const status = useComponentValue(GameStatus, zeroEntity);
    const player = useComponentValue(LocalPlayer, playerEntity);

    if (status?.status !== GameStatusEnum.Prepare) {
        visible = "invisible";
    }

    return (
        <div
            className={`relative flex justify-center -mt-[9.75rem] ${visible} select-none pointer-events-none z-10`}
        >
            <div className=" w-80 h-10 text-white/50 text-lg rounded-lg flex flex-col justify-center">
                <div className="self-center text-[#F2A316] text-sm">
                    Piece: {player?.heroesCount} / {player?.level}
                </div>
            </div>
        </div>
    );
}
