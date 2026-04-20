import { useState, useCallback } from "react";
import useApi from "../../hook/useApi";
import { fetchStatsApi } from "../lib/linkApi";

export function useStats() {
  const apiFetch = useApi();
  const [stats, setStats] = useState({ totalUrls: 0, totalClicks: 0, activeUrls: 0, expiredUrls: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

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

  const advancedStats = (urls) => {
    const totalClicks = urls.reduce((sum, u) => sum + u.clicks, 0);
    return {
      totalClicks,
      avgClicksPerLink: urls.length > 0 ? Math.round(totalClicks / urls.length) : 0,
      mostClickedLink: urls.reduce((max, u) => (u.clicks > max.clicks ? u : max), { clicks: 0 }),
      recentLinks: urls.filter(
        (u) => new Date() - new Date(u.createdAt) < 7 * 24 * 60 * 60 * 1000
      ).length,
    };
  };

  return { stats, statsLoading, fetchStats, advancedStats };
}