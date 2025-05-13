import { formatStringToCamelCase } from "utils/string";

export function getStyleObjectFromString(str: string) {
  if (typeof str !== "string") return {};

  const style: Record<string, string> = {};
  str.split(";").forEach((el) => {
    const [property, value] = el.split(":");
    //console.log(property, value);

    if (!property || !value) return;

    const formattedProperty = formatStringToCamelCase(property.trim());
    style[formattedProperty] = value.trim();
  });

  //console.log(">", style);

  return style;
}
