import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "./hooks/useDojo";
import { Home } from "./Home";
import { ShopButton } from "./features/shop/ShopButton";
import { TopBar } from "./features/info/TopBar";
import { CommitButton } from "./components/CommitButton";
import { ExpButton } from "./features/exp/ExpButton";
import { PieceLimit } from "./features/board/PieceLimit";
import { PlayerList } from "./features/info/PlayerList";
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
import { CurseNotice } from "./features/info/CurseNotice";
import { ChoiceDialog } from "./features/settle/ChoiceDialog";
import { DangerStage } from "./features/info/DangerStage";
import { QuitConfirmation } from "./features/info/QuitConfirmation";
import { OptionMenu } from "./features/misc/OptionMenu";
import { SynergyDetail } from "./features/info/SynergyDetail";
import { useShowFollowValue } from "./hooks/useShowFollowValue";
import { Setting } from "./features/manage/Setting";
import { usePlayBackGroundMusic } from "./hooks/usePlayBackGroundMusic";
import { useCheckNetworkHealth } from "./hooks/useCheckNetworkHealth";

export function Main() {
    const {
        clientComponents: { Player },
        account: { playerEntity },
    } = useDojo();

    const inGame = useComponentValue(Player, playerEntity)?.inMatch;

    useShowFollowValue();
    usePlayBackGroundMusic();
    useCheckNetworkHealth();

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
            <SynergyDetail />
            <Shop />
            <SpeedSlider />
            <SettleDialog />
            <ChoiceDialog />
            <QuitConfirmation />
            <PieceLimit />
            <CommitButton />
            <Inventory />
            <ExpButton />
            <ShopButton />
            <Shade />
            <DangerBorder />
            <HeroInfoDialog />
            <CurseDetails />
            <CurseNotice />
            <StatesPanel />
            <DangerStage />
            <OptionMenu />
            <Setting />
        </div>
    );
}
