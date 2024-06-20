import { AbilityNameType, AbilityParamType } from "../ability/interface";
import { logEvent } from "../debug";
import { EffectParamType, EffectNameType } from "../effect/interface";
import { NON_EXIST_EVENT_HANDLER } from "../utils";
import { asyncMap } from "../utils/asyncHelper";

// define event map
export interface EventMap {
  beforeBattleStart: { isHome: boolean };
  beforePieceAction: { pieceId: string };

  turnEnd: {};

  //
  pieceMove: {
    pieceId: string;
    paths: { x: number; y: number }[];
  };

  pieceDeath: { pieceId: string };

  pieceAttack: { pieceId: string; targetPieceId: string };
  damage: {
    pieceId: string;
    targetPieceId: string;
    type: "Physical" | "Magical" | "Pure" | "Life Drain";
    value: number;
  };
  afterPieceAttack: { pieceId: string; targetPieceId: string };

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
  abilityCast: { abilityName: AbilityNameType; data: AbilityParamType };
}

export type EventNameType = keyof EventMap;
export type EventWithName<T extends keyof EventMap> = EventMap[T] & {
  name: T;
};

interface EventSystem<T extends EventMap> {
  on<K extends keyof T>(event: K, handler: (data: T[K]) => Promise<void>): void;
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
    [K in keyof T]?: Array<(data: T[K]) => Promise<void>>;
  } = {};

  const emittedEvents: ({ name: EventNameType } & T[keyof T])[] = [];

  const on = <K extends keyof T>(
    event: K,
    handler: (data: T[K]) => Promise<void>
  ): void => {
    if (!eventsHandlers[event]) {
      eventsHandlers[event] = [];
    }
    eventsHandlers[event]!.push(handler);
  };

  const off = <K extends keyof T>(
    event: K,
    handler: (data: T[K]) => Promise<void>
  ): void => {
    if (!eventsHandlers[event]) return;
    const index = eventsHandlers[event]!.indexOf(handler);
    if (index > -1) {
      eventsHandlers[event]!.splice(index, 1);
    } else {
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
    await asyncMap(
      eventsHandlers[event]!,
      async (handler) => await handler(data)
    );
  };

  const emitted = () => {
    return emittedEvents;
  };

  return { on, off, emit, emitted };
};
