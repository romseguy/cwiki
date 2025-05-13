import * as utils from "./string";

const normalize = (str: string | boolean) => {
  if (typeof str === "string") {
    str = utils.normalize(str);
  }
  if (str === "") return true;
  return str;
};

export const belongs = (a?: string | string[], b?: string | string[]) => {
  if (!a || !b) return false;

  let na: string | boolean | (string | boolean)[] = a,
    nb: string | boolean | (string | boolean)[] = b;

  if (typeof na === "string" && na !== "/") {
    na = normalize(na);
  }
  if (typeof nb === "string" && nb !== "/") {
    nb = normalize(nb);
  }
  if (Array.isArray(na)) {
    na = na.map((str) => (str !== "/" ? normalize(str) : "/"));
  }
  if (Array.isArray(nb)) {
    nb = nb.map((str) => (str !== "/" ? normalize(str) : "/"));
  }
  if (typeof na === "string" && typeof nb === "string") {
    return na.includes(nb);
  }

  if (Array.isArray(na) && Array.isArray(nb)) {
    const found = na.find((value) => {
      //@ts-expect-error
      return nb.includes(value);
    });
    return found;
  }

  if (Array.isArray(na) && typeof nb === "string") {
    return na.includes(nb);
  }

  if (Array.isArray(nb) && typeof na === "string") {
    return nb.includes(na);
  }

  return false;
};
