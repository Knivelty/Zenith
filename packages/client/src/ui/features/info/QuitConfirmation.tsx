import { ShowItem, useUIStore } from "../../../store";
import { GreenButton } from "../../components/GreenButton";
import { TipsDialog } from "../../components/TipsDialog";
import { useDojo } from "../../hooks/useDojo";

export function QuitConfirmation() {
    const show = useUIStore((state) =>
        state.getShow(ShowItem.QuitConfirmation)
    );
    const setShow = useUIStore((state) => state.setShow);

    const {
        systemCalls: { exit },
        account: { account },
    } = useDojo();

    if (!show) {
        return null;
    }

    return (
        <TipsDialog className="flex flex-col items-center justify-center">
            <div className="text-4xl font-bold">Quit the game?</div>
            <div className="flex mt-20">
                <GreenButton
                    className="w-40 h-10"
                    onClick={() => {
                        setShow(ShowItem.QuitConfirmation, false);
                    }}
                >
                    Cancel
                </GreenButton>
                <GreenButton
                    className="w-40 h-10 ml-20 bg-black text-[#06FF00] opacity-35 border border-[#06FF00]"
                    onClick={() => {
                        exit(account);
                    }}
                >
                    Confirm
                </GreenButton>
            </div>
        </TipsDialog>
    );
}
