import { GreenButton } from "../../components/GreenButton";
import { useDojo } from "../../hooks/useDojo";
import { ShowItem, useUIStore } from "../../../store";
import { GuestTips } from "./GuestTips";
import { Shade } from "../effects/Shade";

export function UnConnected() {
    const {
        account: { account },
        systemCalls: { spawn },
        account: {
            account: { address },
        },
    } = useDojo();

    const setShow = useUIStore((state) => state.setShow);
    const loggedIn = useUIStore((state) => state.loggedIn);
    const setLoggedIn = useUIStore((state) => state.setLoggedIn);

    return (
        <div className="flex z-100 absolute h-screen w-screen bg-[url('/assets/ui/home_bg.png')] top-0 left-0 justify-center overflow-hidden z-20">
            <div className="w-1/2 p-4">
                <div className="flex flex-col justify-center h-full">
                    <div className="text-[#06FF00] font-dogica font-bold text-5xl self-center -mt-32">
                        <img src="/assets/ui/zenith.png" />
                    </div>

                    <GreenButton
                        className="self-center w-[60%] h-16 mt-20 text-xl"
                        onClick={() => {
                            setShow(ShowItem.GuestTips, true);
                            setShow(ShowItem.Shade, true);
                        }}
                    >
                        Login As Guest
                    </GreenButton>

                    <GreenButton className="self-center w-[60%] h-16 mt-12 text-xl">
                        Connect Wallet
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
