import { serialize } from "cookie";
import { NextApiResponse } from "next";
const { getEnv } = require("utils/env");

export const TOKEN_NAME = "api_token";
const MAX_AGE = 60 * 60 * 24 * 7;

export function createCookie(name: string, data: string, options = {}) {
  return serialize(name, data, {
    maxAge: MAX_AGE,
    expires: new Date(Date.now() + MAX_AGE * 1000),
    secure: getEnv() === "production",
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    ...options
  });
}
export function getAuthToken(cookies?: Record<string, string>) {
  if (!cookies) return "";
  return cookies[TOKEN_NAME];
}

export function setAuthToken(res: NextApiResponse, token: string) {
  return res.setHeader("Set-Cookie", [
    createCookie(TOKEN_NAME, token)
    //createCookie("authed", token ? "true" : "false", { httpOnly: false })
  ]);
}
