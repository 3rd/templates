export type Env = {
  HOST: string;
  NODE_ENV: "development" | "production" | "test";
  POCKETBASE_URL: string;
  PORT: number;
};

const readNodeEnv = (): Env["NODE_ENV"] => {
  const value = process.env.NODE_ENV;
  if (value === "production" || value === "test") return value;
  return "development";
};

export const env: Env = {
  HOST: process.env["HOST"] ?? "0.0.0.0",
  NODE_ENV: readNodeEnv(),
  POCKETBASE_URL: process.env["POCKETBASE_URL"] ?? "http://127.0.0.1:8090",
  PORT: Number(process.env["PORT"] ?? 3000),
};
