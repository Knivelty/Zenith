use autochessia::models::{CreatureProfile, StageProfile, Piece, Player};
use autochessia::customType::{PieceChange, RoundResult};


// define the interface
#[starknet::interface]
trait IHome<TContractState> {
    fn initialize(self: @TContractState);


    // set args
    fn setCreatureProfile(self: @TContractState, p: CreatureProfile);
    fn setStageProfile(self: @TContractState, p: StageProfile);


    fn spawn(self: @TContractState);
    fn refreshAltar(self: @TContractState);
    fn buyHero(self: @TContractState, altarSlot: u8, invSlot: u8);
    fn sellHero(self: @TContractState, gid: u32);
    fn commitPreparation(self: @TContractState, changes: Array<PieceChange>, result: RoundResult);
    fn nextRound(self: @TContractState);


    fn startBattle(self: @TContractState);

    // debug func
    fn getCoin(self: @TContractState);
    fn exit(self: @TContractState);
}

use starknet::{
    ContractAddress, Zeroable, contract_address_try_from_felt252, get_caller_address, get_block_info
};


#[dojo::contract]
mod home {
    use starknet::{
        ContractAddress, get_caller_address, get_block_hash_syscall, get_block_info, get_tx_info
    };
    use autochessia::models::{
        CreatureProfile, Position, Piece, Player, InningBattle, GlobalState, MatchState, Altar,
        PlayerPiece, PlayerInvPiece, StageProfile, StageProfilePiece
    };
    use autochessia::utils::{next_position, generate_pseudo_random_address, get_felt_mod};
    use autochessia::customType::{PieceChange, RoundResult};

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


    fn _validPieceChange(self: @ContractState, c: @PieceChange) {
        let world = self.world_dispatcher.read();

        let change = *c;
        let playerAddr = get_caller_address();
        let mut player = get!(world, playerAddr, Player);

        let mut oldPiece = get!(world, change.gid, Piece);

        // TODO: add case by case check
        let mut oldPlayerInvPiece = get!(world, (oldPiece.owner, oldPiece.slot), PlayerInvPiece);
        let mut oldPlayerPiece = get!(world, (oldPiece.owner, oldPiece.idx), PlayerPiece);

        let mut newPlayerInvPiece = get!(world, (oldPiece.owner, change.slot), PlayerInvPiece);
        let mut newPlayerPiece = get!(world, (oldPiece.owner, change.idx), PlayerPiece);

        // only piece move on board
        if (oldPiece.slot == 0 && change.slot == 0) { // idx should be the same
        } else if (oldPiece.slot != 0 && change.slot == 0) {
            // move from inv to board

            oldPlayerInvPiece.gid = 0;
            newPlayerPiece.gid = change.gid;

            player.heroesCount += 1;
            player.inventoryCount -= 1;

            set!(world, (oldPlayerInvPiece, newPlayerPiece));
        } else if (oldPiece.slot == 0 && change.slot != 0) {
            // move from board to inv
            oldPlayerPiece.gid = 0;
            newPlayerInvPiece.gid = change.gid;

            player.heroesCount -= 1;
            player.inventoryCount += 1;

            set!(world, (oldPlayerPiece, newPlayerInvPiece));
        }

        // update piece attr
        oldPiece.x = change.x;
        oldPiece.y = change.y;
        oldPiece.slot = change.slot;
        oldPiece.idx = change.idx;

        set!(world, (oldPiece, player));
    }


    fn _spawnEnemyPiece(self: @ContractState, round: u8, enemyAddr: ContractAddress) {
        let world = self.world_dispatcher.read();
        let playerAddr = get_caller_address();

        let mut globalState = get!(world, 1, GlobalState);

        // get the current stage profile
        let stageProfile = get!(world, round, StageProfile);

        let lastRound = round - 1;
        // delete old piece
        let lastStageProfile = get!(world, lastRound, StageProfile);

        let mut startIdx = 1;
        let lastPieceCount = lastStageProfile.pieceCount;

        loop {
            if (startIdx > lastPieceCount) {
                break;
            }

            // get old piece
            let mut stalePlayerPiece = get!(world, (enemyAddr, startIdx), PlayerPiece);
            let mut stalePiece = get!(world, (stalePlayerPiece.gid), Piece);

            stalePlayerPiece.gid = 0;
            stalePiece.owner = Zeroable::zero();

            // TODO: fix the bug
            // NOTE: comment the next line because there's a migration error and idk why
            // Difference in FunctionId { id: 68, debug_name: None }: Some(OrderedHashMap({Const: 173730})) != Some(OrderedHashMap({Const: 2260})).
            // Difference in FunctionId { id: 68, debug_name: None }: Some(OrderedHashMap({Const: 173730})) != Some(OrderedHashMap({Const: 2260})).
            set!(world, (stalePlayerPiece));
            set!(world, (stalePiece));

            startIdx += 1;
        };

        // spawn piece according to stage profile
        let mut idx = 1;

        loop {
            let sp = get!(world, (round, idx), StageProfilePiece);
            globalState.totalPieceCounter += 1;
            set!(
                world,
                (
                    PlayerPiece { owner: enemyAddr, idx: idx, gid: globalState.totalPieceCounter },
                    Piece {
                        gid: globalState.totalPieceCounter,
                        owner: enemyAddr,
                        idx: idx,
                        slot: 0,
                        level: sp.level,
                        creature_index: sp.creature_index,
                        x: sp.x,
                        y: sp.y,
                    }
                )
            );

            if (idx >= stageProfile.pieceCount) {
                break;
            }
            idx = idx + 1;
        };

        // update heroCount
        let mut enemy = get!(world, enemyAddr, Player);
        enemy.heroesCount = stageProfile.pieceCount;

        set!(world, (globalState, enemy));
    }

    fn _giveRoundCoinReward(self: @ContractState) {
        let world = self.world_dispatcher.read();
        let playerAddr = get_caller_address();

        let mut player = get!(world, playerAddr, Player);

        // get interest
        let interest = player.coin / 10;

        // get streak reward 
        let streakReward = player.winStreak + player.loseStreak;

        // get round base reward
        let matchState = get!(world, player.inMatch, MatchState);
        let roundBaseReward = matchState.round / 10;

        let totalIncome = interest + streakReward + roundBaseReward;

        player.coin += totalIncome;

        set!(world, (player));
    }


    // impl: implement functions specified in trait
    #[abi(embed_v0)]
    impl HomeImpl of IHome<ContractState> {
        // intialize all args
        // TODO: set as real args

        fn initialize(self: @ContractState) {
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
            );

            // intialize stage profile

            // stage 1
            set!(
                world,
                (
                    StageProfile { stage: 1, pieceCount: 2, },
                    StageProfilePiece {
                        stage: 1, index: 1, y: 2, x: 3, creature_index: 1, level: 1,
                    },
                    StageProfilePiece {
                        stage: 1, index: 2, y: 2, x: 6, creature_index: 1, level: 1,
                    }
                )
            );

            // stage 2
            set!(
                world,
                (
                    StageProfile { stage: 2, pieceCount: 2, },
                    StageProfilePiece {
                        stage: 2, index: 1, y: 1, x: 3, creature_index: 2, level: 1,
                    },
                    StageProfilePiece {
                        stage: 2, index: 2, y: 3, x: 5, creature_index: 3, level: 1,
                    }
                )
            );

            // stage 3
            set!(
                world,
                (
                    StageProfile { stage: 3, pieceCount: 2, },
                    StageProfilePiece {
                        stage: 3, index: 1, y: 2, x: 2, creature_index: 4, level: 1,
                    },
                    StageProfilePiece {
                        stage: 3, index: 2, y: 2, x: 7, creature_index: 5, level: 1,
                    }
                )
            );

            // stage 4
            set!(
                world,
                (
                    StageProfile { stage: 4, pieceCount: 3, },
                    StageProfilePiece {
                        stage: 4, index: 1, y: 1, x: 2, creature_index: 5, level: 1,
                    },
                    StageProfilePiece {
                        stage: 4, index: 2, y: 2, x: 5, creature_index: 6, level: 1,
                    },
                    StageProfilePiece {
                        stage: 4, index: 3, y: 3, x: 3, creature_index: 1, level: 1,
                    }
                )
            );

            // stage 5
            set!(
                world,
                (
                    StageProfile { stage: 5, pieceCount: 3, },
                    StageProfilePiece {
                        stage: 5, index: 1, y: 1, x: 5, creature_index: 2, level: 1,
                    },
                    StageProfilePiece {
                        stage: 5, index: 2, y: 2, x: 3, creature_index: 3, level: 1,
                    },
                    StageProfilePiece {
                        stage: 5, index: 3, y: 2, x: 7, creature_index: 3, level: 1,
                    }
                )
            );

            // stage 6
            set!(
                world,
                (
                    StageProfile { stage: 6, pieceCount: 1, },
                    StageProfilePiece {
                        stage: 6, index: 1, y: 2, x: 4, creature_index: 8, level: 1,
                    },
                )
            );

            // stage 7
            set!(
                world,
                (
                    StageProfile { stage: 7, pieceCount: 3, },
                    StageProfilePiece {
                        stage: 7, index: 1, y: 1, x: 5, creature_index: 2, level: 1,
                    },
                    StageProfilePiece {
                        stage: 7, index: 2, y: 2, x: 1, creature_index: 8, level: 1,
                    },
                    StageProfilePiece {
                        stage: 7, index: 3, y: 3, x: 4, creature_index: 9, level: 1,
                    }
                )
            );
        }

        fn setCreatureProfile(self: @ContractState, p: CreatureProfile) {}
        fn setStageProfile(self: @ContractState, p: StageProfile) {}

        // ContractState is defined by system decorator expansion
        fn spawn(self: @ContractState) {
            let world = self.world_dispatcher.read();
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
                    winStreak: 0,
                    loseStreak: 0,
                    locked: 0,
                    inMatch: currentMatch
                }
            );

            // refresh hero altar
            _refreshAltar(self, playerAddr);

            // get player's enemy address
            let enemyAddr = generate_pseudo_random_address(playerAddr.into());

            // get the first stage profile
            let stageProfile = get!(world, 1, StageProfile);

            // spawn enemy
            set!(
                world,
                Player {
                    player: enemyAddr,
                    health: 10,
                    heroesCount: stageProfile.pieceCount,
                    inventoryCount: 0,
                    level: 1,
                    coin: 0,
                    winStreak: 0,
                    loseStreak: 0,
                    locked: 0,
                    inMatch: currentMatch
                }
            );

            // spawn enemy piece
            _spawnEnemyPiece(self, 1, enemyAddr);

            // create battle
            set!(
                world,
                (
                    InningBattle {
                        currentMatch: currentMatch,
                        round: 1,
                        homePlayer: playerAddr,
                        awayPlayer: enemyAddr,
                        end: false,
                        winner: Zeroable::zero(),
                        healthDecrease: 0,
                    },
                ),
            );
        }


        // commit preparation in one function
        // include: refresh, move
        // the contract side need to valid the validity
        fn commitPreparation(
            self: @ContractState, changes: Array<PieceChange>, result: RoundResult
        ) {
            let world = self.world_dispatcher.read();

            let playerAddr = get_caller_address();

            let mut idx = 0;
            let length = changes.len();

            // check each progress
            loop {
                if (idx >= length) {
                    break;
                }

                let change = changes.at(idx);
                _validPieceChange(self, change);

                idx = idx + 1;
            };

            // mark battle as end
            let mut player = get!(world, playerAddr, Player);
            let matchState = get!(world, player.inMatch, MatchState);
            let mut inningBattle = get!(world, (matchState.index, matchState.round), InningBattle);

            if (result.win) {
                inningBattle.winner = inningBattle.homePlayer;

                // update streak 
                if (player.winStreak != 0) {
                    player.winStreak += 1;
                    player.loseStreak = 0;
                } else {
                    player.winStreak = 1;
                    player.loseStreak = 0;
                }
            } else {
                inningBattle.winner = inningBattle.awayPlayer;
                // decrease health
                if (player.health > result.healthDecrease) {
                    player.health -= result.healthDecrease
                } else {
                    player.health = 0;
                }

                // update streak 
                if (player.winStreak != 0) {
                    player.winStreak = 1;
                    player.loseStreak = 0;
                } else {
                    player.winStreak = 0;
                    player.loseStreak += 1;
                }
            }
            inningBattle.healthDecrease = result.healthDecrease;
            inningBattle.end = true;

            set!(world, (inningBattle, player));
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

            let mut piece = get!(world, gid, Piece);
            let mut invPiece = get!(world, (playerAddr, piece.slot), PlayerInvPiece);
            let mut player = get!(world, playerAddr, Player);

            // refund coin
            // TODO: judge by level
            player.coin += 1;
            player.inventoryCount -= 1;

            // by default, consider the piece are sold from inv
            // TODO: delete! will break torii https://github.com/dojoengine/dojo/issues/1635
            // delete!(world, (piece));

            // set gid equal 0 to mark it as deleted
            invPiece.gid = 0;
            piece.slot = 0;
            piece.idx = 0;
            piece.owner = Zeroable::zero();
            set!(world, (invPiece, piece));

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

            let currentRound = currentMatchState.round;
            let newRound = currentRound + 1;

            // spawn new piece
            let enemyAddr = lastInningBattle.awayPlayer;
            _spawnEnemyPiece(self, currentRound + 1, enemyAddr);

            set!(
                world,
                (
                    // update round info
                    MatchState { index: currentMatchState.index, round: newRound },
                    // create battle
                    InningBattle {
                        currentMatch: currentMatchState.index,
                        round: newRound,
                        homePlayer: playerAddr,
                        awayPlayer: lastInningBattle.awayPlayer,
                        end: false,
                        winner: Zeroable::zero(),
                        healthDecrease: 0
                    }
                ),
            );
            // add more coin
            _giveRoundCoinReward(self);
        }


        fn startBattle(self: @ContractState) {}

        fn getCoin(self: @ContractState) {
            let world = self.world_dispatcher.read();
            let playerAddr = get_caller_address();

            let mut player = get!(world, playerAddr, Player);
            player.coin += 10;

            set!(world, (player));
        }

        // exit current game
        fn exit(self: @ContractState) {
            let world = self.world_dispatcher.read();
            let playerAddr = get_caller_address();

            let player = get!(world, playerAddr, Player);
        // delete player inv piece

        // delete player piece

        // reset player attr

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
    #[available_gas(10000000000)]
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
