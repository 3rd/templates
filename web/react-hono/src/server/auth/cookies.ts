import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";
import type { Env } from "../env";

export const sessionCookieName = "app_session";

export const readSessionCookie = (c: Context): string | undefined => getCookie(c, sessionCookieName);

export const writeSessionCookie = (c: Context, token: string, expires: Date, env: Env): void => {
  setCookie(c, sessionCookieName, token, {
    expires,
    httpOnly: true,
    path: "/",
    sameSite: "Lax",
    secure: env.NODE_ENV === "production",
  });
};

export const clearSessionCookie = (c: Context): void => {
  deleteCookie(c, sessionCookieName, { path: "/" });
};
