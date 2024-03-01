use autochessia::models::{Creature, Piece, Player};

// define the interface
#[starknet::interface]
trait IHome<TContractState> {
    fn initialize(self: @TContractState);
    fn spawn(self: @TContractState);
    fn startBattle(self: @TContractState);
    fn nextRound(self: @TContractState);
}

use starknet::{ContractAddress, contract_address_try_from_felt252, get_caller_address};


#[dojo::contract]
mod home {
    use starknet::{ContractAddress, get_caller_address};
    use autochessia::models::{
        Creature, Position, Piece, Player, InningBattle, GlobalState, MatchState
    };
    use autochessia::utils::{next_position, generate_pseudo_random_address};
    use autochessia::customEvent::{PieceActions, PieceAction};
    use dojo::base;
    use super::IHome;


    // declaring custom event struct
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        PieceActions: PieceActions,
    }


    // impl: implement functions specified in trait
    #[external(v0)]
    impl HomeImpl of IHome<ContractState> {
        // intialize all args
        fn initialize(self: @ContractState) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // initialize creature
            set!(
                world,
                Creature {
                    tier: 1,
                    rarity: 1,
                    internal_index: 1,
                    health: 600,
                    attack: 50,
                    defense: 5,
                    range: 1,
                    speed: 101,
                    movement: 4
                }
            );
        }

        // ContractState is defined by system decorator expansion
        fn spawn(self: @ContractState) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // Get the address of the current caller, possibly the player's address.
            let player = get_caller_address();

            // create match
            let globalState = get!(world, 1, GlobalState);
            let currentMatch = globalState.totalMatch + 1;
            set!(
                world,
                (
                    MatchState { index: currentMatch, round: 1 },
                    GlobalState { index: 1, totalMatch: currentMatch }
                )
            );

            // spawn player
            set!(
                world,
                Player {
                    player: player,
                    health: 30,
                    heroesCount: 1,
                    inventoryCount: 0,
                    heroAltarCount: 0,
                    tier: 1,
                    coin: 0,
                    streakCount: 0,
                    locked: 0,
                    inMatch: currentMatch
                }
            );
            set!(
                world,
                Piece {
                    owner: player,
                    index: 1,
                    tier: 1,
                    rarity: 1,
                    internal_index: 1,
                    x_board: 1,
                    y_board: 1,
                    x_in_battle: 0,
                    y_in_battle: 0,
                    currentHealth: 600
                }
            );
            // get player's enemy address

            let enemy = generate_pseudo_random_address(1);
            // // // spawn player's enemy
            set!(
                world,
                (
                    Player {
                        player: enemy,
                        health: 30,
                        heroesCount: 1,
                        inventoryCount: 0,
                        heroAltarCount: 0,
                        tier: 1,
                        coin: 0,
                        streakCount: 0,
                        locked: 0,
                        inMatch: currentMatch
                    },
                    Piece {
                        owner: enemy,
                        index: 1,
                        tier: 1,
                        rarity: 1,
                        internal_index: 1,
                        x_board: 1,
                        y_board: 1,
                        x_in_battle: 0,
                        y_in_battle: 0,
                        currentHealth: 600
                    }
                )
            );
            // create battle
            set!(
                world,
                (InningBattle {
                    currentMatch: currentMatch,
                    round: 1,
                    homePlayer: player,
                    awayPlayer: enemy,
                    end: false
                }),
            );
        }


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
    #[available_gas(30000000)]
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

        // call spawn()
        home_system.spawn();

        // Check world state
        let player = get!(world, caller, Player);

        // check health
        assert(player.health == 30, 'health not right');

        // check inning battle
        let iBattle = get!(world, (1, 1), InningBattle);

        assert(iBattle.homePlayer == caller, 'home player not true');
    }
}
