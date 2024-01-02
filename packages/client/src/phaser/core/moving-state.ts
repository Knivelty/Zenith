import Board from "./board"
import { monsterEntity } from "./monster-entity"
import monsterState from "./monster-state"
import { BoardEvent, monsterActionState } from "../types/enum/Game"
import { Synergy } from "../types/enum/Synergy"
import { distanceC } from "../utils/distance"
import { Weather } from "../types/enum/Weather"
import { Passive } from "../types/enum/Passive"
import { Effect } from "../types/enum/Effect"
import { Transfer } from "../types"

export default class MovingState extends monsterState {
  update(monster: monsterEntity, dt: number, board: Board, weather: string) {
    super.update(monster, dt, board, weather)
    if (monster.cooldown <= 0) {
      monster.cooldown = weather === Weather.SNOW ? 666 : 500
      const targetAtRange = this.getNearestTargetAtRangeCoordinates(
        monster,
        board
      )
      if (targetAtRange) {
        if (!monster.status.charm) {
          monster.toAttackingState()
        }
      } else {
        const targetAtSight = this.getNearestTargetAtSightCoordinates(
          monster,
          board
        )
        if (targetAtSight) {
          this.move(monster, board, targetAtSight)
        }
      }
    } else {
      monster.cooldown = Math.max(0, monster.cooldown - dt)
    }
  }

  move(
    monster: monsterEntity,
    board: Board,
    coordinates: { x: number; y: number }
  ) {
    //logger.debug('move attempt');

    let x: number | undefined = undefined
    let y: number | undefined = undefined
    if (monster.types.has(Synergy.DARK) && monster.baseRange === 1) {
      const farthestCoordinate = this.getFarthestTargetCoordinateAvailablePlace(
        monster,
        board
      )
      //logger.debug({ farthestCoordinate })
      if (farthestCoordinate) {
        x = farthestCoordinate.x
        y = farthestCoordinate.y

        if (monster.passive === Passive.STENCH) {
          board
            .getCellsBetween(x, y, monster.positionX, monster.positionY)
            .forEach((cell) => {
              if (cell.x !== x || cell.y !== y) {
                monster.simulation.room.broadcast(Transfer.BOARD_EVENT, {
                  simulationId: monster.simulation.id,
                  type: BoardEvent.POISON_GAS,
                  x: cell.x,
                  y: cell.y
                })
                board.effects[board.columns * cell.y + cell.x] =
                  Effect.POISON_GAS
              }
            })
        }
      }
    } else {
      const cells = board.getAdjacentCells(monster.positionX, monster.positionY)
      let distance = 999

      cells.forEach((cell) => {
        if (cell.value === undefined) {
          const candidateDistance = distanceC(
            coordinates.x,
            coordinates.y,
            cell.x,
            cell.y
          )
          // logger.debug(`${monster.name} - Candidate (${cell.x},${cell.y}) to ${coordinates.x},${coordinates.y}, distance: ${candidateDistance}`);
          if (candidateDistance < distance) {
            distance = candidateDistance
            x = cell.x
            y = cell.y
          }
        }
      })
    }
    if (x !== undefined && y !== undefined) {
      monster.orientation = board.orientation(
        monster.positionX,
        monster.positionY,
        x,
        y,
        monster,
        undefined
      )
      // logger.debug(`monster ${monster.name} moved from (${monster.positionX},${monster.positionY}) to (${x},${y}), (desired direction (${coordinates.x}, ${coordinates.y})), orientation: ${monster.orientation}`);
      board.swapValue(monster.positionX, monster.positionY, x, y)
    }
  }

  onEnter(monster: monsterEntity) {
    super.onEnter(monster)
    monster.action = monsterActionState.WALK
    monster.cooldown = 0
  }

  onExit(monster: monsterEntity) {
    super.onExit(monster)
  }
}
