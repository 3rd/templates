import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import PocketBase from "pocketbase";
import { env } from "../../utils/env";
import { TypedPocketBase, UsersResponse } from "./generated";

const TOKEN_REFRESH_OFFSET_MS = 10 * 60 * 1000; // 10 minutes before expiry
const TOKEN_CHECK_INTERVAL_MS = 60 * 1000;

type ContextType = {
  user: UsersResponse | null;
  token: string;
  pb: TypedPocketBase;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, passwordConfirm: string) => Promise<UsersResponse>;
  logout: () => void;
};

export const PocketbaseContext = createContext<ContextType>({} as ContextType);

export const PocketbaseProvider = ({ children }: { children: React.ReactNode }) => {
  const pb = useMemo(() => new PocketBase(env.VITE_POCKETBASE_BASE_URL) as TypedPocketBase, []);
  const [token, setToken] = useState(pb.authStore.token);
  const [user, setUser] = useState<UsersResponse | null>(pb.authStore.record as UsersResponse | null);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = Boolean(pb.authStore.isValid) && Boolean(user);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const authData = await pb.collection("users").authWithPassword(email, password);
        setUser(authData.record as UsersResponse);
        setToken(authData.token);
      } catch (error: unknown) {
        throw new Error(error instanceof Error ? error.message : "Failed to login. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [pb],
  );

  const handleRegister = useCallback(
    async (email: string, password: string, passwordConfirm: string) => {
      setIsLoading(true);
      try {
        const userData = await pb.collection("users").create({
          email,
          password,
          passwordConfirm,
          emailVisibility: true,
        });
        await handleLogin(email, password);
        return userData;
      } catch (error: unknown) {
        throw new Error(error instanceof Error ? error.message : "Failed to register. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [pb, handleLogin],
  );

  const handleLogout = useCallback(() => {
    pb.authStore.clear();
    setUser(null);
    setToken("");
  }, [pb]);

  const handleRefresh = useCallback(async () => {
    if (!pb.authStore.isValid || !token) return;

    try {
      const decodedToken = jwtDecode<{ exp: number }>(token);
      const expiresAt = decodedToken.exp;
      const currentTime = Math.floor(Date.now() / 1000);
      const refreshThreshold = expiresAt - TOKEN_REFRESH_OFFSET_MS / 1000;
      if (currentTime >= refreshThreshold) {
        await pb.collection("users").authRefresh();
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
    }
  }, [pb, token]);

  // subscribe to auth changes
  useEffect(() => {
    return pb.authStore.onChange((newToken, newModel) => {
      setToken(newToken);
      setUser(newModel as UsersResponse | null);
    });
  }, [pb.authStore]);

  // setup token refresh
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, TOKEN_CHECK_INTERVAL_MS);
    handleRefresh();
    return () => clearInterval(interval);
  }, [handleRefresh]);

  const providerValue = useMemo(
    () => ({
      user,
      token,
      pb,
      isAuthenticated,
      isLoading,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
    }),
    [user, token, pb, isAuthenticated, isLoading, handleLogin, handleRegister, handleLogout],
  );

  return <PocketbaseContext.Provider value={providerValue}>{children}</PocketbaseContext.Provider>;
};
