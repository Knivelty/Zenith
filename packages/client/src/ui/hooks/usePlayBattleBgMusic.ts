import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "./useDojo";
import { useEffect } from "react";
import { SoundFile, SoundType } from "./usePlaySoundSegment";
import useAudioStore from "./useAudioStore";
import { usePersistUIStore } from "../../store";

export const dangerRangeRangeMap: Record<number, SoundFile> = {
    0: SoundFile.Melody,
    25: SoundFile.Bass,
    50: SoundFile.Drum,
    100: SoundFile.Clock,
};

const dangerRanges = Object.keys(dangerRangeRangeMap).map(Number);

export function usePlayBattleBgMusic() {
    const {
        clientComponents: { Player },
        account: { playerEntity },
    } = useDojo();

    const playerValue = useComponentValue(Player, playerEntity);
    const soundVolumes = usePersistUIStore((state) => state.soundVolumes);

    const { play, playSprite, fadeIn, fadeOut, isLoaded } = useAudioStore();

    useEffect(() => {
        if (!isLoaded) return;

        for (let i = 0; i < dangerRanges.length; i++) {
            const dangerThreshold = dangerRanges[i];

            if (dangerThreshold <= (playerValue?.danger ?? 0)) {
                fadeIn(
                    dangerRangeRangeMap[dangerThreshold],
                    soundVolumes.battleBgm / 100
                );
            } else {
                fadeOut(dangerRangeRangeMap[dangerThreshold]);
            }
        }
    }, [
        playerValue?.danger,
        play,
        isLoaded,
        fadeIn,
        fadeOut,
        soundVolumes.battleBgm,
    ]);

    useEffect(() => {
        if ((playerValue?.danger ?? 0) >= 100) {
            playSprite(
                SoundFile.Main,
                SoundType.DangerHint,
                soundVolumes.battleBgm / 100
            );
        }
    }, [playerValue?.danger, playSprite, soundVolumes.battleBgm]);
}
