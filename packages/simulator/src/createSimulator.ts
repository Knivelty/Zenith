import { createDB } from "./createDB";
import { createEventSystem } from "./createEventSystem";
import { calculateBattleLogs } from "./mechanism/roundBattle";
import { BaseStateType } from "./schema";
import { CreatureType } from "./schema/creature";
import { getPieceCreature } from "./utils/dbHelper";
import { destroyDB } from "./utils/destroy";

export async function createSimulator(
  creatures: CreatureType[],
  initEntities: BaseStateType[]
) {
  globalThis.Simulator.db = await createDB();

  globalThis.Simulator.eventSystem = createEventSystem();

  await importData({ creatures, initEntities });
  await initializeBattle();

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
    const pieceCreature = await getPieceCreature(p.id);
    await db.battle_entity.upsert({
      id: p.id,
      health: pieceCreature.health,
      x: p.initX,
      y: p.initY,
      dead: false,
    });
  }
}
