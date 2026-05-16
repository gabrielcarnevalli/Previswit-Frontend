/**
 * PreviSwit API Client
 * Conecta ao backend FastAPI em api/api.py
 *
 * Configure a variável de ambiente VITE_API_URL no arquivo .env:
 *   VITE_API_URL=http://localhost:8000
 *
 * Para rodar a API:
 *   uvicorn api.api:app --reload --port 8000
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// ─── Helper central ────────────────────────────────────────────────────────

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...options.headers },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(res.status, body.detail ?? res.statusText, body);
    }

    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") throw new ApiError(408, "Timeout: API não respondeu em 30s");
    throw err;
  }
}

export class ApiError extends Error {
  constructor(status, message, data = {}) {
    super(message);
    this.name    = "ApiError";
    this.status  = status;
    this.data    = data;
  }
}

// ─── Endpoints ─────────────────────────────────────────────────────────────

/** Verifica se a API está online */
export async function healthCheck() {
  return request("/");
}

/**
 * Inicia um scan em background.
 * A API retorna imediatamente com { status: "started" }.
 * Acompanhe o progresso via WebSocket (ws_listener.py) ou polling de /reports.
 *
 * @param {object} params
 * @param {string} params.target      - URL alvo (ex: "http://site.com")
 * @param {string} params.pipeline    - "all" | "1" | "2" | "3" | "4" | "6"
 * @param {string} [params.shodanKey] - Shodan API key (opcional)
 * @param {string} [params.vtKey]     - VirusTotal API key (opcional)
 */
export async function startScan({ target, pipeline = "all", shodanKey = "", vtKey = "" }) {
  return request("/scan", {
    method: "POST",
    body: JSON.stringify({
      target,
      pipeline,
      shodan_key: shodanKey,
      vt_key:     vtKey,
    }),
  });
}

/**
 * Lista todos os relatórios JSON disponíveis em /reports/*.json
 * @returns {Promise<{ reports: string[] }>}
 */
export async function listReports() {
  return request("/reports");
}

/**
 * Busca o conteúdo completo de um relatório JSON.
 * @param {string} filename - ex: "example_com_report.json"
 */
export async function getReport(filename) {
  return request(`/reports/${filename}`);
}

/**
 * Retorna o HTML do dashboard interativo gerado pelo PreviSwit.
 * @param {string} filename - ex: "example_com_dashboard.html"
 * @returns {Promise<string>} HTML bruto
 */
export async function getDashboardHtml(filename) {
  const res = await fetch(`${BASE_URL}/dashboard/${filename}`);
  if (!res.ok) throw new ApiError(res.status, res.statusText);
  return res.text();
}

/**
 * Retorna a memória de aprendizado da IA (ai_memory.json).
 */
export async function getAiMemory() {
  return request("/ai-memory");
}

// ─── WebSocket para log em tempo real ──────────────────────────────────────
/**
 * Abre conexão WebSocket com o ws_listener.py do PreviSwit
 * para receber logs do scan em tempo real.
 *
 * Para usar:
 *   const close = connectScanLog((line) => setLog(prev => [...prev, line]));
 *   // chame close() para encerrar
 *
 * @param {(line: string) => void} onMessage
 * @param {() => void} [onClose]
 * @returns {() => void} função para fechar a conexão
 */
export function connectScanLog(onMessage, onClose) {
  const WS_URL = (import.meta.env.VITE_WS_URL ?? "ws://localhost:8765");
  const ws = new WebSocket(WS_URL);

  ws.onmessage = (e) => onMessage(e.data);
  ws.onclose   = () => onClose?.();
  ws.onerror   = (e) => console.error("[PreviSwit WS]", e);

  return () => ws.close();
}
