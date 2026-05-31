"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { JwtProfile } from "@/types/api";

interface AuthContextValue {
  token: string | null;
  profile: JwtProfile | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function parseJwt(token: string): JwtProfile | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function persistToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem("sentinel_access_token", token);
    document.cookie = `sentinel_token=${token}; path=/; max-age=86400; samesite=lax`;
    return;
  }
  window.localStorage.removeItem("sentinel_access_token");
  document.cookie = "sentinel_token=; path=/; max-age=0; samesite=lax";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("sentinel_access_token");
  });

  const value = useMemo<AuthContextValue>(() => {
    const profile = token ? parseJwt(token) : null;
    return {
      token,
      profile,
      isAuthenticated: Boolean(token),
      login: (nextToken) => {
        persistToken(nextToken);
        setToken(nextToken);
      },
      logout: () => {
        persistToken(null);
        setToken(null);
      }
    };
  }, [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
