use autochessia::models::{Direction, Creature, InningBattle};


// define the interface
#[starknet::interface]
trait IHome<TContractState> {
    fn spawn(self: @TContractState);
    fn startBattle(self: @TContractState);
}

use starknet::{ContractAddress, contract_address_try_from_felt252, get_caller_address};


// dojo decorator

#[dojo::contract]
mod home {
    use starknet::{ContractAddress, get_caller_address};
    use autochessia::models::{
        Creature, Position, Piece, Player, Moves, Direction, Vec2, InningBattle
    };
    use autochessia::utils::{next_position, generate_pseudo_random_address};
    use dojo::base;
    use super::IHome;


    // declaring custom event struct
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        PieceAction: PieceAction,
    }

    // declaring custom event struct
    #[derive(Drop, starknet::Event)]
    struct PieceAction {
        // key
        player: ContractAddress,
        pieceId: u8,
        // action order of this battle
        order: u8,
        to_x: u8,
        to_y: u8,
        attackPieceId: u8,
    }


    // impl: implement functions specified in trait
    #[external(v0)]
    impl HomeImpl of IHome<ContractState> {
        // ContractState is defined by system decorator expansion
        fn spawn(self: @ContractState) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // Get the address of the current caller, possibly the player's address.
            let player = get_caller_address();

            // initialize creature, these can be moved to other place later
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

            // spawn player
            set!(
                world,
                (
                    Player {
                        player,
                        health: 30,
                        heroesCount: 1,
                        inventoryCount: 0,
                        heroAltarCount: 0,
                        tier: 1,
                        coin: 0,
                        streakCount: 0,
                        locked: 0
                    },
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
                )
            );
            // get player's enemy address

            let enemy = generate_pseudo_random_address(1);

            // spawn player's enemy
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
                        locked: 0
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
            set!(world, (InningBattle { index: 1, homePlayer: player, awayPlayer: enemy }),);
        }

        fn startBattle(self: @ContractState) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // Get the address of the current caller, possibly the player's address.
            let player = get_caller_address();

            // get inning inning battle
            let inningBattle = get!(world, 1, InningBattle);

            let enemy = inningBattle.awayPlayer;

            // mock move and attack while JPS is not done yet
            emit!(
                world,
                PieceAction {
                    order: 1, player: player, pieceId: 1, to_x: 1, to_y: 1, attackPieceId: 0,
                }
            );

            emit!(
                world,
                PieceAction {
                    order: 2, player: enemy, pieceId: 1, to_x: 7, to_y: 7, attackPieceId: 0,
                },
            );

            emit!(
                world,
                PieceAction {
                    order: 3, player: player, pieceId: 1, to_x: 5, to_y: 1, attackPieceId: 0,
                },
            );

            emit!(
                world,
                PieceAction {
                    order: 4, player: enemy, pieceId: 1, to_x: 5, to_y: 5, attackPieceId: 0,
                },
            );

            emit!(
                world,
                PieceAction {
                    order: 5, player: player, pieceId: 1, to_x: 5, to_y: 4, attackPieceId: 1,
                },
            );

            emit!(
                world,
                PieceAction {
                    order: 6, player: enemy, pieceId: 1, to_x: 5, to_y: 5, attackPieceId: 1,
                },
            );

            emit!(
                world,
                PieceAction {
                    order: 7, player: player, pieceId: 1, to_x: 5, to_y: 4, attackPieceId: 1,
                },
            );

            emit!(
                world,
                PieceAction {
                    order: 8, player: enemy, pieceId: 1, to_x: 5, to_y: 5, attackPieceId: 1,
                },
            );

            emit!(
                world,
                PieceAction {
                    order: 9, player: player, pieceId: 1, to_x: 5, to_y: 4, attackPieceId: 1,
                },
            );

            emit!(
                world,
                PieceAction {
                    order: 10, player: enemy, pieceId: 1, to_x: 5, to_y: 5, attackPieceId: 1,
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
    use autochessia::models::{Position, Moves, Direction, Vec2};

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
        let iBattle = get!(world, 1, InningBattle);

        assert(iBattle.homePlayer == caller, 'home player not true');
    }
}
