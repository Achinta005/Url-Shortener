"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";

export default function VerifiedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { setAccessToken, setIsAuthenticated } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1),
        );

        const access_token = hashParams.get("access_token");
        const refresh_token = hashParams.get("refresh_token");

        if (!access_token || !refresh_token) {
          throw new Error("No tokens found in URL");
        }

        const projectName = "url-service";
        const projectId = 2;

        const response1 = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_API_URL}/auth/oauth/callback?projectName=${projectName}&projectId=${projectId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              access_token,
              refresh_token,
            }),
          },
        );

        if (!response1.ok) {
          const errorData = await response1.json();
          throw new Error(errorData.message || "Profile creation failed");
        }

        const data = await response1.json();
        console.log("Profile created/verified:", data);

        const response = await fetch("/api/auth/set-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh_token }),
        });

        if (!response.ok) {
          throw new Error("Failed to set cookie");
        }
        setAccessToken(access_token);
        setIsAuthenticated(true);

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );

        setTimeout(() => {
          router.push("/home");
        }, 2000);
      } catch (error) {
        console.error("OAuth error:", error);
        router.push("/login?error=oauth_failed");
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [router]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid #e5e5e5",
              borderTopColor: "#3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p>Verifying authentication...</p>
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

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
      }}
    >
      <div>
        <p>Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
