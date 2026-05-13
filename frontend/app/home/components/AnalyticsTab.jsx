"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Area, AreaChart,
} from "recharts";
import { TrendingUp, Clock, Zap, Activity, MousePointerClick, Link2 } from "lucide-react";
import { useStats } from "../hooks/useStats";

const BUCKET_COLORS = {
  "<50ms":     "#22c55e",
  "50-100ms":  "#84cc16",
  "100-200ms": "#eab308",
  "200-500ms": "#f97316",
  "500ms+":    "#ef4444",
};

function CustomTooltip({ active, payload, label, unit = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color ?? "#6366f1" }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}{unit}
        </p>
      ))}
    </div>
  );
}

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className="flex-1 min-w-0 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 text-slate-400 text-xs mb-3 font-medium">
        <span style={{ color }}>{icon}</span>
        {label}
      </div>
      <p className="text-3xl font-bold text-slate-900 leading-none mb-1">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
        {title}
      </p>
      {children}
    </div>
  );
}

const EMPTY = (
  <div className="h-44 flex items-center justify-center text-slate-300 text-sm">
    No data yet
  </div>
);

export default function AnalyticsTab() {
  const {
    stats, statsLoading, fetchStats,
    latencyStats, latencyLoading, fetchLatencyStats,
    clickTimeline, timelineLoading, fetchClickTimeline,
  } = useStats();

  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchStats();
    fetchLatencyStats();
  }, []);

  useEffect(() => {
    fetchClickTimeline(undefined, days);
  }, [days]);

  const timelineData = clickTimeline.reduce((acc, item) => {
    const date = item._id?.date ?? item._id ?? "—";
    const ex = acc.find((d) => d.date === date);
    if (ex) {
      ex.count += item.count;
      ex.avgLatency = Math.round((ex.avgLatency + (item.avgLatency ?? 0)) / 2);
    } else {
      acc.push({ date, count: item.count, avgLatency: Math.round(item.avgLatency ?? 0) });
    }
    return acc;
  }, []);

  const bucketData = (latencyStats.buckets ?? []).map((b) => ({
    bucket: b._id, count: b.count, color: BUCKET_COLORS[b._id] ?? "#6366f1",
  }));

  const { avgLatency, minLatency, maxLatency, p50, p95 } = latencyStats.summary ?? {};
  const p50v = Array.isArray(p50) ? p50[0] : p50;
  const p95v = Array.isArray(p95) ? p95[0] : p95;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp size={18} className="text-indigo-600" />
          Analytics Overview
        </h2>
        <div className="flex gap-1.5">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                days === d
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="flex gap-4 flex-wrap">
        <StatCard
          icon={<MousePointerClick size={13} />} label="Total Clicks" color="#6366f1"
          value={statsLoading ? "…" : (stats.totalClicks?.toLocaleString() ?? "0")}
          sub={`Avg ${stats.totalUrls > 0 ? Math.round(stats.totalClicks / stats.totalUrls) : 0} per link`}
        />
        <StatCard
          icon={<Activity size={13} />} label="Active Links" color="#22c55e"
          value={statsLoading ? "…" : (stats.activeUrls ?? "0")}
          sub={`${stats.totalUrls > 0 ? Math.round((stats.activeUrls / stats.totalUrls) * 100) : 0}% of total`}
        />
        <StatCard
          icon={<Zap size={13} />} label="Avg Latency" color="#eab308"
          value={latencyLoading ? "…" : (avgLatency != null ? `${Math.round(avgLatency)}ms` : "—")}
          sub={minLatency != null ? `min ${Math.round(minLatency)}ms` : undefined}
        />
        <StatCard
          icon={<Clock size={13} />} label="P95 Latency" color="#f97316"
          value={latencyLoading ? "…" : (p95v != null ? `${Math.round(p95v)}ms` : "—")}
          sub={maxLatency != null ? `max ${Math.round(maxLatency)}ms` : undefined}
        />
        <StatCard
          icon={<Link2 size={13} />} label="Total URLs" color="#38bdf8"
          value={statsLoading ? "…" : (stats.totalUrls ?? "0")}
        />
        <StatCard
          icon={<Clock size={13} />} label="Expired" color="#ef4444"
          value={statsLoading ? "…" : (stats.expiredUrls ?? "0")}
          sub={`${stats.totalUrls > 0 ? Math.round((stats.expiredUrls / stats.totalUrls) * 100) : 0}% of total`}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="Clicks over time">
          {timelineData.length === 0 ? EMPTY : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={timelineData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Clicks"
                  stroke="#6366f1" fill="url(#clickGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Avg redirect latency (ms)">
          {timelineData.length === 0 ? EMPTY : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={timelineData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip unit="ms" />} />
                <Line type="monotone" dataKey="avgLatency" name="Avg ms"
                  stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="Latency distribution">
          {bucketData.length === 0 ? EMPTY : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={bucketData} barCategoryGap="35%"
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                <XAxis dataKey="bucket" tick={{ fill: "#94a3b8", fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Requests" radius={[4, 4, 0, 0]}>
                  {bucketData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Latency summary grid */}
        <ChartCard title="Latency summary">
          <div className="grid grid-cols-3 gap-3 pt-1">
            {[
              ["Min",  minLatency, "#22c55e",  "bg-green-50  border-green-100"],
              ["Max",  maxLatency, "#ef4444",  "bg-red-50    border-red-100"],
              ["Avg",  avgLatency, "#6366f1",  "bg-indigo-50 border-indigo-100"],
              ["P50",  p50v,       "#eab308",  "bg-yellow-50 border-yellow-100"],
              ["P95",  p95v,       "#f97316",  "bg-orange-50 border-orange-100"],
              ["Total", latencyStats.summary?.totalClicks, "#38bdf8", "bg-sky-50 border-sky-100"],
            ].map(([label, val, color, bg]) => (
              <div key={label}
                className={`rounded-xl border p-3 ${bg}`}>
                <p className="text-xs text-slate-400 mb-1 font-medium">{label}</p>
                <p className="text-lg font-bold leading-none" style={{ color }}>
                  {latencyLoading
                    ? "…"
                    : val != null
                      ? label === "Total" ? Number(val).toLocaleString() : `${Math.round(val)}ms`
                      : "—"}
                </p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}