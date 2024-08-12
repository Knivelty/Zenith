import { EffectNameType } from "../effect/interface";
import {
  UNKNOWN_CREATURE_ERROR,
  UNKNOWN_PIECE_ERROR,
  UNKNOWN_PLAYER_PROFILE,
} from "./error";

export async function getBattlePiece(entity: string) {
  const db = globalThis.Simulator.db;

  const piece = await db.battle_entity
    .findOne({
      selector: { entity: entity },
    })
    .exec();

  if (!piece) {
    throw UNKNOWN_PIECE_ERROR;
  }

  return piece;
}

export async function getAliveBattlePiece(entity: string) {
  const db = globalThis.Simulator.db;

  const piece = await db.battle_entity
    .findOne({
      selector: { entity: entity, dead: false },
    })
    .exec();

  if (!piece) {
    throw UNKNOWN_PIECE_ERROR;
  }

  return piece;
}

export async function getPieceCreature(entity: string) {
  const db = globalThis.Simulator.db;

  const pieceProfile = await db.base_state
    .findOne({
      selector: { entity: entity },
    })
    .exec();

  if (!pieceProfile) {
    throw UNKNOWN_PIECE_ERROR;
  }

  const pieceCreature = await db.creature
    .findOne({
      selector: {
        creature_idx: pieceProfile.creature_idx,
        level: pieceProfile.level,
      },
    })
    .exec();

  if (!pieceCreature) {
    throw UNKNOWN_CREATURE_ERROR;
  }

  return pieceCreature;
}

export async function getAllUndeadPieceIds() {
  const db = globalThis.Simulator.db;

  const pieces = await db.battle_entity
    .find({
      selector: { dead: false },
    })
    .exec();
  const ids = pieces.map((p) => p.entity);
  return ids;
}

export async function getAwayUndeadPieceIds() {
  const db = globalThis.Simulator.db;

  const awayUndeadPieceIds = await db.battle_entity
    .find({
      selector: {
        dead: false,
        isHome: false,
      },
    })

    .exec();

  return awayUndeadPieceIds;
}

export async function getHomeUndeadPieceIds() {
  const db = globalThis.Simulator.db;

  const alliedUndeadPieceIds = await db.battle_entity
    .find({
      selector: {
        isHome: true,
        dead: false,
      },
    })

    .exec();

  return alliedUndeadPieceIds;
}

export async function getBattleResult() {
  const awayUndeadPieceIds = await getAwayUndeadPieceIds();
  const homeUndeadPieceIds = await getHomeUndeadPieceIds();

  const end =
    homeUndeadPieceIds.length === 0 || awayUndeadPieceIds.length === 0;

  let win: boolean | undefined = undefined;
  let healthDecrease: number | undefined = undefined;
  if (end) {
    win = homeUndeadPieceIds.length ? true : false;
    healthDecrease = awayUndeadPieceIds.length;
  } else {
    win = false;
    healthDecrease = 0;
  }

  return { end, win, healthDecrease };
}

export async function isBattleEnd() {
  const awayUndeadPieceIds = await getAwayUndeadPieceIds();
  const homePieceIds = await getHomeUndeadPieceIds();

  const end = awayUndeadPieceIds.length === 0 || homePieceIds.length === 0;

  return end;
}

export async function movePiece(pieceId: string, toX: number, toY: number) {
  const db = globalThis.Simulator.db;

  await db.battle_entity
    .findOne({
      selector: {
        entity: pieceId,
      },
    })
    .patch({
      x: toX,
      y: toY,
    });
}

export async function increaseHealth(
  source: string,
  target: string,
  type: string,
  value: number
) {
  const db = globalThis.Simulator.db;

  await db.battle_entity
    .findOne({ selector: { entity: target } })
    .incrementalModify((doc) => {
      doc.health += value;
      return doc;
    });
}

export async function decreaseHealth(
  source: string,
  pieceId: string,
  type: string,
  healthDiff: number
) {
  const db = globalThis.Simulator.db;

  await db.battle_entity
    .findOne({ selector: { entity: pieceId } })
    .incrementalModify((doc) => {
      doc.health -= healthDiff;
      return doc;
    });

  // if health lower than zero, set to dead
  if ((await getBattlePiece(pieceId)).health <= 0) {
    await db.battle_entity
      .findOne({ selector: { entity: pieceId } })
      .incrementalPatch({ health: 0, dead: true });

    // emit death event
    await globalThis.Simulator.eventSystem.emit("pieceDeath", {
      pieceId: pieceId,
      killerPieceId: source,
      dmgSource: type,
    });
  }
}

export async function decreaseMana(pieceId: string, manaDecrease: number) {
  const db = globalThis.Simulator.db;
  await db.battle_entity
    .findOne({ selector: { entity: pieceId } })
    .update({ $inc: { mana: -manaDecrease } });
}

export async function increaseArmor(pieceId: string, armorIncrease: number) {
  const db = globalThis.Simulator.db;
  await db.battle_entity
    .findOne({ selector: { entity: pieceId } })
    .incrementalModify((doc) => {
      doc.armor += armorIncrease;
      return doc;
    });
}

export async function getPieceAbilityProfile(pieceId: string) {
  const db = globalThis.Simulator.db;
  const piece = await db.battle_entity
    .findOne({ selector: { entity: pieceId } })
    .exec();

  const abilityProfile = await db.ability_profile
    .findOne({
      selector: { ability_name: piece?.ability },
    })
    .exec();

  if (!abilityProfile) {
    return undefined;
  }

  return abilityProfile;
}

export async function getPieceEffectProfile(
  pieceId: string,
  effectName: EffectNameType
) {
  const db = globalThis.Simulator.db;
  const effect = await db.effect
    .findOne({ selector: { id: pieceId, name: effectName } })
    .exec();

  return effect;
}

export async function getPlayerProfileBySide(isHome: boolean) {
  const db = globalThis.Simulator.db;

  const playerProfile = await db.player_profile
    .findOne({ selector: { isHome: isHome } })
    .exec();

  if (!playerProfile) {
    throw UNKNOWN_PLAYER_PROFILE;
  }

  return playerProfile;
}
