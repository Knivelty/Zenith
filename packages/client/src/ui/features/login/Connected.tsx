import { GreenButton } from "../../components/GreenButton";
import { useDojo } from "../../hooks/useDojo";
import { GuestTips } from "./GuestTips";
import { Shade } from "../effects/Shade";
import { ConnectStatus } from "./ConnectStatus";
import { HomeBg } from "../../components/HomeBg";
import { ShowItem, usePersistUIStore, useUIStore } from "../../../store";

export function Connected() {
    const {
        account: { account },
        systemCalls: { spawn },
        account: {
            account: { address },
        },
    } = useDojo();

    const { skipGuide, setSkipGuide } = usePersistUIStore((state) => state);
    const { setShow } = useUIStore();

    return (
        <div className="flex flex-col justify-center h-full">
            <div className="text-[#06FF00] font-dogica font-bold text-5xl self-center -mt-32">
                <img src="/assets/ui/zenith.png" />
            </div>

            <GreenButton
                className="self-center w-[60%] h-16 mt-20 text-xl"
                onClick={() => {
                    spawn(account).finally(() => {
                        if (!skipGuide) {
                            setShow(ShowItem.GuidePage, true);
                        }
                    });
                }}
            >
                Start
            </GreenButton>
        </div>
    );
}
