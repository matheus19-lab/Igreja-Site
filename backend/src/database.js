/**
 * ============================================================
 * ECCLESIA — DATABASE HELPER
 * Simula um banco de dados usando arquivos JSON locais.
 * Em produção, substituir por PostgreSQL / MongoDB.
 * ============================================================
 */

const fs   = require('fs');
const path = require('path');

// Diretório onde os arquivos JSON ficam armazenados
const DB_DIR = path.join(__dirname, '..', 'data');

// Garante que o diretório de dados existe
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

/**
 * Lê uma coleção do "banco"
 * @param {string} collection - Nome da coleção (ex: 'members')
 * @returns {Array}
 */
function readCollection(collection) {
  const filePath = path.join(DB_DIR, `${collection}.json`);
  if (!fs.existsSync(filePath)) {
    // Arquivo não existe: cria vazio
    fs.writeFileSync(filePath, JSON.stringify([]), 'utf8');
    return [];
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Escreve uma coleção no "banco"
 * @param {string} collection - Nome da coleção
 * @param {Array}  data       - Array de registros
 */
function writeCollection(collection, data) {
  const filePath = path.join(DB_DIR, `${collection}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Operações CRUD genéricas
 */
const db = {
  /** Lista todos os registros */
  findAll(collection) {
    return readCollection(collection);
  },

  /** Busca por ID */
  findById(collection, id) {
    return readCollection(collection).find(r => r.id === id) || null;
  },

  /** Cria novo registro */
  create(collection, data) {
    const records = readCollection(collection);
    records.push(data);
    writeCollection(collection, records);
    return data;
  },

  /** Atualiza registro existente */
  update(collection, id, data) {
    const records = readCollection(collection);
    const idx = records.findIndex(r => r.id === id);
    if (idx === -1) return null;
    records[idx] = { ...records[idx], ...data, id };
    writeCollection(collection, records);
    return records[idx];
  },

  /** Remove registro */
  delete(collection, id) {
    const records = readCollection(collection);
    const idx = records.findIndex(r => r.id === id);
    if (idx === -1) return false;
    records.splice(idx, 1);
    writeCollection(collection, records);
    return true;
  },
};

module.exports = db;
