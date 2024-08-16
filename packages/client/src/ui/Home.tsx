import { useDojo } from "./hooks/useDojo";
import { ShowItem, useUIStore } from "../store";
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

export const Home = () => {
    const {
        account: { playerEntity },
        clientComponents: { PlayerProfile },
    } = useDojo();

    const agreeTerm = useUIStore((state) => state.agreeTerm);
    const loggedIn = useUIStore((state) => state.loggedIn);

    const sessionWalletShow = useUIStore((state) =>
        state.getShow(ShowItem.SessionWalletCreate)
    );

    const { isConnected } = useAccount();
    const setLoggedIn = useUIStore((state) => state.setLoggedIn);

    useMemo(() => {
        if (isConnected) {
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }
    }, [isConnected, setLoggedIn]);

    logDebug("sessionWalletShow: ", sessionWalletShow);

    return (
        <HomeBg>
            {sessionWalletShow && <SessionWalletCreate />}

            {!agreeTerm && <AgreeTerm />}

            {!loggedIn ? <UnConnected /> : <Connected />}

            <ConnectStatus />
            <GuestTips />
            <ConnectWalletDialog />
            <Shade />
        </HomeBg>
    );
};
