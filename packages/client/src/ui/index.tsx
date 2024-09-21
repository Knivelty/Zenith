import { store } from "../store";
import { Loading } from "./features/login/Loading";
import useAudioStore from "./hooks/useAudioStore";
import { Main } from "./Main";

export const UI = () => {
    const layers = store((state) => {
        return {
            networkLayer: state.networkLayer,
            phaserLayer: state.phaserLayer,
        };
    });

    const { isLoaded } = useAudioStore();

    if (!layers.networkLayer || !layers.phaserLayer || !isLoaded)
        return <Loading />;

    return <Main />;
};
