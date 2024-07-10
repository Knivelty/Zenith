import { getBattlePiece, isBattleEnd } from "../utils/dbHelper";
import { findPath } from "./pathFind";
import { executeMove } from "./executeMove";

export async function registerPieceStartAction() {
  globalThis.Simulator.eventSystem.on(
    "beforePieceAction",
    async ({ pieceId, initiative }) => {
      await pieceStartAction(pieceId);

      await globalThis.Simulator.eventSystem.emit("afterPieceAction", {
        pieceId,
        initiative,
      });
    }
  );
}

async function pieceStartAction(actionPieceId: string) {
  const pieceBattle = await getBattlePiece(actionPieceId);
  // if this piece dead or battle end, skip
  if (pieceBattle.dead || (await isBattleEnd())) {
    return;
  }

  await globalThis.Simulator.eventSystem.emit("beforePieceSearchMoveTarget", {
    actionPieceId,
  });
}

export function registerPieceMove() {
  globalThis.Simulator.eventSystem.on(
    "afterPieceSearchMoveTarget",
    async ({ actionPieceId, targetPieceId }) => {
      if (!targetPieceId) {
        // no target piece means all enemy's piece are dead the same as battle end
        return;
      }

      const actPath = await findPath(actionPieceId, targetPieceId);
      await executeMove(actionPieceId, actPath);

      await globalThis.Simulator.eventSystem.emit("tryCast", {
        actionPieceId: actionPieceId,
      });
    }
  );
}
