import { ShowItem, useUIStore } from "../../../store";
import { useClickOutside } from "../../hooks/useClickOutside";
import { OptionMenuItem } from "./OptionMenuItem";

export function OptionMenu() {
    const show = useUIStore((state) =>
        state.getShow(ShowItem.OptionMenuUnfold)
    );
    const setShow = useUIStore((state) => state.setShow);
    const setField = useUIStore((state) => state.setField);

    const { ref } = useClickOutside(() => {
        setShow(ShowItem.OptionMenuUnfold, false);
    });

    if (!show) {
        return (
            <div
                className="absolute top-0 right-4 w-20 h-12 border border-[#06FF00] bg-black flex justify-center items-center space-x-4 hover:cursor-pointer"
                onClick={() => {
                    setShow(ShowItem.OptionMenuUnfold, true);
                }}
            >
                <img
                    src="/assets/ui/triple_line.png"
                    className="w-4 h-auto"
                ></img>
                <img
                    src="/assets/ui/down_arrow.png"
                    className="w-4 h-auto"
                ></img>
            </div>
        );
    }

    return (
        <div
            ref={ref}
            className="absolute top-0 right-4 w-32  z-20 flex flex-col items-center justify-center"
        >
            <div
                className="w-full h-16 border border-[#06FF00] bg-black flex space-x-4 hover:cursor-pointer"
                onClick={() => {
                    setShow(ShowItem.OptionMenuUnfold, false);
                }}
            >
                <div className="absolute top-0 right-0 w-20 h-12 flex justify-center items-center space-x-4">
                    <img
                        src="/assets/ui/triple_line.png"
                        className="w-4 h-auto"
                    ></img>
                    <img
                        src="/assets/ui/down_arrow.png"
                        className="w-4 h-auto"
                    ></img>
                </div>
            </div>
            <OptionMenuItem
                onClick={() => {
                    setShow(ShowItem.Setting, true);
                    setShow(ShowItem.OptionMenuUnfold, false);
                }}
            >
                Setting
            </OptionMenuItem>
            <OptionMenuItem>Picture</OptionMenuItem>
            <OptionMenuItem
                onClick={() => {
                    setField("guideRun", true);
                    setField("guideIndex", 0);
                    setShow(ShowItem.GeneralGuide, true);
                    setShow(ShowItem.OptionMenuUnfold, false);
                }}
            >
                Game Help
            </OptionMenuItem>
            <OptionMenuItem
                onClick={() => {
                    setShow(ShowItem.QuitConfirmation, true);
                }}
            >
                Quit
            </OptionMenuItem>
        </div>
    );
}
