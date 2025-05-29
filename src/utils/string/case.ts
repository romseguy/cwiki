export function formatStringToCamelCase(str: string) {
  const splitted = str.split("-");
  if (splitted.length === 1) return splitted[0];
  return (
    splitted[0] +
    splitted
      .slice(1)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join("")
  );
}

export function formatStringToWikiUrl(str: string) {
  return str.replaceAll(" ", "-");
}

export function formatStringToMdUrl(str: string) {
  return str.replaceAll(" ", "-");
}
