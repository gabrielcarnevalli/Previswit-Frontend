import { useState, useEffect } from "react";
import { MOCK_REPORTS, MOCK_AI_INSIGHTS } from "../lib/constants";
import { listReports, getAiMemory, ApiError } from "../api/previswit";
import { StatCard, SeverityBar, SeverityBadge, Skeleton, ErrorBanner, EmptyState } from "../components/ui";

function ReportCard({ report, onClick }) {
  return (
    <button
      onClick={() => onClick(report)}
      className="w-full text-left card-hover p-4 group transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-sm font-medium text-ink truncate group-hover:text-ink/80 transition-colors font-mono">
              {report.target}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-ink-faint mb-3 pl-4">
            <span>{report.date}</span>
            <span>·</span>
            <span>Pipeline {report.pipeline === "all" ? "completo" : report.pipeline}</span>
          </div>

          <div className="pl-4 space-y-2">
            <SeverityBar
              critical={report.critical}
              high={report.high}
              medium={report.medium}
              low={report.low}
            />
            <div className="flex items-center gap-3 text-xs">
              <span className="text-red-600 font-medium">{report.critical} crítico{report.critical !== 1 ? "s" : ""}</span>
              <span className="text-orange-600">{report.high} alto{report.high !== 1 ? "s" : ""}</span>
              <span className="text-yellow-600">{report.medium} médio{report.medium !== 1 ? "s" : ""}</span>
              <span className="text-blue-500">{report.low} baixo{report.low !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>

        <div className="text-right flex-shrink-0 pl-4">
          <div className="text-2xl font-semibold font-mono text-ink tabular-nums">{report.findings}</div>
          <div className="text-xs text-ink-faint">findings</div>
        </div>
      </div>
    </button>
  );
}

export default function DashboardView({ onSelectReport, onNewScan }) {
  const [reports, setReports]   = useState(null);
  const [insights, setInsights] = useState(MOCK_AI_INSIGHTS);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Tenta buscar da API real; cai para mock se offline
        const data = await listReports();
        if (!cancelled) {
          // API retorna { reports: ["file.json", ...] }
          // Aqui adaptamos para o formato esperado (em produção, busque cada relatório)
          setReports(data.reports?.length ? MOCK_REPORTS : MOCK_REPORTS);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("[Dashboard] API offline, usando dados mock.", err.message);
          setReports(MOCK_REPORTS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const totalFindings = (reports ?? []).reduce((s, r) => s + r.findings, 0);
  const totalCritical = (reports ?? []).reduce((s, r) => s + r.critical, 0);
  const totalScans    = (reports ?? []).length;
  const avgCvss       = "6.8";

  return (
    <div className="space-y-8 animate-fadeUp">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {loading
          ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />)
          : <>
              <StatCard label="Scans"     value={totalScans}    sub="realizados"          />
              <StatCard label="Findings"  value={totalFindings} sub="vulnerabilidades"    />
              <StatCard label="Críticos"  value={totalCritical} sub="prioridade máxima" accent />
              <StatCard label="CVSS Médio" value={avgCvss}      sub="score médio"         />
            </>
        }
      </div>

      {/* Scans recentes */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Scans Recentes</h2>
          <button onClick={onNewScan} className="btn-primary text-xs py-1.5 px-3">
            + Novo Scan
          </button>
        </div>

        {error && <ErrorBanner message={error} onRetry={() => window.location.reload()} />}

        {loading
          ? <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
          : reports?.length === 0
            ? <EmptyState icon="🔍" title="Nenhum scan realizado" description="Inicie um novo scan para ver os resultados aqui." action={<button onClick={onNewScan} className="btn-primary text-sm">Iniciar primeiro scan</button>} />
            : <div className="space-y-3">{reports.map((r) => <ReportCard key={r.id} report={r} onClick={onSelectReport} />)}</div>
        }
      </section>

      {/* AI Insights */}
      <section>
        <h2 className="section-title mb-3">Insights da IA</h2>
        <div className="card p-4 space-y-3">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-3 text-sm" style={{ animationDelay: `${i * 60}ms` }}>
              <span className="text-accent flex-shrink-0 font-bold mt-0.5">▸</span>
              <span className="text-ink-muted leading-relaxed">{insight}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
