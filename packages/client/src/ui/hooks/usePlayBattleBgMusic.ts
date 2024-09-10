import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "./useDojo";
import { useEffect, useState } from "react";
import { SoundFile } from "./usePlaySoundSegment";
import useAudioStore from "./useAudioStore";
import { usePersistUIStore } from "../../store";

export const dangerRangeRangeMap: Record<number, SoundFile> = {
    0: SoundFile.Melody,
    25: SoundFile.Bass,
    50: SoundFile.Drum,
    100: SoundFile.Clock,
};

const dangerRanges = Object.keys(dangerRangeRangeMap).map(Number);

function getDangerLevel(danger: number) {
    let idx = 1;
    for (const d of dangerRanges) {
        if (danger <= d) {
            return idx;
        } else {
            idx += 1;
        }
    }
    return idx;
}

export function usePlayBattleBgMusic() {
    const {
        clientComponents: { Player },
        account: { playerEntity },
    } = useDojo();

    const playerValue = useComponentValue(Player, playerEntity);
    const soundVolumes = usePersistUIStore((state) => state.soundVolumes);

    const { play, fadeIn, fadeOut, isLoaded } = useAudioStore();

    useEffect(() => {
        if (!isLoaded) return;

        const dangerLevel = getDangerLevel(playerValue?.danger ?? 0);

        for (let i = 0; i < dangerRanges.length; i++) {
            const dangerThreshold = dangerRanges[i];

            if (i + 1 <= dangerLevel) {
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
}
