// #[derive(Clone, Drop, Serde)]
// struct MoveChange {
//     pieceId: u8,
//     fromX: u8,
//     fromY: u8,
//     toX: u8,
//     toY: u8
// }

// #[derive(Clone, Drop, Serde)]
// struct PlaceChange {
//     direction: bool,
//     slot: u8,
//     toX: u8,
//     toY: u8
// }

// #[derive(Clone, Drop, Serde)]
// enum PrepareChanges<M, P> {
//     MoveChange: M,
//     PlaceChange: P
// }

#[derive(Copy, Clone, Drop, Serde)]
struct PieceChange {
    gid: u32,
    idx: u8,
    slot: u8,
    x: u8,
    y: u8
}

#[derive(Copy, Clone, Drop, Serde)]
struct RoundResult {
    win: bool,
    healthDecrease: u8
}


#[derive(Copy, Drop, Serde, Introspect)]
enum CurseOptionType {
    Invalid,
    Safe,
    Balanced,
    Challenge
}
