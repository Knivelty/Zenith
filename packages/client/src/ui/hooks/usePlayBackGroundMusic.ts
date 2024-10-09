import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "./useDojo";
import { useEffect, useMemo } from "react";
import {
    SoundFile,
    SoundType,
    usePlaySoundSegment,
} from "./usePlaySoundSegment";
import useAudioStore from "./useAudioStore";
import { usePersistUIStore } from "../../store";

export const dangerRangeRangeMap: Record<number, SoundFile> = {
    0: SoundFile.Melody,
    25: SoundFile.Bass,
    50: SoundFile.Drum,
    100: SoundFile.Clock,
};

const dangerRanges = Object.keys(dangerRangeRangeMap).map(Number);

export function usePlayBackGroundMusic() {
    const {
        clientComponents: { Player },
        account: { playerEntity },
    } = useDojo();

    const playerValue = useComponentValue(Player, playerEntity);
    const soundVolumes = usePersistUIStore((state) => state.soundVolumes);

    const { play, fadeIn, fadeOut, isLoaded } = useAudioStore();

    useEffect(() => {
        if (!isLoaded) return;
        if (!playerValue?.inMatch) {
            Object.values(dangerRangeRangeMap).map((s) => fadeOut(s));
            return;
        }

        for (let i = 0; i < dangerRanges.length; i++) {
            const dangerThreshold = dangerRanges[i];

            if (dangerThreshold <= (playerValue?.danger ?? 0)) {
                fadeIn(
                    dangerRangeRangeMap[dangerThreshold],
                    soundVolumes.music / 100
                );
            } else {
                fadeOut(dangerRangeRangeMap[dangerThreshold]);
            }
        }
    }, [
        playerValue?.danger,
        playerValue?.inMatch,
        play,
        isLoaded,
        fadeIn,
        fadeOut,
        soundVolumes.music,
    ]);

    useEffect(() => {
        if (!playerValue?.inMatch) {
            console.log("play forest");
            fadeIn(SoundFile.Forest, soundVolumes.music / 100);
        } else {
            console.log("stop forest");

            fadeOut(SoundFile.Forest);
        }
    }, [fadeOut, fadeIn, playerValue?.inMatch, soundVolumes.music, isLoaded]);
}
