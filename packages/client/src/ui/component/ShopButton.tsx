import { ShowItem, UIStore, useUIStore } from "../../store";
import { useDojo } from "../hooks/useDojo";
import { useComponentValue } from "@dojoengine/react";
import { useHotkeys } from "react-hotkeys-hook";
import { usePlaySound } from "../hooks/usePlaySound";

export function ShopButton() {
    const {
        account: { playerEntity },
        clientComponents: { Player },
    } = useDojo();
    const setShow = useUIStore((state: UIStore) => state.setShow);
    const getShow = useUIStore((state: UIStore) => {
        return state.getShow;
    });

    const handleClick = () => {
        setShow(ShowItem.Shop, !getShow(ShowItem.Shop));
        play();
    };

    useHotkeys("b", handleClick);

    const { play } = usePlaySound("click");

    const player = useComponentValue(Player, playerEntity);

    return (
        <div className="absolute right-[10%] bottom-[10%] z-20">
            <button
                className="w-32 h-32 bg-black border-[#06FF00] border rounded-full
                 transition duration-300 text-lg"
                onClick={handleClick}
            >
                $ {player?.coin}
            </button>
        </div>
    );
}
