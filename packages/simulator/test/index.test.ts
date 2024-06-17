import { BaseStateType } from "../src";
import { createSimulator } from "../src/createSimulator";
import { AbilityProfileType } from "../src/schema/ability_profile";
import { CreatureType } from "../src/schema/creature";
import { ORDER_BRUTE_NAME } from "../src/synergy/order/brute";
import { ORDER_HUNTER_NAME } from "../src/synergy/order/hunter";
import { ORIGIN_DARK_NAME } from "../src/synergy/origin/dark";
import { ORIGIN_LIGHT_NAME } from "../src/synergy/origin/light";

export const MOCK_CREATURES: CreatureType[] = [
  {
    creature_id: "001",
    health: 600,
    attack: 60,
    armor: 20,
    speed: 3,
    range: 1,
    initiative: 90,
    order: ORDER_HUNTER_NAME,
    origins: [ORIGIN_LIGHT_NAME, ORIGIN_DARK_NAME],
    ability: "dragonExhale",
  },
  {
    creature_id: "002",
    health: 2000,
    attack: 60,
    armor: 20,
    speed: 3,
    range: 1,
    initiative: 60,
    order: ORDER_BRUTE_NAME,
    origins: [],
    ability: "dragonExhale",
  },
];

export const MOCK_ABILITY_PROFILE: AbilityProfileType[] = [
  {
    ability_name: "dragonExhale",
    requiredMana: 100,
  },
];

export const MOCK_INIT_ENTITY: BaseStateType[] = [
  {
    id: "1001",
    initX: 1,
    initY: 1,
    isHome: true,
    creatureId: "001",
    level: 1,
  },
  {
    id: "1002",
    initX: 1,
    initY: 1,
    isHome: true,
    creatureId: "001",
    level: 1,
  },
  {
    id: "2001",
    initX: 1,
    initY: 7,
    isHome: false,
    creatureId: "002",
    level: 1,
  },
];

test("test progress", async () => {
  const { calculateBattleLogs, getEmittedEvents } = await createSimulator(
    MOCK_CREATURES,
    MOCK_INIT_ENTITY,
    MOCK_ABILITY_PROFILE
  );

  const { result } = await calculateBattleLogs();

  console.log("logs: ", result);

  const allEvents = getEmittedEvents();
  console.log("allEvents: ", allEvents);
});
