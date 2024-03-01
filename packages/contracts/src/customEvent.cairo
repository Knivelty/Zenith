use alexandria_data_structures::array_ext::ArrayTraitExt;
use core::clone::Clone;
use core::traits::IndexView;
use core::traits::TryInto;
use core::option::OptionTrait;
use core::traits::Into;
use core::array::ArrayTrait;
use core::array::SpanTrait;
use starknet::ContractAddress;


#[derive(Clone, Drop, Serde)]
struct PieceAction {
    // action order of this battle
    player: ContractAddress,
    order: u8,
    pieceId: u8,
    to_x: u8,
    to_y: u8,
    attackPieceId: u8,
}

// declaring custom event struct
#[derive(Clone, Drop, starknet::Event)]
struct PieceActions {
    // key: match
    matchId: u32,
    // key: round
    roundId: u8,
    logs: Array<PieceAction>,
}
// Deprecated below
// // TODO: finish serialize and deserialize
// impl pieceActionSerde of Serde<PieceActions> {
//     fn serialize(self: @PieceActions, ref output: Array<felt252>) {
//         let mut value = self.clone();
//         output.append(value.battleId.into());

//         loop {
//             match value.logs.pop_front() {
//                 Option::Some(v) => {
//                     let mut newArr = ArrayTrait::<felt252>::new();
//                     v.serialize(ref newArr);
//                     output.append_all(ref newArr);
//                 },
//                 Option::None => { break; }
//             }
//         }
//     }

//     fn deserialize(ref serialized: Span<felt252>) -> Option<PieceActions> {
//         let battleId = serialized.index(0);
//         return Option::None;
//     }
// }


