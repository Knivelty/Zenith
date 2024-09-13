import { GreenButton } from "../../components/GreenButton";
import { useDojo } from "../../hooks/useDojo";
import { GuestTips } from "./GuestTips";
import { Shade } from "../effects/Shade";
import { ConnectStatus } from "./ConnectStatus";
import { HomeBg } from "../../components/HomeBg";

export function Connected() {
    const {
        account: { account },
        systemCalls: { spawn },
        account: {
            account: { address },
        },
    } = useDojo();

    return (
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
    );
}
