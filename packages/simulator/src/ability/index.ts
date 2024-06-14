export interface AbilityParams<T> {
  actionPieceId: string;
  targetPieceId: string;
  level: number;
  data: T;
}

export type AbilityFunction = <T>(params: AbilityParams<T>) => Promise<void>;
