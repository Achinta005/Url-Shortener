"use client";

import { useRef, useCallback } from "react";
import { useAuth } from "../context/authContext";

export default function useApi() {
  const { accessToken, setAccessToken, setIsAuthenticated } = useAuth();

  // Prevent multiple simultaneous refresh calls
  const isRefreshing = useRef(false);
  const refreshQueue = useRef([]);

  const processQueue = (error, token = null) => {
    refreshQueue.current.forEach(({ resolve, reject }) =>
      error ? reject(error) : resolve(token),
    );
    refreshQueue.current = [];
  };

  const apiFetch = useCallback(
    async (url, options = {}) => {
      const res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        credentials: "include",
      });

      if (res.status !== 401) return res;

      // Already refreshing — queue this request
      if (isRefreshing.current) {
        return new Promise((resolve, reject) => {
          refreshQueue.current.push({ resolve, reject });
        }).then((newToken) =>
          fetch(url, {
            ...options,
            headers: {
              "Content-Type": "application/json",
              ...(options.headers || {}),
              Authorization: `Bearer ${newToken}`,
            },
            credentials: "include",
          }),
        );
      }

      isRefreshing.current = true;
      console.log("Token expired, attempting refresh...");

      try {
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (!refreshRes.ok) {
          processQueue(new Error("Refresh failed"));
          setAccessToken(null);
          setIsAuthenticated(false);
          throw new Error("Session expired. Please login again.");
        }

        const refreshData = await refreshRes.json();
        const newToken =
          refreshData.accessToken ??
          refreshData.data?.accessToken ??
          refreshData.access_token ?? // handle snake_case too
          null;

        if (!newToken) {
          throw new Error("No access token in refresh response");
        }

        setAccessToken(newToken);
        setIsAuthenticated(true);
        processQueue(null, newToken);

        // Retry original request
        return fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
            Authorization: `Bearer ${newToken}`,
          },
          credentials: "include",
        });
      } catch (err) {
        processQueue(err);
        setAccessToken(null);
        setIsAuthenticated(false);
        throw err;
      } finally {
        isRefreshing.current = false;
      }
    },
    [accessToken, setAccessToken, setIsAuthenticated],
  );

  return apiFetch;
}
