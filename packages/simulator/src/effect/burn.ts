import { logEffect } from "../debug";
import { EventMap } from "../event/createEventSystem";
import { EffectHandler, EffectMap } from "./interface";
import { overrideEffectToPiece } from "./utils";

/**
 * @note use a global map to confirm to get the same handler
 */
function getHandler(actionPieceId: string, stack: number) {
  const handlerMap = globalThis.Simulator.handlerMap;
  // TODO: perf key design
  const key = `burnHandler-${actionPieceId}-${stack}`;
  if (!handlerMap.has(key)) {
    const handler = async ({ pieceId }: EventMap["beforePieceAction"]) => {
      if (actionPieceId === pieceId) {
        logEffect("Burn")(
          `piece ${pieceId} get ${stack} damage from effect burn`
        );
        await globalThis.Simulator.eventSystem.emit("damage", {
          // TODO: add damage source
          pieceId: "0",
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
  await onBurnActive(preValue);
};

async function onBurnActive({ pieceId, stack }: EffectMap["Burn"]) {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on("beforePieceAction", getHandler(pieceId, stack));
}

async function onBurnDeActive({ pieceId, stack }: EffectMap["Burn"]) {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.off("beforePieceAction", getHandler(pieceId, stack));
}
