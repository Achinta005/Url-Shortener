"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"; // npm install jwt-decode

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Decode JWT and extract user data
  const decodeAndSetUser = (token) => {
    try {
      const decoded = jwtDecode(token);
      
      // Set user from decoded token
      setUser(decoded);
      setAccessToken(token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("❌ JWT decode error:", error);
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
    }
  };

  // Refresh and access token provider after login
  useEffect(() => {
    const restoreSession = async () => {
      try {
        console.log("🔄 Restoring session...");

        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });


        if (!res.ok) {
          throw new Error("Refresh failed");
        }

        const data = await res.json();
        console.log("✅ Session restored");

        // Decode JWT and set user
        if (data.accessToken) {
          decodeAndSetUser(data.accessToken);
        }
      } catch (err) {
        console.error("❌ Session restore error:", err);
        setAccessToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  const setAccessTokenAndDecodeUser = (token) => {
    if (token) {
      decodeAndSetUser(token);
    } else {
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        isAuthenticated,
        isAuthLoading,
        setAccessToken: setAccessTokenAndDecodeUser,
        setIsAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}