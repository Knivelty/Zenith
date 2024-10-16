import { useHotkeys } from "react-hotkeys-hook";
import { useChoice } from "../../hooks/useChoice";
import { useDojo } from "../../hooks/useDojo";
import { cn } from "../../lib/utils";
import { useCallback, useState } from "react";
import { ShowItem, UIStore, useUIStore } from "../../../store";
import {
    SoundType,
    usePlaySoundSegment,
} from "../../hooks/usePlaySoundSegment";
import { LoadingShade } from "../../components/LoadingShade";

export interface IChoice extends React.HTMLAttributes<HTMLDivElement> {
    coinDec?: number;
    coinInc?: number;
    curseDec?: number;
    curseInc?: number;
    dangerDec?: number;
    dangerInc?: number;
    healthDec?: number;
    order: number;
}

export function ChoiceList() {
    const choices = useChoice();
    return (
        <div className="flex w-full justify-center mt-12">
            {choices.map((c, i) => {
                if (!c) {
                    return;
                }
                return <Choice {...c} key={i} order={i + 1} />;
            })}
        </div>
    );
}

export function Choice({
    coinDec,
    coinInc,
    curseDec,
    curseInc,
    dangerDec,
    dangerInc,
    healthDec,
    order,
    ...props
}: IChoice) {
    const {
        account: { account },
        systemCalls: { nextRound },
    } = useDojo();

    const getShow = useUIStore((state: UIStore) => state.getShow);
    const [loading, setLoading] = useState(false);

    const { play } = usePlaySoundSegment(SoundType.Click);

    const nextRoundFn = useCallback(() => {
        if (!order) return;
        setLoading(true);
        play();
        nextRound(account, order).finally(() => {
            setLoading(false);
        });
    }, [order, nextRound, account, play]);

    useHotkeys(order.toString(), () => {
        if (getShow(ShowItem.MakeChoice)) {
            nextRoundFn();
        }
    });

    const coinChangeText = coinDec ? `- $${coinDec}` : `+ $${coinInc}`;
    let statusChangeText = "";
    let imgPath = "";
    if (curseDec) {
        imgPath = "/assets/ui/curse.png";
        statusChangeText += `- ${curseDec} curses `;
    } else if (curseInc) {
        imgPath = "/assets/ui/curse.png";

        statusChangeText += `+ ${curseInc} curses `;
    } else if (dangerDec) {
        imgPath = "/assets/ui/danger.png";

        statusChangeText += `- ${dangerDec} danger `;
    } else if (dangerInc) {
        imgPath = "/assets/ui/danger.png";
        statusChangeText += `+ ${dangerInc} danger `;
    } else if (healthDec) {
        imgPath = "/assets/ui/curse.png";
        statusChangeText += `- ${healthDec} health`;
    } else {
        imgPath = "/assets/ui/curse.png";
    }
    return (
        <div
            className={cn(
                "relative pixelated bg-contain bg-no-repeat w-72 h-auto mx-2 flex flex-col items-center text-center justify-start overflow-hidden",
                "bg-[url(/assets/ui/choice_bg.png)] bg-contain"
            )}
            {...props}
        >
            {/* <div className="absolute inset-0 bg-gray-800 opacity-70 z-10"></div> */}
            <div className="relative w-40 h-40 mt-16 flex justify-center items-center">
                {/* <img */}
                {/*     className="absolute inset-0 w-full h-full" */}
                {/*     src="/assets/ui/chess_bg.png" */}
                {/* ></img> */}
                <img className="relative w-20 h-20 z-20" src={imgPath}></img>
            </div>
            <div className="w-full mt-[15%] text-[#FF3D00] text-sm whitespace-nowrap z-20">
                {statusChangeText.trim() || "no change"}
            </div>
            <div
                className="mt-4 cursor-pointer text-black bg-[#06FF00] w-[50%] h-8 flex flex-col justify-center z-20 relative"
                onClick={nextRoundFn}
            >
                <div>{coinChangeText}</div>
                <LoadingShade
                    className=""
                    gifClassName="h-2/3"
                    loading={loading}
                />
            </div>

            <div className="mt-10"></div>
        </div>
    );
}
