import {
  Grid,
  JumpPointFinder,
  JPFNeverMoveDiagonally,
  DiagonalMovement,
} from "pathfinding";
import { uniqWith } from "lodash";
import { logJps } from "./utils/logger";
import { manhattanDistance } from "./utils";
import { DB } from "./createDB";
import {
  decreaseHealth,
  getAimedPiece,
  getAllUndeadPieceIds,
  getBattlePiece,
  getBattleResult,
  getInitPiece,
  getPieceCreature,
  isBattleEnd,
  movePiece,
} from "./utils/dbHelper";

export type TurnLogs = {
  entity: string;
  paths: { x: number; y: number }[] | undefined;
  attackPiece: string | undefined;
};

export type BattleResult = {
  logs: TurnLogs[];
  result: { win?: boolean; healthDecrease?: number };
};

/**
 * @param pieces
 * @returns
 */
export async function calculateBattleLogs(db: DB): Promise<BattleResult> {
  // logJps(`initial piece status: `, pieces);

  const pieceActions = new Array<TurnLogs>();
  for (let i = 0; i < 500; i++) {
    const logs = await battleForATurn(db);

    pieceActions.push(...logs);
    if (await isBattleEnd(db)) {
      logJps("turn end");
      break;
    } else {
      logJps("next turn");
    }
  }
  const result = await getBattleResult(db);
  return {
    logs: pieceActions,
    result: { win: result.win, healthDecrease: result.healthDecrease },
  };
}

function getFarthestAttackablePoint(x: number, y: number, k: number) {
  const rawPoints: { x: number; y: number }[] = [];
  for (let i = -k; i <= k; i++) {
    const fromX = x + i;
    const fromY1 = y + k - Math.abs(i);
    const fromY2 = y - (k - Math.abs(i));

    rawPoints.push({ x: fromX, y: fromY1 });

    rawPoints.push({ x: fromX, y: fromY2 });
  }

  // Narrow the boundary
  const points = rawPoints.map((point) => {
    point.x = Math.min(7, point.x);
    point.x = Math.max(0, point.x);

    point.y = Math.min(7, point.y);
    point.y = Math.max(0, point.y);

    return point;
  });

  // filter the duplicated element
  const uniqPoints = uniqWith(points, (a, b) => {
    return a.x === b.x && a.y === b.y;
  });

  return uniqPoints;
}

export function getTargetPoint(
  grid: Grid,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  range: number
) {
  if (manhattanDistance(fromX, fromY, toX, toY) <= range) {
    return { x: undefined, y: undefined, needMove: false };
  }

  // get attachable point
  const attackablePoint = getFarthestAttackablePoint(toX, toY, range);

  // console.log("attackablePoint: ", attackablePoint);

  // filter not walkable
  // TODO: add more method to judge whether is walkable
  const walkablePoints = attackablePoint.filter((v) => {
    return grid.getNodeAt(v.x, v.y).walkable;
  });

  // console.log("walkablePoints: ", walkablePoints);

  // get nearest point
  const nearestPoint = walkablePoints
    .map((v) => {
      const dis = manhattanDistance(v.x, v.y, fromX, fromY);

      return { x: v.x, y: v.y, dis };
    })
    .sort((a, b) => {
      return a.dis - b.dis;
    })[0];

  // console.log("nearestPoint: ", nearestPoint);

  return { x: nearestPoint.x, y: nearestPoint.y, needMove: true };
}

function findDoablePath(
  grid: Grid,
  finder: JPFNeverMoveDiagonally,
  speed: number,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
) {
  // calculate path
  const paths = finder.findPath(fromX, fromY, toX, toY, grid);

  // console.log("paths: ", paths);

  // calculate doable path
  let totalDistance = 0;
  const doablePath: { x: number; y: number }[] = [];

  // it means no paths to go, just return
  if (!paths?.[0]?.[0]) {
    return;
  }

  doablePath.push({ x: paths[0][0], y: paths[0][1] });
  // get doable path
  for (let index = 0; index < paths.length - 1; index++) {
    const current = paths[index];
    let next = paths[index + 1];
    const dis = manhattanDistance(current[0], current[1], next[0], next[1]);

    if (dis + totalDistance <= speed) {
      totalDistance += dis;
      doablePath.push({ x: next[0], y: next[1] });
    } else {
      const diff = speed - totalDistance;

      if (diff === 0) {
        break;
      }

      if (current[0] === next[1]) {
        next = [next[0], current[1] + diff];
      } else {
        next = [current[0] + diff, current[1]];
      }

      doablePath.push({ x: next[0], y: next[1] });

      break;
    }
  }

  return doablePath;
}

export async function tryAttack(
  db: DB,
  actionPieceId: string,
  targetPieceId: string
): Promise<string | undefined> {
  const actionPiece = await getBattlePiece(db, actionPieceId);
  const actionPieceCreature = await getPieceCreature(db, actionPieceId);
  const targetPiece = await getBattlePiece(db, targetPieceId);
  const targetPieceCreature = await getPieceCreature(db, targetPieceId);

  // judge wether can attack
  if (
    manhattanDistance(
      actionPiece.x,
      actionPiece.y,
      targetPiece.x,
      targetPiece.y
    ) <= actionPieceCreature.range
  ) {
    const damage =
      actionPieceCreature.attack *
      (1 - targetPieceCreature.armor / (100 + targetPieceCreature.armor));

    await decreaseHealth(db, targetPieceId, damage);

    console.log(
      `piece ${actionPieceId} attack ${targetPieceId} with damage ${damage}`
    );

    return targetPieceId;
  } else {
    logJps("cannot attack due to range");
  }
}

export async function battleForATurn(db: DB): Promise<TurnLogs[]> {
  const undeadPieceIds = await getAllUndeadPieceIds(db);

  const actions: Array<TurnLogs> = [];

  for (const p of undeadPieceIds) {
    const l = await battleForOnePieceOneTurn(db, p);
    if (l) {
      actions.push(l);
    }
  }

  return actions;
}

export async function battleForOnePieceOneTurn(
  db: DB,
  pieceId: string
): Promise<TurnLogs | undefined> {
  const pieceBattle = await getBattlePiece(db, pieceId);
  const pieceInit = await getInitPiece(db, pieceId);
  const pieceCreature = await getPieceCreature(db, pieceId);

  // if this piece dead, skip
  if (pieceBattle.dead || (await isBattleEnd(db))) {
    return;
  }

  // get aimed piece
  const targetPieceId = await getAimedPiece(db, pieceId);

  if (!targetPieceId) {
    // no target piece means all enemy's piece are dead
    return;
  }

  const targetPieceInBattle = await getBattlePiece(db, targetPieceId);

  const grid = new Grid(8, 8);

  const undeadPiece = await getAllUndeadPieceIds(db);

  // console.log("undeadPiece: ", undeadPiece);

  // fill the map
  undeadPiece?.forEach(async (pp: string) => {
    if (pp === pieceId) {
      return;
    }
    const p = await getBattlePiece(db, pp);
    logJps(`try set ${p.x} ${p.y} as un walkable`, pp);
    grid.setWalkableAt(p.x, p.y, false);
  });

  const finder = JumpPointFinder({
    diagonalMovement: DiagonalMovement.Never,
  });

  const targetPoint = getTargetPoint(
    grid,
    pieceBattle.x,
    pieceBattle.y,
    targetPieceInBattle.x,
    targetPieceInBattle.y,
    pieceCreature.range
  );

  logJps(
    `getTargetPoint: piece in ${pieceBattle.x} ${pieceBattle.y} aiming ${targetPieceInBattle.x} ${targetPieceInBattle.y} target to ${targetPoint.x} ${targetPoint.y}`
  );

  let doablePath: { x: number; y: number }[] | undefined = [];

  if (targetPoint.x) {
    // calculate target point
    doablePath = findDoablePath(
      grid,
      finder,
      pieceCreature.speed,
      pieceBattle.x,
      pieceBattle.y,
      targetPoint.x,
      targetPoint.y
    );

    if (!doablePath) {
      logJps(
        `piece ${pieceId} cannot move and stay at ${pieceBattle.x},${pieceBattle.y}`
      );
    } else {
      const toX = doablePath[doablePath.length - 1].x;
      const toY = doablePath[doablePath.length - 1].y;

      await movePiece(db, pieceId, toX, toY);

      logJps(
        `piece ${pieceId} move from ${doablePath[0].x},${doablePath[0].y} to ${toX},${toY}`
      );
    }
  }

  const attackedEntity = await tryAttack(db, pieceId, targetPieceId);

  return {
    // order increase one   by one
    entity: pieceId,
    paths: doablePath,
    attackPiece: attackedEntity,
  };
}
