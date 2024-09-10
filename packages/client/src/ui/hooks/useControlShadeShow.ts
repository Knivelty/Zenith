import { useMemo } from "react";
import { ShowItem, useUIStore } from "../../store";

const withShadeItems = [
    ShowItem.GuestTips,
    ShowItem.MakeChoice,
    ShowItem.CurseDetail,
    ShowItem.CurseNotice,
    ShowItem.DangerStage,
    ShowItem.SettleDialog,
    ShowItem.HeroInfoDialog,
    ShowItem.GuestTips,
    ShowItem.ConnectWalletDialog,
    ShowItem.QuitConfirmation,
    ShowItem.Shop,
    ShowItem.OptionMenuUnfold,
    ShowItem.SynergyDetail,
    ShowItem.Setting,
];

export function useControlShadeShow() {
    const getShow = useUIStore((state) => state.getShow);
    const setShow = useUIStore((state) => state.setShow);

    const shows = useUIStore((state) => state.shows);

    const showString = JSON.stringify(Array.from(shows));

    useMemo(() => {
        console.log("showString: ", showString);
        function isAnyItemShowed() {
            for (const item of withShadeItems) {
                const show = getShow(item);
                if (show) {
                    return true;
                }
            }
            return false;
        }

        if (isAnyItemShowed()) {
            setShow(ShowItem.Shade, true);
        } else {
            setShow(ShowItem.Shade, false);
        }
    }, [getShow, setShow, showString]);
}
