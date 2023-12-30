use core::option::OptionTrait;
use core::traits::Into;
use core::traits::TryInto;
use autochessia::models::{Position, Direction};
use starknet::{ContractAddress, contract_address_try_from_felt252};
use core::poseidon::{PoseidonTrait, poseidon_hash_span};
use core::hash::{HashStateTrait, HashStateExTrait};


fn next_position(mut position: Position, direction: Direction) -> Position {
    match direction {
        Direction::None => { return position; },
        Direction::Left => { position.vec.x -= 1; },
        Direction::Right => { position.vec.x += 1; },
        Direction::Up => { position.vec.y -= 1; },
        Direction::Down => { position.vec.y += 1; },
    };
    position
}


fn generate_pseudo_random_address(seed: felt252) -> ContractAddress {
    let hash = PoseidonTrait::new().update(seed).finalize();

    return hash.try_into().unwrap();
}

