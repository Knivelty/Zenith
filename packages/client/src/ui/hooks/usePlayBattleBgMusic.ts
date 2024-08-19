import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "./useDojo";
import { useEffect, useState } from "react";
import { SoundFile } from "./usePlaySoundSegment";
import useAudioStore from "./useAudioStore";
import { logDebug } from "../lib/utils";

export const dangerRangeRangeMap: Record<number, SoundFile> = {
    0: SoundFile.Melody,
    25: SoundFile.Bass,
    50: SoundFile.Drum,
    100: SoundFile.Clock,
};

const dangerRanges = Object.keys(dangerRangeRangeMap)
    .map(Number)
    .sort((a, b) => b - a);

function getDangerRange(danger: number) {
    return dangerRanges.find((range) => danger >= range) ?? 0;
}

export function usePlayBattleBgMusic() {
    const {
        clientComponents: { Player },
        account: { playerEntity },
    } = useDojo();

    const playerValue = useComponentValue(Player, playerEntity);
    const [prevDangerRange, setPrevDangerRange] = useState<number | undefined>(
        undefined
    );

    const { play, fadeIn, fadeOut, isLoaded } = useAudioStore();

    useEffect(() => {
        if (!isLoaded) return;

        const dangerRange = getDangerRange(playerValue?.danger ?? 0);

        if (dangerRange === prevDangerRange) return;

        logDebug(
            "danger: ",
            playerValue?.danger,
            "dangerRange",
            dangerRange,
            prevDangerRange,
            dangerRangeRangeMap[prevDangerRange ?? 0]
        );

        if (prevDangerRange !== undefined) {
            fadeOut(dangerRangeRangeMap[prevDangerRange]);
        }
        fadeIn(dangerRangeRangeMap[dangerRange]);

        setPrevDangerRange(dangerRange);
    }, [playerValue?.danger, play, prevDangerRange, isLoaded, fadeIn, fadeOut]);
}
