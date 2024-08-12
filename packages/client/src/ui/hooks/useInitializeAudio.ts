import { useEffect, useMemo } from "react";
import useAudioStore from "./useAudioStore";

const audioFiles = {
    click: "/assets/sounds/click.mp3",
    confirm: "/assets/sounds/confirm.mp3",
};

export const useInitializeAudio = () => {
    const audioStore = useAudioStore();
    const { load, setIsLoaded, isLoaded } = audioStore;

    useEffect(() => {
        if (!isLoaded) {
            Object.entries(audioFiles).forEach(([id, src]) => {
                load(id, src);
            });

            setIsLoaded(true);
        }
    }, [load, setIsLoaded, isLoaded]);
};
