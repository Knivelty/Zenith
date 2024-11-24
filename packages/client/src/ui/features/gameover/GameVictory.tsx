import { GreenButton } from "../../components/GreenButton";
import { useGameEnd } from "../../hooks/useControlGameEnd";
import { useDojo } from "../../hooks/useDojo";

export function GameVictory() {
    const {
        systemCalls: { confirmExit },
        account: { account },
    } = useDojo();
    const { result } = useGameEnd();

    return (
        <div className="flex flex-col items-center justify-center text-[#F2A316]">
            <div className="text-3xl mt-16">
                Congratulations on Completing the Game
            </div>
            <div className="w-3/5 mt-8">
                Adventurer, your abilities are impressive. You've temporarily
                tamed Shadow Grove, but don't let it go to your head. The beasts
                here are ever-evolving. Stay vigilant and keep training for the
                next big challenge.
            </div>
            <div className="w-3/5 mt-8">
                You are the Xth adventurer to conquer Shadow Grove in Season 1!
                You are now eligible to mint the rewards the Grove has to offer.
                The rewards are gradually taking shape in the shadow.
            </div>
            <div className="w-3/5 mt-12 text-xl flex justify-center items-center">
                <div>Score: {result?.score}</div>
            </div>
            <img
                className="absolute w-[50rem]"
                src="/assets/ui/victory_firework.gif"
            />
            <img
                className="absolute right-[4rem] w-[10rem]"
                src="/assets/ui/victory_color_bar.png"
            />
            <img
                className="absolute left-[4rem] w-[10rem]"
                src="/assets/ui/victory_color_bar_2.png"
            />

            <div className="flex flex-row space-x-4 mt-8">
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
