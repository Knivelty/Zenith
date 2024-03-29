import { Assets, Sprites } from "./constants";

const baseSprites = {
    [Sprites.Invalid]: {
        assetKey: Assets.MainAtlas,
        frame: "/",
    },
    [Sprites.HealthBar]: {
        assetKey: Assets.MainAtlas,
        frame: "bar/health.png",
    },
} as Record<number | string, { assetKey: Assets; frame: string }>;

export function getSprites() {
    return baseSprites;
}
