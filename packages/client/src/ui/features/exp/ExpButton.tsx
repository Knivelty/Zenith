import { useDojo } from "../../hooks/useDojo";
import { useComponentValue } from "@dojoengine/react";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { ProgressBar } from "../../components/ProgressBar";
import { useCallback, useState } from "react";
import {
    SoundType,
    usePlaySoundSegment,
} from "../../hooks/usePlaySoundSegment";
import { cn } from "../../lib/utils";
import { usePlayerExpProgress } from "../../hooks/usePlayerExpProgress";
import CountUp from "react-countup";

export function ExpButton() {
    const {
        account: { account },
        systemCalls: { buyExp },
    } = useDojo();

    const [loading, setLoading] = useState(false);

    const { play } = usePlaySoundSegment(SoundType.Click);

    const handleClick = useCallback(() => {
        if (loading) {
            return;
        }
        play();
        setLoading(true);
        buyExp(account).finally(() => {
            setLoading(false);
        });
    }, [buyExp, account, play, loading]);

    const { percentage, exp, level, expForNext } = usePlayerExpProgress();

    return (
        <div className="absolute flex  flex-col left-[10%] bottom-[4%] select-none z-20">
            <div className="mb-1 self-center text-sm font-bold transition-all">
                EXP : <CountUp end={exp || 0} preserveValue={true} /> /
                {expForNext}
            </div>
            <div
                onClick={handleClick}
                className="relative flex justify-center w-32 h-32  bg-black border border-[#06FF00]  transition duration-300 rounded-full cursor-pointer"
            >
                <div
                    className={cn(
                        "absolute w-full h-full pointer-events-none",
                        {
                            invisible: !loading,
                        }
                    )}
                >
                    <img
                        className={cn(
                            "absolute w-1/2 h-1/2 translate-y-1/2 translate-x-1/2"
                        )}
                        src="/assets/ui/loading.gif"
                    ></img>
                    <div className="absolute h-full w-full bg-black opacity-80 rounded-full"></div>
                </div>
                <div className="flex flex-col justify-center">
                    <div className="flex self-center text-lg mb-1 -mt-2">
                        <div className="bg-[url('/assets/ui/gold.png')] bg-contain bg-no-repeat w-6 h-6"></div>
                        <div className="self-center">4</div>
                    </div>

                    <div className="self-center text-sm ">Buy 4 exp</div>
                </div>
            </div>
            <div className="-mt-[8.75rem] -ml-[0.75rem] z-10 pointer-events-none">
                <ProgressBar
                    size={152}
                    strokeWidth={8}
                    percentage={percentage}
                />
            </div>
            <div className="absolute flex justify-center -right-2 -bottom-6 rounded-full h-12 w-12 border border-[#06FF00] transition-all">
                <div className="self-center text-xs">
                    Lv. <CountUp end={level || 0} preserveValue={true} />{" "}
                </div>
            </div>
        </div>
    );
}
