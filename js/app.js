// Camada de interface: roteamento por hash, renderização e eventos.
import { PROJECT, SOURCES, DELIVERY, CHECKLIST, TOOLS, REMINDERS, ALL_CHECK_ITEMS } from './data.js';
import { loadState, saveState, setStatus, setNote, progress, roomProgress, emptyState } from './state.js';
import { buildReport } from './report.js';

const view = document.getElementById('view');
const toastEl = document.getElementById('toast');
const bannerEl = document.getElementById('banner');

let storage = null;
try { storage = window.localStorage; } catch { storage = null; }
let state = loadState(storage);
let filter = 'todos';
let warned = false;

const TOOL_NAME = Object.fromEntries(TOOLS.map(t => [t.id, t.name]));
const ITEM_BY_ID = Object.fromEntries(ALL_CHECK_ITEMS.map(i => [i.id, i]));
const STATUS_LABEL = { ok: 'OK', defeito: 'Defeito', na: 'N.A.' };

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const badge = src => `<span class="badge badge-${src}">${esc(SOURCES[src].short)}</span>`;

function persist() {
  if (saveState(storage, state) || warned) return;
  warned = true;
  bannerEl.textContent = 'Não foi possível salvar neste navegador — as marcações não serão guardadas.';
  bannerEl.hidden = false;
}

let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2500);
}

// ---------- Telas ----------

function renderInicio() {
  const p = progress(state, ALL_CHECK_ITEMS);
  const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
  return `
    <h1>${esc(PROJECT.subtitle)}</h1>
    <div class="stats">
      <div class="stat"><b>${p.done}/${p.total}</b><span>verificados</span></div>
      <div class="stat bad"><b>${p.defeito}</b><span>defeitos</span></div>
      <div class="stat"><b>${p.total - p.done}</b><span>pendentes</span></div>
    </div>
    <div class="bar" aria-label="Progresso ${pct}%"><i style="width:${pct}%"></i></div>
    <div class="btn-row">
      <a class="btn primary" href="#/vistoria">Fazer vistoria</a>
      <a class="btn" href="#/laudo">Ver laudo</a>
    </div>
    <h2>Lembretes importantes</h2>
    ${REMINDERS.map(r => `
      <div class="card">
        <h3>${esc(r.title)}</h3>
        <p>${esc(r.detail)}</p>
        <div class="ref">${esc(r.ref)}</div>
      </div>`).join('')}`;
}

function renderEntrega() {
  const opts = [['todos', 'Todos'], ...Object.entries(SOURCES).map(([k, v]) => [k, v.label])];
  const cats = DELIVERY
    .map(c => ({ ...c, items: c.items.filter(i => filter === 'todos' || i.source === filter) }))
    .filter(c => c.items.length);
  return `
    <h1>O que deve ser entregue</h1>
    <p class="muted">Segundo o memorial descritivo, a promessa de compra e venda e os pedidos da DKZA.</p>
    <div class="filters" role="group" aria-label="Filtrar por responsável">
      ${opts.map(([k, l]) => `<button type="button" data-action="filter" data-id="${k}" aria-pressed="${filter === k}">${esc(l)}</button>`).join('')}
    </div>
    ${cats.map(c => `
      <details class="cat" open>
        <summary>${esc(c.category)} <span class="muted">${c.items.length}</span></summary>
        ${c.items.map(i => `
          <div class="deliv">
            <div>${badge(i.source)} ${esc(i.text)}</div>
            ${i.note ? `<div class="note">${esc(i.note)}</div>` : ''}
            <div class="ref">${esc(i.ref)}</div>
          </div>`).join('')}
      </details>`).join('')}`;
}

function renderRooms() {
  const p = progress(state, ALL_CHECK_ITEMS);
  return `
    <h1>Vistoria</h1>
    <p class="muted">${p.done} de ${p.total} itens verificados. Comece pelos documentos.</p>
    <div class="rooms">
      ${CHECKLIST.map(r => {
        const rp = roomProgress(state, r);
        const count = rp.done === rp.total
          ? `<span class="done-all">✓ ${rp.total}</span>`
          : `${rp.done}/${rp.total}`;
        return `<a href="#/vistoria/${esc(r.id)}">
          <span>${esc(r.room)}</span>
          <span class="count">${rp.defeito ? `<span class="bad">${rp.defeito} defeito${rp.defeito > 1 ? 's' : ''}</span> · ` : ''}${count}</span>
        </a>`;
      }).join('')}
    </div>`;
}

function itemCard(i) {
  const st = state.items[i.id] ?? {};
  const status = st.status ?? null;
  const note = st.note ?? '';
  const showNote = status === 'defeito' || note.trim();
  const tools = (i.tools ?? []).map(t => TOOL_NAME[t]).filter(Boolean);
  return `
    <div class="item${status ? ` is-${status}` : ''}" data-item="${esc(i.id)}">
      <h3><span>${esc(i.what)}</span>${badge(i.source)}</h3>
      <p class="how">${esc(i.how)}</p>
      ${tools.length ? `<p class="tools">Ferramentas: ${esc(tools.join(', '))}</p>` : ''}
      <div class="seg" role="group" aria-label="Resultado">
        ${['ok', 'defeito', 'na'].map(s => `<button type="button" data-action="status" data-id="${esc(i.id)}" data-status="${s}" aria-pressed="${status === s}">${STATUS_LABEL[s]}</button>`).join('')}
      </div>
      ${showNote ? `<textarea data-action="note" data-id="${esc(i.id)}" placeholder="Descreva o defeito: onde, tamanho, quantidade…" aria-label="Anotação">${esc(note)}</textarea>` : ''}
    </div>`;
}

function renderRoom(id) {
  const r = CHECKLIST.find(x => x.id === id);
  if (!r) return renderRooms();
  const rp = roomProgress(state, r);
  return `
    <a class="back" href="#/vistoria">‹ Ambientes</a>
    <h1>${esc(r.room)}</h1>
    <p class="muted" id="room-progress">${rp.done}/${rp.total} verificados${rp.defeito ? ` · ${rp.defeito} com defeito` : ''}</p>
    ${r.items.map(itemCard).join('')}`;
}

function renderFerramentas() {
  const group = (list, title) => `
    <h2>${title}</h2>
    ${list.map(t => `<div class="card"><h3>${esc(t.name)}</h3><p class="muted">${esc(t.use)}</p></div>`).join('')}`;
  return `
    <h1>Ferramentas para a vistoria</h1>
    ${group(TOOLS.filter(t => t.essential), 'Essenciais')}
    ${group(TOOLS.filter(t => !t.essential), 'Úteis')}`;
}

function renderLaudo() {
  const text = buildReport(state, { CHECKLIST, SOURCES, PROJECT });
  return `
    <h1 class="no-print">Laudo</h1>
    <p class="muted no-print">Anexe este laudo ao termo de vistoria e peça que seja assinado.</p>
    <div class="btn-row no-print">
      <button type="button" class="btn primary" data-action="share">Compartilhar</button>
      <button type="button" class="btn" data-action="print">Imprimir / PDF</button>
    </div>
    <pre id="report">${esc(text)}</pre>
    <div class="btn-row no-print">
      <button type="button" class="btn danger" data-action="reset">Zerar vistoria</button>
    </div>`;
}

// ---------- Roteamento ----------

function route() {
  const parts = (location.hash || '#/inicio').replace(/^#\/?/, '').split('/');
  const [tab, sub] = parts;
  let html;
  switch (tab) {
    case 'entrega': html = renderEntrega(); break;
    case 'vistoria': html = sub ? renderRoom(sub) : renderRooms(); break;
    case 'ferramentas': html = renderFerramentas(); break;
    case 'laudo': html = renderLaudo(); break;
    default: html = renderInicio();
  }
  view.innerHTML = html;
  const active = ['entrega', 'vistoria', 'ferramentas', 'laudo'].includes(tab) ? tab : 'inicio';
  document.querySelectorAll('.tabs a').forEach(a => {
    if (a.dataset.tab === active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);
}

// ---------- Eventos ----------

function refreshItem(id) {
  const el = view.querySelector(`[data-item="${CSS.escape(id)}"]`);
  if (el) el.outerHTML = itemCard(ITEM_BY_ID[id]);
  const r = CHECKLIST.find(x => x.items.some(i => i.id === id));
  const pe = document.getElementById('room-progress');
  if (r && pe) {
    const rp = roomProgress(state, r);
    pe.textContent = `${rp.done}/${rp.total} verificados${rp.defeito ? ` · ${rp.defeito} com defeito` : ''}`;
  }
}

async function share() {
  const text = buildReport(state, { CHECKLIST, SOURCES, PROJECT });
  if (navigator.share) {
    try { await navigator.share({ title: `Laudo de vistoria — ${PROJECT.name}`, text }); return; }
    catch (e) { if (e?.name === 'AbortError') return; }
  }
  try {
    await navigator.clipboard.writeText(text);
    toast('Laudo copiado');
  } catch {
    const pre = document.getElementById('report');
    const range = document.createRange();
    range.selectNodeContents(pre);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    toast('Selecione e copie o texto do laudo');
  }
}

view.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn || btn.tagName === 'TEXTAREA') return;
  const { action, id } = btn.dataset;
  if (action === 'status') {
    flushNotes();
    const current = state.items[id]?.status ?? null;
    const next = btn.dataset.status === current ? null : btn.dataset.status;
    state = setStatus(state, id, next);
    persist();
    refreshItem(id);
    if (next === 'defeito') view.querySelector(`textarea[data-id="${CSS.escape(id)}"]`)?.focus();
  } else if (action === 'filter') {
    filter = id;
    route();
  } else if (action === 'share') {
    share();
  } else if (action === 'print') {
    window.print();
  } else if (action === 'reset') {
    if (confirm('Apagar todas as marcações e anotações desta vistoria?')) {
      state = emptyState();
      persist();
      route();
      toast('Vistoria zerada');
    }
  }
});

// Anotações: salvas com debounce, mas qualquer valor pendente é gravado antes de
// trocar de tela, marcar status, perder o foco ou o app ir para segundo plano.
const pendingNotes = new Map();
let noteTimer;

function flushNotes() {
  clearTimeout(noteTimer);
  if (!pendingNotes.size) return;
  for (const [id, value] of pendingNotes) state = setNote(state, id, value);
  pendingNotes.clear();
  persist();
}

view.addEventListener('input', e => {
  const ta = e.target;
  if (ta.dataset?.action !== 'note') return;
  pendingNotes.set(ta.dataset.id, ta.value);
  clearTimeout(noteTimer);
  noteTimer = setTimeout(flushNotes, 400);
});
view.addEventListener('change', e => { if (e.target.dataset?.action === 'note') flushNotes(); });

// Barra de abas some enquanto digita (no Android ela sobe com o teclado e cobre o campo).
view.addEventListener('focusin', e => { if (e.target.tagName === 'TEXTAREA') document.body.classList.add('typing'); });
view.addEventListener('focusout', e => {
  if (e.target.tagName !== 'TEXTAREA') return;
  document.body.classList.remove('typing');
  flushNotes();
});
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushNotes(); });
window.addEventListener('pagehide', flushNotes);

window.addEventListener('hashchange', () => { flushNotes(); route(); });
route();

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
