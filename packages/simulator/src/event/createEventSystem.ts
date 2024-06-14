import { logEvent } from "./debug";
import { asyncMap } from "./utils/asyncHelper";

// define event map
interface EventMap {
  beforeBattleStart: { isHome: boolean };
  pieceDeath: { pieceId: string };
}

interface EventSystem<T extends EventMap> {
  on<K extends keyof T>(event: K, handler: (data: T[K]) => Promise<void>): void;
  off<K extends keyof T>(
    event: K,
    handler: (data: T[K]) => Promise<void>
  ): void;
  emit<K extends keyof T>(event: K, data: T[K]): Promise<void>;
}

export const createEventSystem = <T extends EventMap>(): EventSystem<T> => {
  const events: { [K in keyof T]?: Array<(data: T[K]) => Promise<void>> } = {};

  const on = <K extends keyof T>(
    event: K,
    handler: (data: T[K]) => Promise<void>
  ): void => {
    if (!events[event]) {
      events[event] = [];
    }
    events[event]!.push(handler);
  };

  const off = <K extends keyof T>(
    event: K,
    handler: (data: T[K]) => Promise<void>
  ): void => {
    if (!events[event]) return;
    const index = events[event]!.indexOf(handler);
    if (index > -1) {
      events[event]!.splice(index, 1);
    }
  };

  const emit = async <K extends keyof T>(
    event: K,
    data: T[K]
  ): Promise<void> => {
    logEvent(`emit ${event.toString()} with data ${JSON.stringify(data)}`);
    if (!events[event]) return;
    await asyncMap(events[event]!, async (handler) => await handler(data));
  };

  return { on, off, emit };
};
