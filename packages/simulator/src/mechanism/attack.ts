import { logAttack, logJps } from "../debug";
import { EventMap } from "../event/createEventSystem";
import { getBattlePiece } from "../utils/dbHelper";
import { manhattanDistance } from "./distance";

export async function tryAttack({ actionPieceId }: EventMap["pieceNotCast"]) {
  await globalThis.Simulator.eventSystem.emit("beforePieceAttack", {
    actionPieceId: actionPieceId,
  });

  await globalThis.Simulator.eventSystem.emit("afterPieceBasicAttack", {
    actionPieceId,
  });
}

export function registerTryAttack() {
  // piece will try attack on not cast
  globalThis.Simulator.eventSystem.on("pieceNotCast", tryAttack);

  globalThis.Simulator.eventSystem.on(
    "beforePieceAttack",
    async ({ actionPieceId }) => {
      const eventSystem = globalThis.Simulator.eventSystem;

      await eventSystem.emit("beforePieceSearchAttackTarget", {
        actionPieceId,
      });
    }
  );
}

export function registerExecuteAttack() {
  globalThis.Simulator.eventSystem.on(
    "afterPieceSearchAttackTarget",
    async ({ actionPieceId, targetPieceId }) => {
      const actionPiece = await getBattlePiece(actionPieceId);

      if (!targetPieceId) {
        return;
      }

      const targetPiece = await getBattlePiece(targetPieceId);

      // judge wether can attack
      if (
        manhattanDistance(
          actionPiece.x,
          actionPiece.y,
          targetPiece.x,
          targetPiece.y
        ) <= actionPiece.range
      ) {
        logAttack(
          `piece ${actionPieceId} attack ${targetPieceId} with attack ${actionPiece.attack}`
        );

        await emitAttack(actionPieceId, targetPieceId);

        await globalThis.Simulator.eventSystem.emit("damage", {
          pieceId: actionPieceId,
          targetPieceId: targetPieceId,
          value: actionPiece.attack,
          type: "Physical",
        });
      } else {
        logJps("cannot attack due to range");
      }
    }
  );
}

export async function emitAttack(pieceId: string, targetPieceId: string) {
  const eventSystem = globalThis.Simulator.eventSystem;
  await eventSystem.emit("pieceAttack", {
    pieceId: pieceId,
    targetPieceId: targetPieceId,
  });

  await eventSystem.emit("afterPieceAttack", {
    pieceId: pieceId,
    targetPieceId: targetPieceId,
  });
}
