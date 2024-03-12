#[derive(Clone, Drop, Serde)]
struct MoveChange {
    pieceId: u8,
    fromX: u8,
    fromY: u8,
    toX: u8,
    toY: u8
}

#[derive(Clone, Drop, Serde)]
struct PlaceChange {
    direction: bool,
    slot: u8,
    toX: u8,
    toY: u8
}

#[derive(Clone, Drop, Serde)]
enum PrepareChanges<M, P> {
    MoveChange: M,
    PlaceChange: P
}
