export function equals(a: any, b: any): boolean {
  const eq = equalsValue(a, b);
  if (eq) return eq;

  let aa = a;
  let bb = b;

  if (typeof a === "object" && a.toString) aa = a.toString();
  if (typeof b === "object" && b.toString) bb = b.toString();

  return aa === bb;
}

export function equalsValue(a: string | undefined, b: string | undefined) {
  return typeof a === "string" && typeof b === "string" && a === b;
}
