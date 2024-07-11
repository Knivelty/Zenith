import { asyncMap } from "../utils/asyncHelper";
import { getPlayerProfileBySide } from "../utils/dbHelper";
import { getAllPieceWithOrigin, getValidTraitCount } from "./utils";

export const ORDER_CUNNING_NAME = "Cunning";

export const COIN_REWARD: Record<number, number> = {
  0: 0,
  1: 0,
  2: 0,
  3: 1,
  4: 1,
  5: 2,
  6: 2,
  7: 3,
  8: 3,
  9: 3,
};

export const EXP_REWARD: Record<number, number> = {
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 1,
  6: 1,
  7: 1,
  8: 1,
  9: 1,
};

export const HEALTH_PUNISH: Record<number, number> = {
  0: 0,
  1: 0,
  2: 0,
  3: -2,
  4: -2,
  5: -4,
  6: -4,
  7: -6,
  8: -6,
  9: -6,
};

export const HEALTH_REWARD: Record<number, number> = {
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 4,
  8: 4,
  9: 4,
};

export async function applyCunningSynergy(isHome: boolean) {
  await addAttackBonus(isHome);
  await addExtraRaP(isHome);
}

async function addExtraRaP(isHome: boolean) {
  const eventSystem = globalThis.Simulator.eventSystem;
  const allCunningPieces = await getAllPieceWithOrigin(
    isHome,
    ORDER_CUNNING_NAME
  );

  const validCount = getValidTraitCount(allCunningPieces);

  const coinReward = COIN_REWARD[validCount];
  const expReward = EXP_REWARD[validCount];
  const healthReward = HEALTH_REWARD[validCount];

  const healthPunish = HEALTH_PUNISH[validCount];

  eventSystem.on("battleEnd", async ({ doHomeWin }) => {
    if (doHomeWin) {
      await eventSystem.emit("playerCoinDiff", {
        isHome: true,
        value: coinReward,
      });
      await eventSystem.emit("playerExpDiff", {
        isHome: true,
        value: expReward,
      });
      await eventSystem.emit("playerHealthDiff", {
        isHome: true,
        value: healthReward,
      });
    } else {
      await eventSystem.emit("playerHealthDiff", {
        isHome: true,
        value: healthPunish,
      });
    }
  });
}

async function addAttackBonus(isHome: boolean) {
  const db = globalThis.Simulator.db;
  const playerProfile = await getPlayerProfileBySide(isHome);

  const attackBonus = playerProfile.coin / 100;

  const allCunningPieces = await getAllPieceWithOrigin(
    isHome,
    ORDER_CUNNING_NAME
  );

  await asyncMap(allCunningPieces, async (p) => {
    await db.piece_attack
      .find({
        selector: {
          entity: p.entity,
        },
      })
      .update({
        $inc: {
          times: attackBonus,
        },
      });
  });
}
