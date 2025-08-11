import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SWRConfig } from "swr";
import { App } from "./App.tsx";
import { PocketbaseProvider } from "./api/pocketbase/PocketbaseProvider.tsx";

import "./index.css";

const swrConfig = {
  refreshInterval: 0,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  onError: (error: unknown) => {
    console.error("SWR Error:", error);
  },
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PocketbaseProvider>
      <SWRConfig value={swrConfig}>
        <App />
      </SWRConfig>
    </PocketbaseProvider>
  </StrictMode>,
);
