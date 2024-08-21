import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "./useDojo";
import { useEffect, useState } from "react";
import { SoundFile } from "./usePlaySoundSegment";
import useAudioStore from "./useAudioStore";

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
    const [prevDangerLevel, setPrevDangerLevel] = useState<number | undefined>(
        undefined
    );

    const { play, fadeIn, fadeOut, isLoaded } = useAudioStore();

    useEffect(() => {
        if (!isLoaded) return;

        const dangerLevel = getDangerLevel(playerValue?.danger ?? 0);

        if (dangerLevel === prevDangerLevel) return;

        if (dangerLevel > (prevDangerLevel ?? 0)) {
            dangerRanges.slice(prevDangerLevel, dangerLevel).map((v) => {
                fadeIn(dangerRangeRangeMap[v]);
            });
        } else {
            dangerRanges.slice(dangerLevel, prevDangerLevel).map((v) => {
                fadeOut(dangerRangeRangeMap[v]);
            });
        }

        setPrevDangerLevel(dangerLevel);
    }, [playerValue?.danger, play, prevDangerLevel, isLoaded, fadeIn, fadeOut]);
}
