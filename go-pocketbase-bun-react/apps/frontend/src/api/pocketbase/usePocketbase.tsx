import { useContext } from "react";
import { PocketbaseContext } from "./PocketbaseProvider";

export const usePocketbase = () => useContext(PocketbaseContext);
