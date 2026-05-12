"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);

  const hasFetched = useRef(false);

  const clearAuth = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setAccessToken(null);
  }, []);

  const setAuth = useCallback((userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    setAccessToken(token);
  }, []);

  // ── Core: fetch /auth/me with a known access token ──────────────────────────
  const fetchMe = useCallback(async (token) => {
    const res = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.data?.user ?? data.user ?? null;
  }, []);

  // ── Core: call /auth/refresh → returns new access_token from body ───────────
  const doRefresh = useCallback(async () => {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) return null;

    const data = await res.json();
    // Backend returns: { data: { session: { access_token, expires_at } } }
    return data.data?.session?.access_token ?? null;
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      const newToken = await doRefresh();
      console.log("Restoring session, got new token:", !!newToken);
      if (!newToken) {
        clearAuth();
        return;
      }

      const userData = await fetchMe(newToken);

      if (!userData) {
        clearAuth();
        return;
      }

      setAuth(userData, newToken);
    } catch (err) {
      console.error(err);
      clearAuth();
    } finally {
      setIsAuthLoading(false);
    }
  }, [doRefresh, fetchMe, setAuth, clearAuth]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    restoreSession();
  }, []); // intentionally empty — only runs once on mount

  // ── login: called after password login or OAuth verify-callback ─────────────
  // Backend login returns: { data: { user, session: { access_token } } }
  const login = useCallback(
    (userData, token) => {
      setAuth(userData, token);
    },
    [setAuth],
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
    } catch (_) {}
    clearAuth();
  }, [accessToken, clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        setIsAuthenticated,
        isAuthLoading,
        accessToken,
        setAccessToken, // expose so callers can attach to API requests
        login,
        logout,
        restoreSession,
        fetchMe,
        doRefresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
