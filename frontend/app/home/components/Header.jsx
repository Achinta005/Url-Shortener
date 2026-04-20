import { Link2, Activity, Eye, ChevronLeft, Settings, HelpCircle, LogOut, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/authContext";

export default function Header({ stats, onSettings, onHelp }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initial = user?.user_metadata?.full_name?.[0]?.toUpperCase() || "U";
  const fullName = user?.user_metadata?.full_name || "User";
  const email = user?.email || "";

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* ── Left ── */}
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-1.5 text-slate-400 hover:text-slate-700 transition-colors duration-150 shrink-0"
        >
          <ChevronLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* ── Center — Logo ── */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Link2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-slate-800 text-[15px] tracking-tight">LinkShip</span>
        </div>

        {/* ── Right ── */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Stats pills */}
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium text-slate-600">
                {stats?.totalUrls ?? 0}
                <span className="text-slate-400 font-normal ml-1">links</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-medium text-indigo-600">
                {stats?.totalClicks?.toLocaleString() ?? 0}
                <span className="text-indigo-400 font-normal ml-1">clicks</span>
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 bg-slate-100 mx-1" />

          {/* Avatar */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((p) => !p)}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-150"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                {initial}
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[100px] truncate">
                {fullName.split(" ")[0]}
              </span>
              <svg className={`hidden sm:block w-3 h-3 text-slate-400 transition-transform duration-150 ${showMenu ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Dropdown */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl border border-slate-100 shadow-lg shadow-slate-200/60 py-1.5 z-50 animate-in">

                {/* User info */}
                <div className="px-4 py-3 mb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{fullName}</p>
                      <p className="text-xs text-slate-400 truncate">{email}</p>
                    </div>
                  </div>
                </div>

                {/* Mobile stats */}
                <div className="sm:hidden px-4 pb-2 flex gap-2">
                  <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    <Activity className="w-3 h-3 text-slate-400" />
                    <span className="text-xs font-medium text-slate-600">{stats?.totalUrls ?? 0} links</span>
                  </div>
                  <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
                    <Eye className="w-3 h-3 text-indigo-400" />
                    <span className="text-xs font-medium text-indigo-600">{stats?.totalClicks ?? 0} clicks</span>
                  </div>
                </div>

                <div className="h-px bg-slate-100 mx-2 mb-1" />

                <button
                  onClick={() => { onSettings?.(); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-3 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Settings
                </button>

                <button
                  onClick={() => { onHelp?.(); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-3 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  Help & support
                </button>

                <div className="h-px bg-slate-100 mx-2 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>

              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}