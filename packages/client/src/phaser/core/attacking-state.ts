import { Item } from "../types/enum/Item"
import { AttackType } from "../types/enum/Game"
import { Effect } from "../types/enum/Effect"
import Board from "./board"
import { monsterEntity } from "./monster-entity"
import monsterState from "./monster-state"
import { monsterActionState } from "../types/enum/Game"
import { chance } from "../utils/random"
import { distanceC } from "../utils/distance"
import { Synergy } from "../types/enum/Synergy"
import { max, min } from "../utils/number"
import { Passive } from "../types/enum/Passive"
import { AbilityStrategies } from "./abilities/abilities"

export default class AttackingState extends monsterState {
  update(monster: monsterEntity, dt: number, board: Board, weather: string) {
    super.update(monster, dt, board, weather)

    if (monster.cooldown <= 0) {
      monster.cooldown = monster.getAttackDelay()

      // first, try to hit the same target than previous attack
      let target = board.getValue(monster.targetX, monster.targetY)
      let targetCoordinate: { x: number; y: number } | undefined = {
        x: monster.targetX,
        y: monster.targetY
      }

      if (monster.status.confusion) {
        targetCoordinate = this.getTargetCoordinateWhenConfused(monster, board)
      } else if (
        !(
          target &&
          target.team !== monster.team &&
          target.isTargettable &&
          distanceC(
            monster.positionX,
            monster.positionY,
            targetCoordinate.x,
            targetCoordinate.y
          ) <= monster.range
        )
      ) {
        // if target is no longer alive or at range, retargeting
        targetCoordinate = this.getNearestTargetAtRangeCoordinates(
          monster,
          board
        )
        if (targetCoordinate) {
          target = board.getValue(targetCoordinate.x, targetCoordinate.y)
        }
      }

      // no target at range, changing to moving state
      if (!target || !targetCoordinate || monster.status.charm) {
        const targetAtSight = this.getNearestTargetAtSightCoordinates(
          monster,
          board
        )
        if (targetAtSight) {
          monster.toMovingState()
        }
      } else if (
        target &&
        monster.pp >= monster.maxPP &&
        !monster.status.silence
      ) {
        // CAST ABILITY
        let crit = false
        if (monster.items.has(Item.REAPER_CLOTH)) {
          crit = chance(monster.critChance / 100)
        }
        AbilityStrategies[monster.skill].process(
          monster,
          this,
          board,
          target,
          crit
        )
        monster.onCast(board, target, crit)
      } else {
        // BASIC ATTACK
        monster.count.attackCount++
        this.attack(monster, board, targetCoordinate)
        if (
          monster.effects.has(Effect.RISING_VOLTAGE) ||
          monster.effects.has(Effect.OVERDRIVE)
        ) {
          let isTripleAttack = false
          if (monster.effects.has(Effect.RISING_VOLTAGE)) {
            isTripleAttack = monster.count.attackCount % 4 === 0
          } else if (monster.effects.has(Effect.OVERDRIVE)) {
            isTripleAttack = monster.count.attackCount % 3 === 0
          }
          if (isTripleAttack) {
            monster.count.tripleAttackCount++
            this.attack(monster, board, targetCoordinate)
            this.attack(monster, board, targetCoordinate)
          }
        }
      }
    } else {
      monster.cooldown = Math.max(0, monster.cooldown - dt)
    }
  }

  attack(
    monster: monsterEntity,
    board: Board,
    coordinates: { x: number; y: number }
  ) {
    monster.targetX = coordinates.x
    monster.targetY = coordinates.y

    const target = board.getValue(coordinates.x, coordinates.y)
    if (target) {
      monster.orientation = board.orientation(
        monster.positionX,
        monster.positionY,
        target.positionX,
        target.positionY,
        monster,
        target
      )

      let damage = monster.atk
      let physicalDamage = 0
      let specialDamage = 0
      let trueDamage = 0
      let totalTakenDamage = 0

      if (Math.random() * 100 < monster.critChance) {
        monster.onCritical({ target, board })
        if (target.items.has(Item.ROCKY_HELMET) === false) {
          let opponentCritDamage = monster.critDamage
          if (target.effects.has(Effect.BATTLE_ARMOR)) {
            opponentCritDamage -= 0.3
          } else if (target.effects.has(Effect.MOUTAIN_RESISTANCE)) {
            opponentCritDamage -= 0.5
          } else if (target.effects.has(Effect.DIAMOND_STORM)) {
            opponentCritDamage -= 0.7
          }
          damage = Math.round(damage * opponentCritDamage)
        }
      }

      if (monster.items.has(Item.FIRE_GEM)) {
        damage = Math.round(damage + target.hp * 0.08)
      }

      if (monster.attackType === AttackType.SPECIAL) {
        damage = Math.ceil(damage * (1 + monster.ap / 100))
      }

      if (monster.passive === Passive.SPOT_PANDA && target.status.confusion) {
        damage = Math.ceil(damage * (1 + monster.ap / 100))
      }

      let trueDamagePart = 0
      if (monster.hasSynergyEffect(Synergy.GHOST)) {
        if (monster.effects.has(Effect.PHANTOM_FORCE)) {
          trueDamagePart += 0.2
        } else if (monster.effects.has(Effect.CURSE)) {
          trueDamagePart += 0.4
        } else if (monster.effects.has(Effect.SHADOW_TAG)) {
          trueDamagePart += 0.7
        } else if (monster.effects.has(Effect.WANDERING_SPIRIT)) {
          trueDamagePart += 1.0
        }
      }
      if (monster.items.has(Item.RED_ORB) && target) {
        trueDamagePart += 0.25
      }
      if (monster.effects.has(Effect.LOCK_ON) && target) {
        trueDamagePart += 1.0 + monster.ap / 100
        target.status.triggerArmorReduction(3000)
        monster.effects.delete(Effect.LOCK_ON)
      }

      let isAttackSuccessful = true
      let dodgeChance = target.dodge
      if (monster.effects.has(Effect.GAS)) {
        dodgeChance += 0.5
      }
      dodgeChance = max(0.9)(dodgeChance)

      if (
        chance(dodgeChance) &&
        !monster.items.has(Item.XRAY_VISION) &&
        !monster.effects.has(Effect.LOCK_ON) &&
        !target.status.paralysis &&
        !target.status.sleep &&
        !target.status.freeze
      ) {
        isAttackSuccessful = false
        damage = 0
        target.count.dodgeCount += 1
      }
      if (target.status.protect) {
        isAttackSuccessful = false
        damage = 0
      }

      if (trueDamagePart > 0) {
        // Apply true damage part
        trueDamage = Math.ceil(damage * trueDamagePart)
        damage = min(0)(damage * (1 - trueDamagePart))

        const { takenDamage } = target.handleDamage({
          damage: trueDamage,
          board,
          attackType: AttackType.TRUE,
          attacker: monster,
          shouldTargetGainMana: true
        })
        totalTakenDamage += takenDamage
      }

      if (monster.attackType === AttackType.SPECIAL) {
        specialDamage = damage
      } else {
        physicalDamage = damage
      }

      if (monster.passive === Passive.SPOT_PANDA && target.status.confusion) {
        specialDamage += 1 * damage * (1 + monster.ap / 100)
      }

      if (physicalDamage > 0) {
        // Apply attack physical damage
        const { takenDamage } = target.handleDamage({
          damage: physicalDamage,
          board,
          attackType: AttackType.PHYSICAL,
          attacker: monster,
          shouldTargetGainMana: true
        })
        totalTakenDamage += takenDamage
      }

      if (specialDamage > 0) {
        // Apply special damage
        const { takenDamage } = target.handleDamage({
          damage: specialDamage,
          board,
          attackType: AttackType.SPECIAL,
          attacker: monster,
          shouldTargetGainMana: true
        })
        totalTakenDamage += takenDamage
      }

      const totalDamage = physicalDamage + specialDamage + trueDamage
      monster.onAttack({
        target,
        board,
        physicalDamage,
        specialDamage,
        trueDamage,
        totalDamage
      })
      if (isAttackSuccessful) {
        monster.onHit({
          target,
          board,
          totalTakenDamage,
          physicalDamage,
          specialDamage,
          trueDamage
        })
      }
    }
  }

  onEnter(monster) {
    super.onEnter(monster)
    monster.action = monsterActionState.ATTACK
    monster.cooldown = 0
  }

  onExit(monster) {
    super.onExit(monster)
    monster.targetX = -1
    monster.targetY = -1
  }
}
