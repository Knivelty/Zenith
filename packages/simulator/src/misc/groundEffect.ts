export interface GroundEffect {
  fire: {};
  slightFire: {};
  inferno_center: {};
  inferno_middle: {};
  inferno_border: {};
  inferno_edge: {};
}

export interface AffectedGround {
  x: number;
  y: number;
  groundEffect: keyof GroundEffect;
}
