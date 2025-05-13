export function divideArray<T>(array: T[], length: number): T[][] {
  const newArray = [...array];

  if (!length) return [newArray];

  const divideRes = Math.floor(newArray.length / length);
  let results = [];

  for (let i = 0; i < length; i++) {
    results.push(newArray.splice(0, divideRes));
  }

  for (let i = 0; i < newArray.length; i++) {
    if (Array.isArray(results[i])) results[i].push(newArray[i]);
  }

  results = results.filter((item) => item.length);

  return results;
}

export function getItem(array: any, pos: number) {
  if (hasItems(array)) {
    return array[pos];
  }
}

export const hasItems = (any: any) => Array.isArray(any) && any.length > 0;

export const indexOfbyKey = (
  list: { [key: string]: any }[],
  key: string,
  value: any
) => {
  for (let index = 0; index < list.length; index++) {
    if (list[index][key] === value) return index;
  }
  return -1;
};

// https://stackoverflow.com/a/50029028
export const sortOn = (prop: string, list: string[]) => {
  const order: { [key: string]: number } = list.reduce(
    (obj, key, idx) => Object.assign(obj, { [key]: idx + 1 }),
    {}
  );

  const getVal = (item: { [key: string]: any }) =>
    order[item[prop]] || Infinity;

  return (a: { [key: string]: any }, b: { [key: string]: any }) =>
    getVal(a) - getVal(b);
};
