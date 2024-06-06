import { DB, createDB } from "./createDB";
import { BattleEntityType } from "./schema/battle_entity";
import { CreatureType } from "./schema/creature";
import { InitEntityType } from "./schema/entity";

export async function initialize(
  creatures: CreatureType[],
  initEntities: InitEntityType[]
) {
  const db = await createDB();

  await setInitialData({ db, creatures, initEntities });
}

async function setInitialData({
  db,
  creatures,
  initEntities,
}: {
  db: DB;
  creatures: CreatureType[];
  initEntities: InitEntityType[];
}) {
  const p1 = creatures.map(async (c) => {
    await db.creature.insert(c);
  });

  const p2 = initEntities.map(async (e) => {
    await db.init_entity.insert(e);
  });

  await Promise.all([...p1, ...p2]);
}
