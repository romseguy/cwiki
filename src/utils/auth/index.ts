import * as Iron from "@hapi/iron";

export const sealOptions = {
  ...Iron.defaults,
  encryption: { ...Iron.defaults.encryption, minPasswordlength: 0 },
  integrity: { ...Iron.defaults.integrity, minPasswordlength: 0 }
};

export * from "./cookie";
export * from "./client";
export * from "./session";
