export enum Scenes {
    Main = "Main",
}

export enum Maps {
    Main = "Main",
}

export enum Animations {
    PegasusIdle = "PegasusIdle",
    SpriteIdle = "SpriteIdle",
}

// image addresses

export enum Sprites {
    Pegasus,
    Sprite,
}

export enum RPSSprites {
    Rock = "r",
    Paper = "p",
    Scissors = "s",
}

export const ImagePaths: { [key in RPSSprites]: string } = {
    [RPSSprites.Rock]: "rock.png",
    [RPSSprites.Paper]: "paper.png",
    [RPSSprites.Scissors]: "scissors.png",
};

export enum Assets {
    MainAtlas = "MainAtlas",
    Tileset = "Tileset",
}

export enum Direction {
    Unknown,
    Up,
    Down,
    Left,
    Right,
}

export const TILE_HEIGHT = 32;
export const TILE_WIDTH = 32;

// contract offset so we don't overflow
export const ORIGIN_OFFSET = 100;

export const MAP_AMPLITUDE = 16;
