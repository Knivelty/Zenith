import { setComponent } from "@dojoengine/recs";
import { PhaserLayer } from "..";
import { zeroEntity } from "../../utils";

// initialize some obj
export const initialize = (layer: PhaserLayer) => {
    const {
        networkLayer: {
            clientComponents: { UserOperation, Hint },
        },
    } = layer;

    setComponent(UserOperation, zeroEntity, {
        dragging: false,
        draggingGid: 0,
        draggingFromBoard: false,
        selected: false,
        selectGid: 0,
        selectedTrait: "",
        skipAnimation: false,
        animationSpeed: 1,
    });

    setComponent<typeof Hint.schema>(Hint, zeroEntity, {
        showBoardFull: false,
        showBoardNotFull: false,
    });
};
