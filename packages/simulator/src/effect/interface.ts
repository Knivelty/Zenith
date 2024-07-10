export interface EffectMap {
  Darkness: { pieceId: string; stack: number; duration: number };
  Burn: { pieceId: string; stack: number; duration: number };
  Rage: { pieceId: string; stack: number; duration: number };
  Shield: { pieceId: string; stack: number; duration: number };
  ShieldRevenge: { pieceId: string; stack: number; duration: number };
  Revive: { pieceId: string; stack: number; duration: number };
  Taunt: { pieceId: string; stack: number; duration: number };
}

export type EffectNameType = keyof EffectMap;
export function getEffectName<K extends EffectNameType>(key: K): K {
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
