import { AbilityNameType } from "../ability/interface";
import { logDebug } from "../debug";
import { EventMap } from "../event/createEventSystem";
import { getAllUndeadPieceIds, getBattlePiece, getPieceAbilityProfile } from "../utils/dbHelper";

export function getPieceTryCastHandler(pieceId: string) {
  const handlerMap = globalThis.Simulator.handlerMap;
  const key = `pieceCast-${pieceId}`;
  if (!handlerMap.has(key)) {
    const handler = async ({ actionPieceId }: EventMap["tryCast"]) => {
      // filter here
      if (actionPieceId !== pieceId) {
        return;
      }

      const actionPiece = await getBattlePiece(actionPieceId);
      const abilityProfile = await getPieceAbilityProfile(actionPieceId);

      if (!abilityProfile) {
        logDebug(`piece ${actionPieceId} no ability`);
        await globalThis.Simulator.eventSystem.emit("pieceNotCast", {
          actionPieceId,
        });
        return;
      }

      if (actionPiece.mana >= actionPiece.maxMana) {
        // emit use mana event
        await globalThis.Simulator.eventSystem.emit("pieceUseMana", {
          pieceId: actionPieceId,
          manaAmount: actionPiece.mana,
        });

        // emit event to trigger cast
        await globalThis.Simulator.eventSystem.emit("beforeAbilityCast", {
          // warn: assert type here
          abilityName: actionPiece.ability as AbilityNameType,
          data: { actionPieceId: actionPieceId },
        });
      } else {
        await globalThis.Simulator.eventSystem.emit("pieceNotCast", {
          actionPieceId,
        });
      }
    };
    handlerMap.set(key, handler);
  }

  return handlerMap.get(key)!;
}

export async function registerTryCast() {
  const allPieceIds = await getAllUndeadPieceIds();
  allPieceIds.map((pieceId) => {
    globalThis.Simulator.eventSystem.on("tryCast", getPieceTryCastHandler(pieceId));
  });
}
