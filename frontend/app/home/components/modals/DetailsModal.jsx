import { BarChart3, Hash, Globe, Eye, CheckCircle2, XCircle, Calendar, Clock, AlertCircle, FileText, Tag } from "lucide-react";
import { formatDate } from "../../lib/formatters";

export default function DetailsModal({ url, onClose }) {
  if (!url) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" /> Link Details
          </h2>
          <button onClick={onClose}><XCircle className="w-6 h-6 text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <Field label="Short Code"><span className="text-lg font-bold text-indigo-600 flex items-center gap-2"><Hash className="w-5 h-5" />{url.shortCode}</span></Field>
          <Field label="Original URL"><span className="text-sm text-slate-700 break-all flex items-start gap-2"><Globe className="w-4 h-4 mt-0.5 flex-shrink-0" />{url.originalUrl}</span></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Total Clicks"><span className="text-3xl font-bold text-indigo-600 flex items-center gap-2"><Eye className="w-6 h-6" />{url.totalClicks}</span></Field>
            <Field label="Status">
              <span className={`text-lg font-bold flex items-center gap-2 ${url.isActive ? "text-green-600" : "text-red-600"}`}>
                {url.isActive ? <><CheckCircle2 className="w-5 h-5" />Active</> : <><XCircle className="w-5 h-5" />Inactive</>}
              </span>
            </Field>
          </div>
          <Field label="Created"><span className="text-sm text-slate-700 flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(url.createdAt).toLocaleString()}</span></Field>
          {url.lastClickedAt && <Field label="Last Clicked"><span className="text-sm text-slate-700 flex items-center gap-2"><Clock className="w-4 h-4" />{new Date(url.lastClickedAt).toLocaleString()}</span></Field>}
          {url.expiresAt && (
            <Field label="Expires">
              <span className={`text-sm font-semibold flex items-center gap-2 ${new Date(url.expiresAt) < new Date() ? "text-red-600" : "text-green-600"}`}>
                <AlertCircle className="w-4 h-4" />{new Date(url.expiresAt).toLocaleString()}{new Date(url.expiresAt) < new Date() && " (Expired)"}
              </span>
            </Field>
          )}
          {url.maxClicks && (
            <Field label="Click Limit">
              <div className="text-sm text-slate-700 mb-2">{url.totalClicks} / {url.maxClicks} clicks</div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full transition-all ${url.totalClicks >= url.maxClicks ? "bg-red-500" : "bg-green-500"}`}
                  style={{ width: `${Math.min((url.totalClicks / url.maxClicks) * 100, 100)}%` }} />
              </div>
            </Field>
          )}
          {url.title && <Field label="Title"><span className="text-sm text-slate-700 flex items-center gap-2"><FileText className="w-4 h-4" />{url.title}</span></Field>}
          {url.description && <Field label="Description"><span className="text-sm text-slate-700">{url.description}</span></Field>}
          {url.tags?.length > 0 && (
            <Field label="Tags">
              <div className="flex gap-2 flex-wrap">
                {url.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium flex items-center gap-1">
                    <Tag className="w-3 h-3" />{tag}
                  </span>
                ))}
              </div>
            </Field>
          )}
        </div>
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
          <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-semibold">Close</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="p-4 bg-slate-50 rounded-lg">
      <div className="text-xs font-semibold text-slate-500 uppercase mb-1">{label}</div>
      {children}
    </div>
  );
}