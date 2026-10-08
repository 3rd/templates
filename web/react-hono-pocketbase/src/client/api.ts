import { DetailedError, hc, parseResponse, type ClientResponse } from "hono/client";
import type { AppType } from "../server/app";

export const api = hc<AppType>("/", {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => fetch(input, { ...init, credentials: "include" }),
});

type ErrorBody = { error: string };

const isErrorBody = (data: unknown): data is ErrorBody =>
  typeof data === "object" && data !== null && "error" in data && typeof data.error === "string";

const readErrorMessage = (data: unknown) => (isErrorBody(data) ? data.error : "Request failed");

export const readJson = async <T extends ClientResponse<unknown>>(response: T | Promise<T>) => {
  try {
    return await parseResponse(response);
  } catch (error) {
    if (!(error instanceof DetailedError)) {
      throw error;
    }

    throw new Error(readErrorMessage(error.detail?.data), { cause: error });
  }
};
