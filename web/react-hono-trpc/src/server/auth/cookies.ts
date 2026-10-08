import { generateCookie, getCookie } from "hono/cookie";
import type { Context } from "hono";
import type { Env } from "../env";

export const sessionCookieName = "app_session";

export const readSessionCookie = (c: Context): string | undefined => getCookie(c, sessionCookieName);

const sessionCookieOptions = (expires: Date, env: Env): NonNullable<Parameters<typeof generateCookie>[2]> => ({
  expires,
  httpOnly: true,
  path: "/",
  sameSite: "Lax",
  secure: env.NODE_ENV === "production",
});

export const writeSessionResponseCookie = (headers: Headers, token: string, expires: Date, env: Env): void => {
  headers.append("set-cookie", generateCookie(sessionCookieName, token, sessionCookieOptions(expires, env)));
};

export const clearSessionResponseCookie = (headers: Headers): void => {
  headers.append("set-cookie", generateCookie(sessionCookieName, "", { expires: new Date(0), path: "/" }));
};
