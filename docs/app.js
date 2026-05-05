/**
 * ============================================================
 * SISTEMA DE GESTÃO DE IGREJA — LÓGICA PRINCIPAL
 * Arquivo: app.js
 * Armazenamento: localStorage (persistência entre sessões)
 * ============================================================
 */

// ── ESTADO GLOBAL DA APLICAÇÃO ──────────────────────────────
const State = {
  members: [],
  transactions: [],
  events: [],
  currentModule: 'members',
  editingId: null,
  eventFilter: 'all',
};

// ── CONSTANTES ──────────────────────────────────────────────
const ROLES = {
  pastor:    { label: 'Pastor',    cls: 'role--pastor' },
  diacono:   { label: 'Diácono',   cls: 'role--diacono' },
  membro:    { label: 'Membro',    cls: 'role--membro' },
  visitante: { label: 'Visitante', cls: 'role--visitante' },
};

const TX_TYPES = {
  dizimo:   { label: 'Dízimo',    cls: 'tx-type--dizimo' },
  oferta:   { label: 'Oferta',    cls: 'tx-type--oferta' },
  especial: { label: 'Especial',  cls: 'tx-type--especial' },
};

const EVENT_TYPES = {
  culto:   { label: 'Culto',         cls: 'type--culto' },
  reuniao: { label: 'Reunião',        cls: 'type--reuniao' },
  estudo:  { label: 'Estudo Bíblico', cls: 'type--estudo' },
  social:  { label: 'Evento Social',  cls: 'type--social' },
};

const MONTHS_SHORT = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

// ── HELPERS ─────────────────────────────────────────────────

/** Gera ID único */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/** Formata número como BRL */
function formatBRL(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Formata data ISO para exibição */
function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** Retorna label a partir de key em dicionário */
function dictLabel(dict, key) {
  return dict[key] ? dict[key].label : key;
}

/** Número de identificação formatado: "#001" */
function numId(index) {
  return '#' + String(index + 1).padStart(3, '0');
}

/** Iniciais do nome para avatar */
function initials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

/** Mês/ano atual como string */
function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// ── PERSISTÊNCIA ────────────────────────────────────────────

function saveAll() {
  localStorage.setItem('church_members',      JSON.stringify(State.members));
  localStorage.setItem('church_transactions', JSON.stringify(State.transactions));
  localStorage.setItem('church_events',       JSON.stringify(State.events));
}

function loadAll() {
  try {
    State.members      = JSON.parse(localStorage.getItem('church_members'))      || [];
    State.transactions = JSON.parse(localStorage.getItem('church_transactions')) || [];
    State.events       = JSON.parse(localStorage.getItem('church_events'))       || [];
  } catch {
    State.members = []; State.transactions = []; State.events = [];
  }

  // Carrega dados de demonstração se vazio
  if (!State.members.length && !State.transactions.length && !State.events.length) {
    loadDemoData();
  }
}

function loadDemoData() {
  State.members = [
    { id: uid(), name: 'João da Silva Santos', birth: '1975-03-12', role: 'pastor',    phone: '(81) 99999-0001', email: 'joao@exemplo.com' },
    { id: uid(), name: 'Maria Oliveira Souza', birth: '1982-07-24', role: 'diacono',   phone: '(81) 99999-0002', email: 'maria@exemplo.com' },
    { id: uid(), name: 'Pedro Almeida Costa',  birth: '1990-11-03', role: 'membro',    phone: '(81) 99999-0003', email: 'pedro@exemplo.com' },
    { id: uid(), name: 'Ana Lima Ferreira',    birth: '1998-01-17', role: 'membro',    phone: '(81) 99999-0004', email: 'ana@exemplo.com' },
    { id: uid(), name: 'Carlos Mendes',        birth: '2003-09-28', role: 'visitante', phone: '(81) 99999-0005', email: '' },
  ];

  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();

  State.transactions = [
    { id: uid(), type: 'dizimo',   memberId: State.members[0].id, value: 800.00,  date: `${y}-${m}-01`, obs: '' },
    { id: uid(), type: 'oferta',   memberId: State.members[1].id, value: 150.00,  date: `${y}-${m}-05`, obs: '' },
    { id: uid(), type: 'dizimo',   memberId: State.members[2].id, value: 320.00,  date: `${y}-${m}-08`, obs: '' },
    { id: uid(), type: 'especial', memberId: State.members[3].id, value: 500.00,  date: `${y}-${m}-10`, obs: 'Campanha de Missões' },
    { id: uid(), type: 'oferta',   memberId: State.members[4].id, value: 50.00,   date: `${y}-${m}-12`, obs: '' },
  ];

  const d1 = new Date(now); d1.setDate(now.getDate() + 5);
  const d2 = new Date(now); d2.setDate(now.getDate() + 12);
  const d3 = new Date(now); d3.setDate(now.getDate() + 19);
  const d4 = new Date(now); d4.setDate(now.getDate() - 3);

  function isoDate(d) { return d.toISOString().split('T')[0]; }

  State.events = [
    { id: uid(), name: 'Culto de Domingo', datetime: isoDate(d1) + 'T09:00', local: 'Templo Principal', desc: 'Culto de adoração com louvor e pregação da Palavra.', responsible: 'João da Silva Santos', type: 'culto' },
    { id: uid(), name: 'Reunião de Líderes', datetime: isoDate(d2) + 'T19:00', local: 'Sala de Reuniões', desc: 'Reunião mensal de planejamento e avaliação dos ministérios.', responsible: 'João da Silva Santos', type: 'reuniao' },
    { id: uid(), name: 'Estudo Bíblico — Salmos', datetime: isoDate(d3) + 'T19:30', local: 'Sala Bíblica', desc: 'Série de estudos no livro dos Salmos. Traga sua Bíblia.', responsible: 'Maria Oliveira Souza', type: 'estudo' },
    { id: uid(), name: 'Confraternização da Igreja', datetime: isoDate(d4) + 'T15:00', local: 'Área de Lazer', desc: 'Momento de celebração e integração entre os membros.', responsible: 'Pedro Almeida Costa', type: 'social' },
  ];

  saveAll();
}

// ── CURSOR PERSONALIZADO ─────────────────────────────────────
function initCursor() {
  const cursor     = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursor-ring');
  if (!cursor || !cursorRing) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  // Ring com lag suave
  (function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  // Hover em elementos interativos
  document.addEventListener('mouseover', e => {
    const t = e.target.closest('button, .nav-item, .member-item, .tx-item, .event-item, .filter-btn, input, select, textarea');
    if (t) {
      cursor.classList.add('cursor--hover');
      cursorRing.classList.add('cursor--hover');
    }
  });

  document.addEventListener('mouseout', e => {
    const t = e.target.closest('button, .nav-item, .member-item, .tx-item, .event-item, .filter-btn, input, select, textarea');
    if (t) {
      cursor.classList.remove('cursor--hover');
      cursorRing.classList.remove('cursor--hover');
    }
  });

  document.addEventListener('mousedown', () => cursor.classList.add('cursor--click'));
  document.addEventListener('mouseup',   () => cursor.classList.remove('cursor--click'));
}

// ── NAVEGAÇÃO ────────────────────────────────────────────────
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const mod = item.dataset.module;
      if (!mod) return;

      // Fecha formulários abertos
      closeForms();

      // Atualiza nav
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      // Esconde módulos ativos
      document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));

      // Ativa módulo alvo
      State.currentModule = mod;
      const target = document.getElementById('module-' + mod);
      if (target) {
        target.classList.add('active');
        void target.offsetWidth; // reflow para animação
      }

      // Fecha sidebar no mobile
      if (window.innerWidth <= 900) closeSidebar();
    });
  });
}

// ── TOAST ────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = msg;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// ── FORMULÁRIO: FECHAR TODOS ──────────────────────────────────
function closeForms() {
  document.querySelectorAll('.form-panel').forEach(f => f.remove());
  State.editingId = null;
}

// ── SIDEBAR MOBILE ──────────────────────────────────────────
function initSidebar() {
  const toggle  = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (toggle) toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  });

  if (overlay) overlay.addEventListener('click', closeSidebar);
}

function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('active');
}

// ════════════════════════════════════════════════════════════
// MÓDULO 1 — MEMBROS
// ════════════════════════════════════════════════════════════

function renderMembers() {
  const list  = document.getElementById('members-list');
  const count = document.getElementById('members-count');
  if (!list) return;

  count.textContent = `${State.members.length} REGISTRO${State.members.length !== 1 ? 'S' : ''}`;

  if (!State.members.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">✝</div>
        <div class="empty-state__text">Nenhum membro cadastrado</div>
      </div>`;
    return;
  }

  list.innerHTML = State.members.map((m, i) => {
    const role = ROLES[m.role] || { label: m.role, cls: 'role--membro' };
    return `
      <div class="member-item" data-id="${m.id}">
        <span class="member-item__num">${numId(i)}</span>
        <div class="member-item__avatar">${initials(m.name)}</div>
        <div class="member-item__info">
          <div class="member-item__name">${m.name}</div>
          <div class="member-item__meta">
            ${m.phone ? m.phone + ' &nbsp;·&nbsp; ' : ''}
            ${m.email || '—'}
            ${m.birth ? ' &nbsp;·&nbsp; ' + formatDate(m.birth) : ''}
          </div>
        </div>
        <span class="member-item__role ${role.cls}">${role.label}</span>
        <div class="member-item__actions">
          <button class="btn btn-edit" onclick="editMember('${m.id}')">Editar</button>
          <button class="btn btn-danger" onclick="deleteMember('${m.id}')">Excluir</button>
        </div>
      </div>`;
  }).join('');
}

function openMemberForm(member = null) {
  closeForms();
  const isEdit = !!member;
  State.editingId = isEdit ? member.id : null;

  const panel = document.createElement('div');
  panel.className = 'form-panel';
  panel.id = 'member-form';
  panel.innerHTML = `
    <div class="form-panel__title">${isEdit ? 'Editar Membro' : 'Cadastrar Novo Membro'}</div>
    <div class="form-row form-row--2">
      <div class="form-group">
        <label class="form-label">Nome Completo *</label>
        <input class="form-input" id="m-name" type="text" placeholder="Nome completo" value="${isEdit ? member.name : ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Data de Nascimento</label>
        <input class="form-input" id="m-birth" type="date" value="${isEdit ? member.birth : ''}">
      </div>
    </div>
    <div class="form-row form-row--3">
      <div class="form-group">
        <label class="form-label">Função</label>
        <select class="form-select" id="m-role">
          ${Object.entries(ROLES).map(([k, v]) =>
            `<option value="${k}" ${isEdit && member.role === k ? 'selected' : ''}>${v.label}</option>`
          ).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Telefone</label>
        <input class="form-input" id="m-phone" type="text" placeholder="(00) 00000-0000" value="${isEdit ? member.phone : ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input" id="m-email" type="email" placeholder="email@exemplo.com" value="${isEdit ? member.email : ''}">
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" onclick="saveMember()">
        ${isEdit ? '✓ Salvar Alterações' : '+ Cadastrar Membro'}
      </button>
      <button class="btn btn-ghost" onclick="closeForms()">Cancelar</button>
    </div>`;

  const section = document.getElementById('module-members');
  const body    = section.querySelector('.module-body');
  body.insertBefore(panel, body.firstChild);
  document.getElementById('m-name').focus();
}

function saveMember() {
  const name  = document.getElementById('m-name').value.trim();
  const birth = document.getElementById('m-birth').value;
  const role  = document.getElementById('m-role').value;
  const phone = document.getElementById('m-phone').value.trim();
  const email = document.getElementById('m-email').value.trim();

  if (!name) { showToast('Nome é obrigatório', 'error'); return; }

  if (State.editingId) {
    const idx = State.members.findIndex(m => m.id === State.editingId);
    if (idx !== -1) State.members[idx] = { ...State.members[idx], name, birth, role, phone, email };
    showToast('Membro atualizado com sucesso', 'success');
  } else {
    State.members.push({ id: uid(), name, birth, role, phone, email });
    showToast('Membro cadastrado com sucesso', 'success');
  }

  saveAll();
  closeForms();
  renderMembers();
}

function editMember(id) {
  const m = State.members.find(x => x.id === id);
  if (m) openMemberForm(m);
}

function deleteMember(id) {
  if (!confirm('Remover este membro?')) return;
  State.members = State.members.filter(m => m.id !== id);
  saveAll();
  renderMembers();
  showToast('Membro removido', 'info');
}

// ════════════════════════════════════════════════════════════
// MÓDULO 2 — DÍZIMOS E OFERTAS
// ════════════════════════════════════════════════════════════

function calcStats() {
  const mk = currentMonthKey();
  const monthTxs = State.transactions.filter(t => t.date.startsWith(mk));

  const totalMonth  = monthTxs.reduce((s, t) => s + Number(t.value), 0);
  const totalDizimo = monthTxs.filter(t => t.type === 'dizimo').reduce((s, t) => s + Number(t.value), 0);
  const totalOferta = monthTxs.filter(t => t.type !== 'dizimo').reduce((s, t) => s + Number(t.value), 0);

  return { totalMonth, totalDizimo, totalOferta, count: monthTxs.length };
}

function renderFinance() {
  const list = document.getElementById('tx-list');
  if (!list) return;

  // Stats cards
  const stats = calcStats();
  document.getElementById('stat-total').textContent  = formatBRL(stats.totalMonth);
  document.getElementById('stat-dizimo').textContent = formatBRL(stats.totalDizimo);
  document.getElementById('stat-oferta').textContent = formatBRL(stats.totalOferta);
  document.getElementById('stat-count').textContent  = stats.count + ' lançamentos';

  // Lista
  if (!State.transactions.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">₿</div>
        <div class="empty-state__text">Nenhum registro financeiro</div>
      </div>`;
  } else {
    const sorted = [...State.transactions].sort((a, b) => b.date.localeCompare(a.date));
    list.innerHTML = sorted.map((t, i) => {
      const txType = TX_TYPES[t.type] || { label: t.type, cls: 'tx-type--oferta' };
      const memberName = State.members.find(m => m.id === t.memberId)?.name || 'Não identificado';
      return `
        <div class="tx-item" data-id="${t.id}">
          <span class="tx-item__num">${numId(i)}</span>
          <span class="tx-item__type ${txType.cls}">${txType.label}</span>
          <span class="tx-item__member">${memberName}${t.obs ? ' <span style="color:var(--text-muted);font-size:10px;">— ' + t.obs + '</span>' : ''}</span>
          <span class="tx-item__date">${formatDate(t.date)}</span>
          <span class="tx-item__value">${formatBRL(t.value)}</span>
          <div class="tx-item__actions">
            <button class="btn btn-danger" onclick="deleteTransaction('${t.id}')">Excluir</button>
          </div>
        </div>`;
    }).join('');
  }

  renderChart();
}

function renderChart() {
  const wrap = document.getElementById('chart-bars');
  if (!wrap) return;

  // Últimos 6 meses
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: MONTHS_SHORT[d.getMonth()],
      isCurrent: i === 0,
    });
  }

  const values = months.map(m => ({
    ...m,
    total: State.transactions
      .filter(t => t.date.startsWith(m.key))
      .reduce((s, t) => s + Number(t.value), 0),
  }));

  const maxVal = Math.max(...values.map(v => v.total), 1);

  wrap.innerHTML = values.map(v => {
    const pct = Math.round((v.total / maxVal) * 100);
    return `
      <div class="chart-bar-wrap">
        <div class="chart-bar ${v.isCurrent ? 'chart-bar--highlight' : ''}"
             style="height:${Math.max(pct, 2)}%">
          ${v.total > 0 ? `<span class="chart-bar-value">${formatBRL(v.total).replace('R$','')}</span>` : ''}
        </div>
        <span class="chart-bar-label">${v.label}</span>
      </div>`;
  }).join('');
}

function openTransactionForm() {
  closeForms();

  const memberOptions = State.members.map(m =>
    `<option value="${m.id}">${m.name}</option>`
  ).join('');

  const today = new Date().toISOString().split('T')[0];

  const panel = document.createElement('div');
  panel.className = 'form-panel';
  panel.id = 'tx-form';
  panel.innerHTML = `
    <div class="form-panel__title">Registrar Dízimo / Oferta</div>
    <div class="form-row form-row--3">
      <div class="form-group">
        <label class="form-label">Tipo *</label>
        <select class="form-select" id="tx-type">
          ${Object.entries(TX_TYPES).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Valor (R$) *</label>
        <input class="form-input" id="tx-value" type="number" min="0.01" step="0.01" placeholder="0,00">
      </div>
      <div class="form-group">
        <label class="form-label">Data *</label>
        <input class="form-input" id="tx-date" type="date" value="${today}">
      </div>
    </div>
    <div class="form-row form-row--2">
      <div class="form-group">
        <label class="form-label">Membro</label>
        <select class="form-select" id="tx-member">
          <option value="">Visitante / Anônimo</option>
          ${memberOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Observação</label>
        <input class="form-input" id="tx-obs" type="text" placeholder="Ex: Campanha de Missões">
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" onclick="saveTransaction()">+ Registrar</button>
      <button class="btn btn-ghost" onclick="closeForms()">Cancelar</button>
    </div>`;

  const section = document.getElementById('module-finance');
  const body    = section.querySelector('.module-body');
  body.insertBefore(panel, body.firstChild);
  document.getElementById('tx-value').focus();
}

function saveTransaction() {
  const type     = document.getElementById('tx-type').value;
  const value    = parseFloat(document.getElementById('tx-value').value);
  const date     = document.getElementById('tx-date').value;
  const memberId = document.getElementById('tx-member').value;
  const obs      = document.getElementById('tx-obs').value.trim();

  if (!value || value <= 0) { showToast('Informe um valor válido', 'error'); return; }
  if (!date)                { showToast('Informe a data',          'error'); return; }

  State.transactions.push({ id: uid(), type, value, date, memberId, obs });
  saveAll();
  closeForms();
  renderFinance();
  showToast('Registro salvo com sucesso', 'success');
}

function deleteTransaction(id) {
  if (!confirm('Remover este registro?')) return;
  State.transactions = State.transactions.filter(t => t.id !== id);
  saveAll();
  renderFinance();
  showToast('Registro removido', 'info');
}

// ════════════════════════════════════════════════════════════
// MÓDULO 3 — AGENDA DE EVENTOS
// ════════════════════════════════════════════════════════════

function renderEvents() {
  const list  = document.getElementById('events-list');
  const count = document.getElementById('events-count');
  if (!list) return;

  let filtered = [...State.events];
  if (State.eventFilter !== 'all') {
    filtered = filtered.filter(e => e.type === State.eventFilter);
  }

  // Ordena por data
  filtered.sort((a, b) => a.datetime.localeCompare(b.datetime));

  count.textContent = `${filtered.length} EVENTO${filtered.length !== 1 ? 'S' : ''}`;

  if (!filtered.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">📅</div>
        <div class="empty-state__text">Nenhum evento ${State.eventFilter !== 'all' ? 'neste filtro' : 'cadastrado'}</div>
      </div>`;
    return;
  }

  list.innerHTML = filtered.map((e, i) => {
    const dt  = new Date(e.datetime);
    const day = dt.getDate();
    const mon = MONTHS_SHORT[dt.getMonth()];
    const hr  = e.datetime.includes('T') ? e.datetime.split('T')[1].substr(0,5) : '';
    const evType = EVENT_TYPES[e.type] || { label: e.type, cls: 'type--culto' };

    return `
      <div class="event-item" data-id="${e.id}" onclick="toggleEventDesc(this)">
        <span class="event-item__num">${numId(i)}</span>
        <div class="event-item__date-block">
          <span class="event-item__day">${day}</span>
          <span class="event-item__month">${mon}</span>
        </div>
        <div class="event-item__info">
          <div class="event-item__name">${e.name}</div>
          <div class="event-item__meta">
            ${hr ? '<span>⏱ ' + hr + '</span>' : ''}
            ${e.local ? '<span>📍 ' + e.local + '</span>' : ''}
            <span>👤 ${e.responsible || '—'}</span>
          </div>
          <div class="event-item__desc">${e.desc || 'Sem descrição'}</div>
        </div>
        <div class="event-item__right">
          <span class="event-type ${evType.cls}">${evType.label}</span>
          <div class="event-item__actions">
            <button class="btn btn-edit" onclick="event.stopPropagation(); editEvent('${e.id}')">Editar</button>
            <button class="btn btn-danger" onclick="event.stopPropagation(); deleteEvent('${e.id}')">Excluir</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function toggleEventDesc(el) {
  el.classList.toggle('expanded');
}

function initEventFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      State.eventFilter = btn.dataset.filter;
      renderEvents();
    });
  });
}

function openEventForm(ev = null) {
  closeForms();
  const isEdit = !!ev;
  State.editingId = isEdit ? ev.id : null;

  const today = new Date().toISOString().split('T')[0] + 'T19:00';

  const panel = document.createElement('div');
  panel.className = 'form-panel';
  panel.id = 'event-form';
  panel.innerHTML = `
    <div class="form-panel__title">${isEdit ? 'Editar Evento' : 'Adicionar Novo Evento'}</div>
    <div class="form-row form-row--2">
      <div class="form-group">
        <label class="form-label">Nome do Evento *</label>
        <input class="form-input" id="ev-name" type="text" placeholder="Nome do evento" value="${isEdit ? ev.name : ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Tipo</label>
        <select class="form-select" id="ev-type">
          ${Object.entries(EVENT_TYPES).map(([k, v]) =>
            `<option value="${k}" ${isEdit && ev.type === k ? 'selected' : ''}>${v.label}</option>`
          ).join('')}
        </select>
      </div>
    </div>
    <div class="form-row form-row--3">
      <div class="form-group">
        <label class="form-label">Data e Hora *</label>
        <input class="form-input" id="ev-datetime" type="datetime-local" value="${isEdit ? ev.datetime : today}">
      </div>
      <div class="form-group">
        <label class="form-label">Local</label>
        <input class="form-input" id="ev-local" type="text" placeholder="Local do evento" value="${isEdit ? ev.local : ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Responsável</label>
        <input class="form-input" id="ev-resp" type="text" placeholder="Nome do responsável" value="${isEdit ? ev.responsible : ''}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Descrição</label>
        <textarea class="form-textarea" id="ev-desc" placeholder="Detalhes sobre o evento...">${isEdit ? ev.desc : ''}</textarea>
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" onclick="saveEvent()">
        ${isEdit ? '✓ Salvar Alterações' : '+ Adicionar Evento'}
      </button>
      <button class="btn btn-ghost" onclick="closeForms()">Cancelar</button>
    </div>`;

  const section = document.getElementById('module-events');
  const body    = section.querySelector('.module-body');
  body.insertBefore(panel, body.firstChild);
  document.getElementById('ev-name').focus();
}

function saveEvent() {
  const name     = document.getElementById('ev-name').value.trim();
  const type     = document.getElementById('ev-type').value;
  const datetime = document.getElementById('ev-datetime').value;
  const local    = document.getElementById('ev-local').value.trim();
  const resp     = document.getElementById('ev-resp').value.trim();
  const desc     = document.getElementById('ev-desc').value.trim();

  if (!name)     { showToast('Nome do evento é obrigatório', 'error'); return; }
  if (!datetime) { showToast('Informe a data e hora',        'error'); return; }

  if (State.editingId) {
    const idx = State.events.findIndex(e => e.id === State.editingId);
    if (idx !== -1) State.events[idx] = { ...State.events[idx], name, type, datetime, local, responsible: resp, desc };
    showToast('Evento atualizado', 'success');
  } else {
    State.events.push({ id: uid(), name, type, datetime, local, responsible: resp, desc });
    showToast('Evento adicionado', 'success');
  }

  saveAll();
  closeForms();
  renderEvents();
}

function editEvent(id) {
  const e = State.events.find(x => x.id === id);
  if (e) openEventForm(e);
}

function deleteEvent(id) {
  if (!confirm('Remover este evento?')) return;
  State.events = State.events.filter(e => e.id !== id);
  saveAll();
  renderEvents();
  showToast('Evento removido', 'info');
}

// ── LOADER INICIAL ───────────────────────────────────────────
function hideLoader() {
  const loader = document.getElementById('app-loader');
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 600);
  }, 900);
}

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Carrega dados
  loadAll();

  // Init componentes
  initCursor();
  initNavigation();
  initSidebar();
  initEventFilters();

  // Renderiza módulos
  renderMembers();
  renderFinance();
  renderEvents();

  // Ativa primeiro módulo
  document.querySelector('.nav-item[data-module="members"]')?.classList.add('active');
  document.getElementById('module-members')?.classList.add('active');

  // Esconde loader
  hideLoader();

  // Botões de ação globais
  document.getElementById('btn-add-member')?.addEventListener('click', () => openMemberForm());
  document.getElementById('btn-add-tx')?.addEventListener('click', openTransactionForm);
  document.getElementById('btn-add-event')?.addEventListener('click', () => openEventForm());
});
