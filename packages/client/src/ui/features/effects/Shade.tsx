import { ShowItem, UIStore, useUIStore } from "../../../store";
import { cn } from "../../lib/utils";

export function Shade() {
    const shadeShow = useUIStore((state: UIStore) =>
        state.getShow(ShowItem.Shade)
    );

    return (
        <div
            className={cn(
                "fixed w-screen h-screen top-0 left-0 bg-[#151515] z-20 transition-opacity duration-300",
                shadeShow ? "opacity-90" : "opacity-0 pointer-events-none"
            )}
        ></div>
    );
}
