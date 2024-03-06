export enum Scenes {
    Main = "Main",
}

export enum Maps {
    Main = "Main",
}

export enum Animations {
    Invalid = "Invalid",
    MinotaurIdle = "MinotaurIdle",
    ColossusIdle = "ColossusIdle",
    BehemothIdle = "BehemothIdle",
    WyvernIdle = "WyvernIdle",
    BerserkerIdle = "BerserkerIdle",
    GolemIdle = "GolemIdle",
    BearIdle = "BearIdle",
    KitsuneIdle = "KitsuneIdle",
    NueIdle = "NueIdle",
    CyclopsIdle = "CyclopsIdle",
    WraithIdle = "WraithIdle",
    FairyIdle = "FairyIdle",
    LeprechaunIdle = "LeprechaunIdle",
    DragonIdle = "DragonIdle",
    WendigoIdle = "WendigoIdle",
    RakshasaIdle = "RakshasaIdle",
    VampireIdle = "VampireIdle",
    FenrirIdle = "FenrirIdle",
    OgreIdle = "OgreIdle",
    WarlockIdle = "WarlockIdle",
    JiangshiIdle = "JiangshiIdle",
    TarrasqueIdle = "TarrasqueIdle",
    ChupacabraIdle = "ChupacabraIdle",
    EttinIdle = "EttinIdle",
    SatoriIdle = "SatoriIdle",
    MantisIdle = "MantisIdle",
}

// image addresses

export enum Sprites {
    Invalid,
    HealthBar,
    // Minotaur,
    // Colossus,
    // Behemoth,
    // Wyvern,
    // Berserker,
    // Golem,
    // Bear,
    // Kitsune,
    // Nue,
    // Cyclops,
    // Wraith,
    // Fairy,
    // Leprechaun,
    // Dragon,
    // Wendigo,
    // Rakshasa,
    // Vampire,
    // Fenrir,
    // Ogre,
    // Warlock,
    // Jiangshi,
    // Tarrasque,
    // Chupacabra,
    // Ettin,
    // Satori,
    // Mantis,
}

export enum Assets {
    MainAtlas = "MainAtlas",
    Tileset = "Tileset",
}

export const TILE_HEIGHT = 256;
export const TILE_WIDTH = 256;

export const TILE_IMAGE_HEIGHT = 32;
export const TILE_IMAGE_WEIGHT = 32;

// contract offset so we don't overflow
export const ORIGIN_OFFSET = 100;

export const MAP_AMPLITUDE = 16;

export const HealthBarOffSetX = 0;
export const HealthBarOffSetY = 15;

export const MOVE_SPEED = 200;
