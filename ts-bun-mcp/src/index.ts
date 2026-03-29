import { createServer } from "@/server/create-server";

export const server = createServer();

if (import.meta.main) {
  server.start({ transportType: "stdio" });
}
