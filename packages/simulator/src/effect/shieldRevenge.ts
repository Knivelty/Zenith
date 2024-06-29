import { logEffect } from "../debug";
import { EventMap } from "../event/createEventSystem";
import { getPieceEffectProfile } from "../utils/dbHelper";
import { EffectHandler } from "./interface";

/**
 * @note use a global map to confirm to get the same handler
 */
function getHandler(affectedPieceId: string) {
  const handlerMap = globalThis.Simulator.handlerMap;
  // TODO: perf key design
  const key = `shieldRevenge-${affectedPieceId}`;
  if (!handlerMap.has(key)) {
    const handler = async ({ pieceId, targetPieceId }: EventMap["damage"]) => {
      if (targetPieceId === affectedPieceId) {
        logEffect("ShieldRevenge")(`piece ${affectedPieceId} revenge`);

        const shieldEffect = await getPieceEffectProfile(
          targetPieceId,
          "Shield"
        );

        const damage = Math.floor(
          shieldEffect?.stack ? shieldEffect?.stack * 0.15 : 0
        );

        await globalThis.Simulator.eventSystem.emit("damage", {
          pieceId: targetPieceId,
          targetPieceId: pieceId,
          value: damage,
          type: "Magical",
        });
      }
    };
    handlerMap.set(key, handler);
  }

  return handlerMap.get(key)!;
}

export const onEffectShieldRevengeChange: EffectHandler<
  "ShieldRevenge"
> = async ({ preValue, value }) => {
  // nothing happen on shield change

  if (preValue.stack === value.stack) {
    return;
  }

  if (value.stack !== 0 && preValue.stack === 0) {
    globalThis.Simulator.eventSystem.on("damage", getHandler(value.pieceId));
  }

  if (value.stack === 0 && preValue.stack !== 0) {
    globalThis.Simulator.eventSystem.off("damage", getHandler(value.pieceId));
  }
};
