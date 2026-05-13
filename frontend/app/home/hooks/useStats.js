// useStats.js — full updated file

import { useState, useCallback } from "react";
import useApi from "../../hook/useApi";
import {
  fetchStatsApi,
  fetchLatencyStatsApi,
  fetchClickTimelineApi,
} from "../lib/linkApi";

export function useStats() {
  const apiFetch = useApi();

  const [stats, setStats] = useState({
    totalUrls: 0,
    totalClicks: 0,
    activeUrls: 0,
    expiredUrls: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [latencyStats, setLatencyStats] = useState({
    buckets: [],
    timeline: [],
    summary: { avgLatency: 0, minLatency: 0, maxLatency: 0, p50: [0], p95: [0], totalClicks: 0 },
  });
  const [latencyLoading, setLatencyLoading] = useState(false);

  const [clickTimeline, setClickTimeline] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // ── Basic stats ──────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await fetchStatsApi(apiFetch);
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      if (data.success && data.data) setStats(data.data);
    } catch (err) {
      console.error("fetchStats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [apiFetch]);

  // ── Latency stats (histogram + summary) ─────────────────────────────────
  const fetchLatencyStats = useCallback(
    async (shortCode) => {
      try {
        setLatencyLoading(true);
        const res = await fetchLatencyStatsApi(apiFetch, shortCode);
        if (!res.ok) throw new Error("Failed to fetch latency stats");
        const data = await res.json();
        if (data.success && data.data) setLatencyStats(data.data);
      } catch (err) {
        console.error("fetchLatencyStats:", err);
      } finally {
        setLatencyLoading(false);
      }
    },
    [apiFetch],
  );

  // ── Click timeline (line graph) ──────────────────────────────────────────
  const fetchClickTimeline = useCallback(
    async (shortCode, days = 30) => {
      try {
        setTimelineLoading(true);
        const res = await fetchClickTimelineApi(apiFetch, shortCode, days);
        if (!res.ok) throw new Error("Failed to fetch click timeline");
        const data = await res.json();
        if (data.success && data.data) setClickTimeline(data.data);
      } catch (err) {
        console.error("fetchClickTimeline:", err);
      } finally {
        setTimelineLoading(false);
      }
    },
    [apiFetch],
  );

  // ── Client-side derived stats from URL list ──────────────────────────────
  const advancedStats = useCallback((urls) => {
    const totalClicks = urls.reduce((sum, u) => sum + u.clicks, 0);
    return {
      totalClicks,
      avgClicksPerLink: urls.length > 0 ? Math.round(totalClicks / urls.length) : 0,
      mostClickedLink: urls.reduce(
        (max, u) => (u.clicks > max.clicks ? u : max),
        { clicks: 0 },
      ),
      recentLinks: urls.filter(
        (u) => new Date() - new Date(u.createdAt) < 7 * 24 * 60 * 60 * 1000,
      ).length,
    };
  }, []);

  return {
    // basic
    stats,
    statsLoading,
    fetchStats,

    // latency histogram + p50/p95 summary
    latencyStats,
    latencyLoading,
    fetchLatencyStats,

    // clicks-per-day line graph
    clickTimeline,
    timelineLoading,
    fetchClickTimeline,

    // derived
    advancedStats,
  };
}