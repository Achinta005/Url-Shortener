"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useRouter } from "next/navigation";
import useApi from "../hook/useApi";
import {
  Link2,
  ExternalLink,
  Copy,
  Trash2,
  BarChart3,
  Plus,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
  FileText,
  TrendingUp,
  Activity,
  Globe,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Zap,
  Star,
  AlertCircle,
  Info,
  Edit2,
  RefreshCw,
  Share2,
  Lock,
  Unlock,
  TrendingDown,
  Users,
  MousePointer,
  Smartphone,
  Monitor,
  MapPin,
  Target,
  Award,
  Layers,
  Code,
  Hash,
  LinkIcon,
  ArrowRight,
  MoreVertical,
  X,
  Check,
  Archive,
  Bookmark,
  Bell,
  Sun,
  Moon,
  Menu,
  LogOut,
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  MapPinned,
  Building,
  Briefcase,
  UserCheck,
  Shield,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Signal,
  Battery,
  Thermometer,
  Droplet,
  Wind,
  CloudRain,
  CloudSnow,
  Cloudy,
  Sunrise,
  Sunset,
  Navigation,
  Compass,
  Anchor,
  Feather,
  Paperclip,
  Image,
  Film,
  Music,
  Video,
  Headphones,
  Mic,
  Camera,
  Printer,
  Save,
  FolderOpen,
  Folder,
  File,
  FileText as FileTextIcon,
} from "lucide-react";

export default function LinkShortenerPage() {
  const { setAccessToken, setIsAuthenticated, user } = useAuth();
  const router = useRouter();
  const apiFetch = useApi();

  // Main State
  const [activeTab, setActiveTab] = useState("create");
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // URLs State
  const [urls, setUrls] = useState([]);
  const [urlsLoading, setUrlsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 0,
    limit: 10,
  });

  // Stats State
  const [stats, setStats] = useState({
    totalUrls: 0,
    totalClicks: 0,
    activeUrls: 0,
    expiredUrls: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Details Modal State
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // UI State
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Advanced Features State
  const [selectedUrls, setSelectedUrls] = useState([]);
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Tags State
  const [availableTags, setAvailableTags] = useState([
    "Marketing",
    "Social",
    "Campaign",
    "Product",
    "Blog",
    "Newsletter",
  ]);
  const [selectedTags, setSelectedTags] = useState([]);

  // Custom Settings State
  const [settings, setSettings] = useState({
    autoExpire: false,
    defaultExpireDays: 30,
    enableAnalytics: true,
    emailNotifications: true,
    clickThreshold: 1000,
    customDomain: "",
  });

  // Fetch Data on Mount and Tab Change
  useEffect(() => {
    fetchUserURLs();
    fetchUserStats();
  }, [activeTab]);

  // Search and Filter Effect
  useEffect(() => {
    if (activeTab === "urls" && !urlsLoading) {
      handleFilterAndSearch();
    }
  }, [searchQuery, filterStatus, sortBy]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
      }
      // Ctrl/Cmd + N for new link
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        setActiveTab("create");
      }
      // Escape to close modals
      if (e.key === "Escape") {
        setSelectedUrl(null);
        setShowExportModal(false);
        setShowSettingsModal(false);
        setShowHelpModal(false);
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      if (longUrl && longUrl.length > 10) {
        localStorage.setItem(
          "linkDraft",
          JSON.stringify({ longUrl, customSlug }),
        );
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [longUrl, customSlug]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem("linkDraft");
    if (draft) {
      try {
        const { longUrl: savedUrl, customSlug: savedSlug } = JSON.parse(draft);
        if (savedUrl) setLongUrl(savedUrl);
        if (savedSlug) setCustomSlug(savedSlug);
      } catch (e) {
        console.error("Failed to load draft");
      }
    }
  }, []);

  // Fetch User URLs
  const fetchUserURLs = async (page = 1) => {
    try {
      setUrlsLoading(true);

      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/link/api/urls?page=${page}&limit=10`,
      );

      if (!res.ok) {
        throw new Error("Failed to fetch URLs");
      }

      const data = await res.json();

      if (data.success && data.data) {
        const transformedUrls = data.data.map((url) => ({
          id: url._id,
          shortCode: url.shortCode,
          longUrl: url.originalUrl,
          shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://short.ly"}/${url.shortCode}`,
          clicks: url.totalClicks,
          createdAt: url.createdAt,
          title: url.title,
          description: url.description,
          tags: url.tags,
          isActive: url.isActive,
          expiresAt: url.expiresAt,
          maxClicks: url.maxClicks,
          lastClickedAt: url.lastClickedAt,
        }));

        setUrls(transformedUrls);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch user URLs:", error);
    } finally {
      setUrlsLoading(false);
    }
  };

  // Fetch User Stats
  const fetchUserStats = async () => {
    try {
      setStatsLoading(true);

      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/link/api/stats`,
      );

      if (!res.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await res.json();

      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch URL Details
  const fetchUrlDetails = async (shortCode) => {
    try {
      setDetailsLoading(true);

      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/link/api/urls/${shortCode}`,
      );

      if (!res.ok) {
        throw new Error("Failed to fetch URL details");
      }

      const data = await res.json();

      if (data.success && data.data) {
        setSelectedUrl(data.data);
        return data.data;
      }
    } catch (error) {
      console.error("Failed to fetch URL details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Create Short URL
  const handleCreateShortUrl = async () => {
    if (!longUrl) {
      setError("Please enter a URL");
      return;
    }

    try {
      new URL(longUrl);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setLoading(true);
    setError("");
    setShortUrl("");

    try {
      const body = customSlug
        ? { originalUrl: longUrl, customCode: customSlug }
        : { originalUrl: longUrl };

      const endpoint = customSlug
        ? `${process.env.NEXT_PUBLIC_SERVER_API_URL}/link/api/shorten/advanced`
        : `${process.env.NEXT_PUBLIC_SERVER_API_URL}/link/api/shorten`;

      const res = await apiFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || errorData.message || "Failed to create short URL",
        );
      }

      const data = await res.json();

      if (data.success && data.data) {
        const newShortUrl = data.data.shortUrl;
        setShortUrl(newShortUrl);
        setSuccessAnimation(true);

        const newUrlEntry = {
          id: Date.now(),
          longUrl: data.data.originalUrl,
          shortUrl: newShortUrl,
          shortCode: data.data.shortCode,
          clicks: data.data.totalClicks || 0,
          createdAt: data.data.createdAt,
        };

        setUrls((prev) => [newUrlEntry, ...prev]);

        setLongUrl("");
        setCustomSlug("");
        localStorage.removeItem("linkDraft");

        setTimeout(() => setSuccessAnimation(false), 2000);

        await fetchUserStats();
      } else {
        throw new Error(data.message || "Failed to create short URL");
      }
    } catch (err) {
      console.error("Error creating short URL:", err);
      setError(err.message || "Failed to create short URL");
    } finally {
      setLoading(false);
    }
  };

  // Delete URL
  const handleDeleteUrl = async (shortCode) => {
    if (!confirm("Are you sure you want to delete this link?")) {
      return;
    }

    try {
      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/link/api/urls/${shortCode}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) {
        throw new Error("Failed to delete URL");
      }

      setUrls(urls.filter((url) => url.shortCode !== shortCode));
      await fetchUserStats();

      if (selectedUrl?.shortCode === shortCode) {
        setSelectedUrl(null);
      }
    } catch (error) {
      console.error("Failed to delete URL:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await apiFetch("/api/auth/logout", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Logout failed");
      }

      setAccessToken(null);
      setIsAuthenticated(false);
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Bulk Delete URLs
  const handleBulkDelete = async () => {
    if (selectedUrls.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedUrls.length} link(s)?`,
      )
    ) {
      return;
    }

    try {
      const deletePromises = selectedUrls.map((shortCode) =>
        apiFetch(
          `${process.env.NEXT_PUBLIC_SERVER_API_URL}/link/api/urls/${shortCode}`,
          { method: "DELETE" },
        ),
      );

      await Promise.all(deletePromises);

      setUrls(urls.filter((url) => !selectedUrls.includes(url.shortCode)));
      setSelectedUrls([]);
      setBulkActionMode(false);
      await fetchUserStats();
    } catch (error) {
      console.error("Failed to bulk delete:", error);
    }
  };

  // Copy to Clipboard
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle Page Change
  const handlePageChange = (newPage) => {
    fetchUserURLs(newPage);
  };

  // Filter and Search
  const handleFilterAndSearch = () => {
    let filtered = [...urls];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(
        (url) =>
          url.longUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
          url.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          url.title?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      if (filterStatus === "active") {
        filtered = filtered.filter((url) => url.isActive);
      } else if (filterStatus === "expired") {
        filtered = filtered.filter(
          (url) => url.expiresAt && new Date(url.expiresAt) < new Date(),
        );
      } else if (filterStatus === "inactive") {
        filtered = filtered.filter((url) => !url.isActive);
      }
    }

    // Apply sorting
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "most-clicks") {
      filtered.sort((a, b) => b.clicks - a.clicks);
    } else if (sortBy === "least-clicks") {
      filtered.sort((a, b) => a.clicks - b.clicks);
    }

    return filtered;
  };

  // Get filtered URLs
  const getFilteredUrls = () => {
    return handleFilterAndSearch();
  };

  // Toggle URL Selection
  const toggleUrlSelection = (shortCode) => {
    setSelectedUrls((prev) =>
      prev.includes(shortCode)
        ? prev.filter((code) => code !== shortCode)
        : [...prev, shortCode],
    );
  };

  // Select All URLs
  const selectAllUrls = () => {
    if (selectedUrls.length === urls.length) {
      setSelectedUrls([]);
    } else {
      setSelectedUrls(urls.map((url) => url.shortCode));
    }
  };

  // Export URLs
  const handleExport = (format) => {
    const dataToExport = getFilteredUrls();

    if (format === "json") {
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `links-export-${Date.now()}.json`;
      link.click();
    } else if (format === "csv") {
      const headers = [
        "Short Code",
        "Short URL",
        "Long URL",
        "Clicks",
        "Created",
        "Status",
      ];
      const csvContent = [
        headers.join(","),
        ...dataToExport.map((url) =>
          [
            url.shortCode,
            url.shortUrl,
            url.longUrl,
            url.clicks,
            new Date(url.createdAt).toLocaleString(),
            url.isActive ? "Active" : "Inactive",
          ].join(","),
        ),
      ].join("\n");

      const dataBlob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `links-export-${Date.now()}.csv`;
      link.click();
    }

    setShowExportModal(false);
  };

  // Save Settings
  const handleSaveSettings = () => {
    localStorage.setItem("linkSettings", JSON.stringify(settings));
    setShowSettingsModal(false);
  };

  // Load Settings
  useEffect(() => {
    const savedSettings = localStorage.getItem("linkSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to load settings");
      }
    }
  }, []);

  // Calculate Stats
  const calculateAdvancedStats = () => {
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
    const avgClicksPerLink = urls.length > 0 ? totalClicks / urls.length : 0;
    const mostClickedLink = urls.reduce(
      (max, url) => (url.clicks > max.clicks ? url : max),
      { clicks: 0 },
    );
    const recentLinks = urls.filter(
      (url) => new Date() - new Date(url.createdAt) < 7 * 24 * 60 * 60 * 1000,
    ).length;

    return {
      totalClicks,
      avgClicksPerLink: Math.round(avgClicksPerLink),
      mostClickedLink,
      recentLinks,
    };
  };

  // Get Status Badge Color
  const getStatusBadgeColor = (url) => {
    if (!url.isActive) return "bg-red-100 text-red-700 border-red-200";
    if (url.expiresAt && new Date(url.expiresAt) < new Date())
      return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-green-100 text-green-700 border-green-200";
  };

  // Get Status Text
  const getStatusText = (url) => {
    if (!url.isActive) return "Inactive";
    if (url.expiresAt && new Date(url.expiresAt) < new Date()) return "Expired";
    return "Active";
  };

  // Format Date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format Time Ago
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, value] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / value);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
      }
    }
    return "Just now";
  };

  // Get Click Rate Color
  const getClickRateColor = (clicks) => {
    if (clicks > 100) return "text-green-600";
    if (clicks > 50) return "text-yellow-600";
    if (clicks > 10) return "text-orange-600";
    return "text-slate-600";
  };

  // Advanced Stats
  const advancedStats = calculateAdvancedStats();

  // Filtered URLs for display
  const displayUrls = getFilteredUrls();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .slide-in {
          animation: slideIn 0.3s ease-out;
        }
        .scale-in {
          animation: scaleIn 0.3s ease-out;
        }
        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

      {/* Compact Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>

            <div className="flex items-center gap-2">
              <Link2 className="w-6 h-6 text-indigo-600" />
              <span className="font-bold text-slate-900 text-lg">LinkHub</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
              <Activity className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">
                {stats.totalUrls} Links
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-lg">
              <Eye className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-700">
                {stats.totalClicks.toLocaleString()} Clicks
              </span>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg transition-shadow"
              >
                {user?.user_metadata?.full_name?.[0] || "U"}
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50"
                  style={{ animation: "slideInFromRight 0.2s ease-out" }}
                >
                  <div className="px-4 py-3 border-b border-slate-200">
                    <p className="font-semibold text-slate-900">
                      {user?.user_metadata?.full_name || "User"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowSettingsModal(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700 text-sm"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowHelpModal(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700 text-sm"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Help & Support
                  </button>
                  <div className="border-t border-slate-200 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-red-600 text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Zap className="w-9 h-9 text-indigo-600" />
            Link Management
          </h1>
          <p className="text-slate-600">
            Create and manage your shortened links with detailed analytics
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 mb-8 inline-flex gap-1">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
              activeTab === "create"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Plus className="w-4 h-4" />
            Create Link
          </button>
          <button
            onClick={() => setActiveTab("urls")}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
              activeTab === "urls"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            My Links
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === "urls"
                  ? "bg-white text-indigo-600"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {stats.totalUrls}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
              activeTab === "analytics"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Analytics
          </button>
        </div>

        {/* Main Content */}
        {activeTab === "create" ? (
          <div
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-3xl"
            style={{ animation: "scaleIn 0.3s ease-out" }}
          >
            {/* Quick Tips Banner */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Quick Tips</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use custom slugs for memorable links</li>
                  <li>• Keep URLs short and descriptive</li>
                  <li>• Add tags to organize your links</li>
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700">
                <Globe className="w-4 h-4 text-slate-500" />
                Enter your long URL
                <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                placeholder="https://example.com/your-very-long-url-here"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-base outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
              <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Enter a valid URL starting with http:// or https://
              </p>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700">
                <FileText className="w-4 h-4 text-slate-500" />
                Custom slug (optional)
              </label>
              <div className="flex items-center gap-3">
                <span className="px-4 py-3 bg-slate-100 rounded-lg text-sm font-medium text-slate-600 whitespace-nowrap">
                  {process.env.NEXT_PUBLIC_BASE_URL || "short.ly"}/
                </span>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) =>
                    setCustomSlug(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                    )
                  }
                  placeholder="my-custom-link"
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-lg text-base outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Only lowercase letters, numbers, hyphens, and underscores
              </p>
            </div>

            {/* Advanced Options Toggle */}
            <div className="mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Advanced Options
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${showFilters ? "rotate-90" : ""}`}
                />
              </button>
            </div>

            {showFilters && (
              <div
                className="mb-6 p-4 bg-slate-50 rounded-lg space-y-4 border border-slate-200"
                style={{ animation: "slideIn 0.2s ease-out" }}
              >
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() =>
                          setSelectedTags((prev) =>
                            prev.includes(tag)
                              ? prev.filter((t) => t !== tag)
                              : [...prev, tag],
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedTags.includes(tag)
                            ? "bg-indigo-600 text-white"
                            : "bg-white border border-slate-300 text-slate-700 hover:border-indigo-400"
                        }`}
                      >
                        <Tag className="w-3 h-3 inline mr-1" />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Expiration (Optional)
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Click Limit (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 1000"
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                    min="1"
                  />
                </div>
              </div>
            )}

            {error && (
              <div
                className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3"
                style={{ animation: "slideIn 0.3s ease-out" }}
              >
                <XCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <button
              onClick={handleCreateShortUrl}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating your link...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Short Link
                </>
              )}
            </button>

            {shortUrl && (
              <div
                className={`p-6 rounded-xl border-2 transition-all ${
                  successAnimation
                    ? "bg-indigo-50 border-indigo-300"
                    : "bg-green-50 border-green-300"
                }`}
                style={{ animation: "slideIn 0.3s ease-out" }}
              >
                {successAnimation && (
                  <div className="text-center text-5xl mb-4 animate-bounce">
                    🎉
                  </div>
                )}
                <label className="block mb-3 text-sm font-semibold text-slate-700 text-center">
                  {successAnimation
                    ? "Link Created Successfully!"
                    : "Your Short Link"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shortUrl}
                    readOnly
                    className="flex-1 px-4 py-3 border-2 border-green-400 rounded-lg font-semibold text-indigo-600 text-center bg-white"
                  />
                  <button
                    onClick={() => copyToClipboard(shortUrl, "result")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                      copiedId === "result"
                        ? "bg-green-600 text-white"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {copiedId === "result" ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                {/* Share Buttons */}
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    Share via:
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        window.open(
                          `https://twitter.com/intent/tweet?url=${encodeURIComponent(shortUrl)}`,
                          "_blank",
                        )
                      }
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-semibold"
                    >
                      Twitter
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl)}`,
                          "_blank",
                        )
                      }
                      className="flex-1 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all text-sm font-semibold"
                    >
                      Facebook
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shortUrl)}`,
                          "_blank",
                        )
                      }
                      className="flex-1 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-all text-sm font-semibold"
                    >
                      LinkedIn
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Keyboard Shortcuts */}
            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Keyboard Shortcuts
              </h4>
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Create new link:</span>
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono">
                    Ctrl + N
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>Search links:</span>
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono">
                    Ctrl + K
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "urls" ? (
          <div style={{ animation: "scaleIn 0.3s ease-out" }}>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsLoading ? (
                <div className="col-span-full text-center py-12 text-slate-600">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                  Loading stats...
                </div>
              ) : (
                [
                  {
                    icon: <Link2 className="w-6 h-6" />,
                    label: "Total Links",
                    value: stats.totalUrls,
                    color: "from-blue-500 to-indigo-600",
                    bg: "bg-blue-50",
                    subtext: `${advancedStats.recentLinks} this week`,
                  },
                  {
                    icon: <Eye className="w-6 h-6" />,
                    label: "Total Clicks",
                    value: stats.totalClicks.toLocaleString(),
                    color: "from-purple-500 to-pink-600",
                    bg: "bg-purple-50",
                    subtext: `Avg ${advancedStats.avgClicksPerLink} per link`,
                  },
                  {
                    icon: <CheckCircle2 className="w-6 h-6" />,
                    label: "Active Links",
                    value: stats.activeUrls,
                    color: "from-green-500 to-emerald-600",
                    bg: "bg-green-50",
                    subtext: `${Math.round((stats.activeUrls / stats.totalUrls) * 100)}% of total`,
                  },
                  {
                    icon: <Clock className="w-6 h-6" />,
                    label: "Expired Links",
                    value: stats.expiredUrls,
                    color: "from-orange-500 to-red-600",
                    bg: "bg-orange-50",
                    subtext: `${Math.round((stats.expiredUrls / stats.totalUrls) * 100)}% of total`,
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all cursor-pointer"
                    style={{
                      animation: `slideInFromLeft ${0.1 + idx * 0.1}s ease-out`,
                    }}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} ${stat.bg} flex items-center justify-center text-white mb-4`}
                    >
                      {stat.icon}
                    </div>
                    <div className="text-sm font-medium text-slate-600 mb-1">
                      {stat.label}
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-500">{stat.subtext}</div>
                  </div>
                ))
              )}
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 w-full md:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Search links... (Ctrl+K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border-2 border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="inactive">Inactive</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border-2 border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="most-clicks">Most Clicks</option>
                    <option value="least-clicks">Least Clicks</option>
                  </select>

                  {/* Action Buttons */}
                  <button
                    onClick={() => setBulkActionMode(!bulkActionMode)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                      bulkActionMode
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {bulkActionMode ? "Cancel" : "Select"}
                  </button>

                  <button
                    onClick={() => setShowExportModal(true)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all flex items-center gap-2 text-sm font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>

                  <button
                    onClick={() => fetchUserURLs(pagination.page)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all flex items-center gap-2 text-sm font-semibold"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Bulk Actions Bar */}
              {bulkActionMode && selectedUrls.length > 0 && (
                <div
                  className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between"
                  style={{ animation: "slideIn 0.2s ease-out" }}
                >
                  <span className="text-sm font-semibold text-indigo-900">
                    {selectedUrls.length} link(s) selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-semibold flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Selected
                    </button>
                    <button
                      onClick={() => setSelectedUrls([])}
                      className="px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-all text-sm font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Links List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                Your Links
                {displayUrls.length !== urls.length && (
                  <span className="text-sm font-normal text-slate-500">
                    (showing {displayUrls.length} of {urls.length})
                  </span>
                )}
              </h2>

              {urlsLoading ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-600">Loading your links...</p>
                </div>
              ) : displayUrls.length === 0 ? (
                <div className="text-center py-16">
                  {searchQuery || filterStatus !== "all" ? (
                    <>
                      <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-700 mb-2">
                        No links found
                      </h3>
                      <p className="text-slate-500 mb-4">
                        Try adjusting your search or filters
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setFilterStatus("all");
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-semibold"
                      >
                        Clear Filters
                      </button>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-700 mb-2">
                        No links yet
                      </h3>
                      <p className="text-slate-500 mb-4">
                        Create your first short link to get started
                      </p>
                      <button
                        onClick={() => setActiveTab("create")}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-semibold flex items-center gap-2 mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Create Link
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <>
                  {/* Select All */}
                  {bulkActionMode && (
                    <div className="mb-4 pb-4 border-b border-slate-200">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedUrls.length === urls.length}
                          onChange={selectAllUrls}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span className="text-sm font-semibold text-slate-700">
                          Select All ({urls.length} links)
                        </span>
                      </label>
                    </div>
                  )}

                  <div className="space-y-4">
                    {displayUrls.map((url, index) => (
                      <div
                        key={url.id}
                        className="p-5 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all"
                        style={{
                          animation: `slideIn ${0.1 + index * 0.05}s ease-out`,
                        }}
                      >
                        <div className="flex items-start gap-4">
                          {/* Checkbox for bulk selection */}
                          {bulkActionMode && (
                            <input
                              type="checkbox"
                              checked={selectedUrls.includes(url.shortCode)}
                              onChange={() => toggleUrlSelection(url.shortCode)}
                              className="w-5 h-5 text-indigo-600 rounded mt-1"
                            />
                          )}

                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <ExternalLink className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                                  <a
                                    href={url.shortUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold text-indigo-600 hover:text-indigo-700 truncate"
                                  >
                                    {url.shortUrl}
                                  </a>
                                  <span
                                    className={`px-2 py-1 rounded-md text-xs font-semibold border ${getStatusBadgeColor(url)}`}
                                  >
                                    {getStatusText(url)}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 truncate pl-7">
                                  {url.longUrl}
                                </p>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  onClick={() => fetchUrlDetails(url.shortCode)}
                                  disabled={detailsLoading}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2 text-sm font-semibold whitespace-nowrap"
                                >
                                  <BarChart3 className="w-4 h-4" />
                                  Details
                                </button>
                                <button
                                  onClick={() => handleDeleteUrl(url.shortCode)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 text-sm font-semibold"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Stats Bar */}
                            <div className="flex items-center gap-4 flex-wrap">
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 rounded-lg">
                                <Eye className="w-4 h-4 text-indigo-600" />
                                <span
                                  className={`text-sm font-semibold ${getClickRateColor(url.clicks)}`}
                                >
                                  {url.clicks.toLocaleString()} clicks
                                </span>
                              </div>
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-200 rounded-lg">
                                <Calendar className="w-4 h-4 text-slate-600" />
                                <span className="text-sm font-medium text-slate-700">
                                  {formatDate(url.createdAt)}
                                </span>
                              </div>
                              {url.lastClickedAt && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-lg">
                                  <Clock className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-700">
                                    Last: {formatTimeAgo(url.lastClickedAt)}
                                  </span>
                                </div>
                              )}
                              {url.expiresAt && (
                                <div
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                                    new Date(url.expiresAt) < new Date()
                                      ? "bg-red-100"
                                      : "bg-yellow-100"
                                  }`}
                                >
                                  <AlertCircle
                                    className={`w-4 h-4 ${
                                      new Date(url.expiresAt) < new Date()
                                        ? "text-red-600"
                                        : "text-yellow-600"
                                    }`}
                                  />
                                  <span
                                    className={`text-sm font-medium ${
                                      new Date(url.expiresAt) < new Date()
                                        ? "text-red-700"
                                        : "text-yellow-700"
                                    }`}
                                  >
                                    {new Date(url.expiresAt) < new Date()
                                      ? "Expired"
                                      : `Expires ${formatDate(url.expiresAt)}`}
                                  </span>
                                </div>
                              )}

                              {/* Tags */}
                              {url.tags && url.tags.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {url.tags.slice(0, 2).map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                  {url.tags.length > 2 && (
                                    <span className="text-xs text-slate-500">
                                      +{url.tags.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Copy Button */}
                              <button
                                onClick={() =>
                                  copyToClipboard(url.shortUrl, url.id)
                                }
                                className={`ml-auto px-4 py-1.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                                  copiedId === url.id
                                    ? "bg-green-600 text-white"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                                }`}
                              >
                                {copiedId === url.id ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4" />
                                    Copy
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>

                      <div className="flex items-center gap-2">
                        {Array.from({ length: pagination.pages }, (_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => handlePageChange(i + 1)}
                            className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                              pagination.page === i + 1
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          // Analytics Tab
          <div style={{ animation: "scaleIn 0.3s ease-out" }}>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                Analytics Overview
              </h2>

              {/* Analytics Coming Soon */}
              <div className="text-center py-16">
                <BarChart3 className="w-24 h-24 text-slate-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-700 mb-3">
                  Advanced Analytics Coming Soon
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  Track clicks by location, device, referrer, and more with our
                  advanced analytics dashboard.
                </p>

                {/* Feature Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {[
                    {
                      icon: <MapPin className="w-8 h-8" />,
                      title: "Geographic Data",
                      desc: "See where your clicks are coming from",
                    },
                    {
                      icon: <Monitor className="w-8 h-8" />,
                      title: "Device Analytics",
                      desc: "Track desktop, mobile, and tablet usage",
                    },
                    {
                      icon: <Target className="w-8 h-8" />,
                      title: "Referrer Tracking",
                      desc: "Know which sources drive traffic",
                    },
                  ].map((feature, idx) => (
                    <div
                      key={idx}
                      className="p-6 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mx-auto mb-4">
                        {feature.icon}
                      </div>
                      <h4 className="font-bold text-slate-900 mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-slate-600">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          style={{ animation: "fadeIn 0.2s ease-out" }}
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
            style={{ animation: "scaleIn 0.2s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-600" />
                Export Links
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 text-sm">
                Choose a format to export your links
              </p>
              <button
                onClick={() => handleExport("json")}
                className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Code className="w-6 h-6 text-slate-600" />
                  <div className="text-left">
                    <div className="font-semibold text-slate-900">
                      JSON Format
                    </div>
                    <div className="text-xs text-slate-500">
                      For developers and integrations
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </button>
              <button
                onClick={() => handleExport("csv")}
                className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-slate-600" />
                  <div className="text-left">
                    <div className="font-semibold text-slate-900">
                      CSV Format
                    </div>
                    <div className="text-xs text-slate-500">
                      For spreadsheets and analysis
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </button>
            </div>
            <div className="p-6 border-t border-slate-200">
              <button
                onClick={() => setShowExportModal(false)}
                className="w-full py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          style={{ animation: "fadeIn 0.2s ease-out" }}
          onClick={() => setShowSettingsModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-auto shadow-2xl"
            style={{ animation: "scaleIn 0.2s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                Settings
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Auto-Expire Setting */}
              <div>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-semibold text-slate-900 mb-1">
                      Auto-Expire Links
                    </div>
                    <div className="text-sm text-slate-500">
                      Automatically expire links after a set period
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoExpire}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        autoExpire: e.target.checked,
                      })
                    }
                    className="w-12 h-6 appearance-none bg-slate-200 rounded-full relative cursor-pointer transition-colors checked:bg-indigo-600"
                  />
                </label>
                {settings.autoExpire && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Default Expiration (Days)
                    </label>
                    <input
                      type="number"
                      value={settings.defaultExpireDays}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          defaultExpireDays: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                      min="1"
                    />
                  </div>
                )}
              </div>

              {/* Analytics Setting */}
              <div className="pt-6 border-t border-slate-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-semibold text-slate-900 mb-1">
                      Enable Analytics
                    </div>
                    <div className="text-sm text-slate-500">
                      Track clicks and gather insights
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableAnalytics}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        enableAnalytics: e.target.checked,
                      })
                    }
                    className="w-12 h-6 appearance-none bg-slate-200 rounded-full relative cursor-pointer transition-colors checked:bg-indigo-600"
                  />
                </label>
              </div>

              {/* Email Notifications */}
              <div className="pt-6 border-t border-slate-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-semibold text-slate-900 mb-1">
                      Email Notifications
                    </div>
                    <div className="text-sm text-slate-500">
                      Receive updates about your links
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emailNotifications: e.target.checked,
                      })
                    }
                    className="w-12 h-6 appearance-none bg-slate-200 rounded-full relative cursor-pointer transition-colors checked:bg-indigo-600"
                  />
                </label>
              </div>

              {/* Click Threshold */}
              <div className="pt-6 border-t border-slate-200">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Click Notification Threshold
                </label>
                <p className="text-sm text-slate-500 mb-3">
                  Get notified when a link reaches this many clicks
                </p>
                <input
                  type="number"
                  value={settings.clickThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      clickThreshold: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                  min="1"
                />
              </div>

              {/* Custom Domain */}
              <div className="pt-6 border-t border-slate-200">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Custom Domain
                </label>
                <p className="text-sm text-slate-500 mb-3">
                  Use your own domain for short links (Pro feature)
                </p>
                <input
                  type="text"
                  value={settings.customDomain}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      customDomain: e.target.value,
                    })
                  }
                  placeholder="links.yourdomain.com"
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex gap-3">
              <button
                onClick={handleSaveSettings}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-semibold"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          style={{ animation: "fadeIn 0.2s ease-out" }}
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-auto shadow-2xl"
            style={{ animation: "scaleIn 0.2s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                Help & Support
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-indigo-600" />
                  Frequently Asked Questions
                </h4>
                <div className="space-y-4">
                  {[
                    {
                      q: "How do I create a custom short link?",
                      a: "Enter your URL and add a custom slug in the 'Custom slug' field. The slug can only contain lowercase letters, numbers, hyphens, and underscores.",
                    },
                    {
                      q: "Can I edit a link after creating it?",
                      a: "Currently, links cannot be edited. You'll need to create a new link with your desired changes.",
                    },
                    {
                      q: "How long do my links last?",
                      a: "By default, links don't expire. You can set an expiration date when creating advanced links.",
                    },
                    {
                      q: "How do I track link performance?",
                      a: "Click the 'Details' button on any link to see comprehensive analytics including clicks, geographic data, and more.",
                    },
                  ].map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="font-semibold text-slate-900 mb-2">
                        {faq.q}
                      </div>
                      <div className="text-sm text-slate-600">{faq.a}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  Contact Support
                </h4>
                <div className="space-y-3">
                  <a
                    href="mailto:support@linkhub.com"
                    className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">Email</div>
                      <div className="text-sm text-slate-500">
                        support@linkhub.com
                      </div>
                    </div>
                  </a>
                  <a
                    href="https://twitter.com/linkhub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">Twitter</div>
                      <div className="text-sm text-slate-500">@linkhub</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedUrl && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          style={{ animation: "fadeIn 0.2s ease-out" }}
          onClick={() => setSelectedUrl(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-auto shadow-2xl"
            style={{ animation: "scaleIn 0.2s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Link Details
              </h2>
              <button
                onClick={() => setSelectedUrl(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-1">
                  Short Code
                </div>
                <div className="text-lg font-bold text-indigo-600 flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  {selectedUrl.shortCode}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-1">
                  Original URL
                </div>
                <div className="text-sm text-slate-700 break-all flex items-start gap-2">
                  <Globe className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {selectedUrl.originalUrl}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-2">
                    Total Clicks
                  </div>
                  <div className="text-3xl font-bold text-indigo-600 flex items-center gap-2">
                    <Eye className="w-6 h-6" />
                    {selectedUrl.totalClicks}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-2">
                    Status
                  </div>
                  <div
                    className={`text-lg font-bold flex items-center gap-2 ${
                      selectedUrl.isActive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {selectedUrl.isActive ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        Inactive
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-1">
                  Created
                </div>
                <div className="text-sm text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedUrl.createdAt).toLocaleString()}
                </div>
              </div>

              {selectedUrl.lastClickedAt && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    Last Clicked
                  </div>
                  <div className="text-sm text-slate-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {new Date(selectedUrl.lastClickedAt).toLocaleString()}
                  </div>
                </div>
              )}

              {selectedUrl.expiresAt && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    Expires
                  </div>
                  <div
                    className={`text-sm font-semibold flex items-center gap-2 ${
                      new Date(selectedUrl.expiresAt) < new Date()
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    {new Date(selectedUrl.expiresAt).toLocaleString()}
                    {new Date(selectedUrl.expiresAt) < new Date() &&
                      " (Expired)"}
                  </div>
                </div>
              )}

              {selectedUrl.maxClicks && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-2">
                    Click Limit
                  </div>
                  <div className="text-sm text-slate-700 mb-2">
                    {selectedUrl.totalClicks} / {selectedUrl.maxClicks} clicks
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        selectedUrl.totalClicks >= selectedUrl.maxClicks
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min((selectedUrl.totalClicks / selectedUrl.maxClicks) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {selectedUrl.title && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    Title
                  </div>
                  <div className="text-sm text-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {selectedUrl.title}
                  </div>
                </div>
              )}

              {selectedUrl.description && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    Description
                  </div>
                  <div className="text-sm text-slate-700">
                    {selectedUrl.description}
                  </div>
                </div>
              )}

              {selectedUrl.tags?.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-2">
                    Tags
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {selectedUrl.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedUrl.utm &&
                Object.values(selectedUrl.utm).some((v) => v) && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-2">
                      UTM Parameters
                    </div>
                    <div className="space-y-1 text-sm text-slate-700">
                      {selectedUrl.utm.source && (
                        <div>
                          <strong>Source:</strong> {selectedUrl.utm.source}
                        </div>
                      )}
                      {selectedUrl.utm.medium && (
                        <div>
                          <strong>Medium:</strong> {selectedUrl.utm.medium}
                        </div>
                      )}
                      {selectedUrl.utm.campaign && (
                        <div>
                          <strong>Campaign:</strong> {selectedUrl.utm.campaign}
                        </div>
                      )}
                      {selectedUrl.utm.term && (
                        <div>
                          <strong>Term:</strong> {selectedUrl.utm.term}
                        </div>
                      )}
                      {selectedUrl.utm.content && (
                        <div>
                          <strong>Content:</strong> {selectedUrl.utm.content}
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setSelectedUrl(null)}
                className="w-full py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
