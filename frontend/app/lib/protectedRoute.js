"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      setCountdown(3);

      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const redirectTimer = setTimeout(() => {
        router.push("/login");
      }, 3000);

      return () => {
        clearInterval(countdownInterval);
        clearTimeout(redirectTimer);
      };
    }
  }, [isAuthenticated, isAuthLoading, router]);

  if (isAuthLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid",
              borderColor: "#e5e5e5 #e5e5e5 #3b82f6 #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#333", fontSize: "16px" }}>Verifying...</p>
          <style jsx>{`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 24px",
              fontSize: "48px",
            }}
          >
            🔒
          </div>
          <h2
            style={{
              color: "#333",
              fontSize: "24px",
              marginBottom: "8px",
            }}
          >
            Unauthorized
          </h2>
          <p style={{ color: "#666", marginBottom: "24px" }}>
            Redirecting to login in {countdown}s...
          </p>
          <button
            onClick={() => router.push("/login")}
            style={{
              padding: "10px 24px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return children;
}
