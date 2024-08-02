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

fn generate_pseudo_random(seed: u128) -> u128 {
    let hash = PoseidonTrait::new().update(seed.into()).finalize();

    let MASK_128: u256 = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;

    return (hash.into() & MASK_128).try_into().unwrap();
}

fn generate_pseudo_random_u8(seed: felt252, seed2: felt252) -> u8 {
    let hash = PoseidonTrait::new().update(seed).update(seed2).finalize();

    let MASK_8: u256 = 0xff;

    return (hash.into() & MASK_8).try_into().unwrap();
}

fn get_felt_mod(divided: felt252, divid: u8) -> u8 {
    let y: u256 = divided.into();
    let x: u256 = divid.into();

    return (y % x).try_into().unwrap();
}

fn roll_rarity(r: felt252, r1: u8, r2: u8, r3: u8) -> u8 {
    let m = get_felt_mod(r, 100);

    if (m < r1) {
        return 1;
    } else if (m < r1 + r2) {
        return 2;
    } else {
        return 3;
    }
}

fn roll_creature(r: felt252, rarity: u8, count: u8) -> u16 {
    return rarity.into() * 1000 + get_felt_mod(r, count).into() + 1;
}


fn gen_piece_gid(player: ContractAddress, counter: u32) -> u32 {
    let hash = PoseidonTrait::new().update(player.into()).update(counter.into()).finalize();

    let MASK_32: u256 = 0xffffffff;

    return (hash.into() & MASK_32).try_into().unwrap();
}

fn get_min_between_three(num1: u8, num2: u8, num3: u8) -> u8 {
    let mut min = num1;
    if (num2 < min) {
        min = num2;
    }
    if (num3 < min) {
        min = num3;
    }
    return min;
}

fn get_min_num(nums: @Array<u8>) -> u8 {
    let length = nums.len();
    if (length == 0) {
        panic!("empty array")
    }
    let mut idx = 1;
    let mut min = *nums.at(0);
    loop {
        if (idx >= length) {
            break;
        }

        let value = *nums.at(idx);
        if (value < min) {
            min = value;
        }

        idx += 1;
    };
    return min;
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

