export const urlR = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/i;
export const optionalProtocolUrlR =
  /^((?:https?:\/\/)?[^./]+(?:\.[^./]+)+(?:\/.*)?)$/i;
export const unauthorizedEntityUrls = [
  "404",
  "a_propos",
  "admin",
  "callback",
  "contact",
  "donate",
  "evenements",
  "index",
  "login",
  "organisations",
  "privacy",
  "sandbox",
  "sent"
];
