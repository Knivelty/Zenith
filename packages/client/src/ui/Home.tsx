import { GreenButton } from "./components/GreenButton";
import { useDojo } from "./hooks/useDojo";
import { UIStore, useUIStore } from "../store";
import { AgreeTerm } from "./features/login/AgreeTerm";
import { UnConnected } from "./features/login/UnConnected";
import { Connected } from "./features/login/Connected";

export const Home = () => {
    const {
        account: { account },
        systemCalls: { spawn },
        account: {
            account: { address },
        },
    } = useDojo();

    const agreeTerm = useUIStore((state) => state.agreeTerm);
    const loggedIn = useUIStore((state) => state.loggedIn);

    if (!agreeTerm) {
        return <AgreeTerm />;
    }

    if (!loggedIn) return <UnConnected />;

    return <Connected />;

    return (
        <div className="flex z-100 absolute h-screen w-screen bg-[url('/assets/ui/home_bg.png')] top-0 left-0 justify-center overflow-hidden z-20">
            <div className="w-1/2 p-4">
                <div className="flex flex-col justify-center h-full">
                    <div className="text-[#06FF00] font-dogica font-bold text-5xl self-center -mt-32">
                        Zenith
                    </div>

                    <GreenButton
                        className="self-center w-44 h-16 mt-40 text-xl font-dogica"
                        onClick={async () => {
                            await spawn(account);
                        }}
                    >
                        START
                    </GreenButton>
                </div>
            </div>
            <div className="w-1/2 p-4">
                <div className="fl ex flex-col justify-start h-full">
                    <div className="text-[#06FF00] text-3xl font-bold self-center font-dogica mt-32">
                        Rank
                    </div>
                </div>
            </div>
        </div>
    );
};
