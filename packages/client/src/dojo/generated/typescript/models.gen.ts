// Generated by dojo-bindgen on Fri, 21 Jun 2024 16:42:13 +0000. Do not modify this file manually.
import { defineComponent, Type as RecsType, World } from "@dojoengine/recs";

export type ContractComponents = Awaited<
    ReturnType<typeof defineContractComponents>
>;

// Type definition for `autochessia::models::Altar` struct
export interface Altar {
    player: bigint;
    slot1: number;
    slot2: number;
    slot3: number;
    slot4: number;
    slot5: number;
}

export const AltarDefinition = {
    player: RecsType.BigInt,
    slot1: RecsType.Number,
    slot2: RecsType.Number,
    slot3: RecsType.Number,
    slot4: RecsType.Number,
    slot5: RecsType.Number,
};

// Type definition for `autochessia::models::ChoiceProfile` struct
export interface ChoiceProfile {
    t: CurseOptionType;
    idx: number;
    coinDec: number;
    coinInc: number;
    curseDec: number;
    curseInc: number;
    deterDec: number;
    deterInc: number;
    healthDec: number;
}

export const ChoiceProfileDefinition = {
    t: RecsType.Number,
    idx: RecsType.Number,
    coinDec: RecsType.Number,
    coinInc: RecsType.Number,
    curseDec: RecsType.Number,
    curseInc: RecsType.Number,
    deterDec: RecsType.Number,
    deterInc: RecsType.Number,
    healthDec: RecsType.Number,
};

// Type definition for `autochessia::models::MatchState` struct
export interface MatchState {
    index: number;
    round: number;
    player1: bigint;
    player2: bigint;
}

export const MatchStateDefinition = {
    index: RecsType.Number,
    round: RecsType.Number,
    player1: RecsType.BigInt,
    player2: RecsType.BigInt,
};

// Type definition for `autochessia::models::InningBattle` struct
export interface InningBattle {
    currentMatch: number;
    round: number;
    homePlayer: bigint;
    awayPlayer: bigint;
    end: boolean;
    winner: bigint;
    healthDecrease: number;
    dangerous: boolean;
}

export const InningBattleDefinition = {
    currentMatch: RecsType.Number,
    round: RecsType.Number,
    homePlayer: RecsType.BigInt,
    awayPlayer: RecsType.BigInt,
    end: RecsType.Boolean,
    winner: RecsType.BigInt,
    healthDecrease: RecsType.Number,
    dangerous: RecsType.Boolean,
};

// Type definition for `autochessia::models::LevelRarityProb` struct
export interface LevelRarityProb {
    level: number;
    r1: number;
    r2: number;
    r3: number;
}

export const LevelRarityProbDefinition = {
    level: RecsType.Number,
    r1: RecsType.Number,
    r2: RecsType.Number,
    r3: RecsType.Number,
};

// Type definition for `autochessia::models::CurseOption` struct
export interface CurseOption {
    playerAddr: bigint;
    t: CurseOptionType;
    order: number;
}

export const CurseOptionDefinition = {
    playerAddr: RecsType.BigInt,
    t: RecsType.Number,
    order: RecsType.Number,
};

// Type definition for `autochessia::customType::CurseOptionType` enum
export enum CurseOptionType {
    Invalid,
    Safe,
    Balanced,
    Challenge,
}

// Type definition for `autochessia::models::GlobalState` struct
export interface GlobalState {
    index: number;
    totalMatch: number;
    totalCreature: number;
    totalR1Creature: number;
    totalR2Creature: number;
    totalR3Creature: number;
}

export const GlobalStateDefinition = {
    index: RecsType.Number,
    totalMatch: RecsType.Number,
    totalCreature: RecsType.Number,
    totalR1Creature: RecsType.Number,
    totalR2Creature: RecsType.Number,
    totalR3Creature: RecsType.Number,
};

// Type definition for `autochessia::models::Vec2` struct
export interface Vec2 {
    x: number;
    y: number;
}

export const Vec2Definition = {
    x: RecsType.Number,
    y: RecsType.Number,
};

// Type definition for `autochessia::models::Position` struct
export interface Position {
    player: bigint;
    vec: Vec2;
}

export const PositionDefinition = {
    player: RecsType.BigInt,
    vec: Vec2Definition,
};

// Type definition for `autochessia::models::PlayerProfile` struct
export interface PlayerProfile {
    player: bigint;
    pieceCounter: number;
}

export const PlayerProfileDefinition = {
    player: RecsType.BigInt,
    pieceCounter: RecsType.Number,
};

// Type definition for `autochessia::models::PlayerPiece` struct
export interface PlayerPiece {
    owner: bigint;
    idx: number;
    gid: number;
}

export const PlayerPieceDefinition = {
    owner: RecsType.BigInt,
    idx: RecsType.Number,
    gid: RecsType.Number,
};

// Type definition for `autochessia::models::StageProfilePiece` struct
export interface StageProfilePiece {
    stage: number;
    index: number;
    x: number;
    y: number;
    creature_index: number;
    level: number;
}

export const StageProfilePieceDefinition = {
    stage: RecsType.Number,
    index: RecsType.Number,
    x: RecsType.Number,
    y: RecsType.Number,
    creature_index: RecsType.Number,
    level: RecsType.Number,
};

// Type definition for `autochessia::models::StageProfile` struct
export interface StageProfile {
    stage: number;
    pieceCount: number;
}

export const StageProfileDefinition = {
    stage: RecsType.Number,
    pieceCount: RecsType.Number,
};

// Type definition for `autochessia::models::SynergyProfile` struct
export interface SynergyProfile {
    trait_name: bigint;
    requiredPieces: number;
    metadata: bigint;
}

export const SynergyProfileDefinition = {
    trait_name: RecsType.BigInt,
    requiredPieces: RecsType.Number,
    metadata: RecsType.BigInt,
};

// Type definition for `autochessia::models::PlayerInvPiece` struct
export interface PlayerInvPiece {
    owner: bigint;
    slot: number;
    gid: number;
}

export const PlayerInvPieceDefinition = {
    owner: RecsType.BigInt,
    slot: RecsType.Number,
    gid: RecsType.Number,
};

// Type definition for `autochessia::models::LevelConfig` struct
export interface LevelConfig {
    current: number;
    expForNext: number;
}

export const LevelConfigDefinition = {
    current: RecsType.Number,
    expForNext: RecsType.Number,
};

// Type definition for `autochessia::models::Player` struct
export interface Player {
    player: bigint;
    inMatch: number;
    health: number;
    winStreak: number;
    loseStreak: number;
    coin: number;
    exp: number;
    level: number;
    locked: number;
    heroesCount: number;
    inventoryCount: number;
    refreshed: boolean;
    curse: number;
    danger: number;
}

export const PlayerDefinition = {
    player: RecsType.BigInt,
    inMatch: RecsType.Number,
    health: RecsType.Number,
    winStreak: RecsType.Number,
    loseStreak: RecsType.Number,
    coin: RecsType.Number,
    exp: RecsType.Number,
    level: RecsType.Number,
    locked: RecsType.Number,
    heroesCount: RecsType.Number,
    inventoryCount: RecsType.Number,
    refreshed: RecsType.Boolean,
    curse: RecsType.Number,
    danger: RecsType.Number,
};

// Type definition for `autochessia::models::CreatureProfile` struct
export interface CreatureProfile {
    creature_index: number;
    level: number;
    rarity: number;
    health: number;
    maxMana: number;
    attack: number;
    armor: number;
    range: number;
    speed: number;
    initiative: number;
    order: bigint;
    origins: bigint;
    ability: bigint;
}

export const CreatureProfileDefinition = {
    creature_index: RecsType.Number,
    level: RecsType.Number,
    rarity: RecsType.Number,
    health: RecsType.Number,
    maxMana: RecsType.Number,
    attack: RecsType.Number,
    armor: RecsType.Number,
    range: RecsType.Number,
    speed: RecsType.Number,
    initiative: RecsType.Number,
    order: RecsType.BigInt,
    origins: RecsType.BigInt,
    ability: RecsType.BigInt,
};

// Type definition for `autochessia::models::Piece` struct
export interface Piece {
    gid: number;
    owner: bigint;
    idx: number;
    slot: number;
    level: number;
    creature_index: number;
    x: number;
    y: number;
}

export const PieceDefinition = {
    gid: RecsType.Number,
    owner: RecsType.BigInt,
    idx: RecsType.Number,
    slot: RecsType.Number,
    level: RecsType.Number,
    creature_index: RecsType.Number,
    x: RecsType.Number,
    y: RecsType.Number,
};

export function defineContractComponents(world: World) {
    return {
        // Model definition for `autochessia::models::Altar` model
        Altar: (() => {
            return defineComponent(
                world,
                {
                    player: RecsType.BigInt,
                    slot1: RecsType.Number,
                    slot2: RecsType.Number,
                    slot3: RecsType.Number,
                    slot4: RecsType.Number,
                    slot5: RecsType.Number,
                },
                {
                    metadata: {
                        name: "Altar",
                        types: [
                            "ContractAddress",
                            "u16",
                            "u16",
                            "u16",
                            "u16",
                            "u16",
                        ],
                        customTypes: [],
                    },
                }
            );
        })(),

        // Model definition for `autochessia::models::ChoiceProfile` model
        ChoiceProfile: (() => {
            return defineComponent(
                world,
                {
                    t: RecsType.Number,
                    idx: RecsType.Number,
                    coinDec: RecsType.Number,
                    coinInc: RecsType.Number,
                    healthDec: RecsType.Number,
                    healthInc: RecsType.Number,
                    curseDec: RecsType.Number,
                    curseInc: RecsType.Number,
                    dangerDec: RecsType.Number,
                    dangerInc: RecsType.Number,
                },
                {
                    metadata: {
                        name: "ChoiceProfile",
                        types: [
                            "u8",
                            "u8",
                            "u8",
                            "u8",
                            "u8",
                            "u8",
                            "u8",
                            "u8",
                            "u8",
                        ],
                        customTypes: ["CurseOptionType"],
                    },
                }
            );
        })(),

        // Model definition for `autochessia::models::MatchState` model
        MatchState: (() => {
            return defineComponent(
                world,
                {
                    index: RecsType.Number,
                    round: RecsType.Number,
                    player1: RecsType.BigInt,
                    player2: RecsType.BigInt,
                    cheated: RecsType.Boolean,
                },
                {
                    metadata: {
                        name: "MatchState",
                        types: [
                            "u32",
                            "u8",
                            "ContractAddress",
                            "ContractAddress",
                            "bool",
                        ],
                        customTypes: [],
                    },
                }
            );
        })(),

        // Model definition for `autochessia::models::MatchResult` model
        MatchResult: (() => {
            return defineComponent(
                world,
                {
                    index: RecsType.Number,
                    time: RecsType.Number,
                    score: RecsType.Number,
                    player: RecsType.BigInt,
                    cheated: RecsType.Boolean,
                },
                {
                    metadata: {
                        name: "MatchResult",
                        types: ["u32", "u32", "u16", "ContractAddress", "bool"],
                        customTypes: [],
                    },
                }
            );
        })(),

        // Model definition for `autochessia::models::InningBattle` model
        InningBattle: (() => {
            return defineComponent(
                world,
                {
                    currentMatch: RecsType.Number,
                    round: RecsType.Number,
                    homePlayer: RecsType.BigInt,
                    awayPlayer: RecsType.BigInt,
                    end: RecsType.Boolean,
                    winner: RecsType.BigInt,
                    healthDecrease: RecsType.Number,
                    dangerous: RecsType.Boolean,
                    homePlayerCoinInc: RecsType.Number,
                    awayPlayerCoinInc: RecsType.Number,
                },
                {
                    metadata: {
                        name: "InningBattle",
                        types: [
                            "u32",
                            "u8",
                            "ContractAddress",
                            "ContractAddress",
                            "bool",
                            "ContractAddress",
                            "u8",
                            "bool",
                            "u8",
                            "u8",
                        ],
                        customTypes: [],
                    },
                }
            );
        })(),

        // Model definition for `autochessia::models::LevelRarityProb` model
        LevelRarityProb: (() => {
            return defineComponent(
                world,
                {
                    level: RecsType.Number,
                    r1: RecsType.Number,
                    r2: RecsType.Number,
                    r3: RecsType.Number,
                },
                {
                    metadata: {
                        name: "LevelRarityProb",
                        types: ["u8", "u8", "u8", "u8"],
                        customTypes: [],
                    },
                }
            );
        })(),

        // Model definition for `autochessia::models::CurseOption` model
        CurseOption: (() => {
            return defineComponent(
                world,
                {
                    playerAddr: RecsType.BigInt,
                    t: RecsType.Number,
                    order: RecsType.Number,
                },
                {
                    metadata: {
                        name: "CurseOption",
                        types: ["ContractAddress", "u8"],
                        customTypes: ["CurseOptionType"],
                    },
                }
            );
        })(),

        // Model definition for `autochessia::models::GlobalState` model
        GlobalState: (() => {
            return defineComponent(
                world,
                {
                    index: RecsType.Number,
                    totalMatch: RecsType.Number,
                    totalCreature: RecsType.Number,
                    totalR1Creature: RecsType.Number,
                    totalR2Creature: RecsType.Number,
                    totalR3Creature: RecsType.Number,
                },
                {
                    metadata: {
                        name: "GlobalState",
                        types: ["u32", "u32", "u8", "u8", "u8", "u8"],
                        customTypes: [],
                    },
                }
            );
        })(),

        // Model definition for `autochessia::models::Position` model
        Position: (() => {
            return defineComponent(
                world,
                {
                    player: RecsType.BigInt,
                    vec: Vec2Definition,
                },
                {
                    metadata: {
                        name: "Position",
                        types: ["ContractAddress"],
                        customTypes: ["Vec2"],
                    },
                }
            );
        })(),

        // Model definition for `autochessia::models::PlayerProfile` model
        PlayerProfile: (() => {
            return defineComponent(
                world,
                {
                    player: RecsType.BigInt,
                    pieceCounter: RecsType.Number,
                    name: RecsType.BigInt,
                },
                {
                    metadata: {
                        name: "PlayerProfile",
                        types: ["ContractAddress", "u32", "felt252"],
                        customTypes: [],
                    },
                }
            );
        })(),

        // Model definition for `autochessia::models::PlayerPiece` model
        PlayerPiece: (() => {
            return defineComponent(
                world,
                {
                    owner: RecsType.BigInt,
                    idx: RecsType.Number,
                    gid: RecsType.Number,
                },
                {
                    metadata: {
                        name: "PlayerPiece",
                        types: ["ContractAddress", "u8", "u32"],
                        customTypes: [],
                    },
                }
            );
        })(),

        // Model definition for `autochessia::models::StageProfilePiece` model
        StageProfilePiece: (() => {
            return defineComponent(
                world,
                {
                    stage: RecsType.Number,
                    index: RecsType.Number,
                    x: RecsType.Number,
                    y: RecsType.Number,
                    creature_index: RecsType.Number,
                    level: RecsType.Number,
                },
                {
                    metadata: {
                        name: "StageProfilePiece",
                        types: ["u8", "u8", "u8", "u8", "u16", "u8"],
                        customTypes: [],
                    },
                }
            );
        })(),

        // Model definition for `autochessia::models::StageProfile` model
        StageProfile: (() => {
            return defineComponent(
                world,
                {
                    stage: RecsType.Number,
                    pieceCount: RecsType.Number,
                },
                {
                    metadata: {
                        name: "StageProfile",
                        types: ["u8", "u8"],
                        customTypes: [],
                    },
                }
            );
        })(),

        // Model definition for `autochessia::models::SynergyProfile` model
        SynergyProfile: (() => {
            return defineComponent(
                world,
                {
                    trait_name: RecsType.BigInt,
                    requiredPieces: RecsType.Number,
                    metadata: RecsType.BigInt,
                },
                {
                    metadata: {
                        name: "SynergyProfile",
                        types: ["felt252", "u8", "felt252"],
                        customTypes: [],
                    },
                }
            );
        })(),

        // Model definition for `autochessia::models::PlayerInvPiece` model
        PlayerInvPiece: (() => {
            return defineComponent(
                world,
                {
                    owner: RecsType.BigInt,
                    slot: RecsType.Number,
                    gid: RecsType.Number,
                },
                {
                    metadata: {
                        name: "PlayerInvPiece",
                        types: ["ContractAddress", "u8", "u32"],
                        customTypes: [],
                    },
                }
            );
        })(),

        // Model definition for `autochessia::models::LevelConfig` model
        LevelConfig: (() => {
            return defineComponent(
                world,
                {
                    current: RecsType.Number,
                    expForNext: RecsType.Number,
                },
                {
                    metadata: {
                        name: "LevelConfig",
                        types: ["u8", "u8"],
                        customTypes: [],
                    },
                }
            );
        })(),

        // Model definition for `autochessia::models::Player` model
        Player: (() => {
            return defineComponent(
                world,
                {
                    player: RecsType.BigInt,
                    inMatch: RecsType.Number,
                    health: RecsType.Number,
                    winStreak: RecsType.Number,
                    loseStreak: RecsType.Number,
                    coin: RecsType.Number,
                    exp: RecsType.Number,
                    level: RecsType.Number,
                    locked: RecsType.Number,
                    heroesCount: RecsType.Number,
                    inventoryCount: RecsType.Number,
                    refreshed: RecsType.Boolean,
                    curse: RecsType.Number,
                    danger: RecsType.Number,
                },
                {
                    metadata: {
                        name: "Player",
                        types: [
                            "ContractAddress",
                            "u32",
                            "u8",
                            "u8",
                            "u8",
                            "u8",
                            "u8",
                            "u8",
                            "u8",
                            "u8",
                            "u8",
                            "bool",
                            "u8",
                            "u8",
                        ],
                        customTypes: [],
                    },
                }
            );
        })(),

        // Model definition for `autochessia::models::CreatureProfile` model
        CreatureProfile: (() => {
            return defineComponent(
                world,
                {
                    creature_index: RecsType.Number,
                    level: RecsType.Number,
                    rarity: RecsType.Number,
                    health: RecsType.Number,
                    maxMana: RecsType.Number,
                    attack: RecsType.Number,
                    armor: RecsType.Number,
                    range: RecsType.Number,
                    speed: RecsType.Number,
                    initiative: RecsType.Number,
                    order: RecsType.BigInt,
                    origins: RecsType.BigInt,
                    ability: RecsType.BigInt,
                },
                {
                    metadata: {
                        name: "CreatureProfile",
                        types: [
                            "u16",
                            "u8",
                            "u8",
                            "u16",
                            "u16",
                            "u16",
                            "u16",
                            "u8",
                            "u8",
                            "u8",
                            "felt252",
                            "felt252",
                            "felt252",
                        ],
                        customTypes: [],
                    },
                }
            );
        })(),

        // Model definition for `autochessia::models::Piece` model
        Piece: (() => {
            return defineComponent(
                world,
                {
                    gid: RecsType.Number,
                    owner: RecsType.BigInt,
                    idx: RecsType.Number,
                    slot: RecsType.Number,
                    level: RecsType.Number,
                    creature_index: RecsType.Number,
                    x: RecsType.Number,
                    y: RecsType.Number,
                },
                {
                    metadata: {
                        name: "Piece",
                        types: [
                            "u32",
                            "ContractAddress",
                            "u8",
                            "u8",
                            "u8",
                            "u16",
                            "u8",
                            "u8",
                        ],
                        customTypes: [],
                    },
                }
            );
        })(),
    };
}
