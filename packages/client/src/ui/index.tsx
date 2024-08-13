import { store } from "../store";
import { Loading } from "./features/login/Loading";
import { Main } from "./Main";

export const UI = () => {
    const layers = store((state) => {
        return {
            networkLayer: state.networkLayer,
            phaserLayer: state.phaserLayer,
        };
    });

    if (!layers.networkLayer || !layers.phaserLayer) return <Loading />;

    return <Main />;
};
