// Camada de interface: roteamento por hash, renderização e eventos.
import { PROJECT, SOURCES, DELIVERY, CHECKLIST, TOOLS, REMINDERS, ALL_CHECK_ITEMS } from './data.js';
import { loadState, saveState, setStatus, setNote, progress, roomProgress, emptyState } from './state.js';
import { buildReport } from './report.js';
import { buildReportHtml } from './report-html.js';
import { MAX_PER_ITEM, resizeImage, openPhotoDb, addPhoto, listPhotos, deletePhoto, clearPhotos } from './photos.js';

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

// ---------- Fotos (IndexedDB; cache em memória com URLs de objeto) ----------

let photoDb = null;
let photos = {}; // { [itemId]: [{ id, url }] }
const photoList = id => photos[id] ?? [];
const photosForReport = () => photos;
const photoCounts = () => Object.fromEntries(Object.entries(photos).map(([k, v]) => [k, v.length]));

async function initPhotos() {
  try {
    photoDb = await openPhotoDb();
    const by = await listPhotos(photoDb);
    photos = Object.fromEntries(Object.entries(by).map(([k, recs]) =>
      [k, recs.map(r => ({ id: r.id, url: URL.createObjectURL(r.blob) }))]));
    if (Object.keys(photos).length) route();
  } catch {
    photoDb = null;
  }
}

async function addPhotos(itemId, files) {
  if (!photoDb) { toast('Este navegador não permite guardar fotos'); return; }
  const room = MAX_PER_ITEM - photoList(itemId).length;
  const chosen = [...files].slice(0, Math.max(0, room));
  if (files.length > chosen.length) toast(`Máximo de ${MAX_PER_ITEM} fotos por item`);
  navigator.storage?.persist?.().catch(() => {});
  for (const f of chosen) {
    try {
      const blob = await resizeImage(f);
      const rec = await addPhoto(photoDb, itemId, blob);
      (photos[itemId] ??= []).push({ id: rec.id, url: URL.createObjectURL(blob) });
    } catch {
      toast('Não foi possível salvar a foto');
    }
  }
  refreshItem(itemId);
}

async function removePhoto(itemId, photoId) {
  try {
    await deletePhoto(photoDb, photoId);
  } catch {
    toast('Não foi possível apagar a foto');
    return;
  }
  const p = photoList(itemId).find(x => x.id === photoId);
  if (p) URL.revokeObjectURL(p.url);
  photos[itemId] = photoList(itemId).filter(x => x.id !== photoId);
  if (!photos[itemId].length) delete photos[itemId];
  refreshItem(itemId);
}

async function resetPhotos() {
  for (const list of Object.values(photos)) for (const p of list) URL.revokeObjectURL(p.url);
  photos = {};
  if (photoDb) await clearPhotos(photoDb).catch(() => {});
}

function openViewer(url) {
  const v = document.createElement('div');
  v.className = 'viewer';
  v.setAttribute('role', 'dialog');
  v.setAttribute('aria-label', 'Foto');
  v.innerHTML = `<img src="${esc(url)}" alt="Foto do defeito"><button type="button" class="viewer-close" aria-label="Fechar">×</button>`;
  v.addEventListener('click', () => v.remove());
  document.body.appendChild(v);
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
      ${photoBlock(i.id, status)}
    </div>`;
}

function photoBlock(itemId, status) {
  const list = photoList(itemId);
  if (status !== 'defeito' && !list.length) return '';
  const thumbs = list.map((p, k) => `
    <div class="thumb">
      <button type="button" class="thumb-img" data-action="photo-view" data-id="${esc(p.id)}" data-item="${esc(itemId)}" aria-label="Ver foto ${k + 1}"><img src="${esc(p.url)}" alt=""></button>
      <button type="button" class="thumb-del" data-action="photo-del" data-id="${esc(p.id)}" data-item="${esc(itemId)}" aria-label="Apagar foto ${k + 1}">×</button>
    </div>`).join('');
  // Dois botões: com "multiple", o Android 13+ abre só o seletor de fotos (sem câmera).
  // "capture" abre a câmera direto em qualquer versão de Android e no iPhone.
  const add = list.length < MAX_PER_ITEM ? `
    <div class="photo-btns">
      <label class="btn photo-add">📷 Tirar foto
        <input type="file" accept="image/*" capture="environment" data-action="photo-add" data-id="${esc(itemId)}">
      </label>
      <label class="btn photo-add">🖼️ Galeria
        <input type="file" accept="image/*" multiple data-action="photo-add" data-id="${esc(itemId)}">
      </label>
    </div>` : `<p class="muted">Limite de ${MAX_PER_ITEM} fotos atingido.</p>`;
  const hint = status !== 'defeito' ? '<p class="muted">As fotos só entram no laudo quando o item está como Defeito.</p>' : '';
  return `<div class="photos">${list.length ? `<div class="thumbs">${thumbs}</div>` : ''}${add}${hint}</div>`;
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
  const text = buildReport(state, { CHECKLIST, SOURCES, PROJECT }, new Date(), photoCounts());
  const hasPhotos = Object.keys(photos).length > 0;
  return `
    <h1 class="no-print">Laudo</h1>
    <p class="muted no-print">Imprima ou salve em PDF, leve na vistoria e peça que seja assinado. "Compartilhar" envia a versão em texto (WhatsApp/e-mail).</p>
    ${hasPhotos ? '<p class="card no-print warn">As fotos ficam guardadas só neste aparelho. Salve o PDF assim que terminar a vistoria.</p>' : ''}
    <div class="btn-row no-print">
      <button type="button" class="btn primary" data-action="print">Imprimir / PDF</button>
      <button type="button" class="btn" data-action="share">Compartilhar texto</button>
    </div>
    <div class="laudo-wrap">${buildReportHtml(state, { CHECKLIST, SOURCES, PROJECT }, new Date(), photosForReport())}</div>
    <details class="no-print text-version"><summary>Ver versão em texto</summary><pre id="report">${esc(text)}</pre></details>
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
  const text = buildReport(state, { CHECKLIST, SOURCES, PROJECT }, new Date(), photoCounts());
  if (navigator.share) {
    try { await navigator.share({ title: `Laudo de vistoria — ${PROJECT.name}`, text }); return; }
    catch (e) { if (e?.name === 'AbortError') return; }
  }
  try {
    await navigator.clipboard.writeText(text);
    toast('Laudo copiado');
  } catch {
    const pre = document.getElementById('report');
    pre.closest('details')?.setAttribute('open', '');
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
  } else if (action === 'photo-view') {
    const p = photoList(btn.dataset.item).find(x => x.id === id);
    if (p) openViewer(p.url);
  } else if (action === 'photo-del') {
    if (confirm('Apagar esta foto?')) removePhoto(btn.dataset.item, id);
  } else if (action === 'reset') {
    if (confirm('Apagar todas as marcações, anotações e fotos desta vistoria?')) {
      state = emptyState();
      persist();
      resetPhotos().then(() => { route(); toast('Vistoria zerada'); });
    }
  }
});

view.addEventListener('change', e => {
  const input = e.target;
  if (input.dataset?.action !== 'photo-add' || !input.files?.length) return;
  addPhotos(input.dataset.id, input.files);
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
initPhotos();

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
