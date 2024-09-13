import { usePersistUIStore, useUIStore } from "../../store";
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
    DangerHint = "dangerHint",
}

export function usePlaySoundSegment(soundType: SoundType) {
    const play = useAudioStore((state) => state.playSprite);

    const effectVolume = usePersistUIStore(
        (state) => state.soundVolumes.effect
    );

    return {
        play: (volume = effectVolume / 100) => {
            play(SoundFile.Main, soundType, volume);
        },
    };
}
