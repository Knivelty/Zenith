import { useHotkeys } from "react-hotkeys-hook";
import { useChoice } from "../hooks/useChoice";
import { useDojo } from "../hooks/useDojo";
import { cn } from "../lib/utils";
import { useCallback } from "react";
import { ShowItem, UIStore, useUIStore } from "../../store";

export interface IChoice extends React.HTMLAttributes<HTMLDivElement> {
    coinDec?: number;
    coinInc?: number;
    curseDec?: number;
    curseInc?: number;
    deterDec?: number;
    deterInc?: number;
    healthDec?: number;
    order: number;
}

export function ChoiceList() {
    const choices = useChoice();
    return (
        <div className="flex w-full justify-center mt-12">
            {choices.map((c, i) => {
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
    deterDec,
    deterInc,
    healthDec,
    order,
    ...props
}: IChoice) {
    const {
        account: { account },
        systemCalls: { nextRound },
    } = useDojo();

    const getShow = useUIStore((state: UIStore) => state.getShow);

    const nextRoundFn = useCallback(() => {
        if (!order) return;
        nextRound(account, order);
    }, [order, nextRound, account]);

    useHotkeys(order.toString(), () => {
        if (getShow(ShowItem.SettleDialog)) {
            nextRoundFn();
        }
    });

    const coinChangeText = coinDec ? `- $${coinDec}` : `+ $${coinInc}`;
    let statusChangeText = "";
    let imgPath = "";
    if (curseDec) {
        imgPath = "/assets/ui/curse.png";
        statusChangeText += `Lose ${curseDec} curses `;
    } else if (curseInc) {
        imgPath = "/assets/ui/curse.png";

        statusChangeText += `Obtain ${curseInc} curses `;
    } else if (deterDec) {
        imgPath = "/assets/ui/danger.png";

        statusChangeText += `Lose ${deterDec} danger `;
    } else if (deterInc) {
        imgPath = "/assets/ui/danger.png";
        statusChangeText += `Obtain ${deterInc} danger `;
    } else if (healthDec) {
        imgPath = "/assets/ui/curse.png";
        statusChangeText += `Lost ${healthDec} health`;
    } else {
        imgPath = "/assets/ui/curse.png";
    }
    return (
        <div
            className={cn(
                "relative pixelated bg-contain bg-no-repeat w-[20%] h-full mx-8 flex flex-col items-center text-center justify-start overflow-hidden",
                "bg-[url(assets/ui/chess_bg.png)] bg-cover"
            )}
            {...props}
        >
            <div className="absolute inset-0 bg-gray-800 opacity-70 z-10"></div>
            <img className="w-40 h-40 z-10 mt-20" src={imgPath}></img>
            <div className="w-full mt-[15%] text-[#FF3D00] text-sm whitespace-nowrap z-20">
                {statusChangeText.trim() || "no change"}
            </div>
            <div
                className="mt-4 cursor-pointer text-black bg-[#FF3D00] w-[50%] h-8 flex flex-col justify-center z-20"
                onClick={nextRoundFn}
            >
                <div>{coinChangeText}</div>
            </div>

            <div className="mt-10"></div>
        </div>
    );
}
