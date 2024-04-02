import { Assets, Sprites } from "./constants";

const baseSprites = {
    [Sprites.Invalid]: {
        assetKey: Assets.MainAtlas,
        frame: "/",
    },
    [Sprites.PlayerHealthBar]: {
        assetKey: Assets.MainAtlas,
        frame: "healthbar/green.png",
    },
    [Sprites.EnemyHealthBar]: {
        assetKey: Assets.MainAtlas,
        frame: "healthbar/red.png",
    },
} as Record<number | string, { assetKey: Assets; frame: string }>;

export function getSprites() {
    return baseSprites;
}
