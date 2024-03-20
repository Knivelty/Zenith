use starknet::ContractAddress;

#[derive(Model, Copy, Drop, Serde)]
struct Player {
    #[key]
    player: ContractAddress,
    inMatch: u32,
    health: u8,
    streakCount: u8,
    coin: u8,
    level: u8,
    locked: u8,
    // dojo does not support array for now, so it's used to traversal all pieces belong to player
    heroesCount: u8,
    // hero count in inventory 
    inventoryCount: u8,
}

// hero altar of a player
#[derive(Model, Copy, Drop, Serde)]
struct Altar {
    #[key]
    player: ContractAddress,
    slot1: u8,
    slot2: u8,
    slot3: u8,
    slot4: u8,
    slot5: u8,
}

#[derive(Model, Copy, Drop, Serde)]
struct PlayerPiece {
    #[key]
    owner: ContractAddress,
    #[key]
    idx: u8,
    gid: u32,
}

#[derive(Model, Copy, Drop, Serde)]
struct PlayerInvPiece {
    #[key]
    owner: ContractAddress,
    #[key]
    slot: u8,
    gid: u32,
}

#[derive(Model, Copy, Drop, Serde)]
struct Piece {
    // global id of this piece
    #[key]
    gid: u32,
    owner: ContractAddress,
    idx: u8,
    slot: u8,
    level: u8,
    rarity: u8,
    creature_index: u8,
    x: u8,
    y: u8
}


#[derive(Model, Copy, Drop, Serde)]
struct InningBattle {
    #[key]
    currentMatch: u32,
    #[key]
    round: u8,
    homePlayer: ContractAddress,
    awayPlayer: ContractAddress,
    end: bool
}

#[derive(Model, Copy, Drop, Serde)]
struct GlobalState {
    #[key]
    index: u32,
    totalMatch: u32,
    totalCreature: u8,
    totalPieceCounter: u32,
}

#[derive(Model, Copy, Drop, Serde)]
struct MatchState {
    #[key]
    index: u32,
    round: u8,
}

#[derive(Model, Copy, Drop, Serde)]
struct CreatureProfile {
    #[key]
    creature_index: u8,
    #[key]
    level: u8,
    rarity: u8,
    health: u16,
    attack: u8,
    armor: u8,
    range: u8,
    speed: u8,
    initiative: u8,
}


#[derive(Serde, Copy, Drop, Introspect)]
enum Direction {
    None,
    Left,
    Right,
    Up,
    Down,
}

impl DirectionIntoFelt252 of Into<Direction, felt252> {
    fn into(self: Direction) -> felt252 {
        match self {
            Direction::None => 0,
            Direction::Left => 1,
            Direction::Right => 2,
            Direction::Up => 3,
            Direction::Down => 4,
        }
    }
}


#[derive(Clone, Copy, Drop, PartialEq, Serde, Introspect)]
struct Vec2 {
    x: u32,
    y: u32
}

impl Vec2Felt252DictValueImpl of Felt252DictValue<Vec2> {
    #[inline(always)]
    fn zero_default() -> Vec2 nopanic {
        Vec2 { x: 0, y: 0 }
    }
}

impl Vec2Default of Default<Vec2> {
    #[inline(always)]
    fn default() -> Vec2 nopanic {
        Vec2 { x: 0, y: 0 }
    }
}

impl Vec2IntoPos of Into<Vec2, Pos> {
    #[inline(always)]
    fn into(self: Vec2) -> Pos {
        self.x.into() * 0x100000000_u64 + self.y.into()
    }
}

type Pos = u64;

impl PosIntoVec2 of Into<Pos, Vec2> {
    #[inline(always)]
    fn into(self: Pos) -> Vec2 {
        Vec2 {
            x: (self / 0x100000000_u64).try_into().unwrap(),
            y: (self % 0x100000000_u64).try_into().unwrap(),
        }
    }
}

#[derive(Model, Copy, Drop, Serde)]
struct Position {
    #[key]
    player: ContractAddress,
    vec: Vec2,
}

trait Vec2Trait {
    fn is_zero(self: Vec2) -> bool;
    fn is_equal(self: Vec2, b: Vec2) -> bool;
}

impl Vec2Impl of Vec2Trait {
    fn is_zero(self: Vec2) -> bool {
        if self.x - self.y == 0 {
            return true;
        }
        false
    }

    fn is_equal(self: Vec2, b: Vec2) -> bool {
        self.x == b.x && self.y == b.y
    }
}

#[cfg(test)]
mod tests {
    use super::{Position, Vec2, Vec2Trait};

    #[test]
    #[available_gas(100000)]
    fn test_vec_is_zero() {
        assert(Vec2Trait::is_zero(Vec2 { x: 0, y: 0 }), 'not zero');
    }

    #[test]
    #[available_gas(100000)]
    fn test_vec_is_equal() {
        let position = Vec2 { x: 420, y: 0 };
        assert(position.is_equal(Vec2 { x: 420, y: 0 }), 'not equal');
    }
}
