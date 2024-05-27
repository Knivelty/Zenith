import { useChoice } from "../hooks/useChoice";
import { useDojo } from "../hooks/useDojo";

export interface IChoice {
    coinDec?: number;
    coinInc?: number;
    curseDec?: number;
    curseInc?: number;
    deterDec?: number;
    deterInc?: number;
    healthDec?: number;
    onClick: () => void;
}

export function ChoiceList() {
    const {
        account: { account },
        systemCalls: { nextRound },
    } = useDojo();
    const choices = useChoice();
    return (
        <div className="flex h-full w-full justify-center mt-12">
            {choices.map((c, i) => {
                return (
                    <Choice
                        {...c}
                        onClick={() => {
                            nextRound(account, i + 1);
                        }}
                    />
                );
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
    onClick,
}: IChoice) {
    const coinChangeText = coinDec ? `- $${coinDec}` : `+ $${coinInc}`;
    let statusChangeText = "";
    if (curseDec) {
        statusChangeText += `Lose ${curseDec} curses `;
    } else if (curseInc) {
        statusChangeText += `Obtain ${curseInc} curses `;
    } else if (deterDec) {
        statusChangeText += `Lose ${deterDec} danger `;
    } else if (deterInc) {
        statusChangeText += `Obtain ${deterInc} danger `;
    } else if (healthDec) {
        statusChangeText += `Lost ${healthDec} health`;
    }
    return (
        <div className="bg-[url(/assets/ui/choice_detail.png)] pixelated bg-contain bg-no-repeat w-[18%] h-full mx-8 flex flex-col items-center text-center justify-start">
            <div className="w-full mt-52 text-[#FF3D00]">
                {statusChangeText.trim()}
            </div>
            <div className="mt-4 cursor-pointer text-black" onClick={onClick}>
                {coinChangeText}
            </div>
            <div className="mt-20"></div>
        </div>
    );
}
