import { Assets, Sprites } from "./constants";

const baseSprites = {
    [Sprites.Pegasus]: {
        assetKey: Assets.MainAtlas,
        frame: "pegasus/0.png",
    },
    [Sprites.Sprite]: {
        assetKey: Assets.MainAtlas,
        frame: "sprite/0.png",
    },
} as Record<number | string, { assetKey: Assets; frame: string }>;

export function getSprites() {
    return baseSprites;
}
