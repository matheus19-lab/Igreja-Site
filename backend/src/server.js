/**
 * ============================================================
 * ECCLESIA — SERVIDOR PRINCIPAL
 * API REST com Express.js
 * Porta padrão: 3001
 * ============================================================
 */

const express  = require('express');
const cors     = require('cors');
const path     = require('path');

// Importa rotas
const membersRouter      = require('./routes/members');
const transactionsRouter = require('./routes/transactions');
const eventsRouter       = require('./routes/events');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── MIDDLEWARES ──────────────────────────────────────────────

// CORS: permite requisições do frontend (ajuste a origin em produção)
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse de JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições (simples)
app.use((req, _res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method.padEnd(7)} ${req.path}`);
  next();
});

// ── ROTAS DA API ─────────────────────────────────────────────

app.use('/api/members',      membersRouter);
app.use('/api/transactions',  transactionsRouter);
app.use('/api/events',        eventsRouter);

// ── ROTA RAIZ — Health Check ──────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    system:  'Ecclesia — Sistema de Gestão de Igreja',
    version: '1.0.0',
    status:  'online',
    time:    new Date().toISOString(),
    routes: {
      members:      '/api/members',
      transactions: '/api/transactions',
      events:       '/api/events',
    },
  });
});

app.get('/api', (_req, res) => {
  res.json({
    message:   'Ecclesia API',
    endpoints: [
      { method: 'GET',    path: '/api/members',             desc: 'Listar membros' },
      { method: 'POST',   path: '/api/members',             desc: 'Criar membro' },
      { method: 'GET',    path: '/api/members/:id',         desc: 'Buscar membro' },
      { method: 'PUT',    path: '/api/members/:id',         desc: 'Atualizar membro' },
      { method: 'DELETE', path: '/api/members/:id',         desc: 'Remover membro' },
      { method: 'GET',    path: '/api/transactions',        desc: 'Listar transações' },
      { method: 'POST',   path: '/api/transactions',        desc: 'Criar transação' },
      { method: 'GET',    path: '/api/transactions/summary',desc: 'Resumo financeiro por mês' },
      { method: 'DELETE', path: '/api/transactions/:id',    desc: 'Remover transação' },
      { method: 'GET',    path: '/api/events',              desc: 'Listar eventos' },
      { method: 'POST',   path: '/api/events',              desc: 'Criar evento' },
      { method: 'GET',    path: '/api/events/upcoming',     desc: 'Próximos eventos' },
      { method: 'PUT',    path: '/api/events/:id',          desc: 'Atualizar evento' },
      { method: 'DELETE', path: '/api/events/:id',          desc: 'Remover evento' },
    ],
  });
});

// ── HANDLER 404 ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

// ── HANDLER DE ERROS ──────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ success: false, message: 'Erro interno do servidor', error: err.message });
});

// ── START ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ✝  ECCLESIA — Sistema de Gestão de Igreja');
  console.log('  ─────────────────────────────────────────');
  console.log(`  Servidor rodando em: http://localhost:${PORT}`);
  console.log(`  API disponível em:   http://localhost:${PORT}/api`);
  console.log('');
});

module.exports = app;
