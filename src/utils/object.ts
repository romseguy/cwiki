export function removeProps(obj: Record<string, any>, propsToRemove: string[]) {
  let newObj: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    if (propsToRemove.indexOf(key) === -1) newObj[key] = obj[key];
  });
  return newObj;
}
