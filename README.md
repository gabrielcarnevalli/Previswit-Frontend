# PreviSwit UI

Interface web para o [PreviSwit](https://github.com/kpascoal-hub/PreviSwit) — AI-Powered Pentest Framework.

Construída com **React 19 + Vite + Tailwind CSS**, a UI conecta-se ao backend FastAPI do PreviSwit via REST e WebSocket, exibindo scans em tempo real, findings filtráveis e relatórios para download.

---

## Stack

| Tecnologia | Versão | Função |
|---|---|---|
| React | 19 | UI e gerenciamento de estado |
| Vite | 8 | Bundler e dev server |
| Tailwind CSS | 3 | Estilização utilitária |
| DM Sans | — | Tipografia da interface |
| JetBrains Mono | — | Terminal de logs e código |

---

## Pré-requisitos

- **Node.js** 18+ — [nodejs.org](https://nodejs.org)
- **PreviSwit** rodando localmente (backend FastAPI + WebSocket)

---

## Instalação

```bash
# 1. Clone ou extraia o projeto
cd previswit-ui

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# edite .env se necessário (padrão já aponta para localhost)

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:5173** no navegador.

---

## Variáveis de ambiente

Arquivo `.env` na raiz do projeto:

```env
# URL da API FastAPI do PreviSwit
VITE_API_URL=http://localhost:8000

# URL do WebSocket para logs em tempo real (ws_listener.py)
VITE_WS_URL=ws://localhost:8765
```

> Sem essas variáveis, o frontend exibe dados mock automaticamente — útil para desenvolvimento sem o backend.

---

## Uso completo (frontend + backend)

Abra três terminais em paralelo:

```bash
# Terminal 1 — Frontend
cd previswit-ui
npm run dev

# Terminal 2 — API FastAPI
cd PreviSwit-main
uvicorn api.api:app --reload --port 8000

# Terminal 3 — WebSocket (logs em tempo real)
cd PreviSwit-main
python ws_listener.py
```

### CORS — obrigatório no backend

Adicione o middleware CORS no `api/api.py` logo após `app = FastAPI(...)`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Estrutura do projeto

```
previswit-ui/
├── src/
│   ├── api/
│   │   └── previswit.js        # Cliente HTTP/WebSocket para o backend
│   ├── components/
│   │   └── ui.jsx              # Componentes reutilizáveis (Badge, Card, Toast...)
│   ├── hooks/
│   │   └── useApi.js           # Hook genérico com loading / error / data
│   ├── lib/
│   │   └── constants.js        # Dados mock, configs de severidade e pipelines
│   ├── views/
│   │   ├── DashboardView.jsx   # Visão geral: stats, scans recentes, insights da IA
│   │   ├── NewScanView.jsx     # Formulário de scan + terminal de log ao vivo
│   │   ├── FindingsView.jsx    # Vulnerabilidades com filtros e detalhes expansíveis
│   │   └── ReportsView.jsx     # Relatórios gerados com links de download
│   ├── App.jsx                 # Layout com sidebar + roteamento de views
│   ├── index.css               # Tokens de design + diretivas Tailwind
│   └── main.jsx                # Entrypoint React
├── .env                        # Variáveis de ambiente (não commitar)
├── .env.example                # Template de variáveis
├── tailwind.config.js
└── vite.config.js
```

---

## Endpoints consumidos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/` | Health check da API |
| `POST` | `/scan` | Inicia um novo scan |
| `GET` | `/reports` | Lista todos os relatórios JSON |
| `GET` | `/reports/{filename}` | Conteúdo JSON de um relatório |
| `GET` | `/dashboard/{filename}` | Dashboard HTML interativo |
| `GET` | `/ai-memory` | Memória de aprendizado da IA |
| `WS` | `ws://localhost:8765` | Stream de logs em tempo real |

---

## Telas

**Dashboard** — cards com estatísticas agregadas (total de scans, findings, críticos, CVSS médio), lista de scans recentes com barra de distribuição de severidade e painel de insights gerados pela IA.

**Novo Scan** — seleção de target URL, pipeline (completo, 1, 2, 3 IA, 4, Gemini) e API keys opcionais para Shodan e VirusTotal. Ao iniciar, abre conexão WebSocket e exibe os logs do scan em tempo real num terminal estilizado. Cai para modo mock automaticamente se o backend estiver offline.

**Findings** — listagem completa das vulnerabilidades encontradas, filtrável por severidade (Crítico, Alto, Médio, Baixo) e buscável por título ou URL. Cada finding é expansível, exibindo descrição, recomendação de correção e score CVSS.

**Relatórios** — lista de relatórios gerados, com links diretos para download do PDF técnico, dashboard HTML interativo e dados JSON brutos.

---

## Build para produção

```bash
npm run build
```

Os arquivos otimizados são gerados em `dist/`. Para servir com Nginx:

```nginx
server {
    listen 80;
    root /var/www/previswit-ui/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000/;
    }
}
```

---

## Modo mock (sem backend)

O frontend detecta automaticamente quando a API está offline e carrega dados de demonstração. Isso permite trabalhar no UI sem nenhuma dependência de backend. Basta rodar:

```bash
npm run dev
```

E abrir **http://localhost:5173** — tudo funciona com dados simulados.

---

## Projeto pai

Este repositório contém apenas o frontend. O backend completo do PreviSwit — com os pipelines de recon, scanners, motor de IA e geração de relatórios — está em:

[github.com/kpascoal-hub/PreviSwit](https://github.com/kpascoal-hub/PreviSwit)

---

## Aviso legal

> ⚠️ **Uso exclusivo em alvos com autorização escrita.**
> Utilizar esta ferramenta sem permissão é crime (Lei 12.737/2012 — Brasil).
> O PreviSwit Team não se responsabiliza pelo uso indevido.

---

**PreviSwit Team** — Engenharia de Software & Cybersecurity
