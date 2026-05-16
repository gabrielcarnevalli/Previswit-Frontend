import { useState } from "react";
import { MOCK_FINDINGS, SEVERITY } from "../lib/constants";
import { SeverityBadge, CvssScore, SeverityBar, EmptyState } from "../components/ui";

const SEVERITIES = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

function FindingRow({ finding, isOpen, onToggle }) {
  const cfg = SEVERITY[finding.severity] ?? SEVERITY.LOW;

  return (
    <div className={`card overflow-hidden transition-all duration-200 ${isOpen ? cfg.row : ""}`}>
      <button
        onClick={onToggle}
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-surface-hover/50 transition-colors"
      >
        {/* Dot */}
        <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${cfg.dot}`} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <SeverityBadge severity={finding.severity} />
            <span className="text-sm font-medium text-ink">{finding.title}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-faint">
            <span className="font-mono">{finding.source}</span>
            <span>·</span>
            <span className="font-mono truncate">{finding.url}</span>
          </div>
        </div>

        {/* CVSS */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <CvssScore score={finding.cvss} />
          <span className="text-ink-faint text-sm transition-transform duration-200" style={{ transform: isOpen ? "rotate(90deg)" : "none" }}>›</span>
        </div>
      </button>

      {/* Expansão */}
      {isOpen && (
        <div className={`px-4 pb-4 border-t ${cfg.border} animate-fadeIn`}>
          <div className="pt-3 space-y-3">
            <div>
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Descrição</p>
              <p className="text-sm text-ink leading-relaxed">{finding.description}</p>
            </div>
            {finding.recommendation && (
              <div>
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Recomendação</p>
                <p className="text-sm text-ink-muted leading-relaxed">{finding.recommendation}</p>
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <button className="btn-ghost text-xs py-1.5 px-3">Exportar</button>
              <button className="btn-ghost text-xs py-1.5 px-3">Copiar link</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FindingsView({ report }) {
  const [filter, setFilter]   = useState("ALL");
  const [search, setSearch]   = useState("");
  const [openId, setOpenId]   = useState(null);

  const findings = MOCK_FINDINGS; // em produção: vem do report

  const filtered = findings.filter((f) => {
    const matchSev = filter === "ALL" || f.severity === filter;
    const matchSrc = !search || f.title.toLowerCase().includes(search.toLowerCase()) || f.url.toLowerCase().includes(search.toLowerCase());
    return matchSev && matchSrc;
  });

  const counts = {
    ALL:      findings.length,
    CRITICAL: findings.filter((f) => f.severity === "CRITICAL").length,
    HIGH:     findings.filter((f) => f.severity === "HIGH").length,
    MEDIUM:   findings.filter((f) => f.severity === "MEDIUM").length,
    LOW:      findings.filter((f) => f.severity === "LOW").length,
  };

  return (
    <div className="space-y-5 animate-fadeUp">
      {/* Report summary */}
      {report && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-sm font-medium text-ink truncate">{report.target}</span>
            <span className="text-xs text-ink-faint ml-auto">{report.date}</span>
          </div>
          <SeverityBar critical={report.critical} high={report.high} medium={report.medium} low={report.low} />
          <div className="flex items-center gap-4 mt-2 text-xs">
            <span className="text-red-600 font-medium">{report.critical} críticos</span>
            <span className="text-orange-600">{report.high} altos</span>
            <span className="text-yellow-600">{report.medium} médios</span>
            <span className="text-blue-500">{report.low} baixos</span>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        {SEVERITIES.map((sev) => (
          <button
            key={sev}
            onClick={() => setFilter(sev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              filter === sev
                ? sev === "ALL"
                  ? "bg-ink text-surface"
                  : `${SEVERITY[sev]?.badge}`
                : "bg-surface-card border border-surface-border text-ink-muted hover:border-ink-faint"
            }`}
          >
            {sev === "ALL" ? "Todos" : SEVERITY[sev]?.label} ({counts[sev]})
          </button>
        ))}

        <div className="ml-auto">
          <input
            className="input text-xs py-1.5 w-48"
            placeholder="Buscar findings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0
        ? <EmptyState icon="✓" title="Nenhum finding encontrado" description="Tente ajustar os filtros." />
        : (
          <div className="space-y-2">
            {filtered.map((f) => (
              <FindingRow
                key={f.id}
                finding={f}
                isOpen={openId === f.id}
                onToggle={() => setOpenId(openId === f.id ? null : f.id)}
              />
            ))}
          </div>
        )
      }
    </div>
  );
}
