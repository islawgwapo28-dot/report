import { Link, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, FilePlus2, FileText, Palette, FileStack, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/builder", label: "Create Report", icon: FilePlus2 },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/templates", label: "Templates", icon: Palette },
  { to: "/drafts", label: "Saved Drafts", icon: FileStack },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const loc = useLocation();
  return (
    <div className="flex h-screen w-full bg-slate-50">
      <aside
        className={`${collapsed ? "w-16" : "w-60"} shrink-0 transition-all duration-200 bg-slate-900 text-slate-200 flex flex-col`}
      >
        <div className="h-16 flex items-center gap-2 px-4 border-b border-slate-800 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
            W
          </div>
          {!collapsed && (
            <div className="leading-tight overflow-hidden">
              <div className="text-[13px] font-semibold text-white tracking-tight">WPCC</div>
              <div className="text-[10px] text-slate-400 truncate">Report Builder</div>
            </div>
          )}
        </div>
        <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active = loc.pathname === item.to || (item.to !== "/" && loc.pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active ? "bg-red-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                title={item.label}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="h-10 border-t border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
