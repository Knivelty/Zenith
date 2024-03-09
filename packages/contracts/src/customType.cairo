struct moveChange {
    pieceId: u8,
    fromX: u8,
    fromY: u8,
    toX: u8,
    toY: u8
}

struct placeChange {
    direction: bool,
    slot: u8,
    toX: u8,
    toY: u8
}


struct PrepareChanges {}
