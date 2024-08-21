import { useEffect } from "react";
import useAudioStore from "./useAudioStore";
import { dangerRangeRangeMap } from "./usePlayBattleBgMusic";

export enum SoundFileType {
    File = "File",
    Sprite = "Sprite",
}

type AudioFile = {
    type: SoundFileType;
    src: string;
    jsonPath?: string;
};

const audioFiles: Record<string, AudioFile> = {
    main: {
        type: SoundFileType.Sprite,
        src: "/assets/sounds/sounds.ogg",
        jsonPath: "/assets/sounds/sounds.holwer2.json",
    },
    bass: {
        type: SoundFileType.File,
        src: "/assets/sounds/battleBgm/bass.opus",
    },
    clock: {
        type: SoundFileType.File,
        src: "/assets/sounds/battleBgm/clock.opus",
    },
    drum: {
        type: SoundFileType.File,
        src: "/assets/sounds/battleBgm/drum.opus",
    },
    melody: {
        type: SoundFileType.File,
        src: "/assets/sounds/battleBgm/melody.opus",
    },
};

export const useInitializeAudio = () => {
    const { load, loadSprite, setIsLoaded, isLoaded, playInit } =
        useAudioStore();

    useEffect(() => {
        if (!isLoaded) {
            Promise.all(
                Object.entries(audioFiles).map(
                    async ([id, { type, src, jsonPath }]) => {
                        if (type === SoundFileType.Sprite) {
                            const json = await (await fetch(jsonPath!)).json();
                            loadSprite(id, src, json["sprite"]);
                        } else {
                            load(id, src);
                        }
                    }
                )
            ).then(() => {
                setIsLoaded(true);

                Object.values(dangerRangeRangeMap).forEach((v) => {
                    playInit(v);
                });
            });
        }
    }, [isLoaded, setIsLoaded, loadSprite, load, playInit]);
};
