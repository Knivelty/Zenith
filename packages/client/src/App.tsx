import { useEffect } from "react";
import { useNetworkLayer } from "./ui/hooks/useNetworkLayer";
import { PhaserLayer } from "./phaser/phaserLayer";
import { store } from "./store";
import { UI } from "./ui";
import { SelectNetwork } from "./ui/features/misc/SelectNetwork";
import { useInitializeAudio } from "./ui/hooks/useInitializeAudio";
import { Loading } from "./ui/features/login/Loading";
import { StarknetProvider } from "./ui/components/starknet-provider";
import { useControlShadeShow } from "./ui/hooks/useControlShadeShow";

function App() {
  const networkLayer = useNetworkLayer();

  // preload audio files
  useInitializeAudio();
  useControlShadeShow();

  useEffect(() => {
    if (!networkLayer || !networkLayer.account) return;

    console.log("Setting network layer");

    store.setState({ networkLayer });
  }, [networkLayer]);

  if (!networkLayer) {
    return <Loading />;
  }

  return (
    <div>
      <div className="w-full h-screen  bg-[url('/assets/ui/chess_bg.png')] bg-no-repeat bg-cover bg-center	 text-white flex justify-center fixed">
        <div className="self-center">
          {!networkLayer && "loading..."}
        </div>
      </div>
      <SelectNetwork networkLayer={networkLayer} />
      <PhaserLayer networkLayer={networkLayer} />
      <StarknetProvider>
        <UI />
      </StarknetProvider>
    </div>
  );
}

export default App;
