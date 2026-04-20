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

  // Prevent double-call in React StrictMode
  const hasFetched = useRef(false);

  const clearAuth = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const setAuth = useCallback((userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      // Step 1: Try /auth/me with existing access_token cookie
      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        const userData = data.data?.user ?? data.user ?? null;
        if (userData) {
          setAuth(userData);
          return;
        }
      }

      // Step 2: access_token expired — try refresh
      if (res.status === 401) {
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (refreshRes.ok) {
          // After refresh, re-fetch /auth/me to get fresh user data
          const meRes = await fetch("/api/auth/me", {
            method: "GET",
            credentials: "include",
          });

          if (meRes.ok) {
            const meData = await meRes.json();
            const userData = meData.data?.user ?? meData.user ?? null;
            if (userData) {
              setAuth(userData);
              return;
            }
          }
        }

        // Step 3: refresh also failed — clear auth
        clearAuth();
      } else {
        clearAuth();
      }
    } catch (err) {
      console.error("[restoreSession] error:", err);
      clearAuth();
    } finally {
      setIsAuthLoading(false);
    }
  }, [setAuth, clearAuth]); // ✅ proper deps

  useEffect(() => {
    if (hasFetched.current) return; // StrictMode guard
    hasFetched.current = true;
    restoreSession();
  }, [restoreSession]);

  const login = useCallback((userData) => {
    setAuth(userData);
  }, [setAuth]); // ✅ proper deps

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (_) {}
    clearAuth();
  }, [clearAuth]); // ✅ proper deps

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAuthLoading,
        login,
        logout,
        restoreSession, // ✅ expose for manual re-auth if needed
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