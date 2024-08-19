import useAudioStore from "./useAudioStore";

export enum SoundFile {
    Main = "main",
    Bass = "bass",
    Clock = "clock",
    Drum = "drum",
    Melody = "melody",
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

export function usePlaySoundSegment(soundType: SoundType) {
    const play = useAudioStore((state) => state.playSprite);

    return {
        play: () => {
            play(SoundFile.Main, soundType);
        },
    };
}
