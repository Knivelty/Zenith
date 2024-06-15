export interface AbilityMap {
  dragonExhale: { actionPieceId: string };
}
export type AbilityNameType = keyof AbilityMap;
export type AbilityParamType = AbilityMap[keyof AbilityMap];

export type AbilityFunction = (params: AbilityParamType) => Promise<void>;

export interface AbilityDetail {
  func: AbilityFunction;
  requiredMana: number;
}
