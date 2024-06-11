import { DB } from "../createDB";
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
  logs: TurnLog[];
  result: { win?: boolean; healthDecrease?: number };
};

/**
 * @param pieces
 * @returns
 */
export async function calculateBattleLogs(db: DB): Promise<BattleResult> {
  // logJps(`initial piece status: `, pieces);

  const pieceActions = new Array<TurnLog>();
  for (let i = 0; i < 500; i++) {
    const logs = await battleForATurn(db);

    pieceActions.push(...logs);
    if (await isBattleEnd(db)) {
      logJps("turn end");
      break;
    } else {
      logJps("next turn");
    }
  }
  const result = await getBattleResult(db);
  return {
    logs: pieceActions,
    result: { win: result.win, healthDecrease: result.healthDecrease },
  };
}

export async function battleForATurn(db: DB): Promise<TurnLog[]> {
  const undeadPieceIds = await getAllUndeadPieceIdsByInitiative(db);

  const actions: Array<TurnLog> = [];

  for (const p of undeadPieceIds) {
    const l = await battleForOnePieceOneTurn(db, p);
    if (l) {
      actions.push(l);
    }
  }

  return actions;
}
