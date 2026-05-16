"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";

// ── Config ─────────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_SERVER_API_URL ?? "http://localhost:3001/api";

// ── Helpers ────────────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}, accessToken) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}/${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `Request failed: ${res.status}`);
  }

  return res.json();
}

// ── Context ────────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const refreshPromiseRef = useRef(null);

  // ── Silent refresh ─────────────────────────────────────────────────────────
  const refreshAccessToken = useCallback(async () => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    const promise = (async () => {
      try {
        const data = await apiFetch("auth/refresh", { method: "POST" });

        const newToken = data.data.session.access_token;
        setUser(data.data.user);
        setAccessToken(newToken);
        setIsAuthenticated(true);
        return newToken;
      } catch {
        setUser(null);
        setAccessToken(null);
        setIsAuthenticated(false);
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = promise;
    return promise;
  }, []);

  // ── Restore session on mount ───────────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await refreshAccessToken();
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setAccessToken(null);
        }
      } finally {
        setIsAuthLoading(false);
      }
    };

    restoreSession();
  }, [refreshAccessToken]);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const data = await apiFetch("auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setUser(data.data.user);
    setAccessToken(data.data.session.access_token);
    setIsAuthenticated(true);
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (email, password, fullName) => {
    await apiFetch("auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, fullName }),
    });
    // Don't auto-login — user needs to verify email
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await apiFetch("auth/logout", { method: "POST" }, accessToken).catch(() => {});
    setUser(null);
    setAccessToken(null);
    setIsAuthenticated(false);
    router.push("/login");
  }, [accessToken, router]);

  // ── Forgot password ────────────────────────────────────────────────────────
  const forgotPassword = useCallback(async (email) => {
    await apiFetch("auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        isAuthLoading,
        setUser,
        setAccessToken,
        setIsAuthenticated,
        login,
        register,
        logout,
        forgotPassword,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ── authFetch — auto-retries with refreshed token ─────────────────────────────
export async function authFetch(path, options, getToken, refresh) {
  let token = getToken();
  try {
    return await apiFetch(path, options, token);
  } catch (err) {
    if (err.message?.includes("401") || err.message?.includes("403")) {
      token = await refresh();
      if (!token) throw err;
      return apiFetch(path, options, token);
    }
    throw err;
  }
}