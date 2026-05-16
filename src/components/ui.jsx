import { SEVERITY } from "../lib/constants";

// ─── Badge de severidade ────────────────────────────────────────────────────
export function SeverityBadge({ severity }) {
  const cfg = SEVERITY[severity] ?? SEVERITY.LOW;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Barra de proporção de severidades ─────────────────────────────────────
export function SeverityBar({ critical = 0, high = 0, medium = 0, low = 0 }) {
  const total = critical + high + medium + low;
  if (!total) return <div className="h-1.5 rounded-full bg-surface-border" />;
  const pct = (n) => `${Math.max((n / total) * 100, n > 0 ? 3 : 0)}%`;

  return (
    <div className="h-1.5 rounded-full overflow-hidden flex gap-px">
      {critical > 0 && <div className="bg-red-500 rounded-sm"    style={{ width: pct(critical) }} />}
      {high     > 0 && <div className="bg-orange-500 rounded-sm" style={{ width: pct(high) }}     />}
      {medium   > 0 && <div className="bg-yellow-400 rounded-sm" style={{ width: pct(medium) }}   />}
      {low      > 0 && <div className="bg-blue-400 rounded-sm"   style={{ width: pct(low) }}      />}
    </div>
  );
}

// ─── Indicador de status live ───────────────────────────────────────────────
export function LiveDot({ active = false }) {
  return (
    <span className="relative flex h-2 w-2">
      {active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
      <span className={`relative inline-flex rounded-full h-2 w-2 ${active ? "bg-emerald-500" : "bg-surface-border"}`} />
    </span>
  );
}

// ─── Stat card ──────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, accent = false }) {
  return (
    <div className="card p-4 flex flex-col gap-0.5">
      <span className="section-title">{label}</span>
      <span className={`text-2xl font-semibold font-mono tabular-nums mt-1 ${accent ? "text-accent" : "text-ink"}`}>
        {value}
      </span>
      {sub && <span className="text-xs text-ink-faint">{sub}</span>}
    </div>
  );
}

// ─── CVSS score pill ────────────────────────────────────────────────────────
export function CvssScore({ score }) {
  const s = parseFloat(score);
  const color =
    s >= 9   ? "bg-red-100 text-red-700"    :
    s >= 7   ? "bg-orange-100 text-orange-700" :
    s >= 4   ? "bg-yellow-100 text-yellow-700" :
               "bg-blue-100 text-blue-600";

  return (
    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg tabular-nums ${color}`}>
      {s.toFixed(1)}
    </span>
  );
}

// ─── Skeleton loader ────────────────────────────────────────────────────────
export function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse bg-surface-hover rounded-xl ${className}`} />
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────
export function EmptyState({ icon = "◌", title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <span className="text-4xl text-ink-faint">{icon}</span>
      <div>
        <p className="font-medium text-ink">{title}</p>
        {description && <p className="text-sm text-ink-muted mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Error banner ───────────────────────────────────────────────────────────
export function ErrorBanner({ message, onRetry }) {
  return (
    <div className="card border-red-200 bg-red-50 p-4 flex items-start gap-3">
      <span className="text-red-500 mt-0.5 flex-shrink-0">⚠</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-red-700 font-medium">Erro ao carregar dados</p>
        <p className="text-xs text-red-500 mt-0.5 break-words">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="text-xs text-red-600 hover:text-red-800 font-medium flex-shrink-0 transition-colors">
          Tentar novamente
        </button>
      )}
    </div>
  );
}

// ─── Toast notification ─────────────────────────────────────────────────────
export function Toast({ message, type = "info", onClose }) {
  const styles = {
    info:    "bg-ink text-surface",
    success: "bg-emerald-700 text-white",
    error:   "bg-red-700 text-white",
    warning: "bg-amber-600 text-white",
  };
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl animate-fadeUp text-sm font-medium ${styles[type]}`}>
      <span>{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">✕</button>
    </div>
  );
}
