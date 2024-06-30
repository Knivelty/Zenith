import { Animation, Assets } from "@latticexyz/phaserx/src/types";
import {
    INVALID_ANIMATION_KEY_ERROR,
    INVALID_LIMITED_ANIMATION,
} from "../../../error";
import { getAnimations } from "../../config/animationConfig";
import {
    AbilityAnimations,
    GroundAnimations,
    SynergyAnimations,
    TILE_HEIGHT,
} from "../../config/constants";
import { deferred } from "@latticexyz/utils";
import { logDebug } from "../../../ui/lib/utils";

export function getAnimationIndex(
    animationKey: AbilityAnimations | GroundAnimations | SynergyAnimations
) {
    const allAnimation = getAnimations();

    const index = allAnimation.findIndex((v) => v.key === animationKey);

    if (index === -1) {
        throw INVALID_ANIMATION_KEY_ERROR;
    }

    return index;
}

export function getAnimation(
    animationKey: AbilityAnimations | GroundAnimations | SynergyAnimations
) {
    const allAnimation = getAnimations();

    const ani = allAnimation.find((v) => v.key === animationKey);

    if (ani === undefined) {
        throw INVALID_ANIMATION_KEY_ERROR;
    }

    return ani;
}

/**
 * @note the defined animation repeat cannot be -1
 */
export async function playAnimationForOnce({
    sprite,
    animation,
}: {
    sprite: Phaser.GameObjects.Sprite;
    animation: Animation<Assets>;
}) {
    // ignore invalid sprite
    if (typeof sprite.x !== "number" || typeof sprite.y !== "number") {
        return;
    }

    if (animation.repeat === -1) {
        throw INVALID_LIMITED_ANIMATION;
    }

    const [resolve, , promise] = deferred<void>();

    const onAnimationComplete = () => {
        resolve();
        logDebug(
            `sprite at ${sprite.x}, ${sprite.y} finish play animation ${JSON.stringify(animation)}`
        );
    };

    sprite.play(animation);
    const scale = TILE_HEIGHT / sprite.height;
    sprite.setScale(scale);
    sprite.once("animationcomplete", onAnimationComplete);

    logDebug(`sprite at ${sprite.x}, ${sprite.y} play animation ${animation}`);

    return promise;
}
