import { logEffect } from "../debug";
import { EventMap } from "../event/createEventSystem";
import { getPieceEffectProfile } from "../utils/dbHelper";
import { EffectHandler } from "./interface";

/**
 * @note use a global map to confirm to get the same handler
 */
function getHandler(actionPieceId: string) {
  const handlerMap = globalThis.Simulator.handlerMap;
  // TODO: perf key design
  const key = `shieldRevenge-${actionPieceId}`;
  if (!handlerMap.has(key)) {
    const handler = async ({
      pieceId,
      targetPieceId,
    }: EventMap["afterPieceAttack"]) => {
      if (targetPieceId === pieceId) {
        logEffect("ShieldRevenge")(`piece ${pieceId} revenge`);

        const shieldEffect = await getPieceEffectProfile(
          targetPieceId,
          "Shield"
        );

        const damage = Math.floor(shieldEffect?.stack ?? 0 ** 0.15);

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
    globalThis.Simulator.eventSystem.on(
      "afterPieceAttack",
      getHandler(value.pieceId)
    );
  }

  if (value.stack === 0 && preValue.stack !== 0) {
    globalThis.Simulator.eventSystem.off(
      "afterPieceAttack",
      getHandler(value.pieceId)
    );
  }
};
