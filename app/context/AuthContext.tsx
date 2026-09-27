"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import * as authApi from "../lib/auth";

import { User } from "../lib/types";
interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  registerDriver: (username: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, try to silently resume a session using the
  // httpOnly refresh cookie (e.g. the user refreshed the page).
  useEffect(() => {
    authApi
      .bootstrapSession()
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    login: async (username, password) => {
      const loggedInUser = await authApi.login(username, password);
      setUser(loggedInUser);
      return loggedInUser;
    },
    registerDriver: async (username, email, password) => {
      const newUser = await authApi.registerDriver(username, email, password);
      setUser(newUser);
      return newUser;
    },
    logout: async () => {
      await authApi.logout();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}