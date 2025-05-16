export const localize = (
  str?: Record<string, string>,
  locale: string | undefined = "en"
) => (str ? (str[locale] ? str[locale] : str.en) : "");
