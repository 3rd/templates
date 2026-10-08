import { httpLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../server/trpc/router";

export const trpc = createTRPCReact<AppRouter>();

export const createTrpcClient = () =>
  trpc.createClient({
    links: [
      httpLink({
        url: "/api/trpc",
      }),
    ],
  });
