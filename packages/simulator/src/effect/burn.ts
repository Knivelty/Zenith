import { logEffect } from "../debug";
import { EventMap } from "../event/createEventSystem";
import { spellAttack } from "../mechanism/spell";
import { decreaseHealth } from "../utils/dbHelper";
import { EffectMap } from "./createEffectSystem";
import { overrideEffectToPiece } from "./utils";

/**
 * @note use a global map to confirm to get the same handler
 */
function getHandler(actionPieceId: string, stack: number) {
  const handlerMap = globalThis.Simulator.handlerMap;
  // TODO: perf key design
  const key = `${actionPieceId}-${stack}`;
  if (!handlerMap.has(key)) {
    const handler = async ({ pieceId }: EventMap["beforePieceAction"]) => {
      if (actionPieceId === pieceId) {
        logEffect("Burn")(
          `piece ${pieceId} get ${stack} damage from effect burn`
        );
        await decreaseHealth(actionPieceId, stack);
        await overrideEffectToPiece(
          actionPieceId,
          "Burn",
          Math.floor(stack / 2),
          999
        );
      }
    };
    handlerMap.set(key, handler);
  }

  return handlerMap.get(key)!;
}

export async function onBurnActive({ pieceId, stack }: EffectMap["Burn"]) {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on("beforePieceAction", getHandler(pieceId, stack));

  logEffect("Burn")(`active stack ${stack} burn on piece ${pieceId} `);
}

export async function onBurnDeActive({ pieceId, stack }: EffectMap["Burn"]) {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.off("beforePieceAction", getHandler(pieceId, stack));

  logEffect("Burn")(`deActive stack ${stack} burn on piece ${pieceId} `);
}
