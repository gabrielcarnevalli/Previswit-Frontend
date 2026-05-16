# PreviSwit UI — Guia de Setup e Integração

## 1. Pré-requisitos

| Ferramenta | Versão mínima | Link |
|------------|---------------|------|
| Node.js    | 18+           | https://nodejs.org |
| Python     | 3.10+         | https://python.org |
| pip        | qualquer      | incluído com Python |

---

## 2. Rodar o frontend em localhost

```bash
# 1. Entre na pasta do projeto
cd previswit-ui

# 2. Instale as dependências (só na primeira vez)
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Abra **http://localhost:5173** no navegador.  
O Vite faz hot-reload automático — qualquer edição no código reflete instantaneamente.

---

## 3. Rodar a API do PreviSwit (backend)

```bash
# 1. Entre na pasta do PreviSwit
cd PreviSwit-main

# 2. Instale as dependências Python
pip install -r requirements.txt

# 3. Inicie a API FastAPI
uvicorn api.api:app --reload --port 8000
```

A API ficará disponível em **http://localhost:8000**.  
Acesse a documentação interativa em: **http://localhost:8000/docs** (Swagger UI).

---

## 4. Habilitar logs em tempo real (WebSocket)

O arquivo `ws_listener.py` no repositório do PreviSwit expõe os logs do scan via WebSocket.

```bash
# Em um terminal separado, dentro da pasta PreviSwit-main:
python ws_listener.py
```

O WebSocket ficará em **ws://localhost:8765**.

---

## 5. Variáveis de ambiente do frontend

Edite o arquivo `.env` na raiz do `previswit-ui/`:

```env
# URL da API FastAPI
VITE_API_URL=http://localhost:8000

# URL do WebSocket para logs em tempo real
VITE_WS_URL=ws://localhost:8765
```

> **Nota:** sem essas variáveis, o frontend roda normalmente com dados mock (demonstração).

---

## 6. CORS — Habilitar no backend

Para que o frontend (porta 5173) se comunique com a API (porta 8000), adicione CORS ao `api/api.py`:

```python
# Adicione logo após `app = FastAPI(...)`
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # em produção: seu domínio
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 7. Estrutura de arquivos do frontend

```
previswit-ui/
├── src/
│   ├── api/
│   │   └── previswit.js      ← todas as chamadas HTTP/WS à API
│   ├── components/
│   │   └── ui.jsx            ← componentes reutilizáveis (Badge, Card, Toast...)
│   ├── hooks/
│   │   └── useApi.js         ← hook genérico loading/error/data
│   ├── lib/
│   │   └── constants.js      ← dados mock + constantes de severidade/pipelines
│   ├── views/
│   │   ├── DashboardView.jsx ← tela principal com stats e scans recentes
│   │   ├── NewScanView.jsx   ← formulário + terminal de log ao vivo
│   │   ├── FindingsView.jsx  ← lista de vulnerabilidades com filtros
│   │   └── ReportsView.jsx   ← relatórios gerados com links de download
│   ├── App.jsx               ← roteamento + layout sidebar
│   ├── index.css             ← tokens de design + Tailwind
│   └── main.jsx              ← entrypoint React
├── .env                      ← variáveis de ambiente (não commitar)
├── .env.example              ← template para novos desenvolvedores
├── tailwind.config.js
└── vite.config.js
```

---

## 8. Como o frontend se integra à API

### Fluxo de um scan completo

```
Usuário preenche URL + pipeline
        │
        ▼
NewScanView.jsx
  ├── connectScanLog()    → abre WebSocket (ws://localhost:8765)
  │   └── logs chegam em tempo real no terminal
  └── startScan()         → POST /scan { target, pipeline, shodan_key, vt_key }
            │
            ▼
       API retorna { status: "started" }
            │
       Scan roda em background (subprocess no servidor)
            │
       Logs chegam via WebSocket → exibidos no terminal
            │
       Scan termina → arquivos gerados em reports/
            │
       Frontend navega para FindingsView
            │
       ReportsView.jsx → GET /reports → lista arquivos
                       → GET /reports/{file} → conteúdo JSON
                       → GET /dashboard/{file} → HTML do dashboard
```

### Endpoints disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET`  | `/` | Health check |
| `GET`  | `/reports` | Lista relatórios JSON |
| `GET`  | `/reports/{filename}` | Conteúdo de um relatório |
| `GET`  | `/dashboard/{filename}` | Dashboard HTML interativo |
| `GET`  | `/ai-memory` | Memória de aprendizado da IA |
| `POST` | `/scan` | Inicia um novo scan |

---

## 9. Build para produção

```bash
# Gera a pasta dist/ com os arquivos otimizados
npm run build

# Preview local do build de produção
npm run preview
```

Para servir em produção com Nginx:

```nginx
server {
    listen 80;
    root /var/www/previswit-ui/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy para a API FastAPI
    location /api/ {
        proxy_pass http://localhost:8000/;
    }
}
```

---

## 10. Dicas de desenvolvimento

- **Modo mock:** se a API estiver offline, o frontend usa dados mock automaticamente — útil para trabalhar no UI sem precisar do backend.
- **Hot reload:** o Vite recarrega instantaneamente ao salvar qualquer arquivo `.jsx`, `.js` ou `.css`.
- **Tailwind IntelliSense:** instale a extensão oficial no VS Code para autocomplete das classes.
- **DevTools:** inspecione as chamadas à API na aba **Network** do DevTools do navegador.
