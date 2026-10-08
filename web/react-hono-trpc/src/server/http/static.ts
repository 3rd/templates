import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import type { Context } from "hono";

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const clientRoot = "dist/client";

export const serveClientAsset = async (c: Context): Promise<Response> => {
  const url = new URL(c.req.url);
  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = normalize(requestedPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = join(clientRoot, safePath);

  try {
    const file = await readFile(filePath);
    const contentType = contentTypes[extname(filePath)] ?? "application/octet-stream";
    return new Response(file, {
      headers: { "content-type": contentType },
    });
  } catch {
    const html = await readFile(join(clientRoot, "index.html"));
    const contentType = contentTypes[".html"] ?? "text/html; charset=utf-8";
    return new Response(html, {
      headers: { "content-type": contentType },
    });
  }
};
