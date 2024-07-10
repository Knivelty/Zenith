import { EventMap } from "../event/createEventSystem";
import { getPieceSearchAttackTargetHandler } from "../mechanism/enemySearch";
import { getBattlePiece } from "../utils/dbHelper";
import { EffectHandler } from "./interface";

function getHandler(affectedPieceId: string) {
  const handlerMap = globalThis.Simulator.handlerMap;
  // TODO: perf key design
  const key = `taunt-${affectedPieceId}`;
  if (!handlerMap.has(key)) {
    const handler = async ({
      actionPieceId,
    }: EventMap["beforePieceSearchAttackTarget"]) => {
      const actionPiece = await getBattlePiece(actionPieceId);
      const affectedPiece = await getBattlePiece(actionPieceId);
      const originHandler = getPieceSearchAttackTargetHandler();

      if (actionPiece.isHome === affectedPiece.isHome) {
        await originHandler({ actionPieceId });
      } else {
        await globalThis.Simulator.eventSystem.emit(
          "afterPieceSearchAttackTarget",
          { actionPieceId, targetPieceId: affectedPieceId }
        );
      }
    };
    handlerMap.set(key, handler);
  }

  return handlerMap.get(key)!;
}

export const onEffectTauntChange: EffectHandler<"Taunt"> = async ({
  preValue,
  value,
}) => {
  // nothing happen on shield change

  const originHandler = getPieceSearchAttackTargetHandler();
  const handler = getHandler(value.pieceId);


  // active
  if (preValue.stack === 0 && value.stack !== 0) {
    globalThis.Simulator.eventSystem.off(
      "beforePieceSearchAttackTarget",
      originHandler
    );
    globalThis.Simulator.eventSystem.on(
      "beforePieceSearchAttackTarget",
      handler
    );
  }


  // de active
  if (preValue.stack !== 0 && value.stack === 0) {
    globalThis.Simulator.eventSystem.on(
      "beforePieceSearchAttackTarget",
      originHandler
    );
    globalThis.Simulator.eventSystem.off(
      "beforePieceSearchAttackTarget",
      handler
    );
  }
};
