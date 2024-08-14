import { ShowItem, useUIStore } from "../../../store";
import { GreenButton } from "../../components/GreenButton";
import { TipsDialog } from "../../components/TipsDialog";

export function GuestTips() {
    const show = useUIStore((state) => state.getShow(ShowItem.GuestTips));
    const setShow = useUIStore((state) => state.setShow);

    const setLoggedIn = useUIStore((state) => state.setLoggedIn);

    if (!show) return null;

    return (
        <TipsDialog className="flex flex-col items-center justify-center">
            <div className="flex flex-row justify-center items-center">
                <img className="w-16 h-16" src="/assets/ui/warning.png" />
                <div className="text-2xl ml-4">TIP</div>
            </div>
            <div className="mt-8 w-1/2">
                ARE YOU SURE YOU WANT TO LOGIN AS GUEST? YOU WILL NOT BE ABLE TO
                WIN PRIZES OR PLAY ACROSS DEVICES.
            </div>
            <div className="flex flex-row items-center justify-center mt-8 w-full">
                <GreenButton
                    className="w-1/5 h-12"
                    onClick={() => {
                        setShow(ShowItem.GuestTips, false);
                        setShow(ShowItem.Shade, false);
                    }}
                >
                    Cancel
                </GreenButton>
                <GreenButton
                    className="w-1/5 h-12 ml-4"
                    onClick={() => {
                        setShow(ShowItem.GuestTips, false);
                        setShow(ShowItem.Shade, false);
                        setLoggedIn();
                    }}
                >
                    Confirm
                </GreenButton>
            </div>
        </TipsDialog>
    );
}
