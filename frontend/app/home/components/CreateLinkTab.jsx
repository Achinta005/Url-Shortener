import { useState, useEffect } from "react";
import {
  Globe, FileText, Info, Settings, ChevronRight, Tag,
  Plus, XCircle, CheckCircle2, Copy, Sparkles, Calendar, MousePointerClick,
} from "lucide-react";

const TAGS = ["Marketing", "Social", "Campaign", "Product", "Blog", "Newsletter"];

export default function CreateLinkTab({ onCreate, onStatsRefresh }) {
  const [longUrl, setLongUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [successAnim, setSuccessAnim] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [expiresAt, setExpiresAt] = useState("");
  const [maxClicks, setMaxClicks] = useState("");

  useEffect(() => {
    const draft = localStorage.getItem("linkDraft");
    if (draft) {
      try {
        const { longUrl: u, customSlug: s } = JSON.parse(draft);
        if (u) setLongUrl(u);
        if (s) setCustomSlug(s);
      } catch (_) { }
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (longUrl?.length > 10)
        localStorage.setItem("linkDraft", JSON.stringify({ longUrl, customSlug }));
    }, 1000);
    return () => clearTimeout(t);
  }, [longUrl, customSlug]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async () => {
    if (!longUrl) return setError("Please enter a URL");
    try { new URL(longUrl); } catch { return setError("Please enter a valid URL"); }
    setLoading(true); setError(""); setShortUrl("");
    try {
      const url = await onCreate({ longUrl, customSlug, tags: selectedTags, expiresAt, maxClicks });
      setShortUrl(url);
      setSuccessAnim(true);
      setLongUrl(""); setCustomSlug(""); setSelectedTags([]); setExpiresAt(""); setMaxClicks("");
      localStorage.removeItem("linkDraft");
      setTimeout(() => setSuccessAnim(false), 2000);
      onStatsRefresh?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "short.ly";

  return (
    <div className="w-full space-y-4">

      {/* ── Main form card ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">New short link</p>
            <p className="text-xs text-slate-400">Paste a long URL and get a clean short one</p>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* Long URL */}
          <div>
            <label className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <Globe className="w-3.5 h-3.5" /> Destination URL <span className="text-red-400 normal-case tracking-normal font-normal">required</span>
            </label>
            <input
              type="url"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="https://example.com/your-very-long-url-here"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm
                         text-slate-800 placeholder:text-slate-400 outline-none
                         focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
                         transition-all duration-150"
            />
          </div>

          {/* Custom slug */}
          <div>
            <label className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <FileText className="w-3.5 h-3.5" /> Custom slug
              <span className="normal-case tracking-normal font-normal text-slate-400">optional</span>
            </label>
            <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all duration-150">
              <span className="px-4 py-3 bg-slate-100 text-xs font-medium text-slate-500 border-r border-slate-200 whitespace-nowrap shrink-0">
                {baseUrl}/
              </span>
              <input
                type="text"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                placeholder="my-custom-link"
                className="flex-1 px-4 py-3 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>

          {/* Advanced toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors group"
          >
            <Settings className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-200" />
            Advanced options
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvanced ? "rotate-90" : ""}`} />
          </button>

          {/* Advanced panel */}
          {showAdvanced && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-4">

              {/* Tags */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((tag) => {
                    const active = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => setSelectedTags((p) =>
                          active ? p.filter((t) => t !== tag) : [...p, tag]
                        )}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                                    border transition-all duration-150
                                    ${active
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                          }`}
                      >
                        <Tag className="w-3 h-3" />{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Expiry + Click limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    <Calendar className="w-3.5 h-3.5" /> Expires on
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm
                               text-slate-700 outline-none focus:border-indigo-400 focus:ring-2
                               focus:ring-indigo-100 transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    <MousePointerClick className="w-3.5 h-3.5" /> Click limit
                  </label>
                  <input
                    type="number"
                    value={maxClicks}
                    onChange={(e) => setMaxClicks(e.target.value)}
                    placeholder="e.g. 1000"
                    min="1"
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm
                               text-slate-700 placeholder:text-slate-400 outline-none
                               focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <XCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99]
                       text-white text-sm font-semibold rounded-xl
                       transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
          >
            {loading
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating…</>
              : <><Plus className="w-4 h-4" /> Create short link</>
            }
          </button>
        </div>
      </div>

      {/* ── Success card ── */}
      {shortUrl && (
        <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all
                         ${successAnim ? "border-indigo-200" : "border-green-200"}`}>
          <div className={`px-6 py-3 flex items-center gap-2 text-xs font-semibold
                           ${successAnim ? "bg-indigo-50 text-indigo-700" : "bg-green-50 text-green-700"}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {successAnim ? "Link created successfully!" : "Your short link"}
          </div>

          <div className="p-6 space-y-4">
            {/* Copy row */}
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl
                              text-sm font-medium text-indigo-600 truncate">
                {shortUrl}
              </div>
              <button
                onClick={() => handleCopy(shortUrl, "result")}
                className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all
                            ${copiedId === "result"
                    ? "bg-green-600 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
              >
                {copiedId === "result"
                  ? <><CheckCircle2 className="w-4 h-4" /> Copied</>
                  : <><Copy className="w-4 h-4" /> Copy</>
                }
              </button>
            </div>

            {/* Share */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Share</p>
              <div className="flex gap-2">
                {[
                  { label: "X / Twitter", bg: "bg-slate-800 hover:bg-slate-900", url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shortUrl)}` },
                  { label: "Facebook", bg: "bg-blue-600 hover:bg-blue-700", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl)}` },
                  { label: "LinkedIn", bg: "bg-sky-700 hover:bg-sky-800", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shortUrl)}` },
                ].map(({ label, bg, url }) => (
                  <button
                    key={label}
                    onClick={() => window.open(url, "_blank")}
                    className={`flex-1 py-2 ${bg} text-white rounded-xl text-xs font-semibold transition-colors`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tips card ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-slate-400" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tips</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { title: "Custom slugs", body: "Use memorable words so links are easy to share and recognise." },
            { title: "Set expiry", body: "Expire links automatically after a date or click threshold." },
            { title: "Add tags", body: "Organise links with tags to filter and analyse by campaign." },
          ].map(({ title, body }) => (
            <div key={title} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-semibold text-slate-700 mb-1">{title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}