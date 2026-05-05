/**
 * ============================================================
 * ECCLESIA — ROTAS: DÍZIMOS E OFERTAS
 * Endpoints REST para gerenciar registros financeiros.
 * ============================================================
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

const router = express.Router();
const COLLECTION = 'transactions';

const VALID_TYPES = ['dizimo', 'oferta', 'especial'];

function validate(body) {
  const errors = [];
  if (!body.type || !VALID_TYPES.includes(body.type))
    errors.push(`Tipo inválido. Use: ${VALID_TYPES.join(', ')}`);
  if (!body.value || isNaN(body.value) || Number(body.value) <= 0)
    errors.push('Valor deve ser um número positivo');
  if (!body.date)
    errors.push('Data é obrigatória');
  return errors;
}

// ── GET /api/transactions ─────────────────────────────────────
router.get('/', (req, res) => {
  try {
    let txs = db.findAll(COLLECTION);

    // Filtro por mês (YYYY-MM)
    if (req.query.month) {
      txs = txs.filter(t => t.date.startsWith(req.query.month));
    }

    // Filtro por tipo
    if (req.query.type) {
      txs = txs.filter(t => t.type === req.query.type);
    }

    // Filtro por membro
    if (req.query.memberId) {
      txs = txs.filter(t => t.memberId === req.query.memberId);
    }

    // Ordena por data decrescente
    txs.sort((a, b) => b.date.localeCompare(a.date));

    // Calcula total
    const total = txs.reduce((sum, t) => sum + Number(t.value), 0);

    res.json({ success: true, data: txs, total, count: txs.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno', error: err.message });
  }
});

// ── GET /api/transactions/summary ────────────────────────────
// Resumo financeiro por mês
router.get('/summary', (req, res) => {
  try {
    const txs = db.findAll(COLLECTION);

    // Agrupa por mês
    const byMonth = {};
    txs.forEach(t => {
      const month = t.date.substr(0, 7); // YYYY-MM
      if (!byMonth[month]) byMonth[month] = { month, total: 0, dizimo: 0, oferta: 0, especial: 0, count: 0 };
      byMonth[month].total += Number(t.value);
      byMonth[month][t.type] = (byMonth[month][t.type] || 0) + Number(t.value);
      byMonth[month].count++;
    });

    const summary = Object.values(byMonth).sort((a, b) => b.month.localeCompare(a.month));
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno', error: err.message });
  }
});

// ── GET /api/transactions/:id ─────────────────────────────────
router.get('/:id', (req, res) => {
  try {
    const tx = db.findById(COLLECTION, req.params.id);
    if (!tx) return res.status(404).json({ success: false, message: 'Registro não encontrado' });
    res.json({ success: true, data: tx });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno', error: err.message });
  }
});

// ── POST /api/transactions ────────────────────────────────────
router.post('/', (req, res) => {
  try {
    const errors = validate(req.body);
    if (errors.length) return res.status(400).json({ success: false, errors });

    const tx = {
      id:        uuidv4(),
      type:      req.body.type,
      value:     Number(req.body.value),
      date:      req.body.date,
      memberId:  req.body.memberId  || null,
      obs:       req.body.obs       || '',
      createdAt: new Date().toISOString(),
    };

    const saved = db.create(COLLECTION, tx);
    res.status(201).json({ success: true, data: saved, message: 'Registro salvo com sucesso' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno', error: err.message });
  }
});

// ── PUT /api/transactions/:id ─────────────────────────────────
router.put('/:id', (req, res) => {
  try {
    const existing = db.findById(COLLECTION, req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Registro não encontrado' });

    const merged = { ...existing, ...req.body };
    const errors = validate(merged);
    if (errors.length) return res.status(400).json({ success: false, errors });

    const updated = db.update(COLLECTION, req.params.id, {
      type:      merged.type,
      value:     Number(merged.value),
      date:      merged.date,
      memberId:  merged.memberId || null,
      obs:       merged.obs      || '',
      updatedAt: new Date().toISOString(),
    });

    res.json({ success: true, data: updated, message: 'Registro atualizado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno', error: err.message });
  }
});

// ── DELETE /api/transactions/:id ──────────────────────────────
router.delete('/:id', (req, res) => {
  try {
    const deleted = db.delete(COLLECTION, req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Registro não encontrado' });
    res.json({ success: true, message: 'Registro removido com sucesso' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno', error: err.message });
  }
});

module.exports = router;
