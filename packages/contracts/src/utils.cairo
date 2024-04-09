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


fn generate_pseudo_random_address(seed: felt252, seed2: felt252) -> ContractAddress {
    let hash = PoseidonTrait::new().update(seed).update(seed2).finalize();

    return hash.try_into().unwrap();
}

fn get_felt_mod(divided: felt252, divid: felt252) -> u8 {
    // println!("value: {}  {}", divided, divid);

    let MASK_32: u256 = 0xffffffff;
    let y: u32 = (divided.into() & MASK_32).try_into().unwrap();
    let x: u32 = divid.try_into().unwrap();

    // println!("value: {} {} {}", x, y, y % x);

    return (y % x).try_into().unwrap();
}


fn gen_piece_gid(player: ContractAddress, counter: u32) -> u32 {
    let hash = PoseidonTrait::new().update(player.into()).update(counter.into()).finalize();

    let MASK_32: u256 = 0xffffffff;

    return (hash.into() & MASK_32).try_into().unwrap();
}

fn two_to(mut power: usize) -> felt252 {
    assert(power < 252, 'Power too large');
    let mut result = 1;
    loop {
        if power == 0 {
            break;
        }
        result *= 2;
        power = integer::u32_wrapping_sub(power, 1);
    };
    result
}

fn exp_256(mut power: usize) -> u128 {
    assert(power < 16, 'Power too large');
    let mut result = 1_u128;
    loop {
        if power == 0 {
            break;
        }
        result *= 256;
        power = integer::u32_wrapping_sub(power, 1);
    };
    result
}

