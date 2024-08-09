import { getComponentValueStrict } from "@dojoengine/recs";
import { PhaserLayer } from "../..";
import { AnimationTime } from "../../config/constants/animationTime";
import { zeroEntity } from "../../../utils";

export const animationTime = (layer: PhaserLayer) => {
    const {
        networkLayer: {
            clientComponents: { UserOperation },
        },
    } = layer;

    function getAnimationTime(animation: keyof typeof AnimationTime) {
        const userO = getComponentValueStrict(UserOperation, zeroEntity);
        if (userO.animationSpeed === 0) {
            return 0;
        }
        return AnimationTime[animation] / userO.animationSpeed;
    }

    function getAnimationSpeed() {
        const userO = getComponentValueStrict(UserOperation, zeroEntity);
        return userO.animationSpeed;
    }

    return { getAnimationTime, getAnimationSpeed };
};
