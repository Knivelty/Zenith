import { getBattleResult, isBattleEnd } from "../utils/dbHelper";
import { logJps } from "../utils/logger";
import { getAllUndeadPieceIdsByInitiative } from "./actLev";
import { battleForOnePieceOneTurn } from "./oneAction";

export type TurnLog = {
  entity: string;
  paths: { x: number; y: number }[] | undefined;
  attackPiece: string | undefined;
};

export type BattleResult = {
  result: { win?: boolean; healthDecrease?: number };
};

/**
 * @param pieces
 * @returns
 */
export async function calculateBattleLogs(): Promise<BattleResult> {
  const eventSystem = globalThis.Simulator.eventSystem;

  await eventSystem.emit("beforeBattleStart", { isHome: true });
  await eventSystem.emit("beforeBattleStart", { isHome: false });

  for (let i = 0; i < 500; i++) {
    await battleForATurn();

    if (await isBattleEnd()) {
      logJps("turn end");
      break;
    } else {
      logJps("next turn");
    }
  }
  const result = await getBattleResult();
  return {
    result: { win: result.win, healthDecrease: result.healthDecrease },
  };
}

export async function battleForATurn() {
  const undeadPieceIds = await getAllUndeadPieceIdsByInitiative();

  for (const p of undeadPieceIds) {
    await battleForOnePieceOneTurn(p);
  }
}
