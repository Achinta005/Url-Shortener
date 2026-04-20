import { Plus, BarChart3, TrendingUp } from "lucide-react";
import { useRef, useEffect, useState } from "react";

const TABS = [
  { id: "create", label: "Create", icon: Plus },
  { id: "urls", label: "My Links", icon: BarChart3 },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
];

export default function TabNavigation({ activeTab, setActiveTab, totalUrls }) {
  const containerRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const buttonRefs = useRef({});

  useEffect(() => {
    const btn = buttonRefs.current[activeTab];
    const container = containerRef.current;
    if (!btn || !container) return;
    const bRect = btn.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
    setIndicator({ left: bRect.left - cRect.left, width: bRect.width });
  }, [activeTab]);

  return (
    <div className="flex justify-center mb-8">
      <div
        ref={containerRef}
        className="relative inline-flex items-center gap-0.5 p-1 mb-8
                 bg-slate-100 border border-slate-200 rounded-xl "
      >
        {/* Sliding background */}
        <span
          aria-hidden
          className="absolute top-1 bottom-1 rounded-[10px] bg-white shadow-sm border border-slate-200 transition-all duration-200 ease-out"
          style={{ left: indicator.left, width: indicator.width }}
        />

        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              ref={(el) => (buttonRefs.current[id] = el)}
              onClick={() => setActiveTab(id)}
              className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-[10px]
                        text-sm font-medium transition-colors duration-150 select-none
                        ${active
                  ? "text-slate-800"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${active ? "text-indigo-500" : "text-slate-400"}`} />
              {label}
              {id === "urls" && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-none transition-colors
                            ${active
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-slate-200 text-slate-500"
                    }`}
                >
                  {totalUrls}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}