# ✝ Ecclesia — Sistema de Gestão de Igreja

> Sistema administrativo para igrejas e paróquias com estética cinematográfica e minimalista.

---

## 📁 Estrutura do Projeto

```
church-system/
├── frontend/
│   ├── html/
│   │   └── index.html        ← Ponto de entrada do sistema
│   ├── css/
│   │   └── styles.css        ← Todos os estilos (dark mode, animações, cursor)
│   └── js/
│       └── app.js            ← Toda a lógica CRUD + localStorage
│
└── backend/
    ├── package.json          ← Dependências Node.js
    ├── data/                 ← Arquivos JSON gerados automaticamente
    └── src/
        ├── server.js         ← Servidor Express principal
        ├── database.js       ← Camada de persistência (JSON files)
        └── routes/
            ├── members.js        ← CRUD de membros
            ├── transactions.js   ← CRUD de dízimos/ofertas
            └── events.js         ← CRUD de eventos
```

---

## 🚀 Como Usar

### Opção 1 — Frontend puro (mais simples)

Abra `frontend/html/index.html` diretamente no navegador.  
Os dados são salvos automaticamente no **localStorage** do browser.

> ⚠️ Precisa de conexão com a internet apenas para carregar as fontes do Google Fonts.

---

### Opção 2 — Com Backend (API REST)

**Pré-requisitos:** Node.js 18+ instalado.

```bash
# 1. Entre na pasta do backend
cd backend

# 2. Instale as dependências
npm install

# 3. Inicie o servidor
npm start
# ou em modo desenvolvimento (com auto-reload):
npm run dev
```

O servidor estará disponível em: `http://localhost:3001`

Documentação dos endpoints: `http://localhost:3001/api`

---

## ✨ Funcionalidades

### 👥 Módulo #01 — Membros
- Cadastrar, editar e remover membros
- Campos: nome, nascimento, função (Pastor / Diácono / Membro / Visitante), telefone, email
- Listagem estilo "projetos" com numeração `#001`, `#002`...
- Avatar com iniciais do nome

### 💰 Módulo #02 — Dízimos & Ofertas
- Registrar dízimos, ofertas e contribuições especiais
- Cards de resumo: total do mês, total de dízimos, total de ofertas
- Gráfico de barras dos últimos 6 meses (CSS puro, sem bibliotecas)
- Histórico completo de registros

### 📅 Módulo #03 — Agenda de Eventos
- Campos: nome, data/hora, local, descrição, responsável, tipo
- Tipos: Culto / Reunião / Estudo Bíblico / Evento Social
- Filtros por tipo de evento
- Clique no evento para expandir a descrição

---

## 🎨 Identidade Visual

- **Fundo:** `#090909` (quase preto)
- **Tipografia:** Syne (display) + DM Mono (dados) + Instrument Serif (logo)
- **Acento:** `#c8a96e` (dourado suave)
- **Efeitos:** cursor personalizado, grain overlay, transições cinematográficas
- **Hover:** `translateX(4px)` + borda lateral dourada + sombra suave

---

## 🔌 API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/members` | Listar todos os membros |
| POST | `/api/members` | Criar membro |
| PUT | `/api/members/:id` | Atualizar membro |
| DELETE | `/api/members/:id` | Remover membro |
| GET | `/api/transactions` | Listar transações |
| GET | `/api/transactions/summary` | Resumo por mês |
| POST | `/api/transactions` | Criar transação |
| DELETE | `/api/transactions/:id` | Remover transação |
| GET | `/api/events` | Listar eventos |
| GET | `/api/events/upcoming` | Próximos eventos |
| POST | `/api/events` | Criar evento |
| PUT | `/api/events/:id` | Atualizar evento |
| DELETE | `/api/events/:id` | Remover evento |

### Filtros disponíveis

```
GET /api/members?role=pastor
GET /api/members?search=João
GET /api/transactions?month=2024-12
GET /api/transactions?type=dizimo
GET /api/events?type=culto
GET /api/events?from=2024-12-01&to=2024-12-31
GET /api/events/upcoming?limit=3
```

---

## 🛠 Tecnologias

**Frontend**
- HTML5 + CSS3 + JavaScript puro (sem frameworks)
- Google Fonts: Syne, DM Mono, Instrument Serif
- localStorage para persistência offline

**Backend**
- Node.js + Express.js
- CORS configurado
- Persistência em arquivos JSON (substituível por PostgreSQL/MongoDB)

---

*Ecclesia — construído com elegância cinematográfica e propósito.*
