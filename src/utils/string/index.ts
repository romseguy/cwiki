import DOMPurify from "isomorphic-dompurify";
export * from "./base64ToUint8Array";
export * from "./capitalize";
export * from "./equals";
export * from "./formatStringToCamelCase";
export * from "./getStyleObjectFromString";
export * from "./normalize";
export * from "./toast";

export const MB = 1000000;

export const phoneR = /^[0-9]{10,}$/i;

export function bytesForHuman(bytes: number, decimals = 0) {
  const units = ["o", "Ko", "Mo", "Go"];
  let i = 0;

  for (i; bytes > 1024; i++) {
    bytes /= 1024;
  }

  return parseFloat(bytes.toFixed(decimals)) + units[i];
}

export function getExtension(path: string) {
  // extract file name from full path ...
  // (supports `\\` and `/` separators)
  const basename = path.split(/[\\/]/).pop();

  if (!basename) return "";

  // get last position of `.`
  const pos = basename.lastIndexOf(".");

  if (pos < 1) return "";

  // extract extension ignoring `.`
  return basename.slice(pos + 1).toLowerCase();
}

export function isImage(fileName: string) {
  const str = fileName.toLowerCase();
  return (
    str.includes(".png") ||
    str.includes(".jpg") ||
    str.includes(".jpeg") ||
    str.includes(".bmp") ||
    str.includes(".webp")
  );
}

export function isVideo(fileName: string) {
  const str = fileName.toLowerCase();
  return str.includes(".mp4") || str.includes(".webm");
}

export function logJson(message: string, object?: any) {
  if (object) console.log(message, JSON.stringify(object, null, 2));
  else console.log(message);
}

export function sanitize(str?: string) {
  if (!str) return "";
  return DOMPurify.sanitize(str, {
    ADD_ATTR: ["target"],
    ADD_TAGS: ["iframe"]
  });
}

export function toLowerCase(str?: string) {
  if (!str) return "";

  return str.toLowerCase();
}

export function toString(a: any): string {
  if (typeof a === "object" && a.toString) return a.toString();

  return "" + a;
}

export function transformRTEditorOutput(str: string): Document {
  const parser = new DOMParser();
  //const doc = parser.parseFromString(str.replace(/&nbsp;/g, " "), "text/html");
  const doc = parser.parseFromString(str, "text/html");
  const links = (doc.firstChild as HTMLElement).getElementsByTagName("a");
  //const paragraphs = (doc.firstChild as HTMLElement).getElementsByTagName("p");

  for (let i = 0; i < links.length; i++) {
    const link = links[i];

    if (!link.innerText.includes("http")) {
      link.setAttribute("title", link.innerText);

      if (link.href.includes("http") || link.href.includes("mailto:")) {
        link.classList.add("clip");

        if (link.href.includes("mailto:"))
          link.innerText = "@" + link.innerText;
      }
    }
  }

  // for (let i = 0; i < paragraphs.length; i++) {
  //   const paragraph = paragraphs[i];
  // }

  return doc;
}

export function transformTopicMessage(str: string) {
  if (!str) return "<i>Message vide.</i>";

  let newStr = "" + str;

  if (str.includes("href")) {
    const collapseLength = 28;
    const regex =
      /([^+>]*)[^<]*(<a [^>]*(href="([^>^\"]*)")[^>]*>)([^<]+)(<\/a>)/gi;
    let link;
    while ((link = regex.exec(str)) !== null) {
      // const url = link[4];
      const text = link[5];
      let canCollapse = text.length > collapseLength;
      if (canCollapse) {
        const shortText = "Ouvrir le lien";
        newStr = newStr.replace(">" + text + "<", ">" + shortText + "<");
      }
    }
  }

  return newStr;
}

export function truncate(str?: string, threshold?: number, addDots?: boolean) {
  if (!str) return "";

  return threshold && str.length > threshold
    ? `${str.substring(0, threshold)}${addDots && "..."}`
    : str;
}

export function zIndex(level: number = 0) {
  const base = 10000;
  return level === 0 ? base : (level + 1) * base;
}
