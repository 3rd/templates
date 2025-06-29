import process from "process";

export const env = {
  IS_DEV: process.env.NODE_ENV === "development",
  PORT: process.env.PORT || 3000,
};
