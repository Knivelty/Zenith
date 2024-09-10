import { useCallback } from "react";
import {
    ShowItem,
    Volume,
    usePersistUIStore,
    useUIStore,
} from "../../../store";
import { Dialog } from "../../components/Dialog";
import { useClickOutside } from "../../hooks/useClickOutside";
import {
    SoundType,
    usePlaySoundSegment,
} from "../../hooks/usePlaySoundSegment";

export function Setting() {
    const show = useUIStore((state) => state.getShow(ShowItem.Setting));
    const setShow = useUIStore((state) => state.setShow);

    const { ref } = useClickOutside(() => {
        setShow(ShowItem.Setting, false);
    });

    const { play } = usePlaySoundSegment(SoundType.Click);

    const volumes = usePersistUIStore((state) => state.soundVolumes);

    const setVolume = usePersistUIStore((state) => state.setVolume);

    const setVolumeFn = useCallback(
        (volumeName: keyof typeof volumes, value: number) => {
            setVolume({ [volumeName]: value });
            play(value / 100);
        },
        [setVolume, play]
    );

    if (!show) {
        return null;
    }

    return (
        <Dialog ref={ref}>
            <div className="flex flex-col items-center justify-center h-full">
                <div className="text-2xl font-bold mb-6">Set Volumes</div>

                {Object.keys(volumes).map((volumeName: string) => {
                    return (
                        <div className="w-64 mb-4">
                            <label htmlFor={volumeName} className="block mb-2">
                                {volumeName}{" "}
                                {volumes[volumeName as keyof Volume]}
                            </label>
                            <input
                                type="range"
                                id={volumeName}
                                min="0"
                                max="100"
                                defaultValue={
                                    volumes[volumeName as keyof Volume]
                                }
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                onChange={(v) => {
                                    const newVolume = Number(v.target.value);
                                    setVolumeFn(
                                        volumeName as keyof Volume,
                                        newVolume
                                    );
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </Dialog>
    );
}
