import { logEffect } from "../debug";
import { EventMap } from "../event/createEventSystem";
import { getPieceEffectProfile } from "../utils/dbHelper";
import { EffectHandler, EffectMap } from "./interface";
import { overrideEffectToPiece } from "./utils";

/**
 * @note use a global map to confirm to get the same handler
 */
function getHandler(actionPieceId: string) {
  const handlerMap = globalThis.Simulator.handlerMap;
  // TODO: perf key design
  const key = `burnHandler-${actionPieceId}`;
  if (!handlerMap.has(key)) {
    const handler = async ({ pieceId }: EventMap["beforePieceAction"]) => {
      if (actionPieceId === pieceId) {
        const pieceBurnEffect = await getPieceEffectProfile(pieceId, "Burn");
        logEffect("Burn")(
          `piece ${pieceId} get ${pieceBurnEffect?.stack} damage from effect burn`
        );
        const stack = pieceBurnEffect?.stack ?? 0;
        await globalThis.Simulator.eventSystem.emit("damage", {
          // TODO: add damage source
          sourcePieceId: "0",
          targetPieceId: pieceId,
          value: stack,
          type: "Magical",
        });
        await overrideEffectToPiece({
          pieceId: actionPieceId,
          effectName: "Burn",
          stack: Math.floor(stack / 2),
          duration: 999,
        });
      }
    };
    handlerMap.set(key, handler);
  }

  return handlerMap.get(key)!;
}

export const onEffectBurnChange: EffectHandler<"Burn"> = async ({
  preValue,
  value,
}) => {
  await onBurnDeActive(preValue);
  await onBurnActive(value);
};

async function onBurnActive({ pieceId, stack }: EffectMap["Burn"]) {
  if (!stack) {
    return;
  }

  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on("beforePieceAction", getHandler(pieceId), 10);
}

async function onBurnDeActive({ pieceId, stack }: EffectMap["Burn"]) {
  if (!stack) {
    return;
  }

  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.off("beforePieceAction", getHandler(pieceId));
}
