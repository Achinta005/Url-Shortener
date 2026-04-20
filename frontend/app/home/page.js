"use client";
import ProtectedRoute from "../lib/protectedRoute";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/authContext";
import { useRouter } from "next/navigation";
import { useLinks } from "./hooks/useLinks";
import { useStats } from "./hooks/useStats";
import { useSettings } from "./hooks/useSettings";
import Header from "./components/Header";
import TabNavigation from "./components/TabNavigation";
import CreateLinkTab from "./components/CreateLinkTab";
import MyLinksTab from "./components/MyLinksTab";
import AnalyticsTab from "./components/AnalyticsTab";
import DetailsModal from "./components/modals/DetailsModal";
import ExportModal from "./components/modals/ExportModal";
import SettingsModal from "./components/modals/SettingsModal";
import HelpModal from "./components/modals/HelpModal";

export default function HomePage() {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("create");
  const [showExport, setShowExport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const {
    urls,
    urlsLoading,
    pagination,
    selectedUrl,
    setSelectedUrl,
    detailsLoading,
    fetchUrls,
    fetchUrlDetails,
    createUrl,
    deleteUrl,
    bulkDelete,
  } = useLinks();
  const { stats, statsLoading, fetchStats, advancedStats } = useStats();
  const { settings, setSettings, saveSettings } = useSettings();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, isAuthLoading]);

  useEffect(() => {
    fetchUrls();
    fetchStats();
  }, [activeTab]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        setActiveTab("create");
      }
      if (e.key === "Escape") {
        setSelectedUrl(null);
        setShowExport(false);
        setShowSettings(false);
        setShowHelp(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleExport = (format) => {
    const data = urls;
    if (format === "json") {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `links-${Date.now()}.json`;
      a.click();
    } else if (format === "csv") {
      const csv = [
        "Short Code,Short URL,Long URL,Clicks,Created,Status",
        ...data.map((u) =>
          [
            u.shortCode,
            u.shortUrl,
            u.longUrl,
            u.clicks,
            new Date(u.createdAt).toLocaleString(),
            u.isActive ? "Active" : "Inactive",
          ].join(","),
        ),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `links-${Date.now()}.csv`;
      a.click();
    }
    setShowExport(false);
  };

  if (isAuthLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );

  return (
    <>
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <Header
            stats={stats}
            onSettings={() => setShowSettings(true)}
            onHelp={() => setShowHelp(true)}
          />

          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-8 place-items-center">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Link Management
              </h1>
              <p className="text-slate-600">
                Create and manage your shortened links with detailed analytics
              </p>
            </div>

            <TabNavigation
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              totalUrls={stats.totalUrls}
            />

            {activeTab === "create" && (
              <CreateLinkTab onCreate={createUrl} onStatsRefresh={fetchStats} />
            )}
            {activeTab === "urls" && (
              <MyLinksTab
                urls={urls}
                urlsLoading={urlsLoading}
                pagination={pagination}
                stats={stats}
                statsLoading={statsLoading}
                advancedStats={advancedStats(urls)}
                onFetchUrls={fetchUrls}
                onDetails={fetchUrlDetails}
                onDelete={deleteUrl}
                onBulkDelete={bulkDelete}
                onExport={() => setShowExport(true)}
                onPageChange={fetchUrls}
              />
            )}
            {activeTab === "analytics" && <AnalyticsTab />}
          </div>

          {selectedUrl && (
            <DetailsModal
              url={selectedUrl}
              onClose={() => setSelectedUrl(null)}
            />
          )}
          {showExport && (
            <ExportModal
              onExport={handleExport}
              onClose={() => setShowExport(false)}
            />
          )}
          {showSettings && (
            <SettingsModal
              settings={settings}
              setSettings={setSettings}
              onSave={() => {
                saveSettings();
                setShowSettings(false);
              }}
              onClose={() => setShowSettings(false)}
            />
          )}
          {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
        </div>
      </ProtectedRoute>
    </>
  );
}
