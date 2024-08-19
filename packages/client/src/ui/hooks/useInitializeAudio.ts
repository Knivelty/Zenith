import { useEffect } from "react";
import useAudioStore from "./useAudioStore";

const audioFiles = {
    main: {
        src: "/assets/sounds/sounds.ogg",
        jsonPath: "/assets/sounds/sounds.holwer2.json",
    },
};

export const useInitializeAudio = () => {
    const audioStore = useAudioStore();
    const { load, setIsLoaded, isLoaded } = audioStore;

    useEffect(() => {
        if (!isLoaded) {
            Object.entries(audioFiles).forEach(
                async ([id, { src, jsonPath }]) => {
                    const json = await (await fetch(jsonPath)).json();
                    load(id, src, json["sprite"]);
                }
            );

            setIsLoaded(true);
        }
    }, [isLoaded, setIsLoaded, load]);
};
