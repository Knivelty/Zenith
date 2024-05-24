import { useEffect } from "react";
import { useNetworkLayer } from "./ui/hooks/useNetworkLayer";
import { PhaserLayer } from "./phaser/phaserLayer";
import { store } from "./store";
import { UI } from "./ui";
import { SelectNetwork } from "./ui/SelectNetwork";

function App() {
    const networkLayer = useNetworkLayer();

    useEffect(() => {
        if (!networkLayer || !networkLayer.account) return;

        console.log("Setting network layer");

        store.setState({ networkLayer });
    }, [networkLayer]);

    return (
        <div>
            <div className="w-full h-screen  bg-[url('/assets/ui/chess_bg.png')] bg-no-repeat bg-cover bg-center	 text-white flex justify-center fixed">
                <div className="self-center">
                    {!networkLayer && "loading..."}
                </div>
            </div>
            <SelectNetwork networkLayer={networkLayer} />
            <PhaserLayer networkLayer={networkLayer} />
            <UI />
        </div>
    );
}

export default App;
