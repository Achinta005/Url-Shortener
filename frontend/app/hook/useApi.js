"use client";

import { useAuth } from "../context/authContext";

export default function useApi() {
  const { accessToken, setAccessToken, setIsAuthenticated } = useAuth();

  const apiFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
      credentials: "include",
    });

    // 🔐 Access token expired
    if (res.status === 401) {
      console.log("🔄 Token expired, attempting refresh...");

      try {
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (!refreshRes.ok) {
          console.error("❌ Refresh failed");
          setAccessToken(null);
          setIsAuthenticated(false);
          throw new Error("Session expired");
        }

        const refreshData = await refreshRes.json();

        // ✅ Handle both response structures
        const newAccessToken =
          refreshData.accessToken || refreshData.data?.accessToken;

        if (!newAccessToken) {
          console.error("❌ No access token in refresh response:", refreshData);
          throw new Error("Invalid refresh response");
        }

        console.log("✅ Token refreshed successfully");
        setAccessToken(newAccessToken);
        setIsAuthenticated(true);

        // 🔁 Retry original request with new token
        return fetch(url, {
          ...options,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${newAccessToken}`,
          },
          credentials: "include",
        });
      } catch (refreshError) {
        console.error("❌ Refresh error:", refreshError);
        setAccessToken(null);
        setIsAuthenticated(false);
        throw refreshError;
      }
    }

    return res;
  };

  return apiFetch;
}
