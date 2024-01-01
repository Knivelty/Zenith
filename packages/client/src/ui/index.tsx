import { store } from "../store";
import { ChessMain } from "./ChessMain";
import { CreateAccount } from "./CreateAccount";

export const UI = () => {
    const layers = store((state) => {
        return {
            networkLayer: state.networkLayer,
            phaserLayer: state.phaserLayer,
        };
    });

    if (!layers.networkLayer || !layers.phaserLayer) return <></>;

    return <ChessMain />;
};
