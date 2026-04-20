"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const { param } = useParams();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("init"); // init | resolving | redirecting

  useEffect(() => {
    if (!param || param === "login" || param === "register") return;

    // Phase 1: resolving (0 → 60%)
    setPhase("resolving");
    const t1 = setTimeout(() => setProgress(60), 100);

    // Phase 2: redirecting (60 → 90%)
    const t2 = setTimeout(() => {
      setPhase("redirecting");
      setProgress(90);
    }, 900);

    // Phase 3: go
    const t3 = setTimeout(() => {
      setProgress(100);
      const url = `${process.env.NEXT_PUBLIC_SERVER_API_URL}/${param}`;
      window.location.replace(url);
    }, 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [param]);

  const label = {
    init: "Initializing…",
    resolving: "Resolving link…",
    redirecting: "Taking you there…",
  }[phase];

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span style={styles.logoText}>LinkShip</span>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          {/* Spinner */}
          <div style={styles.spinnerWrap}>
            <div style={styles.spinnerTrack} />
            <div
              style={{
                ...styles.spinnerHead,
                animation:
                  phase !== "init" ? "ls-spin 0.8s linear infinite" : "none",
              }}
            />
          </div>

          {/* Text */}
          <p style={styles.heading}>Redirecting</p>
          <p style={styles.subtext}>{label}</p>

          {/* Link pill */}
          <div style={styles.pill}>
            <span style={styles.pillDot} />
            <span style={styles.pillCode}>/{param}</span>
          </div>

          {/* Progress bar */}
          <div style={styles.barTrack}>
            <div
              style={{
                ...styles.barFill,
                width: `${progress}%`,
                transition:
                  progress === 0
                    ? "none"
                    : progress === 100
                      ? "width 0.2s ease"
                      : "width 1.2s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          </div>

          <p style={styles.hint}>You will be redirected automatically</p>
        </div>
      </main>

      <footer style={styles.footer}>
        <span>Secure redirect · LinkShip</span>
      </footer>

      <style>{`
        @keyframes ls-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "var(--color-background-tertiary, #f5f5f3)",
    fontFamily: "var(--font-sans, system-ui, sans-serif)",
  },
  header: {
    padding: "14px 24px",
    borderBottom: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.1))",
    background: "var(--color-background-primary)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "var(--color-text-primary)",
  },
  logoText: {
    fontSize: 15,
    fontWeight: 500,
  },
  main: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    background: "var(--color-background-primary)",
    border: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.1))",
    borderRadius: 16,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 360,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  spinnerWrap: {
    position: "relative",
    width: 52,
    height: 52,
    marginBottom: 4,
  },
  spinnerTrack: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: "3px solid var(--color-border-tertiary, rgba(0,0,0,0.1))",
  },
  spinnerHead: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: "3px solid transparent",
    borderTopColor: "var(--color-text-primary)",
  },
  heading: {
    margin: 0,
    fontSize: 18,
    fontWeight: 500,
    color: "var(--color-text-primary)",
  },
  subtext: {
    margin: 0,
    fontSize: 13,
    color: "var(--color-text-secondary)",
    minHeight: 18,
  },
  pill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 14px",
    background: "var(--color-background-secondary, rgba(0,0,0,0.04))",
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: 999,
    marginTop: 4,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "var(--color-text-secondary)",
    flexShrink: 0,
  },
  pillCode: {
    fontSize: 13,
    fontFamily: "var(--font-mono, monospace)",
    color: "var(--color-text-secondary)",
    maxWidth: 220,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  barTrack: {
    width: "100%",
    height: 3,
    background: "var(--color-border-tertiary, rgba(0,0,0,0.08))",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 8,
  },
  barFill: {
    height: "100%",
    background: "var(--color-text-primary)",
    borderRadius: 999,
  },
  hint: {
    margin: 0,
    fontSize: 11,
    color: "var(--color-text-tertiary, rgba(0,0,0,0.35))",
    textAlign: "center",
  },
  footer: {
    padding: "12px 24px",
    borderTop: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.1))",
    background: "var(--color-background-primary)",
    textAlign: "center",
    fontSize: 11,
    color: "var(--color-text-tertiary, rgba(0,0,0,0.35))",
  },
};
