export interface EffectMap {
  Darkness: { pieceId: string; stack: number };
  Burn: { pieceId: string; stack: number };
}

export type EffectNameType = keyof EffectMap;
export type EffectParamType = EffectMap[keyof EffectMap];
export type EffectHandler = ({
  preValue,
  value,
}: {
  preValue: EffectParamType;
  value: EffectParamType;
}) => Promise<void>;
