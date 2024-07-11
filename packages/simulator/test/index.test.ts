import { BaseStateType } from "../src";
import { createSimulator } from "../src/createSimulator";
import { AbilityProfileType } from "../src/schema/ability_profile";
import { CreatureType } from "../src/schema/creature";
import { ORDER_BRUTE_NAME } from "../src/synergy/brute";
import { ORDER_HUNTER_NAME } from "../src/synergy/hunter";
import { ORIGIN_DARK_NAME } from "../src/synergy/dark";
import { ORIGIN_LIGHT_NAME } from "../src/synergy/light";
import { PlayerProfileType } from "../src/schema/player_profile";

export const MOCK_CREATURES: CreatureType[] = [
  {
    creature_idx: 1,
    level: 1,
    health: 2000,
    maxMana: 90,
    attack: 60,
    armor: 20,
    speed: 3,
    range: 1,
    initiative: 90,
    order: ORDER_HUNTER_NAME,
    origins: [ORIGIN_LIGHT_NAME, ORIGIN_DARK_NAME],
    ability: "burningBurst",
  },
  {
    creature_idx: 2,
    level: 1,
    health: 2000,
    maxMana: 100,
    attack: 60,
    armor: 20,
    speed: 3,
    range: 1,
    initiative: 90,
    order: ORDER_HUNTER_NAME,
    origins: [ORIGIN_LIGHT_NAME, ORIGIN_DARK_NAME],
    ability: "mountainCollapse",
  },
  {
    creature_idx: 3,
    level: 1,
    health: 2000,
    maxMana: 80,
    attack: 60,
    armor: 20,
    speed: 3,
    range: 1,
    initiative: 60,
    order: ORDER_BRUTE_NAME,
    origins: [],
    ability: "barbariansRage",
  },
];

export const MOCK_ABILITY_PROFILE: AbilityProfileType[] = [
  {
    ability_name: "burningBurst",
    requiredMana: 90,
  },
  {
    ability_name: "barbariansRage",
    requiredMana: 90,
  },
  {
    ability_name: "mountainCollapse",
    requiredMana: 100,
  },
];

export const MOCK_INIT_ENTITY: BaseStateType[] = [
  {
    entity: "1001",
    initX: 1,
    initY: 1,
    isHome: true,
    creature_idx: 1,
    level: 1,
  },
  {
    entity: "1002",
    initX: 1,
    initY: 3,
    isHome: true,
    creature_idx: 2,
    level: 1,
  },
  {
    entity: "2001",
    initX: 1,
    initY: 7,
    isHome: false,
    creature_idx: 3,
    level: 1,
  },
];

export const MOCK_PLAYER_PROFILE: PlayerProfileType[] = [
  { isHome: true, address: "1", coin: 1 },
  { isHome: false, address: "2", coin: 1 },
];

test("test progress", async () => {
  const { calculateBattleLogs, getEmittedEvents } = await createSimulator({
    creatures: MOCK_CREATURES,
    initEntities: MOCK_INIT_ENTITY,
    ability_profiles: MOCK_ABILITY_PROFILE,
    allPlayerProfiles: MOCK_PLAYER_PROFILE,
  });

  const { result } = await calculateBattleLogs();

  console.log("logs: ", result);

  const allEvents = getEmittedEvents();
  console.log("allEvents: ", allEvents);
});
