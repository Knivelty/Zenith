import { getComponentValue, setComponent } from "@dojoengine/recs";
import { PhaserLayer } from "..";
import { zeroEntity } from "../../utils";
import { logDebug } from "../../ui/lib/utils";
import { GameStatusEnum } from "../../dojo/types";

// initialize some obj
export const initialize = (layer: PhaserLayer) => {
    const {
        networkLayer: {
            clientComponents: { UserOperation, Hint, Player, GameStatus },
            playerEntity,
            account: { address },
        },
    } = layer;

    const playerV = getComponentValue(Player, playerEntity);

    logDebug("init player value:", playerV);

    setComponent(GameStatus, zeroEntity, {
        played: false,
        shouldPlay: false,
        status: GameStatusEnum.Prepare,
        currentRound: 1,
        currentMatch: playerV?.inMatch || 0,
        dangerous: false,
        homePlayer: BigInt(address),
        awayPlayer: 1n,
        ended: false,
    });

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
