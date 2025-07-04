import { createRoot } from "react-dom/client";
import { App } from "./App";

import "./index.css";

const container = document.querySelector("#root") as Element;
const root = createRoot(container);

root.render(<App />);
