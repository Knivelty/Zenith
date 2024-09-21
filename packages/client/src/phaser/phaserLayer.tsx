import { useEffect } from "react";
import { NetworkLayer } from "../dojo/createNetworkLayer";
import { store, usePersistUIStore } from "../store";
import { usePhaserLayer } from "../ui/hooks/usePhaserLayer";

type Props = {
    networkLayer: NetworkLayer | null;
};

export const PhaserLayer = ({ networkLayer }: Props) => {
    const loggedIn = usePersistUIStore((state) => state.loggedIn);
    const { phaserLayer, ref } = usePhaserLayer({ networkLayer });

    useEffect(() => {
        if (phaserLayer) {
            store.setState({ phaserLayer });
        }
    }, [phaserLayer, loggedIn]);

    return (
        <div
            ref={ref}
            onDragOver={(e) => {
                e.preventDefault();
            }}
            style={{
                position: "absolute",
                top: "4%",
                left: "50%",
                width: "50rem",
                height: "50rem",
                transform: "translateX(-50%)",
                zIndex: "5",
            }}
        />
    );
};
