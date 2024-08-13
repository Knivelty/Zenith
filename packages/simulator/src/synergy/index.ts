export interface SynergyMap {
  Strength: {};
  Light: {};
  Dark: {};
  Cunning: {};
  Magical: {};
  Hunter: {};
  Brute: {};
  Imaginary: {};
}

export type SynergyName = keyof SynergyMap;
