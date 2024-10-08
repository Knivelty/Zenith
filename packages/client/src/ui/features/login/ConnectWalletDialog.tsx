import { braavos, useAccount, useConnect } from "@starknet-react/core";
import { ShowItem, usePersistUIStore, useUIStore } from "../../../store";
import { GreenButton } from "../../components/GreenButton";
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
      <div className="text-2xl ml-4">Connect Wallet</div>
      <img className="w-32 mt-12" src="/assets/ui/braavos.png" />

      <div className="flex flex-row items-center justify-center mt-12 w-full">
        <GreenButton
          className="w-2/5 h-12 ml-4"
          onClick={() => {
            connect({ connector: braavos() });
          }}
        >
          Connect to your braavos Wallet
        </GreenButton>
      </div>
    </Dialog>
  );
}
