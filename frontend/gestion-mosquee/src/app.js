const API_BASE = (import.meta.env.VITE_API_URL) || 'http://localhost:8001';

const state = {
  token: localStorage.getItem('mg_token') || null,
  user: JSON.parse(localStorage.getItem('mg_user') || 'null'),
  page: 'dashboard',
  prayers: [],
  announcements: [],
  finances: [],
  events: [],
  members: [],
};

const $ = (sel) => document.querySelector(sel);

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) headers['Authorization'] = `Bearer ${state.token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) { logout(); throw new Error('Session expiree'); }
  if (!res.ok) {
    let detail = `Erreur ${res.status}`;
    try { const j = await res.json(); if (j.detail) detail = j.detail; } catch {}
    throw new Error(detail);
  }
  return res.json();
}

/* ===== Auth ===== */
const loginForm = $('#login-form');
const registerForm = $('#register-form');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = $('#login-username').value.trim();
  const password = $('#login-password').value;
  $('#login-error').textContent = '';
  try {
    const data = await api('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username, password }),
    });
    state.token = data.access_token;
    localStorage.setItem('mg_token', data.access_token);
    localStorage.setItem('mg_user', JSON.stringify({ username }));
    showMain();
  } catch (err) { $('#login-error').textContent = err.message; }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = $('#reg-username').value.trim();
  const password = $('#reg-password').value;
  const full_name = $('#reg-fullname').value.trim();
  $('#register-error').textContent = '';
  try {
    await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, full_name }),
    });
    toggleForms();
    $('#login-username').value = username;
    $('#login-password').value = '';
    alert('Compte cree ! Connectez-vous.');
  } catch (err) { $('#register-error').textContent = err.message; }
});

$('#btn-register-link').addEventListener('click', toggleForms);
$('#btn-login-link').addEventListener('click', toggleForms);
$('#btn-logout').addEventListener('click', logout);

function toggleForms() {
  $('#login-form').style.display = $('#login-form').style.display === 'none' ? 'block' : 'none';
  registerForm.style.display = registerForm.style.display === 'none' ? 'block' : 'none';
}

function logout() {
  state.token = null;
  localStorage.removeItem('mg_token');
  localStorage.removeItem('mg_user');
  $('#screen-main').style.display = 'none';
  $('#screen-login').classList.add('active');
}

function showMain() {
  $('#screen-login').classList.remove('active');
  $('#screen-login').style.display = 'none';
  $('#screen-main').style.display = 'flex';
  $('#user-display').textContent = (state.user?.username || '');
  navigate('dashboard');
}

/* ===== Navigation ===== */
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => navigate(btn.dataset.page));
});

function navigate(page) {
  state.page = page;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === `page-${page}`));

  const titles = { dashboard: 'Tableau de bord', prayers: 'Horaires de prieres', announcements: 'Annonces', finances: 'Finances', events: 'Evenements', members: 'Membres' };
  $('#page-title').textContent = titles[page] || '';

  switch (page) {
    case 'dashboard': loadDashboard(); break;
    case 'prayers': loadPrayers(); break;
    case 'announcements': loadAnnouncements(); break;
    case 'finances': loadFinances(); break;
    case 'events': loadEvents(); break;
    case 'members': loadMembers(); break;
  }
}

/* ===== Dashboard ===== */
async function loadDashboard() {
  try {
    const [prayers, financeSummary, announcements] = await Promise.all([
      api('/api/prayers/'),
      api('/api/finances/summary'),
      api('/api/announcements/'),
    ]);
    renderStats(financeSummary, announcements, prayers);
    renderDashboardPrayers(prayers);
    renderDashboardAnnouncements(announcements);
  } catch (err) { console.error(err); }
}

function renderStats(finance, announcements, prayers) {
  $('#stats-grid').innerHTML = `
    <div class="stat-card"><div class="stat-value">${finance.solde ?? '--'}</div><div class="stat-label">Solde (MAD)</div></div>
    <div class="stat-card"><div class="stat-value">${prayers.length}</div><div class="stat-label">Prieres</div></div>
    <div class="stat-card"><div class="stat-value">${announcements.length}</div><div class="stat-label">Annonces</div></div>
    <div class="stat-card"><div class="stat-value">${localStorage.getItem('mg_members_count') || '--'}</div><div class="stat-label">Membres</div></div>
  `;
}

function renderDashboardPrayers(prayers) {
  $('#dashboard-prayers').innerHTML = prayers.map(p => {
    const t = p.time_hour < 10 ? '0' + p.time_hour : p.time_hour;
    const m = p.time_minute < 10 ? '0' + p.time_minute : p.time_minute;
    return `<div class="prayer-row"><span class="prayer-name">${p.name}</span><span>${t}:${m}</span></div>`;
  }).join('') || '<p class="card-meta">Aucune priere configuree</p>';
}

function renderDashboardAnnouncements(anns) {
  $('#dashboard-announcements').innerHTML = anns.slice(0, 3).map(a => `
    <div class="card">
      <div class="card-header">
        <div><span class="card-title">${esc(a.title)}</span><br><span class="card-meta">${new Date(a.created_at).toLocaleDateString()}</span></div>
        <span class="badge badge-${a.category}">${a.category}</span>
      </div>
      <div class="card-body">${esc(a.content).slice(0, 120)}...</div>
    </div>`).join('') || '<p class="card-meta">Aucune annonce</p>';
}

/* ===== Prayers ===== */
async function loadPrayers() {
  try {
    state.prayers = await api('/api/prayers/');
    renderPrayers();
  } catch (err) { showError('#prayers-list', err); }
}

function renderPrayers() {
  $('#prayers-list').innerHTML = state.prayers.map(p => {
    const fmt = (h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    return `
      <div class="prayer-row">
        <span class="prayer-name">${p.name}</span>
        <div class="prayer-times">
          <span>Adhan <strong>${fmt(p.time_hour, p.time_minute)}</strong></span>
          ${p.iqama_hour != null ? `<span>Iqama <strong>${fmt(p.iqama_hour, p.iqama_minute)}</strong></span>` : ''}
        </div>
        <div class="prayer-actions">
          <button class="btn-icon" onclick="editPrayer(${p.id})" title="Modifier">&#9998;</button>
          <button class="btn-icon" onclick="deletePrayer(${p.id})" title="Supprimer">&#10005;</button>
        </div>
      </div>`;
  }).join('') || '<p class="card-meta">Aucune priere. Ajoutez-en une.</p>';
}

window.editPrayer = (id) => {
  const p = state.prayers.find(x => x.id === id);
  if (!p) return;
  $('#p-edit-id').value = p.id;
  $('#p-name').value = p.name;
  $('#p-hour').value = p.time_hour;
  $('#p-minute').value = p.time_minute;
  $('#p-iqama-hour').value = p.iqama_hour ?? '';
  $('#p-iqama-minute').value = p.iqama_minute ?? '';
  $('#prayer-form-title').textContent = 'Modifier la priere';
  $('#prayer-form').style.display = 'flex';
};

$('#btn-add-prayer').addEventListener('click', () => {
  $('#p-edit-id').value = '';
  $('#p-name').value = 'Fajr';
  $('#p-hour').value = ''; $('#p-minute').value = '';
  $('#p-iqama-hour').value = ''; $('#p-iqama-minute').value = '';
  $('#prayer-form-title').textContent = 'Ajouter une priere';
  $('#prayer-form').style.display = 'flex';
});

$('#prayer-form form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('#p-edit-id').value;
  const payload = {
    name: $('#p-name').value,
    time_hour: parseInt($('#p-hour').value),
    time_minute: parseInt($('#p-minute').value),
    iqama_hour: $('#p-iqama-hour').value ? parseInt($('#p-iqama-hour').value) : null,
    iqama_minute: $('#p-iqama-minute').value ? parseInt($('#p-iqama-minute').value) : null,
  };
  try {
    if (id) await api(`/api/prayers/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    else await api('/api/prayers/', { method: 'POST', body: JSON.stringify(payload) });
    $('#prayer-form').style.display = 'none';
    loadPrayers();
  } catch (err) { alert(err.message); }
});

$('#btn-cancel-prayer').addEventListener('click', () => $('#prayer-form').style.display = 'none');

window.deletePrayer = async (id) => {
  if (!confirm('Supprimer cette priere ?')) return;
  try { await api(`/api/prayers/${id}`, { method: 'DELETE' }); loadPrayers(); }
  catch (err) { alert(err.message); }
};

/* ===== Announcements ===== */
async function loadAnnouncements() {
  try {
    state.announcements = await api('/api/announcements/');
    renderAnnouncements();
  } catch (err) { showError('#announcements-list', err); }
}

function renderAnnouncements() {
  $('#announcements-list').innerHTML = state.announcements.map(a => `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">${esc(a.title)}</div>
          <div class="card-meta">${new Date(a.created_at).toLocaleString()}</div>
        </div>
        <span class="badge badge-${a.category}">${a.category}</span>
      </div>
      <div class="card-body">${esc(a.content)}</div>
      <div class="card-actions">
        <button class="btn btn-sm btn-secondary" onclick="editAnnouncement(${a.id})">Modifier</button>
        <button class="btn btn-sm btn-danger" onclick="deleteAnnouncement(${a.id})">Supprimer</button>
      </div>
    </div>`).join('') || '<p class="card-meta">Aucune annonce</p>';
}

window.editAnnouncement = (id) => {
  const a = state.announcements.find(x => x.id === id);
  if (!a) return;
  $('#a-edit-id').value = a.id;
  $('#a-title').value = a.title;
  $('#a-content').value = a.content;
  $('#a-category').value = a.category;
  $('#ann-form-title').textContent = "Modifier l'annonce";
  $('#announcement-form').style.display = 'flex';
};

$('#btn-add-announcement').addEventListener('click', () => {
  $('#a-edit-id').value = '';
  $('#a-title').value = ''; $('#a-content').value = ''; $('#a-category').value = 'general';
  $('#ann-form-title').textContent = 'Nouvelle annonce';
  $('#announcement-form').style.display = 'flex';
});

$('#announcement-form form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('#a-edit-id').value;
  const payload = { title: $('#a-title').value, content: $('#a-content').value, category: $('#a-category').value };
  try {
    if (id) await api(`/api/announcements/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    else await api('/api/announcements/', { method: 'POST', body: JSON.stringify(payload) });
    $('#announcement-form').style.display = 'none';
    loadAnnouncements();
  } catch (err) { alert(err.message); }
});

$('#btn-cancel-ann').addEventListener('click', () => $('#announcement-form').style.display = 'none');

window.deleteAnnouncement = async (id) => {
  if (!confirm('Supprimer cette annonce ?')) return;
  try { await api(`/api/announcements/${id}`, { method: 'DELETE' }); loadAnnouncements(); }
  catch (err) { alert(err.message); }
};

/* ===== Finances ===== */
async function loadFinances() {
  try {
    const [list, summary] = await Promise.all([api('/api/finances/'), api('/api/finances/summary')]);
    state.finances = list;
    renderFinanceSummary(summary);
    renderFinances();
  } catch (err) { showError('#finances-list', err); }
}

function renderFinanceSummary(s) {
  $('#finance-summary').innerHTML = `
    <div class="stat-card"><div class="stat-value amount-recette">${s.total_recettes.toFixed(2)}</div><div class="stat-label">Recettes (MAD)</div></div>
    <div class="stat-card"><div class="stat-value amount-depense">${s.total_depenses.toFixed(2)}</div><div class="stat-label">Depenses (MAD)</div></div>
    <div class="stat-card"><div class="stat-value amount-solde">${s.solde.toFixed(2)}</div><div class="stat-label">Solde (MAD)</div></div>
  `;
}

function renderFinances() {
  $('#finances-list').innerHTML = state.finances.map(f => `
    <div class="finance-summary-row">
      <div>
        <div style="font-weight:600">${esc(f.category)}</div>
        <div class="card-meta">${f.description ? esc(f.description) : ''} | ${new Date(f.date).toLocaleDateString()}</div>
      </div>
      <div class="amount ${f.type === 'recette' ? 'amount-recette' : 'amount-depense'}">
        ${f.type === 'recette' ? '+' : '-'}${f.amount.toFixed(2)}
      </div>
      <button class="btn-icon" onclick="deleteFinance(${f.id})" title="Supprimer">&#10005;</button>
    </div>`).join('') || '<p class="card-meta">Aucune transaction</p>';
}

$('#btn-add-finance').addEventListener('click', () => {
  $('#f-type').value = 'recette'; $('#f-category').value = ''; $('#f-description').value = ''; $('#f-amount').value = '';
  $('#finance-form').style.display = 'flex';
});

$('#finance-form form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    type: $('#f-type').value,
    category: $('#f-category').value,
    description: $('#f-description').value || null,
    amount: parseFloat($('#f-amount').value),
  };
  try {
    await api('/api/finances/', { method: 'POST', body: JSON.stringify(payload) });
    $('#finance-form').style.display = 'none';
    loadFinances();
  } catch (err) { alert(err.message); }
});

$('#btn-cancel-finance').addEventListener('click', () => $('#finance-form').style.display = 'none');

window.deleteFinance = async (id) => {
  if (!confirm('Supprimer cette transaction ?')) return;
  try { await api(`/api/finances/${id}`, { method: 'DELETE' }); loadFinances(); }
  catch (err) { alert(err.message); }
};

/* ===== Events ===== */
async function loadEvents() {
  try {
    state.events = await api('/api/events/');
    renderEvents();
  } catch (err) { showError('#events-list', err); }
}

function renderEvents() {
  $('#events-list').innerHTML = state.events.map(ev => `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">${esc(ev.title)}</div>
          <div class="card-meta">${new Date(ev.start_date).toLocaleString()}${ev.location ? ' — ' + esc(ev.location) : ''}</div>
        </div>
        ${ev.recurring ? '<span class="badge badge-religieux">Recurrent</span>' : ''}
      </div>
      ${ev.description ? `<div class="card-body">${esc(ev.description)}</div>` : ''}
      <div class="card-actions">
        <button class="btn btn-sm btn-secondary" onclick="editEvent(${ev.id})">Modifier</button>
        <button class="btn btn-sm btn-danger" onclick="deleteEvent(${ev.id})">Supprimer</button>
      </div>
    </div>`).join('') || '<p class="card-meta">Aucun evenement</p>';
}

window.editEvent = (id) => {
  const ev = state.events.find(x => x.id === id);
  if (!ev) return;
  $('#e-edit-id').value = ev.id;
  $('#e-title').value = ev.title;
  $('#e-description').value = ev.description || '';
  $('#e-location').value = ev.location || '';
  $('#e-start').value = toLocalInput(new Date(ev.start_date));
  $('#e-end').value = ev.end_date ? toLocalInput(new Date(ev.end_date)) : '';
  $('#e-max').value = ev.max_attendees || '';
  $('#ev-form-title').textContent = "Modifier l'evenement";
  $('#event-form').style.display = 'flex';
};

function toLocalInput(d) {
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

$('#btn-add-event').addEventListener('click', () => {
  $('#e-edit-id').value = '';
  $('#e-title').value = ''; $('#e-description').value = ''; $('#e-location').value = '';
  $('#e-start').value = ''; $('#e-end').value = ''; $('#e-max').value = '';
  $('#ev-form-title').textContent = 'Nouvel evenement';
  $('#event-form').style.display = 'flex';
});

$('#event-form form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('#e-edit-id').value;
  const payload = {
    title: $('#e-title').value,
    description: $('#e-description').value || null,
    location: $('#e-location').value || null,
    start_date: new Date($('#e-start').value).toISOString(),
    end_date: $('#e-end').value ? new Date($('#e-end').value).toISOString() : null,
    max_attendees: $('#e-max').value ? parseInt($('#e-max').value) : null,
  };
  try {
    if (id) await api(`/api/events/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    else await api('/api/events/', { method: 'POST', body: JSON.stringify(payload) });
    $('#event-form').style.display = 'none';
    loadEvents();
  } catch (err) { alert(err.message); }
});

$('#btn-cancel-event').addEventListener('click', () => $('#event-form').style.display = 'none');

window.deleteEvent = async (id) => {
  if (!confirm('Supprimer cet evenement ?')) return;
  try { await api(`/api/events/${id}`, { method: 'DELETE' }); loadEvents(); }
  catch (err) { alert(err.message); }
};

/* ===== Members ===== */
async function loadMembers() {
  try {
    state.members = await api('/api/members/');
    localStorage.setItem('mg_members_count', state.members.length);
    renderMembers();
  } catch (err) { showError('#members-list', err); }
}

function renderMembers() {
  const roles = { imam: 'Imam', benevole: 'Benevole', fidele: 'Fidele', admin: 'Admin' };
  $('#members-list').innerHTML = state.members.map(m => `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">${esc(m.name)}</div>
          <div class="card-meta">${esc(m.email || '')} ${m.phone || ''}</div>
        </div>
        <span class="badge badge-general">${roles[m.role] || m.role}</span>
      </div>
      <div class="card-actions">
        <button class="btn btn-sm btn-secondary" onclick="editMember(${m.id})">Modifier</button>
        <button class="btn btn-sm btn-danger" onclick="deleteMember(${m.id})">Supprimer</button>
      </div>
    </div>`).join('') || '<p class="card-meta">Aucun membre</p>';
}

window.editMember = (id) => {
  const m = state.members.find(x => x.id === id);
  if (!m) return;
  $('#m-edit-id').value = m.id;
  $('#m-name').value = m.name;
  $('#m-email').value = m.email || '';
  $('#m-phone').value = m.phone || '';
  $('#m-role').value = m.role;
  $('#m-form-title').textContent = 'Modifier le membre';
  $('#member-form').style.display = 'flex';
};

$('#btn-add-member').addEventListener('click', () => {
  $('#m-edit-id').value = '';
  $('#m-name').value = ''; $('#m-email').value = ''; $('#m-phone').value = ''; $('#m-role').value = 'fidele';
  $('#m-form-title').textContent = 'Ajouter un membre';
  $('#member-form').style.display = 'flex';
});

$('#member-form form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('#m-edit-id').value;
  const payload = {
    name: $('#m-name').value,
    email: $('#m-email').value || null,
    phone: $('#m-phone').value || null,
    role: $('#m-role').value,
  };
  try {
    if (id) await api(`/api/members/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    else await api('/api/members/', { method: 'POST', body: JSON.stringify(payload) });
    $('#member-form').style.display = 'none';
    loadMembers();
  } catch (err) { alert(err.message); }
});

$('#btn-cancel-member').addEventListener('click', () => $('#member-form').style.display = 'none');

window.deleteMember = async (id) => {
  if (!confirm('Supprimer ce membre ?')) return;
  try { await api(`/api/members/${id}`, { method: 'DELETE' }); loadMembers(); }
  catch (err) { alert(err.message); }
};

/* ===== Utils ===== */
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function showError(sel, err) {
  const el = $(sel);
  if (el) el.innerHTML = '<p class="card-meta" style="color:var(--danger)">Erreur : ' + esc(err.message) + '</p>';
}

/* Close modal on backdrop click */
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', (e) => { if (e.target === m) m.style.display = 'none'; });
});

/* ===== Init ===== */
if (state.token) showMain();