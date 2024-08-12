import useAudioStore from "../hooks/useAudioStore";

export function usePlaySound(soundId: "confirm" | "click") {
    const play = useAudioStore((state) => state.play);
    const isLoaded = useAudioStore((state) => state.isLoaded);

    return {
        play: () => {
            play(soundId);
        },
        isLoaded,
    };
}
