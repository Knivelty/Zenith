import { useHotkeys } from "react-hotkeys-hook";
import { ShowItem, useUIStore } from "../../store";

const BLOCK_ESC_SHOW_ITEM = [
    ShowItem.MakeChoice,
    ShowItem.CurseNotice,
    ShowItem.DangerStage,
    ShowItem.SettleDialog,
];

export function useEscCloseDialog() {
    const setShow = useUIStore((state) => state.setShow);

    useHotkeys("esc", () => {
        Object.values(ShowItem).map((v) => {
            if (BLOCK_ESC_SHOW_ITEM.includes(v as ShowItem)) return;

            setShow(v as ShowItem, false);
        });
    });
}
