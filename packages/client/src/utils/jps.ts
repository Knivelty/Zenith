import {
    Grid,
    JumpPointFinder,
    JPFNeverMoveDiagonally,
    DiagonalMovement,
} from "pathfinding";
import { uniqWith } from "lodash";
import { logJps } from "../ui/lib/utils";

export type PieceInBattle = {
    player: string;
    entity: string;
    x: number;
    y: number;
    health: number;
    attack: number;
    armor: number;
    speed: number;
    range: number;
    isInHome: boolean;
    dead: boolean;
};

export type PieceInBattleOrUndefined = PieceInBattle | undefined;

export function manhattanDistance(
    x0: number,
    y0: number,
    x1: number,
    y1: number
) {
    return Math.abs(x1 - x0) + Math.abs(y1 - y0);
}

// function get

function getHomePiece(pieces: PieceInBattle[]) {
    return pieces.filter((v) => v.isInHome === true);
}

function getAwayPiece(pieces: PieceInBattle[]) {
    return pieces.filter((v) => v.isInHome === false);
}

function getAimedPiece(
    actionP: PieceInBattle,
    pieces: PieceInBattle[]
): PieceInBattle | undefined {
    let opposingP: PieceInBattle[] = [];

    if (actionP.isInHome) {
        opposingP = getAwayPiece(pieces);
    } else {
        opposingP = getHomePiece(pieces);
    }

    // get latest piece
    const targetPiece = opposingP
        .map((opp) => {
            return {
                ...opp,
                distance: manhattanDistance(actionP.x, actionP.y, opp.x, opp.y),
            };
        })
        .sort((a, b) => a.distance - b.distance)[0];

    return targetPiece;
}

const ROWS = 8;
const COLS = 8;

export type PieceAction = {
    entity: string;
    player: string;
    order: number;
    paths: { x: number; y: number }[];
    attackPiece: string | undefined;
};

export type WinResult = {
    win: boolean;
    healthDecrease: number;
};

export type BattleResult = {
    logs: PieceAction[];
    result: WinResult;
};

/**
 * @dev "pieces" should be arranged in descending order of "initiative".
 * @param pieces
 * @returns
 */
export function calculateBattleLogs(pieces: PieceInBattle[]): BattleResult {
    const pieceActions = new Array<PieceAction>();
    let baseTurnOrder = 1;
    for (let i = 0; i < 500; i++) {
        const logs = battleForAStep(pieces, baseTurnOrder);

        baseTurnOrder = logs.length ? logs[logs.length - 1].order + 1 : 1;

        pieceActions.push(...logs);
        if (isTurnEnd(pieces)) {
            console.log("turn end");
            break;
        } else {
            console.log("next turn");
        }
    }
    const result = getResult(pieces);
    return { logs: pieceActions, result };
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

function isTurnEnd(pieces: PieceInBattle[]) {
    if (
        getHomePiece(pieces).findIndex((v) => v.dead === false) === -1 ||
        getAwayPiece(pieces).findIndex((v) => v.dead === false) === -1
    ) {
        return true;
    }
    return false;
}

function getResult(pieces: PieceInBattle[]) {
    console.log("getting result", pieces);

    const remainHomePiece = getHomePiece(pieces).filter(
        (v) => v.dead === false
    ).length;
    const remainAwayPiece = getAwayPiece(pieces).filter(
        (v) => v.dead === false
    ).length;
    // TODO: check exception
    if (!remainHomePiece) {
        return { win: false, healthDecrease: remainAwayPiece };
    } else {
        return { win: true, healthDecrease: remainAwayPiece };
    }
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

function tryAttack(
    pieces: PieceInBattle[],
    p: PieceInBattle,
    targetPiece: PieceInBattle
): string | undefined {
    // judge wether can attack
    if (manhattanDistance(p.x, p.y, targetPiece.x, targetPiece.y) <= p.range) {
        const attackedPieceIndex = pieces.findIndex(
            (v) => v.entity == targetPiece.entity
        );
        const attackedPiece = pieces[attackedPieceIndex];
        if (attackedPiece) {
            const damage =
                p.attack * (attackedPiece.armor / (1 + attackedPiece.armor));
            attackedPiece.health -= damage;

            console.log(
                `piece ${p.entity} attack ${attackedPiece.entity} with damage ${damage}`
            );

            // if dead, set as death
            if (attackedPiece.health <= 0) {
                // pieces.splice(index);
                attackedPiece.dead = true;
                console.log(`piece ${attackedPiece.entity} dead`);
            }
            return attackedPiece.entity;
        } else {
            console.error("calculate error");
        }
    } else {
        // console.log("cannot attack");
    }
}

export function battleForAStep(
    pieces: PieceInBattle[],
    baseTurnOrder: number
): PieceAction[] {
    const actions = new Array<PieceAction>();

    // each piece action by initiative
    for (const p of pieces) {
        if (p.dead || isTurnEnd(pieces)) {
            continue;
        }

        const undeadPiece = pieces.filter((v) => v.dead !== true);

        // get aimed piece
        const targetPiece = getAimedPiece(p, undeadPiece);

        if (!targetPiece) {
            // no target piece means all enemy's piece are dead
            continue;
        }

        const grid = new Grid(8, 8);

        // console.log("undeadPiece: ", undeadPiece);

        // fill the map
        undeadPiece.forEach((pp) => {
            if (pp.entity === p.entity) {
                return;
            }
            logJps(`try set ${pp.x} ${pp.y} as workable`)
            grid.setWalkableAt(pp.x, pp.y, false);
        });

        const finder = JumpPointFinder({
            diagonalMovement: DiagonalMovement.Never,
        });

        const targetPoint = getTargetPoint(
            grid,
            p.x,
            p.y,
            targetPiece.x,
            targetPiece.y,
            p.range
        );

        let doablePath: { x: number; y: number }[] = [];

        if (targetPoint.x) {
            // calculate target point
            doablePath = findDoablePath(
                grid,
                finder,
                p.speed,
                p.x,
                p.y,
                targetPoint.x,
                targetPoint.y
            );

            // console.log("doablePath:", doablePath);

            // move
            p.x = doablePath[doablePath.length - 1].x;
            p.y = doablePath[doablePath.length - 1].y;

            console.log(
                `piece ${p.entity} move from ${doablePath[0].x},${doablePath[0].y} to ${p.x},${p.y}`
            );
        }

        const attackedEntity = tryAttack(pieces, p, targetPiece);

        actions.push({
            player: p.player,
            // order increase one by one
            order: actions.length
                ? actions[actions.length - 1].order + 1
                : baseTurnOrder,
            entity: p.entity,
            paths: doablePath,
            attackPiece: attackedEntity,
        });
    }

    return actions;
}
