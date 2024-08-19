import useAudioStore from "../hooks/useAudioStore";

export enum SoundFile {
    Main = "main",
}

export enum SoundType {
    Confirm = "confirm",
    Click = "click",
    Gameover = "gameover",
    Hit = "hit",
    Refresh = "refresh",
    Sell = "sell",
    Upgrade = "upgrade",
}

export function usePlaySound(soundType: SoundType) {
    const play = useAudioStore((state) => state.play);
    const isLoaded = useAudioStore((state) => state.isLoaded);

    return {
        play: () => {
            play(SoundFile.Main, soundType);
        },
        isLoaded,
    };
}
