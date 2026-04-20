export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

export const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = {
    year: 31536000, month: 2592000, week: 604800,
    day: 86400, hour: 3600, minute: 60,
  };
  for (const [unit, value] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / value);
    if (interval >= 1) return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
  }
  return "Just now";
};

export const getStatusBadgeColor = (url) => {
  if (!url.isActive) return "bg-red-100 text-red-700 border-red-200";
  if (url.expiresAt && new Date(url.expiresAt) < new Date())
    return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-green-100 text-green-700 border-green-200";
};

export const getStatusText = (url) => {
  if (!url.isActive) return "Inactive";
  if (url.expiresAt && new Date(url.expiresAt) < new Date()) return "Expired";
  return "Active";
};

export const getClickRateColor = (clicks) => {
  if (clicks > 100) return "text-green-600";
  if (clicks > 50) return "text-yellow-600";
  if (clicks > 10) return "text-orange-600";
  return "text-slate-600";
};

export const transformUrl = (url) => ({
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
});