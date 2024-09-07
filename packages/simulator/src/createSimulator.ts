import { createDB } from "./createDB";
import { logDebug } from "./debug";
import { createEventSystem } from "./event/createEventSystem";
import { getEmittedEvents } from "./event/getEmittedEvents";
import { calculateBattleLogs } from "./mechanism/roundBattle";
import { registerAbilities } from "./registry/registerAbility";
import { registerEffect } from "./registry/registerEffect";
import { registerEventHandler } from "./registry/registerEventHandler";
import { registerSynergy } from "./registry/registerSynergy";
import { BaseStateType, BattleEntityType } from "./schema";
import { AbilityProfileType } from "./schema/ability_profile";
import { CreatureType } from "./schema/creature";
import { PlayerProfileType } from "./schema/player_profile";
import { applyEntityOverride } from "./utils/applyEntityOverride";
import { getPieceCreature } from "./utils/dbHelper";
import { cleanDB } from "./utils/destroy";

export async function createSimulator({
  creatures,
  initEntities,
  ability_profiles,
  allPlayerProfiles,
  overrides,
}: {
  creatures: CreatureType[];
  initEntities: BaseStateType[];
  ability_profiles: AbilityProfileType[];
  allPlayerProfiles: PlayerProfileType[];
  overrides?: { battleEntity?: Partial<BattleEntityType>[] };
}) {
  logDebug("simulator input", initEntities, creatures);
  if (globalThis?.Simulator?.db) {
    await cleanDB();
  }

  const db = await createDB();
  const eventSystem = createEventSystem();
  const handlerMap = new Map<string, (data: any) => Promise<void>>();

  globalThis.Simulator = {
    db,
    eventSystem,
    handlerMap,
  };

  await importData({
    creatures,
    initEntities,
    ability_profiles,
    allPlayerProfiles,
  });
  await initializeBattle();

  registerEventHandler();
  registerSynergy();
  registerEffect();
  registerAbilities();

  await applyEntityOverride(overrides);

  return { calculateBattleLogs, cleanDB, getEmittedEvents };
}

async function importData({
  creatures,
  initEntities,
  ability_profiles,
  allPlayerProfiles,
}: {
  creatures: CreatureType[];
  initEntities: BaseStateType[];
  ability_profiles: AbilityProfileType[];
  allPlayerProfiles: PlayerProfileType[];
}) {
  const db = globalThis.Simulator.db;
  const p1 = creatures.map(async (c) => {
    return await db.creature.upsert(c);
  });

  const p2 = initEntities.map(async (e) => {
    return await db.base_state.upsert(e);
  });

  const p3 = ability_profiles.map(async (a) => {
    return await db.ability_profile.upsert(a);
  });

  const p4 = allPlayerProfiles.map(async (p) => {
    return await db.player_profile.upsert(p);
  });

  await Promise.all([...p1, ...p2, ...p3, ...p4]);
}

async function initializeBattle() {
  const db = globalThis.Simulator.db;

  // find all piece and copy to battle entity
  const allPieces = await db.base_state.find().exec();

  for (const p of allPieces) {
    const c = await getPieceCreature(p.entity);
    await db.battle_entity.insert({
      entity: p.entity,
      isHome: p.isHome,
      health: c.health,
      maxHealth: c.health,
      mana: 0,
      maxMana: c.maxMana,
      attack: c.attack,
      armor: c.armor,
      range: c.range,
      speed: c.speed,
      initiative: c.initiative,
      order: c.order,
      origins: c.origins,
      x: p.initX,
      y: p.initY,
      dead: false,
      creature_idx: p.creature_idx,
      level: p.level,
      spell_amp: 0,
      ability: c.ability,
    });

    // initial piece attack
    await db.piece_attack.insert({
      entity: p.entity,
      base: c.attack,
      addition: 0,
      times: 1,
      isFixed: false,
      fixedValue: 0,
    });
  }
}
