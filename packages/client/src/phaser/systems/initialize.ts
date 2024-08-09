import { setComponent } from "@dojoengine/recs";
import { PhaserLayer } from "..";
import { zeroEntity } from "../../utils";

// initialize some obj
export const initialize = (layer: PhaserLayer) => {
    const {
        networkLayer: {
            clientComponents: { UserOperation },
        },
    } = layer;

    setComponent(UserOperation, zeroEntity, {
        dragging: false,
        draggingGid: 0,
        selected: false,
        selectGid: 0,
        skipAnimation: false,
        animationSpeed: 1,
    });
};
