import { Link2, Eye, CheckCircle2, Clock, Activity } from "lucide-react";

export default function StatsGrid({ stats, advancedStats, loading }) {
  if (loading) return (
    <div className="col-span-full text-center py-12 text-slate-600">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
      Loading stats...
    </div>
  );

  const cards = [
    { icon: <Link2 className="w-6 h-6" />, label: "Total Links", value: stats.totalUrls, color: "from-blue-500 to-indigo-600", subtext: `${advancedStats.recentLinks} this week` },
    { icon: <Eye className="w-6 h-6" />, label: "Total Clicks", value: stats.totalClicks.toLocaleString(), color: "from-purple-500 to-pink-600", subtext: `Avg ${advancedStats.avgClicksPerLink} per link` },
    { icon: <CheckCircle2 className="w-6 h-6" />, label: "Active Links", value: stats.activeUrls, color: "from-green-500 to-emerald-600", subtext: `${Math.round((stats.activeUrls / stats.totalUrls) * 100) || 0}% of total` },
    { icon: <Clock className="w-6 h-6" />, label: "Expired Links", value: stats.expiredUrls, color: "from-orange-500 to-red-600", subtext: `${Math.round((stats.expiredUrls / stats.totalUrls) * 100) || 0}% of total` },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((stat, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4`}>
            {stat.icon}
          </div>
          <div className="text-sm font-medium text-slate-600 mb-1">{stat.label}</div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
          <div className="text-xs text-slate-500">{stat.subtext}</div>
        </div>
      ))}
    </div>
  );
}