// define event map
interface EventMap {
  increaseHealth: { amount: number };
  changeDifficulty: { level: string };
  // define more event here
}

interface EventSystem<T extends EventMap> {
  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): void;
  off<K extends keyof T>(event: K, handler: (data: T[K]) => void): void;
  emit<K extends keyof T>(event: K, data: T[K]): void;
}

export const createEventSystem = <T extends EventMap>(): EventSystem<T> => {
  const events: { [K in keyof T]?: Array<(data: T[K]) => void> } = {};

  const on = <K extends keyof T>(
    event: K,
    handler: (data: T[K]) => void | Promise<void>
  ): void => {
    if (!events[event]) {
      events[event] = [];
    }
    events[event]!.push(handler);
  };

  const off = <K extends keyof T>(
    event: K,
    handler: (data: T[K]) => void | Promise<void>
  ): void => {
    if (!events[event]) return;
    const index = events[event]!.indexOf(handler);
    if (index > -1) {
      events[event]!.splice(index, 1);
    }
  };

  const emit = <K extends keyof T>(event: K, data: T[K]): void => {
    if (!events[event]) return;
    events[event]!.forEach((handler) => handler(data));
  };

  return { on, off, emit };
};
