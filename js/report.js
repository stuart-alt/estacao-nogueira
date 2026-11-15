// Geração do laudo de vistoria em texto puro.
import { progress } from './state.js';

const pad = n => String(n).padStart(2, '0');
const fmtDate = d => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const OBS = '    Obs.: ';
const OBS_CONT = ' '.repeat(OBS.length);

export function buildReport(state, data, date = new Date()) {
  const { CHECKLIST, SOURCES, PROJECT } = data;
  const all = CHECKLIST.flatMap(r => r.items);
  const p = progress(state, all);
  const out = [
    `LAUDO DE VISTORIA — ${PROJECT.name}`,
    `Data: ${fmtDate(date)}`,
    `Verificados: ${p.done}/${p.total} · Defeitos: ${p.defeito} · Pendentes: ${p.total - p.done}`,
    '',
  ];

  const pending = [];
  for (const room of CHECKLIST) {
    const defects = room.items.filter(i => state.items[i.id]?.status === 'defeito');
    const open = room.items.filter(i => !state.items[i.id]?.status).length;
    if (open) pending.push(`${room.room}: ${open}`);
    if (!defects.length) continue;
    out.push(`== ${room.room} ==`);
    for (const i of defects) {
      out.push(`[ ] ${i.what} — Responsável: ${SOURCES[i.source].label}`);
      const note = state.items[i.id].note ?? '';
      if (note.trim()) {
        note.trim().split(/\r?\n/).forEach((line, k) => out.push((k ? OBS_CONT : OBS) + line));
      }
    }
    out.push('');
  }

  if (!p.defeito) out.push('Nenhum defeito registrado.', '');
  if (pending.length) {
    out.push(`PENDENTES (não verificados): ${p.total - p.done} itens — ${pending.join('; ')}`, '');
  }
  out.push('---');
  out.push('Pendências a corrigir pela Construtora por força da garantia obrigatória (Promessa cl. 11ª §4) e pela DKZA conforme pedidos contratados.');
  return out.join('\n');
}
