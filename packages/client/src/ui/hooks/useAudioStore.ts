import { create } from "zustand";
import { Howl, SoundSpriteDefinitions } from "howler";
import { logDebug } from "../lib/utils";
import { SoundFile } from "./usePlaySoundSegment";
import { deferred } from "@latticexyz/utils";

interface AudioStore {
    sounds: Record<string, Howl>;
    isLoaded: boolean;
    load: (id: string, src: string) => Promise<void>;
    loadSprite: (
        id: string,
        src: string,
        spriteMap: SoundSpriteDefinitions
    ) => Promise<void>;
    play: (id: SoundFile) => void;
    playSprite: (id: SoundFile, segment: string, volume?: number) => void;
    playInit: (id: SoundFile) => void;
    fadeIn: (id: SoundFile, maxVolume?: number, duration?: number) => void;
    fadeOut: (id: SoundFile, duration?: number) => void;
    stop: (id: string) => void;
    setIsLoaded: (loaded: boolean) => void;
}

const useAudioStore = create<AudioStore>()((set, get) => ({
    sounds: {},
    isLoaded: false,
    loadSprite: async (
        id: string,
        src: string,
        spriteMap: SoundSpriteDefinitions
    ) => {
        const [resolve, , promise] = deferred<void>();
        set((state: any) => ({
            sounds: {
                ...state.sounds,
                [id]: new Howl({
                    src: [src],
                    preload: true,
                    sprite: spriteMap,
                    onload: () => {
                        resolve();
                    },
                }),
            },
        }));

        return promise;
    },
    load: async (id: string, src: string) => {
        const [resolve, , promise] = deferred<void>();

        set((state: any) => ({
            sounds: {
                ...state.sounds,
                [id]: new Howl({
                    src: [src],
                    preload: true,
                    onload: () => {
                        resolve();
                    },
                }),
            },
        }));
        return promise;
    },
    play: (id: SoundFile) => {
        const { sounds } = get();
        if (sounds[id]) {
            sounds[id].play();
        } else {
            console.warn(`Sound with id "${id}" not found.`);
        }
    },
    playSprite: (id: SoundFile, segment: string, volume = 1) => {
        const { sounds } = get();
        if (sounds[id]) {
            logDebug(`playing ${id} with segment ${segment}`);
            sounds[id].play(segment);
            sounds[id].volume(volume);
        } else {
            console.warn(`Sound with id "${id}" not found.`);
        }
    },
    playInit: (id: SoundFile) => {
        const { sounds } = get();
        if (sounds[id]) {
            sounds[id].loop(true);
            sounds[id].volume(0);
            sounds[id].play();
        }
    },
    stop: (id: string) => {
        const { sounds } = get();
        if (sounds[id]) {
            sounds[id].stop();
        }
    },
    fadeIn: (id: SoundFile, expectedVolume = 1, duration = 1000) => {
        const { sounds } = get();

        if (sounds[id]) {
            sounds[id].fade(sounds[id].volume(), expectedVolume, duration);
        }
    },
    fadeOut: (id: SoundFile, duration = 1000) => {
        const { sounds } = get();

        if (sounds[id]) {
            sounds[id].fade(sounds[id].volume(), 0, duration);
        }
    },

    setIsLoaded: (loaded: boolean) => set({ isLoaded: loaded }),
}));

export default useAudioStore;
