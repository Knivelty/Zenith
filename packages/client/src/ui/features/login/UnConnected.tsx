import { GreenButton } from "../../components/GreenButton";
import { useDojo } from "../../hooks/useDojo";
import { ShowItem, useUIStore } from "../../../store";
import { HomeBg } from "../../components/HomeBg";
import { Rank } from "../info/Rank";

export function UnConnected() {
    const {
        account: { account },
        systemCalls: { spawn },
        account: {
            account: { address },
        },
    } = useDojo();

    const setShow = useUIStore((state) => state.setShow);

    return (
        <div className="flex flex-col justify-center h-full">
            <div className="text-[#06FF00] font-dogica font-bold text-5xl self-center -mt-32">
                <img src="/assets/ui/zenith.png" />
            </div>

            {/* <GreenButton
                className="self-center w-[60%] h-16 mt-20 text-xl"
                onClick={() => {
                    setShow(ShowItem.GuestTips, true);
                }}
            >
                Login As Guest
            </GreenButton> */}

            <GreenButton
                className="self-center w-[60%] h-16 mt-12 text-xl"
                onClick={() => {
                    setShow(ShowItem.ConnectWalletDialog, true);
                }}
            >
                Connect Wallet
            </GreenButton>
        </div>
    );
}
