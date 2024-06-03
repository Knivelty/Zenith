import { useUIStore } from "../../store";
import { cn } from "../lib/utils";

export function Shade() {
    const shadeShow = useUIStore((state) => state.shadeShow);

    return (
        <div
            className={cn(
                "fixed w-screen h-screen top-0 left-0 bg-[#151515] opacity-[0.8] z-20",
                { invisible: !shadeShow }
            )}
        ></div>
    );
}
