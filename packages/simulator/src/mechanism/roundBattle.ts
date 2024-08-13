import { logJps } from "../debug";
import { getBattleResult, isBattleEnd } from "../utils/dbHelper";
import { getAllUndeadPiecesByInitiative } from "./actLev";

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

  for (let i = 1; i <= 500; i++) {
    await generateActionOrderStack();
    await globalThis.Simulator.eventSystem.emit("turnStart", { turn: i });
    await pieceActionOnceInATurn(i);

    if (await isBattleEnd()) {
      logJps("battle end");
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

async function generateActionOrderStack() {
  const undeadPieces = await getAllUndeadPiecesByInitiative();

  // remove old value
  await globalThis.Simulator.db.action_order_stack.find({}).remove();

  await globalThis.Simulator.db.action_order_stack.bulkInsert(
    undeadPieces.map((p) => {
      return { piece_id: p.entity, initiative: p.initiative };
    })
  );
}

async function pieceActionOnceInATurn(turn: number) {
  const query = globalThis.Simulator.db.action_order_stack.findOne({
    sort: [{ initiative: "desc" }],
  });

  const piece = await query.exec();
  if (piece) {
    await globalThis.Simulator.eventSystem.emit("beforePieceAction", {
      pieceId: piece?.piece_id,
      initiative: piece.initiative,
    });
    // remove the stack after exec
    await query.remove();

    // recursive run
    await pieceActionOnceInATurn(turn);
  } else {
    await globalThis.Simulator.eventSystem.emit("turnEnd", { turn });
  }
}
