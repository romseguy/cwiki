export const emailR = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
export const optionalProtocolUrlR =
  /^((?:https?:\/\/)?[^./]+(?:\.[^./]+)+(?:\/.*)?)$/i;
export const phoneR = /^[0-9]{10,}$/i;
export const urlFilenameR = /([^\/]+)(?=\.\w+$)/;
export const urlR = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/i;
