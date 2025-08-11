import { useContext } from "react";
import { PocketbaseContext } from "../api/pocketbase/PocketbaseProvider";

export const useAuth = () => {
  const context = useContext(PocketbaseContext);
  
  if (!context) {
    throw new Error("useAuth must be used within PocketbaseProvider");
  }
  
  return {
    user: context.user,
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    login: context.login,
    register: context.register,
    logout: context.logout,
  };
};