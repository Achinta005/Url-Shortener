import { Download, Code, FileText, ArrowRight, X } from "lucide-react";

export default function ExportModal({ onExport, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-600" /> Export Links
          </h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { format: "json", icon: <Code className="w-6 h-6 text-slate-600" />, label: "JSON Format", desc: "For developers and integrations" },
            { format: "csv", icon: <FileText className="w-6 h-6 text-slate-600" />, label: "CSV Format", desc: "For spreadsheets and analysis" },
          ].map(({ format, icon, label, desc }) => (
            <button key={format} onClick={() => onExport(format)}
              className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                {icon}
                <div className="text-left">
                  <div className="font-semibold text-slate-900">{label}</div>
                  <div className="text-xs text-slate-500">{desc}</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </button>
          ))}
        </div>
        <div className="p-6 border-t border-slate-200">
          <button onClick={onClose} className="w-full py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  );
}