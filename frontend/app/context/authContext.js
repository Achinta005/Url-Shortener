"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const clearAuth = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const setAuth = useCallback((userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const restoreSession = useCallback(async () => {
    // Step 1: Try /auth/me with existing access_token cookie
    try {
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

      // Step 2: access_token expired or invalid — try refresh
      if (res.status === 401) {
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const userData = refreshData.data?.user ?? refreshData.user ?? null;
          if (userData) {
            setAuth(userData);
            return;
          }
        }

        // Step 3: refresh_token also expired — clear auth
        clearAuth();
      } else {
        clearAuth();
      }
    } catch (err) {
      clearAuth();
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, []);

  const login = useCallback((userData) => {
    setAuth(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (_) {}
    clearAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAuthLoading,
        login,
        logout,
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
