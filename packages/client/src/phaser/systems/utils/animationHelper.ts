import { INVALID_ANIMATION_KEY_ERROR } from "../../../error";
import { getAnimations } from "../../config/animationConfig";
import { AbilityAnimations } from "../../config/constants";

export function getCastAnimationIndex(animationKey: AbilityAnimations) {
    const allAnimation = getAnimations();

    const index = allAnimation.findIndex((v) => v.key === animationKey);

    if (index === -1) {
        throw INVALID_ANIMATION_KEY_ERROR;
    }

    return index;
}
