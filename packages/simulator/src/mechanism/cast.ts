import { AbilityNameType } from "../ability/interface";
import { logDebug } from "../debug";
import { EventMap } from "../event/createEventSystem";
import { getBattlePiece, getPieceAbilityProfile } from "../utils/dbHelper";

export function getPieceTryCastHandler(actionPieceId: string) {
  const handlerMap = globalThis.Simulator.handlerMap;
  const key = `pieceCast-${actionPieceId}`;
  if (!handlerMap.has(key)) {
    const handler = async ({ actionPieceId }: EventMap["tryCast"]) => {
      const actionPiece = await getBattlePiece(actionPieceId);
      const abilityProfile = await getPieceAbilityProfile(actionPieceId);

      if (!abilityProfile) {
        logDebug(`piece ${actionPieceId} no ability`);
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
  globalThis.Simulator.eventSystem.on("tryCast", async ({ actionPieceId }) => {
    await getPieceTryCastHandler(actionPieceId)({ actionPieceId });
  });
}
