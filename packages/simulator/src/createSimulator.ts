import { createDB } from "./createDB";
import { logDebug } from "./debug";
import { createEventSystem } from "./event/createEventSystem";
import { getEmittedEvents } from "./event/getEmittedEvents";
import { calculateBattleLogs } from "./mechanism/roundBattle";
import { registerAbilities } from "./registry/registerAbility";
import { registerEffect } from "./registry/registerEffect";
import { registerEventHandler } from "./registry/registerEventHandler";
import { registerSynergy } from "./registry/registerSynergy";
import { BaseStateType } from "./schema";
import { AbilityProfileType } from "./schema/ability_profile";
import { CreatureType } from "./schema/creature";
import { getPieceCreature } from "./utils/dbHelper";
import { destroyDB } from "./utils/destroy";

export async function createSimulator(
  creatures: CreatureType[],
  initEntities: BaseStateType[],
  ability_profiles: AbilityProfileType[]
) {
  logDebug("simulator input", initEntities);
  if (globalThis?.Simulator?.db) {
    await destroyDB();
  }

  const db = await createDB();
  const eventSystem = createEventSystem();
  const handlerMap = new Map<string, (data: any) => Promise<void>>();

  globalThis.Simulator = {
    db,
    eventSystem,
    handlerMap,
  };

  await importData({ creatures, initEntities, ability_profiles });
  await initializeBattle();
  registerSynergy();
  registerEffect();
  registerAbilities();
  registerEventHandler();

  return { calculateBattleLogs, destroyDB, getEmittedEvents };
}

async function importData({
  creatures,
  initEntities,
  ability_profiles,
}: {
  creatures: CreatureType[];
  initEntities: BaseStateType[];
  ability_profiles: AbilityProfileType[];
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

  await Promise.all([...p1, ...p2, ...p3]);
}

async function initializeBattle() {
  const db = globalThis.Simulator.db;

  // find all piece and copy to battle entity
  const allPieces = await db.base_state.find().exec();

  for (const p of allPieces) {
    const c = await getPieceCreature(p.id);
    await db.battle_entity.insert({
      id: p.id,
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
      id: p.id,
      base: c.attack,
      addition: 0,
      times: 1,
      isFixed: false,
      fixedValue: 0,
    });
  }
}
