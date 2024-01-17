import { Animations, Assets } from "./constants";

type AnimationsConfig = {
    key: string;
    assetKey: Assets.MainAtlas;
    startFrame: number;
    endFrame: number;
    frameRate: number;
    repeat: number;
    prefix: string;
    suffix: string;
}[];

const baseAnimations: AnimationsConfig = [
    {
        key: Animations.PegasusIdle,
        assetKey: Assets.MainAtlas,
        startFrame: 0,
        endFrame: 1,
        frameRate: 1,
        repeat: -1,
        prefix: "pegasus/",
        suffix: ".png",
    },
    {
        key: Animations.SpriteIdle,
        assetKey: Assets.MainAtlas,
        startFrame: 0,
        endFrame: 1,
        frameRate: 1,
        repeat: -1,
        prefix: "sprite/",
        suffix: ".png",
    },
];

export function getAnimations() {
    // const animationConfigs: AnimationsConfig = [];
    return baseAnimations;
}
