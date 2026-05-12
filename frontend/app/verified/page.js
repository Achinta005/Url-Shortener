"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";

export default function VerifiedPage() {
  const router = useRouter();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  const { login, setAccessToken, setIsAuthenticated } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase puts tokens in the URL hash after OAuth/email verify
        // e.g. /verified#access_token=xxx&refresh_token=yyy&type=signup
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        const type = params.get("type"); // signup | recovery | magiclink

        if (!access_token) {
          setStatus("error");
          setMessage("No token found. Link may be invalid or expired.");
          return;
        }

        if (type === "recovery") {
          // For password reset — redirect to reset page with token
          router.replace(`/reset-password?token=${access_token}`);
          return;
        }

        // For signup/OAuth — send to backend to verify and set cookies
        const res = await fetch("/api/auth/verify-callback", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token, refresh_token, type }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
          return;
        }
        console.log("Verification successful:", data);
        setAccessToken(data.session.access_token);

        login(data.user, data.session.access_token);

        setIsAuthenticated(true);

        setStatus("success");
        setMessage("Verified! Redirecting...");

        setTimeout(() => {
          router.replace("/home");
        }, 1500);
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    handleCallback();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      {status === "verifying" && (
        <>
          <div>Verifying your account...</div>
        </>
      )}
      {status === "success" && (
        <>
          <div>✅ {message}</div>
        </>
      )}
      {status === "error" && (
        <>
          <div>❌ {message}</div>
          <button
            onClick={() => router.push("/login")}
            style={{ marginTop: 16 }}
          >
            Back to Login
          </button>
        </>
      )}
    </div>
  );
}
