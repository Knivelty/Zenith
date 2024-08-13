import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "./hooks/useDojo";
import { Home } from "./Home";
import { ShopButton } from "./features/shop/ShopButton";
import { TopBar } from "./features/info/TopBar";
import { CommitButton } from "./components/CommitButton";
import { ExpButton } from "./features/exp/ExpButton";
import { PieceLimit } from "./features/board/PieceLimit";
import { PlayerList } from "./features/info/Playlist";
import { SettleDialog } from "./features/settle/SettleDialog";
import { DangerBorder } from "./features/effects/DangerBorder";
import { Shade } from "./features/effects/Shade";
import { HeroInfoDialog } from "./features/info/HeroInfoDialog";
import { SynergyBar } from "./features/info/SynergyBar";
import { CurseDetails } from "./features/info/CurseDetail";
import { StatesPanel } from "./features/debug/StatePanel";
import { SpeedSlider } from "./features/misc/SpeedSlider";
import { Debugger } from "./features/debug/Debugger";
import Shop from "./features/shop/Shop";
import { Inventory } from "./features/inventory/Inventory";

export function Main() {
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
            <SpeedSlider />
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
            <StatesPanel />
        </div>
    );
}
