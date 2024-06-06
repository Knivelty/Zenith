import { ShowItem, UIStore, useUIStore } from "../../store";
import { useDojo } from "../hooks/useDojo";
import { useComponentValue } from "@dojoengine/react";
import { useHotkeys } from "react-hotkeys-hook";

export function ShopButton() {
    const {
        account: { playerEntity },
        clientComponents: { Player },
    } = useDojo();
    const setShow = useUIStore((state: UIStore) => state.setShow);
    const getShow = useUIStore((state: UIStore) => {
        return state.getShow;
    });

    useHotkeys("p", () => {
        setShow(ShowItem.Shop, !getShow(ShowItem.Shop));
    });

    const player = useComponentValue(Player, playerEntity);

    return (
        <div className="absolute right-[10%] bottom-[10%] z-20">
            <button
                className="w-32 h-32 bg-black border-[#06FF00] border rounded-full
                 transition duration-300 text-lg"
                onClick={async () => {
                    setShow(ShowItem.Shop, !getShow(ShowItem.Shop));
                }}
            >
                $ {player?.coin}
            </button>
        </div>
    );
}
