import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";
import type { Env } from "../env";

const sessionCookieName = "pb_session";
const sessionMaxAge = 7 * 24 * 60 * 60;

export const readSessionCookie = (c: Context): string | undefined => getCookie(c, sessionCookieName);

export const writeSessionCookie = (c: Context, token: string, env: Env): void => {
  setCookie(c, sessionCookieName, token, {
    httpOnly: true,
    maxAge: sessionMaxAge,
    path: "/",
    sameSite: "Lax",
    secure: env.NODE_ENV === "production",
  });
};

export const clearSessionCookie = (c: Context): void => {
  deleteCookie(c, sessionCookieName, { path: "/" });
};
