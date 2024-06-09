export function manhattanDistance(
  x0: number,
  y0: number,
  x1: number,
  y1: number
) {
  return Math.abs(x1 - x0) + Math.abs(y1 - y0);
}
