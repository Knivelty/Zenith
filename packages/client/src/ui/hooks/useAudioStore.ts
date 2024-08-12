import { create } from "zustand";
import { Howl } from "howler";

interface AudioStore {
    sounds: Record<string, Howl>;
    isLoaded: boolean;
    load: (id: string, src: string) => void;
    play: (id: string) => void;
    stop: (id: string) => void;
    setIsLoaded: (loaded: boolean) => void;
}

const useAudioStore = create<AudioStore>()((set, get) => ({
    sounds: {},
    isLoaded: false,
    load: (id: string, src: string) => {
        set((state: any) => ({
            sounds: {
                ...state.sounds,
                [id]: new Howl({ src: [src], preload: true }),
            },
        }));
    },
    play: (id: string) => {
        const { sounds } = get();
        if (sounds[id]) {
            sounds[id].play();
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
