import { initialize } from "../src";
import { CreatureType } from "../src/schema/creature";
import { InitEntityType } from "../src/schema/entity";

export const MOCK_CREATURES: CreatureType[] = [
  {
    id: "1",
    health: 600,
    attack: 60,
    armor: 20,
    speed: 3,
    range: 2,
    initiative: 90,
  },
  {
    id: "2",
    health: 800,
    attack: 60,
    armor: 20,
    speed: 3,
    range: 2,
    initiative: 60,
  },
];

export const MOCK_INIT_ENTITY: InitEntityType[] = [
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
    isEnemy: false,
    creatureId: "2",
  },
];

test("test progress", () => {
  initialize(MOCK_CREATURES, MOCK_INIT_ENTITY);
});
