import { useDojo } from "./hooks/useDojo";
import { ShowItem, UIStore, usePersistUIStore, useUIStore } from "../store";
import { AgreeTerm } from "./features/login/AgreeTerm";
import { UnConnected } from "./features/login/UnConnected";
import { Connected } from "./features/login/Connected";

import { GuestTips } from "./features/login/GuestTips";
import { ConnectWalletDialog } from "./features/login/ConnectWalletDialog";
import { Shade } from "./features/effects/Shade";
import { ConnectStatus } from "./features/login/ConnectStatus";
import { useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { SessionWalletCreate } from "./features/login/SessionWalletCreate";
import { HomeBg } from "./components/HomeBg";
import { logDebug } from "./lib/utils";
import { Rank } from "./features/info/Rank";
import { ScaleCheck } from "./features/scaleCheck/scaleCheck";

export const Home = () => {
    const {
        account: { playerEntity },
        clientComponents: { PlayerProfile },
    } = useDojo();

    const { agreeTerm, loggedIn, didScaleCheck } = usePersistUIStore((state) => state);

    const sessionWalletShow = useUIStore((state: UIStore) =>
        state.getShow(ShowItem.SessionWalletCreate)
    );

    const { isConnected } = useAccount();
    const setLoggedIn = usePersistUIStore((state) => state.setLoggedIn);

    useMemo(() => {
        if (isConnected) {
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }
    }, [isConnected, setLoggedIn]);

    logDebug("sessionWalletShow: ", sessionWalletShow);

    if (!didScaleCheck) {
        return <ScaleCheck />
    }

    return (
        <HomeBg>

            {sessionWalletShow && <SessionWalletCreate />}

            {!agreeTerm && <AgreeTerm />}

            <div className="w-1/2 p-4">
                {!loggedIn ? <UnConnected /> : <Connected />}
            </div>
            <div className="w-1/2 p-4">
                <div className="flex flex-col justify-start items-center h-full">
                    <Rank />
                </div>
            </div>

            {loggedIn && <ConnectStatus />}
            <GuestTips />
            <ConnectWalletDialog />
            <Shade />
        </HomeBg>
    );
};
