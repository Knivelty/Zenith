import { useEffect } from "react";
import useAudioStore from "./useAudioStore";
import { dangerRangeRangeMap } from "./usePlayBackGroundMusic";
import { SoundFile } from "./usePlaySoundSegment";

export enum SoundFileType {
    File = "File",
    Sprite = "Sprite",
}

type AudioFile = {
    type: SoundFileType;
    src: string;
    jsonPath?: string;
};

const audioFiles: Record<SoundFile, AudioFile> = {
    main: {
        type: SoundFileType.Sprite,
        src: "/assets/sounds/sounds.ogg",
        jsonPath: "/assets/sounds/sounds.holwer2.json",
    },
    bass: {
        type: SoundFileType.File,
        src: "/assets/sounds/music/bass.opus",
    },
    clock: {
        type: SoundFileType.File,
        src: "/assets/sounds/music/clock.opus",
    },
    drum: {
        type: SoundFileType.File,
        src: "/assets/sounds/music/drum.opus",
    },
    melody: {
        type: SoundFileType.File,
        src: "/assets/sounds/music/melody.opus",
    },
    [SoundFile.Forest]: {
        type: SoundFileType.File,
        src: "/assets/sounds/music/forest.mp3",
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

                playInit(SoundFile.Forest);
            });
        }
    }, [isLoaded, setIsLoaded, loadSprite, load, playInit]);
};
