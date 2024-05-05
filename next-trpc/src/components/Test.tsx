"use client";

import React from "react";
import { trpc } from "@/trpc/client";

export const Test = () => {
  const { data } = trpc.test.check.useQuery();

  return <div>Query result: {data}</div>;
};
