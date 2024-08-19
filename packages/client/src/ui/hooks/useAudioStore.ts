import { create } from "zustand";
import { Howl, SoundSpriteDefinitions } from "howler";
import { SoundFile } from "./usePlaySound";
import { logDebug } from "../lib/utils";

interface AudioStore {
    sounds: Record<string, Howl>;
    isLoaded: boolean;
    load: (id: string, src: string, spriteMap: SoundSpriteDefinitions) => void;
    play: (id: SoundFile, segment: string) => void;
    stop: (id: string) => void;
    setIsLoaded: (loaded: boolean) => void;
}

const useAudioStore = create<AudioStore>()((set, get) => ({
    sounds: {},
    isLoaded: false,
    load: (id: string, src: string, spriteMap: SoundSpriteDefinitions) => {
        set((state: any) => ({
            sounds: {
                ...state.sounds,
                [id]: new Howl({
                    src: [src],
                    preload: true,
                    sprite: spriteMap,
                    
                }),
            },
        }));
    },
    play: (id: SoundFile, segment: string) => {
        const { sounds } = get();
        if (sounds[id]) {
            logDebug(`playing ${id} with segment ${segment}`);
            sounds[id].play(segment);
        } else {
            console.warn(`Sound with id "${id}" not found.`);
        }
    },
    stop: (id: string) => {
        const { sounds } = get();
        if (sounds[id]) {
            sounds[id].stop();
        }
    },
    setIsLoaded: (loaded: boolean) => set({ isLoaded: loaded }),
}));

export default useAudioStore;
