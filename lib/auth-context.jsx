"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, request, setToken } from "./api";
import { hasPermission } from "./permissions";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [session, setSession] = useState({ user: null, tenant: null });
  const [status, setStatus] = useState("loading"); // loading | authenticated | anonymous

  /** Re-hydrate the session from the token on first paint. */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await request({ url: "/auth/me", method: "GET" });
        if (!cancelled) {
          setSession({ user: data.user, tenant: data.tenant });
          setStatus("authenticated");
        }
      } catch {
        if (!cancelled) {
          setSession({ user: null, tenant: null });
          setStatus("anonymous");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await api
      .post("/auth/login", credentials)
      .then((r) => ({ data: r.data.data }));

    setToken(data.token);
    setSession({ user: data.user, tenant: data.tenant });
    setStatus("authenticated");
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setSession({ user: null, tenant: null });
    setStatus("anonymous");
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      ...session,
      status,
      isAuthenticated: status === "authenticated",
      login,
      logout,
      can: (permission) => hasPermission(session.user?.role, permission),
    }),
    [session, status, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
