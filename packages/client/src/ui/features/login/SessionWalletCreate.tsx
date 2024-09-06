import { useCallback, useMemo, useState } from "react";
import { GreenButton } from "../../components/GreenButton";
import { HomeBg } from "../../components/HomeBg";
import { Dialog } from "../../components/Dialog";
import { useDojo } from "../../hooks/useDojo";
import { ShowItem, usePersistUIStore, useUIStore } from "../../../store";
import { usePlayerProfile } from "../../hooks/usePlayerProfile";
import { cn } from "../../lib/utils";
import { LoadingShade } from "../../components/LoadingShade";

export function SessionWalletCreate() {
    const {
        systemCalls: { setName },
        clientComponents: { PlayerProfile },
        account: { account, playerEntity },
    } = useDojo();

    const [inputName, setInputName] = useState("");
    const setShow = useUIStore((state) => state.setShow);
    const setLoggedIn = usePersistUIStore((state) => state.setLoggedIn);
    const { playerName } = usePlayerProfile();

    useMemo(() => {
        if (playerName != "") {
            setShow(ShowItem.SessionWalletCreate, false);
            setLoggedIn(true);
        }
    }, [playerName, setShow, setLoggedIn]);

    const loggedIn = usePersistUIStore((state) => state.loggedIn);

    const [loading, setLoading] = useState(false);

    const setNameFn = useCallback(() => {
        if (loading) {
            return;
        }
        setLoading(true);
        setName(account, inputName).finally(() => {
            setLoading(false);
        });
    }, [account, inputName, setName, loading]);

    return (
        <HomeBg className="z-40 flex-col items-center justify-start">
            <div className="text-3xl font-bold custom-green-text-shadow mt-[5%] bg-none">
                WELCOME TO Zenith
            </div>
            <div className="text-xs custom-green-text-shadow mt-[1%]">
                Follow the steps below to set up for a smooth start to the game.
            </div>
            <Dialog className="w-1/2 h-1/2 flex flex-col items-center justify-start">
                <div className="text-3xl font-bold mt-[5%]">SESSION WALLET</div>
                <div className="text-xs w-[40rem] mt-8 text-opacity-50">
                    The session wallet is a private key stored in your browser's
                    local storage. It allows you to play games without having to
                    confirm transactions.
                </div>
                <div className="text-xs text-[#EE7956] mt-12">
                    Authorization successful, session wallet has been created.{" "}
                </div>
                <input
                    type="text"
                    className="bg-black placeholder:text-[#06FF00] placeholder:text-opacity-50 w-[28rem] h-[4rem] pl-4 border-2 border-[#06FF00] mt-8"
                    placeholder="your name"
                    onChange={(e) => setInputName(e.target.value)}
                />
                <GreenButton
                    className="mt-8 w-[28rem] h-[4rem] relative"
                    onClick={setNameFn}
                >
                    <div>Confirm</div>
                    <LoadingShade
                        className=""
                        gifClassName="h-2/3"
                        loading={loading}
                    />
                </GreenButton>
            </Dialog>
        </HomeBg>
    );
}
