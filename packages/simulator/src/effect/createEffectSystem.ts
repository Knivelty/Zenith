import { asyncMap } from "../utils/asyncHelper";

export interface EffectMap {
  Darkness: { pieceId: string; stack: number };
  Burn: { pieceId: string; stack: number };
}

export type EffectNameType = keyof EffectMap;

interface EffectSystem<T extends EffectMap> {
  registerActive<K extends keyof T>(
    effect: K,
    handler: (data: T[K]) => Promise<void>
  ): void;
  registerDeActive<K extends keyof T>(
    effect: K,
    handler: (data: T[K]) => Promise<void>
  ): void;

  active<K extends keyof T>(effect: K, data: T[K]): Promise<void>;
  deActive<K extends keyof T>(effect: K, data: T[K]): Promise<void>;
}

export const createEffectSystem = <T extends EffectMap>(): EffectSystem<T> => {
  const activeRegistry: {
    [K in keyof T]?: Array<(data: T[K]) => Promise<void>>;
  } = {};
  const deActiveRegistry: {
    [K in keyof T]?: Array<(data: T[K]) => Promise<void>>;
  } = {};

  const registerActive = <K extends keyof T>(
    effect: K,
    onActive: (data: T[K]) => Promise<void>
  ): void => {
    if (!activeRegistry[effect]) {
      activeRegistry[effect] = [];
    }
    activeRegistry[effect]!.push(onActive);
  };

  const registerDeActive = <K extends keyof T>(
    effect: K,
    onDeActive: (data: T[K]) => Promise<void>
  ): void => {
    if (!deActiveRegistry[effect]) {
      deActiveRegistry[effect] = [];
    }
    deActiveRegistry[effect]!.push(onDeActive);
  };

  const active = async <K extends keyof T>(
    effect: K,
    data: T[K]
  ): Promise<void> => {
    if (!activeRegistry[effect]) return;
    await asyncMap(
      activeRegistry[effect]!,
      async (handler) => await handler(data)
    );
  };

  const deActive = async <K extends keyof T>(
    effect: K,
    data: T[K]
  ): Promise<void> => {
    if (!deActiveRegistry[effect]) return;
    await asyncMap(
      deActiveRegistry[effect]!,
      async (handler) => await handler(data)
    );
  };

  return { registerActive, registerDeActive, active, deActive };
};
