import { BaseStateType } from "../src";
import { createSimulator } from "../src/createSimulator";
import { CreatureType } from "../src/schema/creature";

export const MOCK_CREATURES: CreatureType[] = [
  {
    creature_id: "1",
    health: 600,
    attack: 60,
    armor: 20,
    speed: 3,
    range: 2,
    initiative: 90,
  },
  {
    creature_id: "2",
    health: 800,
    attack: 60,
    armor: 20,
    speed: 3,
    range: 2,
    initiative: 60,
  },
];

export const MOCK_INIT_ENTITY: BaseStateType[] = [
  {
    id: "1",
    initX: 1,
    initY: 1,
    isEnemy: false,
    creatureId: "1",
  },
  {
    id: "2",
    initX: 7,
    initY: 7,
    isEnemy: true,
    creatureId: "2",
  },
];

test("test progress", async () => {
  const { db, calculateBattleLogs } = await createSimulator(
    MOCK_CREATURES,
    MOCK_INIT_ENTITY
  );

  const { logs, result } = await calculateBattleLogs(db);

  console.log("logs: ", logs, result);
});
