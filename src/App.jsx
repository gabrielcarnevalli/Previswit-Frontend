import { useState } from "react";
import DashboardView from "./views/DashboardView";
import NewScanView   from "./views/NewScanView";
import FindingsView  from "./views/FindingsView";
import ReportsView   from "./views/ReportsView";

const ShieldIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-surface">
    <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524z"/>
  </svg>
);

const NAV = [
  { id: "dashboard", label: "Dashboard",  icon: "◈" },
  { id: "scan",      label: "Novo Scan",  icon: "⌖" },
  { id: "findings",  label: "Findings",   icon: "⚑" },
  { id: "reports",   label: "Relatórios", icon: "▣" },
];

export default function App() {
  const [view,           setView]           = useState("dashboard");
  const [selectedReport, setSelectedReport] = useState(null);
  const [mobileOpen,     setMobileOpen]     = useState(false);

  function navigate(id) { setView(id); setMobileOpen(false); }

  function handleSelectReport(report) {
    setSelectedReport(report);
    navigate("findings");
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* ── Sidebar desktop ── */}
      <aside className="hidden md:flex flex-col w-52 flex-shrink-0 h-screen sticky top-0 border-r border-surface-border bg-surface-card p-3 gap-1">
        <div className="flex items-center gap-2.5 px-3 py-3 mb-1">
          <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center flex-shrink-0">
            <ShieldIcon />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink leading-none">PreviSwit</p>
            <p className="text-xs text-ink-faint mt-0.5">v1.0 · Pentest AI</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5">
          {NAV.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                view === id
                  ? "bg-surface-hover text-ink shadow-sm border border-surface-border"
                  : "text-ink-muted hover:bg-surface-hover hover:text-ink"
              }`}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <div className="px-3 pt-3 border-t border-surface-border space-y-0.5">
          <p className="text-xs text-ink-faint font-medium">AI-Powered Pentest</p>
          <p className="text-xs text-ink-faint">PreviSwit Team</p>
        </div>
      </aside>

      {/* ── Mobile topbar ── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-surface-card border-b border-surface-border flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-ink flex items-center justify-center"><ShieldIcon /></div>
          <span className="font-semibold text-sm text-ink">PreviSwit</span>
        </div>
        <button onClick={() => setMobileOpen(v => !v)} className="text-ink-muted p-1 rounded-lg hover:bg-surface-hover transition-colors">
          <span className="text-lg leading-none">{mobileOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black/20" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-14 inset-x-0 bg-surface-card border-b border-surface-border p-3 space-y-1" onClick={e => e.stopPropagation()}>
            {NAV.map(({ id, label, icon }) => (
              <button key={id} onClick={() => navigate(id)}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${view === id ? "bg-surface-hover text-ink border border-surface-border" : "text-ink-muted hover:bg-surface-hover hover:text-ink"}`}>
                <span>{icon}</span>{label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
          {view === "dashboard" && <DashboardView onSelectReport={handleSelectReport} onNewScan={() => navigate("scan")} />}
          {view === "scan"      && <NewScanView onScanComplete={() => navigate("findings")} />}
          {view === "findings"  && <FindingsView report={selectedReport} />}
          {view === "reports"   && <ReportsView />}
        </div>
      </main>
    </div>
  );
}
