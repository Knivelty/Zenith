export interface GroundEffect {
  fire: {};
  slightFire: {};
}

export interface AffectedGround {
  x: number;
  y: number;
  groundEffect: keyof GroundEffect;
}
