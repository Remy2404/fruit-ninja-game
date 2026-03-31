export interface Vector2D {
  x: number;
  y: number;
}

/**
 * High-performance line-segment to circle collision detection.
 * Avoids object allocation by unwrapping vector math.
 */
export function lineToCircleIntersection(
  p1: Vector2D, // Line start
  p2: Vector2D, // Line end
  c: Vector2D,  // Circle center
  r: number     // Circle radius
): boolean {
  // Vector from line start to end
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  // Vector from line start to circle center
  const fx = p1.x - c.x;
  const fy = p1.y - c.y;

  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const cDist = (fx * fx + fy * fy) - r * r;

  // Quadratic coefficients for discriminant
  let discriminant = b * b - 4 * a * cDist;

  // No intersection at all
  if (discriminant < 0) {
    return false;
  }

  // Intersects infinite line, now check if it's within the specific line segment (t between 0 and 1)
  discriminant = Math.sqrt(discriminant);

  // Either solution may be on the segment
  const t1 = (-b - discriminant) / (2 * a);
  const t2 = (-b + discriminant) / (2 * a);

  // If either t is between 0 and 1, the segment intersects the circle
  if (t1 >= 0 && t1 <= 1) return true;
  if (t2 >= 0 && t2 <= 1) return true;

  // One edge case: the entire segment is inside the circle
  // If the line segment is short and inside, t1 < 0 and t2 > 1
  if ((t1 < 0 && t2 > 1) || (t2 < 0 && t1 > 1)) return true;

  return false;
}

/**
 * Line Segment intersection (e.g., trail crossing another trail)
 */
export function lineToLineIntersection(
  p1: Vector2D, p2: Vector2D,
  p3: Vector2D, p4: Vector2D
): boolean {
  const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  if (d === 0) return false;

  const u = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
  const v = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;

  return u >= 0 && u <= 1 && v >= 0 && v <= 1;
}

/**
 * Distance between two points (squared, for faster comparison)
 */
export function distSq(a: Vector2D, b: Vector2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}
