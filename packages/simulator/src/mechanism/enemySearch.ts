import { logDebug } from "../debug";
import { EventMap } from "../event/createEventSystem";
import {
  getHomeUndeadPieceIds,
  getBattlePiece,
  getAwayUndeadPieceIds,
} from "../utils/dbHelper";
import { manhattanDistance } from "./distance";

export async function registerPieceSearchMoveTarget() {
  globalThis.Simulator.eventSystem.on(
    "beforePieceSearchMoveTarget",
    getPieceSearchMoveTargetHandler()
  );
}

export async function registerPieceSearchAttackTarget() {
  globalThis.Simulator.eventSystem.on(
    "beforePieceSearchAttackTarget",
    getPieceSearchAttackTargetHandler()
  );
}

function getPieceSearchMoveTargetHandler() {
  const handlerMap = globalThis.Simulator.handlerMap;
  // TODO: perf key design
  const key = `findMoveTarget`;

  if (!handlerMap.has(key)) {
    const handler = async ({
      actionPieceId,
    }: EventMap["beforePieceSearchMoveTarget"]) => {
      const targetPieceId = await findTargetPiece(actionPieceId);
      if (targetPieceId) {
        await globalThis.Simulator.eventSystem.emit(
          "afterPieceSearchMoveTarget",
          { actionPieceId, targetPieceId }
        );
      }
    };

    handlerMap.set(key, handler);
  }

  return handlerMap.get(key)!;
}

export function getPieceSearchAttackTargetHandler() {
  const handlerMap = globalThis.Simulator.handlerMap;
  // TODO: perf key design
  const key = `findAttackTarget`;

  if (!handlerMap.has(key)) {
    const handler = async ({
      actionPieceId,
    }: EventMap["beforePieceSearchAttackTarget"]) => {
      const targetPieceId = await findTargetPiece(actionPieceId);
      if (targetPieceId) {
        await globalThis.Simulator.eventSystem.emit(
          "afterPieceSearchAttackTarget",
          { actionPieceId, targetPieceId }
        );
      }
    };

    handlerMap.set(key, handler);
  }

  return handlerMap.get(key)!;
}

export async function findTargetPiece(
  actionPieceId: string
): Promise<string | undefined> {
  const actionPieceBattle = await getBattlePiece(actionPieceId);

  if (!actionPieceBattle) {
    throw Error("unknown piece gid");
  }

  // tgtSet = target set
  let tgtSet: Awaited<ReturnType<typeof getHomeUndeadPieceIds>>;

  if (actionPieceBattle.isHome) {
    tgtSet = await getAwayUndeadPieceIds();
  } else {
    tgtSet = await getHomeUndeadPieceIds();
  }

  logDebug(`piece ${actionPieceId}'s target set: `, tgtSet);

  // get nearest piece
  const pieceWithDistance = await Promise.all(
    tgtSet.map(async (opp) => {
      const p = await getBattlePiece(opp.entity);

      return {
        id: opp.entity,
        distance: manhattanDistance(
          actionPieceBattle?.x,
          actionPieceBattle?.y,
          p.x,
          p.y
        ),
      };
    })
  );

  return pieceWithDistance?.[0].id;
}
