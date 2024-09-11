import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "../../hooks/useDojo";
import { cn } from "../../lib/utils";
import { zeroEntity } from "../../../utils";

export function DangerBorder() {
    const {
        clientComponents: { GameStatus },
    } = useDojo();

    const status = useComponentValue(GameStatus, zeroEntity);

    console.log(":status", status);

    const visible = status?.dangerous == true;

    return (
        <div
            className={cn(
                "fixed w-screen h-screen top-0 left-0 pointer-events-none z-50",
                {
                    invisible: !visible,
                }
            )}
            style={{
                animation: "danger-glow 1s steps(5,start)  infinite",
            }}
        ></div>
    );
}
