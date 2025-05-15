export const localize = (str: Record<string, string>, locale: string) =>
  str[locale] ?? str["en"];
