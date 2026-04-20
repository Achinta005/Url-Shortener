import { TrendingUp, BarChart3, MapPin, Monitor, Target } from "lucide-react";

const FEATURES = [
  { icon: <MapPin className="w-8 h-8" />, title: "Geographic Data", desc: "See where your clicks are coming from" },
  { icon: <Monitor className="w-8 h-8" />, title: "Device Analytics", desc: "Track desktop, mobile, and tablet usage" },
  { icon: <Target className="w-8 h-8" />, title: "Referrer Tracking", desc: "Know which sources drive traffic" },
];

export default function AnalyticsTab() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-indigo-600" /> Analytics Overview
      </h2>
      <div className="text-center py-16">
        <BarChart3 className="w-24 h-24 text-slate-300 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-slate-700 mb-3">Advanced Analytics Coming Soon</h3>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">
          Track clicks by location, device, referrer, and more with our advanced analytics dashboard.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {FEATURES.map((f, idx) => (
            <div key={idx} className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mx-auto mb-4">{f.icon}</div>
              <h4 className="font-bold text-slate-900 mb-2">{f.title}</h4>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}