import { AbilityNameType, AbilityParamType } from "../ability";
import { logDebug, logEvent } from "../debug";
import { EffectParamType, EffectNameType } from "../effect";
import { asyncMap } from "../utils/asyncHelper";

// define event map
export interface EventMap {
  beforeBattleStart: { isHome: boolean };
  beforePieceAction: { pieceId: string };
  pieceDeath: { pieceId: string };
  afterAttack: { pieceId: string; targetPieceId: string };

  // effect relate event
  effectDeActive: {
    effectName: EffectNameType;
    data: EffectParamType;
  };
  effectActive: {
    effectName: EffectNameType;
    data: EffectParamType;
  };

  // ability relate event
  abilityCast: { abilityName: AbilityNameType; data: AbilityParamType };
}

export type EventName = keyof EventMap;

interface EventSystem<T extends EventMap> {
  on<K extends keyof T>(event: K, handler: (data: T[K]) => Promise<void>): void;
  off<K extends keyof T>(
    event: K,
    handler: (data: T[K]) => Promise<void>
  ): void;
  // TODO: handler match exact data
  emit<K extends keyof T>(event: K, data: T[K]): Promise<void>;
}

export const createEventSystem = <T extends EventMap>(): EventSystem<T> => {
  const eventsHandlers: {
    [K in keyof T]?: Array<(data: T[K]) => Promise<void>>;
  } = {};

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
      logDebug("cannot find func");
    }
  };

  const emit = async <K extends keyof T>(
    event: K,
    data: T[K]
  ): Promise<void> => {
    logEvent(event as EventName)(data);
    if (!eventsHandlers[event]) return;
    await asyncMap(
      eventsHandlers[event]!,
      async (handler) => await handler(data)
    );
  };

  return { on, off, emit };
};
