use autochessia::models::{CreatureProfile, Piece, Player};
use autochessia::customType::{MoveChange, PlaceChange, PrepareChanges};


// define the interface
#[starknet::interface]
trait IHome<TContractState> {
    fn initialize(self: @TContractState);


    fn spawn(self: @TContractState);
    fn refreshAltar(self: @TContractState);
    fn buyHero(self: @TContractState, altarSlot: u8, invSlot: u8);
    fn sellHero(self: @TContractState, gid: u32);
    fn commitPreparation(
        self: @TContractState, changes: Array<PrepareChanges<MoveChange, PlaceChange>>
    );
    fn nextRound(self: @TContractState);


    fn startBattle(self: @TContractState);

    // debug func
    fn getCoin(self: @TContractState);
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
        CreatureProfile, Position, Piece, Player, InningBattle, GlobalState, MatchState, Altar,
        PlayerInvPiece
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

            // Minotaur
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

            // Colossus
            set!(
                world,
                CreatureProfile {
                    level: 1,
                    rarity: 1,
                    creature_index: 2,
                    health: 700,
                    attack: 35,
                    armor: 65,
                    range: 2,
                    speed: 1,
                    initiative: 60
                }
            );

            // Behemoth
            set!(
                world,
                CreatureProfile {
                    level: 1,
                    rarity: 1,
                    creature_index: 3,
                    health: 550,
                    attack: 45,
                    armor: 60,
                    range: 2,
                    speed: 2,
                    initiative: 85
                }
            );

            // Wyvern
            set!(
                world,
                CreatureProfile {
                    level: 1,
                    rarity: 1,
                    creature_index: 4,
                    health: 450,
                    attack: 100,
                    armor: 30,
                    range: 3,
                    speed: 4,
                    initiative: 135
                }
            );

            // Berserker
            set!(
                world,
                CreatureProfile {
                    level: 1,
                    rarity: 1,
                    creature_index: 5,
                    health: 500,
                    attack: 65,
                    armor: 85,
                    range: 2,
                    speed: 3,
                    initiative: 95
                }
            );

            // Golem
            set!(
                world,
                CreatureProfile {
                    level: 1,
                    rarity: 1,
                    creature_index: 6,
                    health: 600,
                    attack: 65,
                    armor: 50,
                    range: 2,
                    speed: 2,
                    initiative: 110
                }
            );

            // Bear
            set!(
                world,
                CreatureProfile {
                    level: 1,
                    rarity: 1,
                    creature_index: 7,
                    health: 960,
                    attack: 90,
                    armor: 40,
                    range: 2,
                    speed: 2,
                    initiative: 80
                }
            );

            // Kitsune
            set!(
                world,
                CreatureProfile {
                    level: 1,
                    rarity: 1,
                    creature_index: 8,
                    health: 420,
                    attack: 70,
                    armor: 35,
                    range: 2,
                    speed: 3,
                    initiative: 115
                }
            );

            // Nue
            set!(
                world,
                CreatureProfile {
                    level: 1,
                    rarity: 1,
                    creature_index: 9,
                    health: 400,
                    attack: 80,
                    armor: 25,
                    range: 2,
                    speed: 4,
                    initiative: 175
                }
            );

            // Cyclops
            set!(
                world,
                CreatureProfile {
                    level: 1,
                    rarity: 1,
                    creature_index: 10,
                    health: 300,
                    attack: 125,
                    armor: 40,
                    range: 2,
                    speed: 0,
                    initiative: 150
                }
            );

            set!(
                world,
                GlobalState { index: 1, totalMatch: 0, totalCreature: 10, totalPieceCounter: 0 }
            )
        }

        // ContractState is defined by system decorator expansion
        fn spawn(self: @ContractState) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // Get the address of the current caller, possibly the player's address.
            let playerAddr = get_caller_address();

            // create match
            let mut globalState = get!(world, 1, GlobalState);
            let currentMatch = globalState.totalMatch + 1;
            globalState.totalMatch = currentMatch;

            set!(world, (MatchState { index: currentMatch, round: 1 }, globalState));

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

        fn refreshAltar(self: @ContractState) {
            let world = self.world_dispatcher.read();
            let playerAddr = get_caller_address();

            let mut player = get!(world, playerAddr, Player);

            // player coin reduce by 2
            player.coin -= 2;

            set!(world, (player));

            _refreshAltar(self, playerAddr);
        }

        fn buyHero(self: @ContractState, altarSlot: u8, invSlot: u8) {
            let world = self.world_dispatcher.read();
            let playerAddr = get_caller_address();

            let mut player = get!(world, playerAddr, Player);
            let mut altar = get!(world, playerAddr, Altar);
            let mut globalState = get!(world, 1, GlobalState);
            globalState.totalPieceCounter += 1;

            // get creature Id
            let creatureId = match altarSlot.into() {
                0 => { 0 },
                1 => {
                    let creatureId = altar.slot1;
                    altar.slot1 = 0;
                    creatureId
                },
                2 => {
                    let creatureId = altar.slot2;
                    altar.slot2 = 0;
                    creatureId
                },
                3 => {
                    let creatureId = altar.slot3;
                    altar.slot3 = 0;
                    creatureId
                },
                4 => {
                    let creatureId = altar.slot4;
                    altar.slot4 = 0;
                    creatureId
                },
                5 => {
                    let creatureId = altar.slot5;
                    altar.slot5 = 0;
                    creatureId
                },
                _ => { 0 }
            };
            // check whether is empty
            if (creatureId == 0) {
                panic!("invalid creature");
            }

            // get creature profile
            let creatureProfile = get!(world, (creatureId, 1), CreatureProfile);

            // player coin minus 1
            player.coin -= 1;
            player.inventoryCount += 1;

            // check wether this slot is full
            let playerInvPiece = get!(world, (playerAddr, invSlot), PlayerInvPiece);
            if (playerInvPiece.gid != 0) {
                panic!("this slot occupied")
            }

            // spwan piece
            set!(
                world,
                (
                    Piece {
                        gid: globalState.totalPieceCounter,
                        owner: playerAddr,
                        idx: 0,
                        slot: invSlot,
                        level: 1,
                        rarity: creatureProfile.rarity,
                        creature_index: creatureId,
                        x: 0,
                        y: 0
                    },
                    PlayerInvPiece {
                        owner: playerAddr, slot: invSlot, gid: globalState.totalPieceCounter
                    },
                    altar,
                    globalState,
                    player
                )
            )
        // 
        }

        fn sellHero(self: @ContractState, gid: u32) {
            let world = self.world_dispatcher.read();
            let playerAddr = get_caller_address();

            let piece = get!(world, gid, Piece);
            let mut invPiece = get!(world, (playerAddr, piece.slot), PlayerInvPiece);
            let mut player = get!(world, playerAddr, Player);

            // refund coin
            // TODO: judge by level
            player.coin += 1;

            // by default, consider the piece are sold from inv
            // TODO: delete! will break torii https://github.com/dojoengine/dojo/issues/1635
            // delete!(world, (piece));

            // set gid equal 0 to mark it as deleted
            invPiece.gid = 0;
            set!(world, (invPiece));

            set!(world, (player));
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


        fn startBattle(self: @ContractState) {}

        fn getCoin(self: @ContractState) {
            let world = self.world_dispatcher.read();
            let playerAddr = get_caller_address();

            let player = get!(world, playerAddr, Player);

            set!(
                world,
                Player {
                    player: player.player,
                    inMatch: player.inMatch,
                    health: player.health,
                    streakCount: player.streakCount,
                    coin: player.coin + 10,
                    level: player.level,
                    locked: player.locked,
                    // dojo does not support array for now, so it's used to traversal all pieces belong to player
                    heroesCount: player.heroesCount,
                    // hero count in inventory 
                    inventoryCount: player.inventoryCount,
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
