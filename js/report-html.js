// Laudo formatado (HTML) para impressão/PDF. Função pura: estado + dados -> string HTML.
import { progress } from './state.js';
import { fmtDate } from './report.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const noteHtml = n => esc(String(n ?? '').trim()).replace(/\r?\n/g, '<br>');
const badge = (src, SOURCES) => `<span class="badge badge-${src}">${esc(SOURCES[src].label)}</span>`;
const DOC_STATUS = { ok: ['Recebido', 'st-ok'], defeito: ['Com problema', 'st-bad'], na: ['Não se aplica', 'st-na'] };

export function buildReportHtml(state, data, date = new Date()) {
  const { CHECKLIST, SOURCES, PROJECT } = data;
  const all = CHECKLIST.flatMap(r => r.items);
  const p = progress(state, all);
  const st = id => state.items[id]?.status ?? null;
  const defects = all.filter(i => st(i.id) === 'defeito');
  const bySource = src => defects.filter(i => i.source === src).length;
  const docsRoom = CHECKLIST.find(r => r.id === 'documentos');

  const statBox = (key, value, label, cls = '') =>
    `<div class="lp-stat ${cls}"><b data-stat="${key}">${value}</b><span>${label}</span></div>`;

  // Documentos
  const docs = docsRoom ? `
    <section data-section="documentos">
      <h2>Documentos recebidos na entrega</h2>
      <table class="lp-table">
        <thead><tr><th>Documento</th><th class="w-status">Situação</th></tr></thead>
        <tbody>${docsRoom.items.map(i => {
          const [label, cls] = DOC_STATUS[st(i.id)] ?? ['Pendente', 'st-pend'];
          const note = state.items[i.id]?.note;
          return `<tr><td>${esc(i.what)}${note?.trim() ? `<div class="lp-note">${noteHtml(note)}</div>` : ''}</td>
            <td><span class="lp-st ${cls}">${label}</span></td></tr>`;
        }).join('')}</tbody>
      </table>
    </section>` : '';

  // Defeitos por ambiente (documentos ficam na seção própria)
  let n = 0;
  const rooms = CHECKLIST.filter(r => r.id !== 'documentos')
    .map(r => ({ r, items: r.items.filter(i => st(i.id) === 'defeito') }))
    .filter(x => x.items.length);
  const defectsHtml = rooms.length ? rooms.map(({ r, items }) => `
      <div class="lp-room">
        <h3>${esc(r.room)}</h3>
        <table class="lp-table">
          <thead><tr><th class="num">Nº</th><th>Item e observação</th><th class="w-resp">Responsável</th><th class="w-fix">Corrigido em</th></tr></thead>
          <tbody>${items.map(i => {
            const note = state.items[i.id]?.note;
            return `<tr><td class="num">${++n}</td>
              <td><strong>${esc(i.what)}</strong>${note?.trim() ? `<div class="lp-note">${noteHtml(note)}</div>` : ''}</td>
              <td>${badge(i.source, SOURCES)}</td>
              <td class="lp-fill">___/___/____</td></tr>`;
          }).join('')}</tbody>
        </table>
      </div>`).join('') : '<p class="lp-empty">Nenhum defeito registrado.</p>';

  // Pendentes
  const pend = CHECKLIST
    .map(r => ({ r, k: r.items.filter(i => !st(i.id)).length }))
    .filter(x => x.k);
  const pendHtml = pend.length ? `
    <section data-section="pendentes">
      <h2>Itens não verificados</h2>
      <p>${pend.map(({ r, k }) => `${esc(r.room)}: ${k}`).join(' · ')}</p>
    </section>` : '';

  const sig = label => `<div class="lp-sig"><div class="lp-line"></div><b>${label}</b><span>Nome:</span><span>Data: ___/___/____</span></div>`;

  return `
<article class="laudo">
  <header class="lp-head">
    <div>
      <div class="lp-kicker">${esc(PROJECT.name)}</div>
      <h1>Laudo de Vistoria de Entrega</h1>
    </div>
    <div class="lp-date">Data da vistoria<br><b>${fmtDate(date)}</b></div>
  </header>

  <section class="lp-fields">
    <div><span>Proprietário</span><i></i></div>
    <div><span>Unidade</span><i></i></div>
    <div><span>Representante da construtora</span><i></i></div>
    <div><span>Representante DKZA</span><i></i></div>
  </section>

  <section class="lp-stats" data-section="resumo">
    ${statBox('done', p.done, `de <span data-stat="total">${p.total}</span> verificados`)}
    ${statBox('ok', p.ok, 'OK', 'ok')}
    ${statBox('defeito', p.defeito, 'Defeitos', 'bad')}
    ${statBox('pendentes', p.total - p.done, 'Pendentes')}
  </section>
  <p class="lp-split">Defeitos por responsável:
    ${badge('construtora', SOURCES)} <b data-stat="defeito-construtora">${bySource('construtora')}</b>
    &nbsp; ${badge('dkza', SOURCES)} <b data-stat="defeito-dkza">${bySource('dkza')}</b></p>

  ${docs}

  <section data-section="defeitos">
    <h2>Defeitos encontrados</h2>
    ${defectsHtml}
  </section>

  ${pendHtml}

  <section class="lp-legal" data-section="base">
    <h2>Base contratual</h2>
    <p>As pendências acima constam deste laudo de vistoria para correção pela Construtora por força da garantia obrigatória da obra
    (Promessa de Compra e Venda, cl. 11ª §4), observado o desempenho mínimo da NBR 15.575 (Contrato CAIXA, cl. 37.2), e pela DKZA quanto aos
    serviços por ela contratados, conforme seu manual de garantia. O recebimento das chaves não implica aceite das pendências listadas.</p>
  </section>

  <section class="lp-sigs" data-section="assinaturas">
    ${sig('Proprietário')}
    ${sig('Construtora')}
    ${sig('DKZA')}
  </section>
</article>`;
}
