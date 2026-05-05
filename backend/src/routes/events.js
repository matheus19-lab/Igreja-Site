/**
 * ============================================================
 * ECCLESIA — ROTAS: EVENTOS
 * Endpoints REST para gerenciar a agenda de eventos.
 * ============================================================
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

const router = express.Router();
const COLLECTION = 'events';

const VALID_TYPES = ['culto', 'reuniao', 'estudo', 'social'];

function validate(body) {
  const errors = [];
  if (!body.name || !body.name.trim())  errors.push('Nome do evento é obrigatório');
  if (!body.datetime)                   errors.push('Data e hora são obrigatórias');
  if (body.type && !VALID_TYPES.includes(body.type))
    errors.push(`Tipo inválido. Use: ${VALID_TYPES.join(', ')}`);
  return errors;
}

// ── GET /api/events ───────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    let events = db.findAll(COLLECTION);

    // Filtro por tipo
    if (req.query.type) {
      events = events.filter(e => e.type === req.query.type);
    }

    // Filtro por data (ex: ?from=2024-01-01&to=2024-12-31)
    if (req.query.from) {
      events = events.filter(e => e.datetime >= req.query.from);
    }
    if (req.query.to) {
      events = events.filter(e => e.datetime <= req.query.to + 'T23:59');
    }

    // Busca por nome
    if (req.query.search) {
      const q = req.query.search.toLowerCase();
      events = events.filter(e =>
        e.name.toLowerCase().includes(q) ||
        (e.responsible && e.responsible.toLowerCase().includes(q))
      );
    }

    // Ordena por data crescente (próximos primeiro)
    events.sort((a, b) => a.datetime.localeCompare(b.datetime));

    res.json({ success: true, data: events, total: events.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno', error: err.message });
  }
});

// ── GET /api/events/upcoming ──────────────────────────────────
// Próximos eventos (a partir de hoje)
router.get('/upcoming', (req, res) => {
  try {
    const now    = new Date().toISOString();
    const limit  = parseInt(req.query.limit) || 5;
    const events = db.findAll(COLLECTION)
      .filter(e => e.datetime >= now)
      .sort((a, b) => a.datetime.localeCompare(b.datetime))
      .slice(0, limit);

    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno', error: err.message });
  }
});

// ── GET /api/events/:id ───────────────────────────────────────
router.get('/:id', (req, res) => {
  try {
    const event = db.findById(COLLECTION, req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Evento não encontrado' });
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno', error: err.message });
  }
});

// ── POST /api/events ──────────────────────────────────────────
router.post('/', (req, res) => {
  try {
    const errors = validate(req.body);
    if (errors.length) return res.status(400).json({ success: false, errors });

    const event = {
      id:          uuidv4(),
      name:        req.body.name.trim(),
      datetime:    req.body.datetime,
      local:       req.body.local       || '',
      desc:        req.body.desc        || '',
      responsible: req.body.responsible || '',
      type:        req.body.type        || 'culto',
      createdAt:   new Date().toISOString(),
    };

    const saved = db.create(COLLECTION, event);
    res.status(201).json({ success: true, data: saved, message: 'Evento criado com sucesso' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno', error: err.message });
  }
});

// ── PUT /api/events/:id ───────────────────────────────────────
router.put('/:id', (req, res) => {
  try {
    const existing = db.findById(COLLECTION, req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Evento não encontrado' });

    const merged = { ...existing, ...req.body };
    const errors = validate(merged);
    if (errors.length) return res.status(400).json({ success: false, errors });

    const updated = db.update(COLLECTION, req.params.id, {
      name:        merged.name.trim(),
      datetime:    merged.datetime,
      local:       merged.local       || '',
      desc:        merged.desc        || '',
      responsible: merged.responsible || '',
      type:        merged.type        || 'culto',
      updatedAt:   new Date().toISOString(),
    });

    res.json({ success: true, data: updated, message: 'Evento atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno', error: err.message });
  }
});

// ── DELETE /api/events/:id ────────────────────────────────────
router.delete('/:id', (req, res) => {
  try {
    const deleted = db.delete(COLLECTION, req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Evento não encontrado' });
    res.json({ success: true, message: 'Evento removido com sucesso' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno', error: err.message });
  }
});

module.exports = router;
