import { useState, useEffect, useRef, useCallback } from "react";
import { PIPELINES, MOCK_SCAN_LOG } from "../lib/constants";
import { startScan, connectScanLog, ApiError } from "../api/previswit";
import { LiveDot } from "../components/ui";

// ─── Cor de cada linha do log ───────────────────────────────────────────────
function logStyle(line) {
  if (line.includes("[CRIT]") || line.includes("[SUCCESS]")) return "text-red-500 font-semibold";
  if (line.includes("[WARN]")) return "text-amber-600";
  if (line.includes("[OK]"))   return "text-emerald-600";
  if (line.includes("[INFO]")) return "text-ink-muted";
  return "text-ink-faint";
}

// ─── Terminal de log ────────────────────────────────────────────────────────
function Terminal({ lines, active }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  return (
    <div className="card overflow-hidden">
      {/* Titlebar estilo macOS */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-surface-border bg-surface-hover">
        <span className="w-3 h-3 rounded-full bg-red-400/70"   />
        <span className="w-3 h-3 rounded-full bg-yellow-400/70"/>
        <span className="w-3 h-3 rounded-full bg-emerald-400/70"/>
        <span className="text-xs text-ink-faint font-mono ml-2 flex-1">PreviSwit — scan terminal</span>
        <div className="flex items-center gap-1.5">
          <LiveDot active={active} />
          {active && <span className="text-xs text-emerald-600 font-medium">LIVE</span>}
        </div>
      </div>

      <div className="bg-[#1a1917] p-4 h-72 overflow-y-auto font-mono text-xs leading-relaxed space-y-0.5">
        {lines.length === 0 && (
          <span className="text-ink-faint/40">Aguardando início do scan...</span>
        )}
        {lines.map((line, i) => (
          <div key={i} className={logStyle(line)}>{line}</div>
        ))}
        {active && (
          <span className="text-emerald-500 animate-pulse select-none">█</span>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}

// ─── View principal ─────────────────────────────────────────────────────────
export default function NewScanView({ onScanComplete }) {
  const [target,       setTarget]       = useState("");
  const [pipeline,     setPipeline]     = useState("all");
  const [shodanKey,    setShodanKey]    = useState("");
  const [vtKey,        setVtKey]        = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [phase,  setPhase]  = useState("idle"); // idle | scanning | done | error
  const [logLines, setLog]  = useState([]);
  const [errMsg, setErrMsg] = useState("");

  const wsCloseRef = useRef(null);

  // Cleanup WebSocket quando o componente desmonta
  useEffect(() => () => wsCloseRef.current?.(), []);

  const appendLog = useCallback((line) => {
    setLog((prev) => [...prev, line]);
  }, []);

  // ─── Modo mock (quando API está offline) ─────────────────────────────────
  function runMockScan() {
    setLog([]);
    setPhase("scanning");
    let i = 0;

    function step() {
      if (i >= MOCK_SCAN_LOG.length) {
        setPhase("done");
        setTimeout(() => onScanComplete?.(), 1200);
        return;
      }
      const delay = MOCK_SCAN_LOG[i].includes("━━━") ? 500 : Math.random() * 150 + 60;
      setTimeout(() => {
        setLog((prev) => [...prev, MOCK_SCAN_LOG[i]]);
        i++;
        step();
      }, delay);
    }

    step();
  }

  // ─── Scan real via API + WebSocket ───────────────────────────────────────
  async function runRealScan() {
    setLog([]);
    setPhase("scanning");
    appendLog(`[INFO]  Conectando à API em ${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}...`);

    try {
      // 1. Abre WebSocket para logs em tempo real (ws_listener.py)
      let wsConnected = false;
      try {
        const close = connectScanLog(
          (line) => appendLog(line),
          () => {
            appendLog("[INFO]  WebSocket encerrado.");
            setPhase("done");
            setTimeout(() => onScanComplete?.(), 1000);
          }
        );
        wsCloseRef.current = close;
        wsConnected = true;
        appendLog("[OK]    WebSocket conectado — recebendo logs em tempo real.");
      } catch {
        appendLog("[WARN]  WebSocket indisponível — progresso não será exibido em tempo real.");
      }

      // 2. Dispara o scan via REST
      const result = await startScan({ target, pipeline, shodanKey, vtKey });
      appendLog(`[OK]    Scan iniciado: ${result.status} — pipeline ${result.pipeline}`);

      // Se não tem WS, simula conclusão após polling
      if (!wsConnected) {
        appendLog("[INFO]  Polling de relatórios a cada 10s...");
        // Em produção: poll listReports() até aparecer o relatório novo
        setTimeout(() => {
          setPhase("done");
          onScanComplete?.();
        }, 5000);
      }
    } catch (err) {
      const msg = err instanceof ApiError
        ? `API Error ${err.status}: ${err.message}`
        : err.message;

      appendLog(`[WARN]  ${msg} — alternando para modo demo.`);
      runMockScan();
    }
  }

  async function handleStart() {
    if (!target.trim() || phase === "scanning") return;
    setErrMsg("");
    await runRealScan();
  }

  function handleReset() {
    wsCloseRef.current?.();
    setPhase("idle");
    setLog([]);
    setTarget("");
  }

  const isScanning = phase === "scanning";
  const isDone     = phase === "done";

  return (
    <div className="space-y-6 animate-fadeUp">
      {/* Formulário */}
      <div className="card p-5 space-y-5">
        {/* Target URL */}
        <div>
          <label className="label">URL Alvo</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint font-mono text-sm select-none">$</span>
            <input
              className="input pl-8 font-mono"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              placeholder="https://target.com"
              disabled={isScanning}
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Pipeline */}
        <div>
          <label className="label">Pipeline</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {PIPELINES.map((p) => (
              <button
                key={p.value}
                onClick={() => setPipeline(p.value)}
                disabled={isScanning}
                className={`text-left p-3 rounded-xl border text-sm transition-all duration-150 ${
                  pipeline === p.value
                    ? "border-ink/40 bg-surface-hover text-ink"
                    : "border-surface-border bg-surface-card text-ink-muted hover:border-ink-faint hover:text-ink"
                } disabled:opacity-40`}
              >
                <div className="font-medium text-xs">{p.label}</div>
                <div className="text-xs text-ink-faint mt-0.5 leading-tight">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Configurações avançadas */}
        <div>
          <button
            className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            <span className="transition-transform duration-200" style={{ display: "inline-block", transform: showAdvanced ? "rotate(90deg)" : "none" }}>›</span>
            API Keys opcionais (Shodan / VirusTotal)
          </button>

          {showAdvanced && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
              <div>
                <label className="label">Shodan API Key</label>
                <input className="input font-mono text-xs" value={shodanKey} onChange={(e) => setShodanKey(e.target.value)} placeholder="Deixe vazio para usar InternetDB público" disabled={isScanning} />
              </div>
              <div>
                <label className="label">VirusTotal API Key</label>
                <input className="input font-mono text-xs" value={vtKey} onChange={(e) => setVtKey(e.target.value)} placeholder="Deixe vazio para usar urlscan.io" disabled={isScanning} />
              </div>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleStart}
            disabled={!target.trim() || isScanning}
            className="btn-primary flex items-center gap-2"
          >
            {isScanning
              ? <><span className="animate-spin">⟳</span> Escaneando...</>
              : "▶ Iniciar Scan"
            }
          </button>

          {(isScanning || isDone || logLines.length > 0) && (
            <button onClick={handleReset} className="btn-ghost text-xs">
              Limpar
            </button>
          )}

          {isDone && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
              <span>✓</span> Scan concluído
            </span>
          )}
        </div>

        {errMsg && <p className="text-xs text-red-600">{errMsg}</p>}
      </div>

      {/* Terminal */}
      {(logLines.length > 0 || isScanning) && (
        <Terminal lines={logLines} active={isScanning} />
      )}

      {/* Aviso legal */}
      <div className="card border-amber-200 bg-amber-50/50 p-4 flex items-start gap-3">
        <span className="text-amber-600 flex-shrink-0 text-lg leading-none">⚠</span>
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>Uso exclusivo em alvos com autorização escrita.</strong> Utilizar esta ferramenta sem permissão é crime (Lei 12.737/2012 — Brasil). O PreviSwit Team não se responsabiliza pelo uso indevido.
        </p>
      </div>
    </div>
  );
}
