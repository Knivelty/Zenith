export interface EffectMap {
  Darkness: { pieceId: string; stack: number; duration: number };
  Burn: { pieceId: string; stack: number; duration: number };
  Rage: { pieceId: string; stack: number; duration: number };
}

export type EffectNameType = keyof EffectMap;
export function getEffectName<EffectMap, K extends EffectNameType>(key: K): K {
  return key;
}
export type EffectParamType<T extends EffectNameType> = EffectMap[T];
export type EffectHandler<T extends EffectNameType> = ({
  preValue,
  value,
}: {
  preValue: EffectParamType<T>;
  value: EffectParamType<T>;
}) => Promise<void>;
