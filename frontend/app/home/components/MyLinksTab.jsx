import { useState } from "react";
import { TrendingUp, Search, Download, RefreshCw, CheckCircle2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import StatsGrid from "./StatsGrid";
import LinkCard from "./LinkCard";

export default function MyLinksTab({ urls, urlsLoading, pagination, stats, statsLoading, advancedStats, onFetchUrls, onDetails, onDelete, onBulkDelete, onExport, onPageChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  const toggleSelect = (code) => setSelectedUrls((p) => p.includes(code) ? p.filter((c) => c !== code) : [...p, code]);
  const selectAll = () => setSelectedUrls(selectedUrls.length === urls.length ? [] : urls.map((u) => u.shortCode));

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUrls = urls
    .filter((url) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return url.longUrl.toLowerCase().includes(q) || url.shortCode.toLowerCase().includes(q) || url.title?.toLowerCase().includes(q);
      }
      return true;
    })
    .filter((url) => {
      if (filterStatus === "active") return url.isActive;
      if (filterStatus === "expired") return url.expiresAt && new Date(url.expiresAt) < new Date();
      if (filterStatus === "inactive") return !url.isActive;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "most-clicks") return b.clicks - a.clicks;
      if (sortBy === "least-clicks") return a.clicks - b.clicks;
      return 0;
    });

  return (
    <div>
      <StatsGrid stats={stats} advancedStats={advancedStats} loading={statsLoading} />

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input id="search-input" type="text" placeholder="Search links... (Ctrl+K)" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border-2 border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="inactive">Inactive</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border-2 border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most-clicks">Most Clicks</option>
              <option value="least-clicks">Least Clicks</option>
            </select>
            <button onClick={() => setBulkMode(!bulkMode)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${bulkMode ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
              <CheckCircle2 className="w-4 h-4" />{bulkMode ? "Cancel" : "Select"}
            </button>
            <button onClick={() => onExport()} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 flex items-center gap-2 text-sm font-semibold">
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={() => onFetchUrls(pagination.page)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 flex items-center gap-2 text-sm font-semibold">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {bulkMode && selectedUrls.length > 0 && (
          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between">
            <span className="text-sm font-semibold text-indigo-900">{selectedUrls.length} link(s) selected</span>
            <div className="flex gap-2">
              <button onClick={async () => { await onBulkDelete(selectedUrls); setSelectedUrls([]); setBulkMode(false); }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete Selected
              </button>
              <button onClick={() => setSelectedUrls([])}
                className="px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-semibold">Clear</button>
            </div>
          </div>
        )}
      </div>

      {/* Links List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-indigo-600" /> Your Links
          {filteredUrls.length !== urls.length && <span className="text-sm font-normal text-slate-500">(showing {filteredUrls.length} of {urls.length})</span>}
        </h2>

        {urlsLoading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading your links...</p>
          </div>
        ) : filteredUrls.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No links found.</div>
        ) : (
          <>
            {bulkMode && (
              <div className="mb-4 pb-4 border-b border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={selectedUrls.length === urls.length} onChange={selectAll} className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-sm font-semibold text-slate-700">Select All ({urls.length} links)</span>
                </label>
              </div>
            )}
            <div className="space-y-4">
              {filteredUrls.map((url) => (
                <LinkCard key={url.id} url={url} onDetails={onDetails} onDelete={onDelete}
                  onCopy={copyToClipboard} copiedId={copiedId}
                  bulkMode={bulkMode} selected={selectedUrls.includes(url.shortCode)} onToggle={toggleSelect} />
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button onClick={() => onPageChange(pagination.page - 1)} disabled={pagination.page === 1}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 flex items-center gap-2 font-semibold">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: pagination.pages }, (_, i) => (
                    <button key={i + 1} onClick={() => onPageChange(i + 1)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all ${pagination.page === i + 1 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button onClick={() => onPageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 flex items-center gap-2 font-semibold">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}