import { useComponentValue } from "@dojoengine/react";
import { useUIStore } from "../store";
import { Debugger } from "./Debugger";
import { Inventory } from "./Inventory";
import Shop from "./Shop";
import { useDojo } from "./hooks/useDojo";
import { Home } from "./Home";
import { ShopButton } from "./ShopButton";

export function ChessMain() {
    const {
        clientComponents: { Player },
        account: { playerEntity },
    } = useDojo();

    const inGame = useComponentValue(Player, playerEntity)?.inMatch;

    if (!inGame) {
        return <Home />;
    }

    return (
        <div className="relative w-screen h-screen overflow-hidden">
            <Debugger />
            <Shop />
            <Inventory />
            <ShopButton />
        </div>
    );
}
