import { useComponentValue } from "@dojoengine/react";
import { Debugger } from "./Debugger";
import { Inventory } from "./Inventory";
import Shop from "./Shop";
import { useDojo } from "./hooks/useDojo";
import { Home } from "./Home";
import { ShopButton } from "./ShopButton";
import { TopBar } from "./TopBar";

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
            <TopBar />
            <Debugger />
            <Shop />
            <Inventory />
            <ShopButton />
        </div>
    );
}
