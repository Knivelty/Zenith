import { GreenButton } from "../../components/GreenButton";
import { useGameEnd } from "../../hooks/useControlGameEnd";
import { useDojo } from "../../hooks/useDojo";

export function Overview() {
    const {
        systemCalls: { confirmExit },
        account: { account },
    } = useDojo();
    const { result } = useGameEnd();
    return (
        <div className="flex flex-col items-center justify-center text-[#A6A6A6]">
            <div className="text-3xl mt-16">Game Over</div>
            <div className="w-3/5 mt-12">
                Adventurer, it seems I overestimated you. Your skills are
                laughable against Shadow Grove, Go train some more.
            </div>
            <div className="mt-16">
                You have completed a total of {result?.score} rounds.
            </div>
            <div className="flex flex-row space-x-4 mt-12">
                <GreenButton
                    className="w-48 h-12"
                    onClick={() => {
                        console.log("confirmExit: ", confirmExit);
                        confirmExit(account);
                    }}
                >
                    Home
                </GreenButton>
                <GreenButton className="w-48 h-12">Share to X</GreenButton>
            </div>
        </div>
    );
}
