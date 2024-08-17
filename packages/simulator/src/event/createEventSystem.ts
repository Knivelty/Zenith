import { AbilityNameType, AbilityParamType } from "../ability/interface";
import { logEvent } from "../debug";
import { AffectedGround } from "../misc/groundEffect";
import { EffectParamType, EffectNameType } from "../effect/interface";
import { NON_EXIST_EVENT_HANDLER } from "../utils";
import { asyncMap } from "../utils/asyncHelper";
import { BattleEntityType } from "../schema";

// define event map
export interface EventMap {
  beforeBattleStart: { isHome: boolean };

  turnStart: { turn: number };
  turnEnd: { turn: number };

  battleEnd: { doHomeWin: boolean };

  beforePieceAction: { pieceId: string; initiative: number };
  afterPieceAction: { pieceId: string; initiative: number };

  beforePieceSearchMoveTarget: { actionPieceId: string };
  afterPieceSearchMoveTarget: { actionPieceId: string; targetPieceId: string };

  beforePieceSearchAttackTarget: { actionPieceId: string };
  afterPieceSearchAttackTarget: {
    actionPieceId: string;
    targetPieceId: string;
  };

  //
  pieceMove: {
    pieceId: string;
    paths: { x: number; y: number }[];
  };

  pieceDeath: { pieceId: string; killerPieceId: string; dmgSource: string };

  beforePieceAttack: { actionPieceId: string };
  pieceAttack: { pieceId: string; targetPieceId: string };
  afterPieceAttack: { pieceId: string; targetPieceId: string };

  afterPieceBasicAttack: { actionPieceId: string };

  damage: {
    sourcePieceId: string;
    targetPieceId: string;
    type: "Physical" | "Magical" | "Pure" | "Life Drain";
    value: number;
  };

  heal: {
    sourcePieceId: string;
    targetPieceId: string;
    type: "Active Heal";
    value: number;
  };

  // for front end play animation
  healthDecrease: {
    pieceId: string;
    value: number;
  };

  // mana
  pieceGainMana: { pieceId: string; manaAmount: number };
  pieceUseMana: { pieceId: string; manaAmount: number };

  // effect relate event
  effectChange: {
    effectName: EffectNameType;
    preValue: EffectParamType<EffectNameType>;
    value: EffectParamType<EffectNameType>;
  };

  // ability relate event

  tryCast: { actionPieceId: string };

  // this event is used to trigger cast
  beforeAbilityCast: { abilityName: AbilityNameType; data: AbilityParamType };
  // this event emit more detail to let client render animation
  abilityCast: {
    abilityName: AbilityNameType;
    data: AbilityParamType;
    affectedGrounds: AffectedGround[];
  };
  afterAbilityCast: {
    abilityName: AbilityNameType;
    data: AbilityParamType;
  };

  pieceNotCast: {
    actionPieceId: string;
  };

  // summon event
  pieceSpawn: BattleEntityType;

  // Settlement related event
  playerHealthDiff: { isHome: boolean; value: number };
  playerCoinDiff: { isHome: boolean; value: number };
  playerExpDiff: { isHome: boolean; value: number };
}

export type EventNameType = keyof EventMap;
export type EventWithName<T extends keyof EventMap> = EventMap[T] & {
  name: T;
};

interface EventSystem<T extends EventMap> {
  on<K extends keyof T>(
    event: K,
    handler: (data: T[K]) => Promise<void>,
    priority?: number
  ): void;
  off<K extends keyof T>(
    event: K,
    handler: (data: T[K]) => Promise<void>
  ): void;
  // TODO: handler match exact data
  emit<K extends keyof T>(event: K, data: T[K]): Promise<void>;

  emitted(): ({ name: EventNameType } & T[keyof T])[];
}

export const createEventSystem = <T extends EventMap>(): EventSystem<T> => {
  const eventsHandlers: {
    [K in keyof T]?: Array<{
      func: (data: T[K]) => Promise<void>;
      priority: number;
    }>;
  } = {};

  const emittedEvents: ({ name: EventNameType } & T[keyof T])[] = [];

  const on = <K extends keyof T>(
    event: K,
    handler: (data: T[K]) => Promise<void>,
    priority = 1
  ): void => {
    if (!eventsHandlers[event]) {
      eventsHandlers[event] = [];
    }
    eventsHandlers[event]!.push({ func: handler, priority });
  };

  const off = <K extends keyof T>(
    event: K,
    handler: (data: T[K]) => Promise<void>
  ): void => {
    if (!eventsHandlers[event]) return;
    const index = eventsHandlers[event]!.map((e) => e.func).indexOf(handler);
    if (index > -1) {
      eventsHandlers[event]!.splice(index, 1);
    } else {
      console.trace(NON_EXIST_EVENT_HANDLER);
      throw NON_EXIST_EVENT_HANDLER;
    }
  };

  const emit = async <K extends keyof T>(
    event: K,
    data: T[K]
  ): Promise<void> => {
    logEvent(event as EventNameType)(data);
    emittedEvents.push({ name: event as EventNameType, ...data });
    if (!eventsHandlers[event]) return;

    // higher priority handler will be executed first
    for (const handler of eventsHandlers[event]!.sort(
      (a, b) => b.priority - a.priority
    )) {
      await handler.func(data);
    }
  };

  const emitted = () => {
    return emittedEvents;
  };

  return { on, off, emit, emitted };
};
