import { useComponentValue } from "@dojoengine/react";
import { Debugger } from "./Debugger";
import { Inventory } from "./Inventory";
import Shop from "./Shop";
import { useDojo } from "./hooks/useDojo";
import { Home } from "./Home";
import { ShopButton } from "./component/ShopButton";
import { TopBar } from "./TopBar";
import { CommitButton } from "./component/CommitButton";
import { ExpButton } from "./component/ExpButton";
import { PieceLimit } from "./component/PieceLimit";

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
        <div
            onDragOver={(e) => {
                e.preventDefault();
            }}
            className="relative w-screen h-screen overflow-hidden"
        >
            <TopBar />
            <Debugger />
            <Shop />
            <CommitButton />
            <PieceLimit />
            <Inventory />
            <ExpButton />
            <ShopButton />
        </div>
    );
}
