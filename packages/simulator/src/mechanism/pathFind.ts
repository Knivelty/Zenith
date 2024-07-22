import {
  DiagonalMovement,
  Grid,
  JPFNeverMoveDiagonally,
  JumpPointFinder,
} from "pathfinding";
import { getAllUndeadPieceIds, getBattlePiece } from "../utils/dbHelper";
import { manhattanDistance } from "./distance";
import { uniqWith } from "lodash";
import { asyncMap } from "../utils/asyncHelper";
import { logDebug, logJps } from "../debug";

export async function findPath(actionPieceId: string, targetPieceId: string) {
  const actionPieceInBattle = await getBattlePiece(actionPieceId);

  const targetPieceInBattle = await getBattlePiece(targetPieceId);

  const grid = new Grid(8, 8);

  const undeadPieceIds = await getAllUndeadPieceIds();

  // fill the map
  await asyncMap(undeadPieceIds, async (pid: string) => {
    if (pid === actionPieceId) {
      return;
    }
    const p = await getBattlePiece(pid);
    logJps(`try set ${p.x} ${p.y} as un walkable`, pid);
    grid.setWalkableAt(p.x, p.y, false);
  });

  const finder = JumpPointFinder({
    diagonalMovement: DiagonalMovement.Never,
  });

  const targetPoint = getTargetPoint(
    grid,
    actionPieceInBattle.x,
    actionPieceInBattle.y,
    targetPieceInBattle.x,
    targetPieceInBattle.y,
    actionPieceInBattle.range
  );

  logJps(
    `getTargetPoint: piece in ${actionPieceInBattle.x} ${actionPieceInBattle.y} aiming ${targetPieceInBattle.x} ${targetPieceInBattle.y} target to ${targetPoint.x} ${targetPoint.y}`
  );

  let actPath: { x: number; y: number }[] = [];

  if (targetPoint.needMove && targetPoint.x !== undefined) {
    actPath = findActPath(
      grid,
      finder,
      actionPieceInBattle.speed,
      actionPieceInBattle.x,
      actionPieceInBattle.y,
      targetPoint.x,
      targetPoint.y
    );
  } else {
    actPath = [{ x: actionPieceInBattle.x, y: actionPieceInBattle.y }];
  }

  return actPath;
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

  // get nearest point
  const nearestPoint = walkablePoints
    .map((v) => {
      const dis = manhattanDistance(v.x, v.y, fromX, fromY);

      return { x: v.x, y: v.y, dis };
    })
    .sort((a, b) => {
      return a.dis - b.dis;
    })[0];

  return { x: nearestPoint.x, y: nearestPoint.y, needMove: true };
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

function findActPath(
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

  logDebug("jps find paths: ", paths);

  // calculate doable path
  let totalDistance = 0;
  const doablePath: { x: number; y: number }[] = [];

  // it means no paths to go, just return
  if (paths?.[0]?.[0] === undefined) {
    return [{ x: fromX, y: fromY }];
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
