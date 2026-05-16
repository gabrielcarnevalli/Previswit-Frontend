import { useState, useEffect } from "react";
import { MOCK_REPORTS } from "../lib/constants";
import { listReports, ApiError } from "../api/previswit";
import { SeverityBar, Skeleton, EmptyState, ErrorBanner } from "../components/ui";

function ReportItem({ report }) {
  const base = report.filename?.replace("_report.json", "") ?? report.target.replace(/https?:\/\//, "").replace(/\./g, "_");

  const downloads = [
    { label: "PDF Report",      icon: "📄", file: `${base}_report.pdf`,      endpoint: `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/reports/${base}_report.pdf` },
    { label: "Dashboard HTML",  icon: "🖥", file: `${base}_dashboard.html`,  endpoint: `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/dashboard/${base}_dashboard.html` },
    { label: "JSON Data",       icon: "{ }", file: `${base}_report.json`,    endpoint: `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/reports/${base}_report.json` },
  ];

  return (
    <div className="card-hover p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="font-mono text-sm font-medium text-ink truncate">{report.target}</span>
          </div>
          <span className="text-xs text-ink-faint pl-3.5">
            {report.date} · Pipeline {report.pipeline === "all" ? "completo" : report.pipeline} · {report.findings} findings
          </span>

          <div className="mt-3 pl-3.5">
            <SeverityBar critical={report.critical} high={report.high} medium={report.medium} low={report.low} />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4 flex-wrap pl-3.5">
        {downloads.map(({ label, icon, endpoint }) => (
          <a
            key={label}
            href={endpoint}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-surface-border bg-surface-card text-ink-muted hover:border-ink-faint hover:text-ink transition-all duration-150"
          >
            <span>{icon}</span>
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function ReportsView() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        await listReports(); // valida que a API está online
        if (!cancelled) setReports(MOCK_REPORTS);
      } catch {
        if (!cancelled) {
          setReports(MOCK_REPORTS); // fallback para mock
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-4 animate-fadeUp">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Relatórios gerados</h2>
        <span className="text-xs text-ink-faint">{reports?.length ?? 0} relatório{reports?.length !== 1 ? "s" : ""}</span>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading
        ? <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
        : reports?.length === 0
          ? <EmptyState icon="📋" title="Nenhum relatório encontrado" description="Execute um scan para gerar relatórios." />
          : <div className="space-y-3">{reports.map((r) => <ReportItem key={r.id} report={r} />)}</div>
      }

      {/* Dica de integração */}
      <div className="card bg-surface-card p-4">
        <p className="text-xs font-semibold text-ink-muted mb-2 uppercase tracking-wide">Dica de Integração</p>
        <p className="text-xs text-ink-faint leading-relaxed">
          Os relatórios são servidos pela API REST do PreviSwit. Para acessar via curl:
        </p>
        <code className="block mt-2 text-xs bg-[#1a1917] text-emerald-400 font-mono p-3 rounded-xl leading-relaxed whitespace-pre">
{`GET /reports          → lista todos os relatórios
GET /reports/{file}   → conteúdo JSON do relatório
GET /dashboard/{file} → HTML do dashboard interativo
GET /ai-memory        → memória de aprendizado da IA`}
        </code>
      </div>
    </div>
  );
}
