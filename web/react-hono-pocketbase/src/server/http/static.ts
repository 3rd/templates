import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, normalize } from "node:path";
import type { Context } from "hono";

const clientDir = "dist/client";
const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const contentTypeFor = (path: string): string => {
  const extension = path.match(/\.[^.]+$/)?.[0] ?? "";
  return contentTypes[extension] ?? "application/octet-stream";
};

export const serveClientAsset = async (c: Context): Promise<Response> => {
  const requestedPath = c.req.path === "/" ? "/index.html" : c.req.path;
  const assetPath = join(clientDir, normalize(requestedPath));
  const fallbackPath = join(clientDir, "index.html");
  const filePath = existsSync(assetPath) ? assetPath : fallbackPath;

  if (!existsSync(filePath)) return c.text("Client build not found. Run `bun run build` first.", 404);

  const body = await readFile(filePath);
  return new Response(body, {
    headers: {
      "content-type": contentTypeFor(filePath),
    },
  });
};
