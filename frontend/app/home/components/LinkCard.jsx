import { ExternalLink, BarChart3, Trash2, Eye, Calendar, Clock, AlertCircle, Copy, CheckCircle2 } from "lucide-react";
import { getStatusBadgeColor, getStatusText, getClickRateColor, formatDate, formatTimeAgo } from "../lib/formatters";

export default function LinkCard({ url, onDetails, onDelete, onCopy, copiedId, bulkMode, selected, onToggle }) {
  return (
    <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        {bulkMode && (
          <input type="checkbox" checked={selected} onChange={() => onToggle(url.shortCode)}
            className="w-5 h-5 text-indigo-600 rounded mt-1" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <a href={url.shortUrl} target="_blank" rel="noopener noreferrer"
                  className="font-bold text-indigo-600 hover:text-indigo-700 truncate">{url.shortUrl}</a>
                <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${getStatusBadgeColor(url)}`}>
                  {getStatusText(url)}
                </span>
              </div>
              <p className="text-sm text-slate-600 truncate pl-7">{url.longUrl}</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button onClick={() => onDetails(url.shortCode)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2 text-sm font-semibold">
                <BarChart3 className="w-4 h-4" /> Details
              </button>
              <button onClick={() => onDelete(url.shortCode)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 text-sm font-semibold">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 rounded-lg">
              <Eye className="w-4 h-4 text-indigo-600" />
              <span className={`text-sm font-semibold ${getClickRateColor(url.clicks)}`}>
                {url.clicks.toLocaleString()} clicks
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-200 rounded-lg">
              <Calendar className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">{formatDate(url.createdAt)}</span>
            </div>
            {url.lastClickedAt && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-lg">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Last: {formatTimeAgo(url.lastClickedAt)}</span>
              </div>
            )}
            {url.expiresAt && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${new Date(url.expiresAt) < new Date() ? "bg-red-100" : "bg-yellow-100"}`}>
                <AlertCircle className={`w-4 h-4 ${new Date(url.expiresAt) < new Date() ? "text-red-600" : "text-yellow-600"}`} />
                <span className={`text-sm font-medium ${new Date(url.expiresAt) < new Date() ? "text-red-700" : "text-yellow-700"}`}>
                  {new Date(url.expiresAt) < new Date() ? "Expired" : `Expires ${formatDate(url.expiresAt)}`}
                </span>
              </div>
            )}
            <button onClick={() => onCopy(url.shortUrl, url.id)}
              className={`ml-auto px-4 py-1.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${copiedId === url.id ? "bg-green-600 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
              {copiedId === url.id ? <><CheckCircle2 className="w-4 h-4" />Copied</> : <><Copy className="w-4 h-4" />Copy</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}