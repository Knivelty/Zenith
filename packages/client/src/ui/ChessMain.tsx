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
import { PlayerList } from "./Playlist";
import { SettleDialog } from "./component/SettleDialog";
import { DangerBorder } from "./component/DangerBorder";
import { Shade } from "./component/Shade";
import { HeroInfoDialog } from "./HeroInfoDialog";
import { SynergyBar } from "./SynergyBar";
import { CurseDetails } from "./component/CurseDetail";

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
            className="relative w-screen h-screen overflow-hidden select-none"
        >
            <TopBar />
            <Debugger />
            <PlayerList />
            <SynergyBar />
            <Shop />
            <SettleDialog />
            <PieceLimit />
            <CommitButton />
            <Inventory />
            <ExpButton />
            <ShopButton />
            <Shade />
            <DangerBorder />
            <HeroInfoDialog />
            <CurseDetails />
        </div>
    );
}
