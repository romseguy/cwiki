import { isServer } from "utils/isServer";

export const getStoredValue = (key?: string) => {
  if (isServer() || !key) return;
  const d = localStorage.getItem(key);
  if (d) {
    const parsed = JSON.parse(d);

    if (parsed) {
      const value = parsed.value;

      if (typeof value === "string") return value;
    }
  }
};
