/**
 * ============================================================
 * ECCLESIA — ROTAS: MEMBROS
 * Endpoints REST para gerenciar membros da igreja.
 * ============================================================
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

const router = express.Router();
const COLLECTION = 'members';

// Roles válidas
const VALID_ROLES = ['pastor', 'diacono', 'membro', 'visitante'];

/**
 * Valida os campos do membro
 */
function validate(body) {
  const errors = [];
  if (!body.name || !body.name.trim())       errors.push('Nome é obrigatório');
  if (body.role && !VALID_ROLES.includes(body.role))
    errors.push(`Função inválida. Use: ${VALID_ROLES.join(', ')}`);
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
    errors.push('Email inválido');
  return errors;
}

// ── GET /api/members ─────────────────────────────────────────
// Lista todos os membros
router.get('/', (req, res) => {
  try {
    let members = db.findAll(COLLECTION);

    // Filtro opcional por role
    if (req.query.role) {
      members = members.filter(m => m.role === req.query.role);
    }

    // Busca por nome
    if (req.query.search) {
      const q = req.query.search.toLowerCase();
      members = members.filter(m => m.name.toLowerCase().includes(q));
    }

    res.json({ success: true, data: members, total: members.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno', error: err.message });
  }
});

// ── GET /api/members/:id ──────────────────────────────────────
// Busca membro por ID
router.get('/:id', (req, res) => {
  try {
    const member = db.findById(COLLECTION, req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Membro não encontrado' });
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno', error: err.message });
  }
});

// ── POST /api/members ─────────────────────────────────────────
// Cria novo membro
router.post('/', (req, res) => {
  try {
    const errors = validate(req.body);
    if (errors.length) return res.status(400).json({ success: false, errors });

    const member = {
      id:        uuidv4(),
      name:      req.body.name.trim(),
      birth:     req.body.birth     || null,
      role:      req.body.role      || 'membro',
      phone:     req.body.phone     || '',
      email:     req.body.email     || '',
      createdAt: new Date().toISOString(),
    };

    const saved = db.create(COLLECTION, member);
    res.status(201).json({ success: true, data: saved, message: 'Membro cadastrado com sucesso' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno', error: err.message });
  }
});

// ── PUT /api/members/:id ──────────────────────────────────────
// Atualiza membro existente
router.put('/:id', (req, res) => {
  try {
    const existing = db.findById(COLLECTION, req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Membro não encontrado' });

    const errors = validate({ ...existing, ...req.body });
    if (errors.length) return res.status(400).json({ success: false, errors });

    const updated = db.update(COLLECTION, req.params.id, {
      name:      req.body.name  !== undefined ? req.body.name.trim()  : existing.name,
      birth:     req.body.birth !== undefined ? req.body.birth        : existing.birth,
      role:      req.body.role  !== undefined ? req.body.role         : existing.role,
      phone:     req.body.phone !== undefined ? req.body.phone        : existing.phone,
      email:     req.body.email !== undefined ? req.body.email        : existing.email,
      updatedAt: new Date().toISOString(),
    });

    res.json({ success: true, data: updated, message: 'Membro atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno', error: err.message });
  }
});

// ── DELETE /api/members/:id ───────────────────────────────────
// Remove membro
router.delete('/:id', (req, res) => {
  try {
    const deleted = db.delete(COLLECTION, req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Membro não encontrado' });
    res.json({ success: true, message: 'Membro removido com sucesso' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro interno', error: err.message });
  }
});

module.exports = router;
