import { INVALID_ANIMATION_KEY_ERROR } from "../../../error";
import { getAnimations } from "../../config/animationConfig";
import { AbilityAnimations, GroundAnimations } from "../../config/constants";

export function getAnimationIndex(
    animationKey: AbilityAnimations | GroundAnimations
) {
    const allAnimation = getAnimations();

    const index = allAnimation.findIndex((v) => v.key === animationKey);

    if (index === -1) {
        throw INVALID_ANIMATION_KEY_ERROR;
    }

    return index;
}
