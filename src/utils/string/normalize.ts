import latinize from "latinize";

export function normalize(
  str?: string,
  underscores: boolean | undefined = true
): string {
  if (!str) return "";
  let out = "" + str.trim();
  out = out.replace(/\//g, "");
  out = out.replace(/#/g, "");
  out = out.replace(/\?/g, "");
  out = out.replace(/\s{2,}/g, " ");

  if (underscores) out = out.replace(/\ /g, "_");

  out = latinize(out);
  //out = out.replace(/\p{Diacritic}/gu, "");
  out = out.toLowerCase();

  return out;
}
