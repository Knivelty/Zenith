import { GreenButton } from "../../components/GreenButton";
import { useDojo } from "../../hooks/useDojo";
import { GuestTips } from "./GuestTips";
import { Shade } from "../effects/Shade";
import { ConnectStatus } from "./ConnectStatus";

export function Connected() {
    const {
        account: { account },
        systemCalls: { spawn },
        account: {
            account: { address },
        },
    } = useDojo();

    return (
        <div className="flex z-100 absolute h-screen w-screen bg-[url('/assets/ui/home_bg.png')] top-0 left-0 justify-center overflow-hidden z-20">
            <div className="w-1/2 p-4">
                <ConnectStatus />
                <div className="flex flex-col justify-center h-full">
                    <div className="text-[#06FF00] font-dogica font-bold text-5xl self-center -mt-32">
                        <img src="/assets/ui/zenith.png" />
                    </div>

                    <GreenButton
                        className="self-center w-[60%] h-16 mt-20 text-xl"
                        onClick={() => {
                            spawn(account);
                        }}
                    >
                        Start
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
            <GuestTips />
            <Shade />
        </div>
    );
}
