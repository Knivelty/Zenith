import { Assets, Sprites } from "./constants";

const baseSprites = {
    [Sprites.Invalid]: {
        assetKey: Assets.MainAtlas,
        frame: "/",
    },
    [Sprites.LevelOneGreen]: {
        assetKey: Assets.MainAtlas,
        frame: "statusBar/levelOneGreen.png",
    },
    [Sprites.LevelTwoGreen]: {
        assetKey: Assets.MainAtlas,
        frame: "statusBar/levelTwoGreen.png",
    },
    [Sprites.LevelThreeGreen]: {
        assetKey: Assets.MainAtlas,
        frame: "statusBar/levelThreeGreen.png",
    },
    [Sprites.LevelOneRed]: {
        assetKey: Assets.MainAtlas,
        frame: "statusBar/levelOneRed.png",
    },
    [Sprites.LevelTwoRed]: {
        assetKey: Assets.MainAtlas,
        frame: "statusBar/levelTwoRed.png",
    },
    [Sprites.LevelThreeRed]: {
        assetKey: Assets.MainAtlas,
        frame: "statusBar/levelThreeRed.png",
    },
    [Sprites.LevelStar]: {
        assetKey: Assets.MainAtlas,
        frame: "statusBar/star.png",
    },
    [Sprites.BoardFull]: {
        assetKey: Assets.MainAtlas,
        frame: "boardHint/boardFull.png",
    },
    [Sprites.BoardNotFull]: {
        assetKey: Assets.MainAtlas,
        frame: "boardHint/boardNotFull.png",
    },
} as Record<number | string, { assetKey: Assets; frame: string }>;

export function getSprites() {
    return baseSprites;
}
