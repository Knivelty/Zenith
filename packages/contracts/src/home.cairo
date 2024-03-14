use autochessia::models::{CreatureProfile, Piece, Player};
use autochessia::customType::{MoveChange, PlaceChange, PrepareChanges};


// define the interface
#[starknet::interface]
trait IHome<TContractState> {
    fn initialize(self: @TContractState);


    fn spawn(self: @TContractState);
    fn refreshAltar(self: @TContractState);
    fn buyHero(self: @TContractState, slot: u8);
    fn sellHero(self: @TContractState, gid: u16);
    fn commitPreparation(
        self: @TContractState, changes: Array<PrepareChanges<MoveChange, PlaceChange>>
    );
    fn nextRound(self: @TContractState);


    fn startBattle(self: @TContractState);
}

use starknet::{
    ContractAddress, contract_address_try_from_felt252, get_caller_address, get_block_info
};


#[dojo::contract]
mod home {
    use starknet::{
        ContractAddress, get_caller_address, get_block_hash_syscall, get_block_info, get_tx_info
    };
    use autochessia::models::{
        CreatureProfile, Position, Piece, Player, InningBattle, GlobalState, MatchState, Altar
    };
    use autochessia::utils::{next_position, generate_pseudo_random_address, get_felt_mod};
    use autochessia::customType::{MoveChange, PlaceChange, PrepareChanges};

    use autochessia::customEvent::{PieceActions, PieceAction};
    use dojo::base;
    use core::poseidon::{PoseidonTrait, poseidon_hash_span};
    use core::hash::{HashStateTrait, HashStateExTrait};
    use super::IHome;


    // declaring custom event struct
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        PieceActions: PieceActions,
    }

    fn _refreshAltar(self: @ContractState, playerAddr: ContractAddress) {
        let world = self.world_dispatcher.read();

        let player = get!(world, playerAddr, Player);

        // generate pseudo random number on block hash
        // let mut hash = get_block_hash_syscall(get_block_info().unbox().block_number - 10);
        // TODO: change it later
        let hash = get_tx_info().unbox().nonce;

        let mut r: felt252 = hash;

        // match hash {
        //     Result::Ok(value) => { r = value.into() },
        //     Result::Err(err) => { panic!("gr error") },
        // }

        // filter the altar
        let creatureCount: felt252 = get!(world, 1, GlobalState).totalCreature.into();

        let slot1 = get_felt_mod(r, creatureCount) + 1;
        r = PoseidonTrait::new().update(r.into()).finalize().into();

        let slot2 = get_felt_mod(r, creatureCount) + 1;
        r = PoseidonTrait::new().update(r.into()).finalize().into();

        let slot3 = get_felt_mod(r, creatureCount) + 1;
        r = PoseidonTrait::new().update(r.into()).finalize().into();

        let slot4 = get_felt_mod(r, creatureCount) + 1;
        r = PoseidonTrait::new().update(r.into()).finalize().into();

        let slot5 = get_felt_mod(r, creatureCount) + 1;

        // set altar
        set!(world, Altar { player: playerAddr, slot1, slot2, slot3, slot4, slot5 });
    }

    fn _validateMoveChange(moveChange: @MoveChange) {}

    fn _validatePlaceChange(placeChange: @PlaceChange) {}


    // impl: implement functions specified in trait
    #[abi(embed_v0)]
    impl HomeImpl of IHome<ContractState> {
        // intialize all args
        fn initialize(self: @ContractState) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // initialize creature
            set!(
                world,
                CreatureProfile {
                    level: 1,
                    rarity: 1,
                    creature_index: 1,
                    health: 600,
                    attack: 48,
                    armor: 40,
                    range: 2,
                    speed: 2,
                    initiative: 90
                }
            );

            set!(world, GlobalState { index: 1, totalMatch: 0, totalCreature: 1, })
        }

        // ContractState is defined by system decorator expansion
        fn spawn(self: @ContractState) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // Get the address of the current caller, possibly the player's address.
            let playerAddr = get_caller_address();

            // create match
            let globalState = get!(world, 1, GlobalState);
            let currentMatch = globalState.totalMatch + 1;
            set!(
                world,
                (
                    MatchState { index: currentMatch, round: 1 },
                    GlobalState {
                        index: 1, totalMatch: currentMatch, totalCreature: globalState.totalCreature
                    }
                )
            );

            // spawn player
            set!(
                world,
                Player {
                    player: playerAddr,
                    health: 100,
                    heroesCount: 0,
                    inventoryCount: 0,
                    level: 1,
                    coin: 1,
                    streakCount: 0,
                    locked: 0,
                    inMatch: currentMatch
                }
            );

            // refresh hero altar
            _refreshAltar(self, playerAddr);

            // get player's enemy address
            let enemy = generate_pseudo_random_address(playerAddr.into());

            // spawn player's enemy and first round enemy
            set!(
                world,
                (
                    Player {
                        player: enemy,
                        health: 10,
                        heroesCount: 1,
                        inventoryCount: 0,
                        level: 1,
                        coin: 0,
                        streakCount: 0,
                        locked: 0,
                        inMatch: currentMatch
                    },
                    Piece {
                        gid: 1,
                        owner: enemy,
                        idx: 1,
                        slot: 0,
                        level: 1,
                        rarity: 1,
                        creature_index: 1,
                        x: 1,
                        y: 1,
                    }
                )
            );
            // create battle
            set!(
                world,
                (InningBattle {
                    currentMatch: currentMatch,
                    round: 1,
                    homePlayer: playerAddr,
                    awayPlayer: enemy,
                    end: false
                }),
            );
        }


        // commit preparation in one function
        // include: refresh, move
        // the contract side need to valid the validity
        fn commitPreparation(
            self: @ContractState, changes: Array<PrepareChanges<MoveChange, PlaceChange>>
        ) {
            let mut idx = 0;
            let length = changes.len();

            loop {
                let change = changes.at(idx);
                match change {
                    PrepareChanges::MoveChange(val) => { _validateMoveChange(val) },
                    PrepareChanges::PlaceChange(val) => { _validatePlaceChange(val) },
                }

                idx = idx + 1;
                if (idx >= length) {
                    break;
                }
            }
        }

        fn refreshAltar(self: @ContractState) {}
        fn buyHero(self: @ContractState, slot: u8) {}
        fn sellHero(self: @ContractState, gid: u16) {}

        fn nextRound(self: @ContractState) {
            let world = self.world_dispatcher.read();
            let playerAddr = get_caller_address();
            let player = get!(world, playerAddr, Player);
            let currentMatchState = get!(world, player.inMatch, MatchState);

            let lastInningBattle = get!(
                world, (player.inMatch, currentMatchState.round), InningBattle
            );

            let newRound = currentMatchState.round + 1;

            set!(world, MatchState { index: currentMatchState.index, round: newRound });

            // create battle
            set!(
                world,
                (InningBattle {
                    currentMatch: currentMatchState.index,
                    round: newRound,
                    homePlayer: playerAddr,
                    awayPlayer: lastInningBattle.awayPlayer,
                    end: false
                }),
            );
        }


        fn startBattle(self: @ContractState) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // Get the address of the current caller, possibly the player's address.
            let playerAddr = get_caller_address();

            let player = get!(world, playerAddr, Player);

            let currentMatchState = get!(world, player.inMatch, MatchState);

            // get inning inning battle
            let inningBattle = get!(
                world, (currentMatchState.index, currentMatchState.round), InningBattle
            );

            let enemy = inningBattle.awayPlayer;

            let mut logs = ArrayTrait::<PieceAction>::new();

            // move period
            logs
                .append(
                    PieceAction {
                        order: 1,
                        player: playerAddr,
                        pieceId: 1,
                        to_x: 1,
                        to_y: 1,
                        attackPieceId: 0,
                    },
                );

            logs
                .append(
                    PieceAction {
                        order: 2, player: enemy, pieceId: 1, to_x: 7, to_y: 7, attackPieceId: 0,
                    },
                );

            logs
                .append(
                    PieceAction {
                        order: 3,
                        player: playerAddr,
                        pieceId: 1,
                        to_x: 5,
                        to_y: 1,
                        attackPieceId: 0,
                    },
                );

            logs
                .append(
                    PieceAction {
                        order: 4, player: enemy, pieceId: 1, to_x: 5, to_y: 7, attackPieceId: 0,
                    },
                );

            logs
                .append(
                    PieceAction {
                        order: 5,
                        player: playerAddr,
                        pieceId: 1,
                        to_x: 5,
                        to_y: 4,
                        attackPieceId: 0,
                    },
                );

            // attack period
            logs
                .append(
                    PieceAction {
                        order: 6, player: enemy, pieceId: 1, to_x: 5, to_y: 5, attackPieceId: 1,
                    },
                );

            logs
                .append(
                    PieceAction {
                        order: 7,
                        player: playerAddr,
                        pieceId: 1,
                        to_x: 5,
                        to_y: 4,
                        attackPieceId: 1,
                    },
                );

            logs
                .append(
                    PieceAction {
                        order: 8, player: enemy, pieceId: 1, to_x: 5, to_y: 5, attackPieceId: 1,
                    },
                );

            logs
                .append(
                    PieceAction {
                        order: 9,
                        player: playerAddr,
                        pieceId: 1,
                        to_x: 5,
                        to_y: 4,
                        attackPieceId: 1,
                    },
                );

            logs
                .append(
                    PieceAction {
                        order: 10, player: enemy, pieceId: 1, to_x: 5, to_y: 5, attackPieceId: 1,
                    }
                );
            logs
                .append(
                    PieceAction {
                        order: 11,
                        player: playerAddr,
                        pieceId: 1,
                        to_x: 5,
                        to_y: 4,
                        attackPieceId: 1,
                    }
                );

            logs
                .append(
                    PieceAction {
                        order: 12, player: enemy, pieceId: 1, to_x: 5, to_y: 5, attackPieceId: 1,
                    }
                );

            logs
                .append(
                    PieceAction {
                        order: 13,
                        player: playerAddr,
                        pieceId: 1,
                        to_x: 5,
                        to_y: 4,
                        attackPieceId: 1,
                    }
                );

            logs
                .append(
                    PieceAction {
                        order: 14, player: enemy, pieceId: 1, to_x: 5, to_y: 5, attackPieceId: 1,
                    }
                );

            logs
                .append(
                    PieceAction {
                        order: 15,
                        player: playerAddr,
                        pieceId: 1,
                        to_x: 5,
                        to_y: 4,
                        attackPieceId: 1,
                    }
                );

            logs
                .append(
                    PieceAction {
                        order: 16, player: enemy, pieceId: 1, to_x: 5, to_y: 5, attackPieceId: 1,
                    }
                );

            set!(
                world,
                InningBattle {
                    currentMatch: currentMatchState.index,
                    round: currentMatchState.round,
                    homePlayer: playerAddr,
                    awayPlayer: enemy,
                    end: true
                }
            );

            // mock move and attack while JPS is not done yet
            emit!(
                world,
                PieceActions {
                    matchId: currentMatchState.index, roundId: currentMatchState.round, logs: logs
                }
            );
        }
    }
}

#[cfg(test)]
mod tests {
    use starknet::class_hash::Felt252TryIntoClassHash;

    // import world dispatcher
    use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};

    // import test utils
    use dojo::test_utils::{spawn_test_world, deploy_contract};

    // import models
    use autochessia::models::{Player, player, Piece, piece, InningBattle, inning_battle};

    // import home
    use super::{home, IHomeDispatcher, IHomeDispatcherTrait};

    use debug::PrintTrait;

    #[test]
    #[available_gas(60000000)]
    fn test_spwan() { // caller
        let caller = starknet::contract_address_const::<0x0>();

        // models
        let mut models = array![
            player::TEST_CLASS_HASH, piece::TEST_CLASS_HASH, inning_battle::TEST_CLASS_HASH
        ];

        // deploy world with models
        let world = spawn_test_world(models);
        // deploy systems contract
        let contract_address = world
            .deploy_contract('salt', home::TEST_CLASS_HASH.try_into().unwrap());
        let home_system = IHomeDispatcher { contract_address };

        // initialize
        home_system.initialize();

        // call spawn()
        home_system.spawn();

        // Check world state
        let player = get!(world, caller, Player);

        // check health
        assert(player.health == 100, 'health not right');

        // check inning battle
        let iBattle = get!(world, (1, 1), InningBattle);

        assert(iBattle.homePlayer == caller, 'home player not true');
    }
}
