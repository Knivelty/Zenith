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
    OrcIdle = "OrcIdle",
    BasiliskIdle = "BasiliskIdle",
}

// image addresses

export enum Sprites {
    Invalid,
    PlayerHealthBar,
    EnemyHealthBar,
}

export const AnimationIndex: Record<number, number> = {
    1: 27,
    2: 28,
    1002: 6,
    1001: 5,
    1003: 7,
    1004: 11,
    1005: 12,
    1006: 13,
    1007: 18,
    1008: 19,
    1009: 25,
    1010: 26,
    2001: 3,
    2002: 4,
    2003: 8,
    2004: 9,
    2005: 10,
    2006: 15,
    2007: 16,
    2008: 17,
    2009: 23,
    2010: 24,
    3001: 1,
    3002: 2,
    3003: 14,
    3004: 20,
    3005: 21,
    3006: 22,
};

export const Monster: Record<number, string> = {
    1: "Orc",
    2: "Basilisk",
    1002: "Golem",
    1001: "Berserker",
    1003: "Bear",
    1004: "Wraith",
    1005: "Fairy",
    1006: "Leprechaun",
    1007: "Fenrir",
    1008: "Ogre",
    1009: "Satori",
    1010: "Mantis",
    2001: "Behemoth",
    2002: "Wyvern",
    2003: "Kitsune",
    2004: "Nue",
    2005: "Cyclops",
    2006: "Wendigo",
    2007: "Rakshasa",
    2008: "Vampire",
    2009: "Chupacabra",
    2010: "Ettin",
    3001: "Minotaur",
    3002: "Colossus",
    3003: "Dragon",
    3004: "Warlock",
    3005: "Jiangshi",
    3006: "Tarrasque",
};

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

export const Health_CHANGE_OFFSET_X = 256;
export const Health_CHANGE_OFFSET_Y = -15;

export const MOVE_TIME_PER_LENGTH = 300;

export const HEALTH_PER_SEGMENT = 100;

export const HEALTH_BAR_WIDTH = 240;
export const HEALTH_BAR_HEIGHT = 40;
export const HEALTH_BAR_BORDER_WIDTH = 8;

export const HEALTH_BAR_PLAYER_COLOR = 0x06ff00;
export const HEALTH_BAR_ENEMY_COLOR = 0xff3d00;

export const HEALTH_BAR_BORDER_COLOR = 0x000000;
export const HEALTH_BAR_EMPTY_COLOR = 0x2b432b;
