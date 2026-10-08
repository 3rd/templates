export type Env = {
  DATABASE_PATH: string;
  HOST: string;
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
};

const readNodeEnv = (): Env["NODE_ENV"] => {
  const value = process.env.NODE_ENV;
  if (value === "production" || value === "test") return value;
  return "development";
};

export const env: Env = {
  DATABASE_PATH: process.env["DATABASE_PATH"] ?? "data/app.db",
  HOST: process.env["HOST"] ?? "0.0.0.0",
  NODE_ENV: readNodeEnv(),
  PORT: Number(process.env["PORT"] ?? 3000),
};
