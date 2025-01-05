import { braavos, argent, useAccount, useConnect } from "@starknet-react/core";
import { ShowItem, usePersistUIStore, useUIStore } from "../../../store";
import { Dialog } from "../../components/Dialog";
import { useMemo } from "react";
import { usePlayerProfile } from "../../hooks/usePlayerProfile";
import { logDebug } from "../../lib/utils";

export function ConnectWalletDialog() {
    const show = useUIStore((state) =>
        state.getShow(ShowItem.ConnectWalletDialog)
    );
    const setShow = useUIStore((state) => state.setShow);

    const setLoggedIn = usePersistUIStore((state) => state.setLoggedIn);

    const { connect } = useConnect();
    const { isConnected } = useAccount();
    const { playerName } = usePlayerProfile();

    logDebug(
        "playerName:",
        playerName,
        !playerName,
        playerName.length,
        !!playerName,
        "isConnected: ",
        isConnected
    );

    useMemo(() => {
        if (isConnected) {
            setLoggedIn(true);
            setShow(ShowItem.ConnectWalletDialog, false);
            if (!playerName) {
                logDebug("show SessionWalletCreate");
                setShow(ShowItem.SessionWalletCreate, true);
            }
        }
    }, [isConnected, setLoggedIn, setShow, playerName]);

    if (!show) return null;

    return (
        <Dialog className="flex flex-col items-center justify-center">
            <div className="text-2xl ml-4 mb-12">Choose your Wallet</div>

            <div className="flex flex-row items-center justify-center gap-16 h-32">
                <img
                    onClick={() => {
                        connect({ connector: braavos() });
                    }}
                    className="w-16 cursor-pointer hover:scale-110 transition-transform"
                    src="/assets/ui/braavos.png"
                />

                <img
                    onClick={() => {
                        connect({ connector: argent() });
                    }}
                    className="w-16 cursor-pointer hover:scale-110 transition-transform"
                    src="/assets/ui/argent.png"
                />
            </div>
        </Dialog>
    );
}
