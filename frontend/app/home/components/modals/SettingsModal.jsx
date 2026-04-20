import { Settings, X } from "lucide-react";

export default function SettingsModal({ settings, setSettings, onSave, onClose }) {
  const toggle = (key) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" /> Settings
          </h3>
          <button onClick={onClose}><X className="w-6 h-6 text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-6">
          {[
            { key: "autoExpire", label: "Auto-Expire Links", desc: "Automatically expire links after a set period" },
            { key: "enableAnalytics", label: "Enable Analytics", desc: "Track clicks and gather insights" },
            { key: "emailNotifications", label: "Email Notifications", desc: "Receive updates about your links" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="pt-4 border-t border-slate-200 first:border-0 first:pt-0">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-900 mb-1">{label}</div>
                  <div className="text-sm text-slate-500">{desc}</div>
                </div>
                <input type="checkbox" checked={settings[key]} onChange={() => toggle(key)}
                  className="w-12 h-6 appearance-none bg-slate-200 rounded-full cursor-pointer transition-colors checked:bg-indigo-600" />
              </label>
            </div>
          ))}

          {settings.autoExpire && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Default Expiration (Days)</label>
              <input type="number" value={settings.defaultExpireDays} min="1"
                onChange={(e) => setSettings((s) => ({ ...s, defaultExpireDays: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg outline-none focus:border-indigo-500" />
            </div>
          )}

          <div className="pt-6 border-t border-slate-200">
            <label className="text-sm font-medium text-slate-700 mb-2 block">Click Notification Threshold</label>
            <input type="number" value={settings.clickThreshold} min="1"
              onChange={(e) => setSettings((s) => ({ ...s, clickThreshold: parseInt(e.target.value) }))}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg outline-none focus:border-indigo-500" />
          </div>

          <div className="pt-6 border-t border-slate-200">
            <label className="text-sm font-medium text-slate-700 mb-2 block">Custom Domain</label>
            <input type="text" value={settings.customDomain} placeholder="links.yourdomain.com"
              onChange={(e) => setSettings((s) => ({ ...s, customDomain: e.target.value }))}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg outline-none focus:border-indigo-500" />
          </div>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex gap-3">
          <button onClick={onSave} className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-semibold">Save Changes</button>
          <button onClick={onClose} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  );
}