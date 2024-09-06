import { useDojo } from "../../hooks/useDojo";
import { shortenAddress } from "../../lib/utils";
import { ShowItem, usePersistUIStore, useUIStore } from "../../../store";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";

export function ConnectStatus() {
    const {
        account: {
            account: { address },
        },
    } = useDojo();

    const { account: walletAccount } = useAccount();
    const { isConnected } = useAccount();
    const { disconnect } = useDisconnect();

    const show = useUIStore((state) => state.getShow(ShowItem.AccountOption));
    const setShow = useUIStore((state) => state.setShow);
    const setLoggedIn = usePersistUIStore((state) => state.setLoggedIn);

    return (
        <div className="fixed top-12 left-12 flex flex-col justify-center w-60">
            <div
                className="border-2 border-[#06FF00] bg-black w-60 h-8 flex justify-center items-center cursor-pointer"
                onClick={() => {
                    setShow(ShowItem.AccountOption, !show);
                }}
            >
                {shortenAddress(walletAccount?.address ?? address)}
            </div>
            {show && (
                <div className="mt-4 border-2 p-3 border-[#06FF00] bg-black w-60 flex flex-col gap-y-4">
                    <div className="flex flex-row items-center justify-start">
                        <img className="ml-4" src="/assets/ui/profile.png" />
                        <div className="ml-2">Profile</div>
                    </div>
                    <div className="border-b-2 border-[#06FF00] w-52 self-center"></div>
                    <div
                        className="flex flex-row items-center justify-start cursor-pointer"
                        onClick={() => {
                            if (isConnected) {
                                disconnect();
                            } else {
                                setLoggedIn(false);
                            }
                        }}
                    >
                        <img className="ml-4" src="/assets/ui/disconnect.png" />
                        <div className="ml-2">Disconnect</div>
                    </div>
                </div>
            )}
        </div>
    );
}
