export interface SynergyMap {
  STRENGTH: {};
  LIGHT: {};
  DARK: {};
  CUNNING: {};
  MAGICAL: {};
  HUNTER: {};
  BRUTE: {};
  IMAGINARY: {};
}

export type SynergyName = keyof SynergyMap;
