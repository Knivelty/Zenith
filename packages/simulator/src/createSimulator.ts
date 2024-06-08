import { DB, createDB } from "./createDB";
import { calculateBattleLogs } from "./jps";
import { CreatureType } from "./schema/creature";
import { InitEntityType } from "./schema/entity";
import { getPieceCreature } from "./utils/dbHelper";
import { destroyDB } from "./utils/destroy";

export async function createSimulator(
  creatures: CreatureType[],
  initEntities: InitEntityType[]
) {
  const db = await createDB();

  await importData({ db, creatures, initEntities });
  await initializeBattle(db);

  return { db, calculateBattleLogs, destroyDB };
}

async function importData({
  db,
  creatures,
  initEntities,
}: {
  db: DB;
  creatures: CreatureType[];
  initEntities: InitEntityType[];
}) {
  const p1 = creatures.map(async (c) => {
    await db.creature.upsert(c);
  });

  const p2 = initEntities.map(async (e) => {
    await db.init_entity.upsert(e);
  });

  await Promise.all([...p1, ...p2]);
}

async function initializeBattle(db: DB) {
  // find all piece and copy to battle entity
  const allPieces = await db.init_entity.find().exec();

  for (const p of allPieces) {
    const pieceCreature = await getPieceCreature(db, p.id);
    await db.battle_entity.upsert({
      id: p.id,
      health: pieceCreature.health,
      x: p.initX,
      y: p.initY,
      dead: false,
    });
  }
}
