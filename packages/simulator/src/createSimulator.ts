import { createDB } from "./createDB";
import { createEffectSystem } from "./effect/general";
import { createEventSystem } from "./event/createEventSystem";
import { calculateBattleLogs } from "./mechanism/roundBattle";
import { registerEffect } from "./registry/registerEffect";
import { registerSynergy } from "./registry/registerSynergy";
import { BaseStateType } from "./schema";
import { CreatureType } from "./schema/creature";
import { getPieceCreature } from "./utils/dbHelper";
import { destroyDB } from "./utils/destroy";

export async function createSimulator(
  creatures: CreatureType[],
  initEntities: BaseStateType[]
) {
  const db = await createDB();
  const eventSystem = createEventSystem();
  const effectSystem = createEffectSystem();
  globalThis.Simulator = { db, eventSystem, effectSystem };

  await importData({ creatures, initEntities });
  await initializeBattle();
  await registerSynergy();
  await registerEffect();

  return { calculateBattleLogs, destroyDB };
}

async function importData({
  creatures,
  initEntities,
}: {
  creatures: CreatureType[];
  initEntities: BaseStateType[];
}) {
  const db = globalThis.Simulator.db;
  const p1 = creatures.map(async (c) => {
    await db.creature.upsert(c);
  });

  const p2 = initEntities.map(async (e) => {
    await db.base_state.upsert(e);
  });

  await Promise.all([...p1, ...p2]);
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
      maxMana: 100,
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
