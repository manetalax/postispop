export const MAX_NOTES = 12;
export const MAX_TEXT = 10000;
export const TEMPLATES = [
  { id:'tareas', title:'Lista de tareas', notes:['Por hacer\n☐ Mi primera tarea','En curso\nUna tarea cada vez','Terminado\nCelebra lo que has conseguido'] },
  { id:'semana', title:'Plan semanal', notes:['Lunes\nPrioridad:','Martes\nPrioridad:','Miércoles\nPrioridad:','Jueves\nPrioridad:','Viernes\nPrioridad:','Fin de semana\nTiempo para mí'] },
  { id:'reunion', title:'Reunión', notes:['Objetivo de la reunión','Agenda\n1.\n2.\n3.','Decisiones','Acciones\nResponsable · Fecha','Dudas por resolver'] },
  { id:'estudio', title:'Estudio', notes:['Tema y objetivo','Conceptos clave','Preguntas de repaso','Ejercicio práctico','Lo que necesito revisar'] },
  { id:'ideas', title:'Lluvia de ideas', notes:['Pregunta que queremos resolver','Ideas sin filtrar','Agrupar ideas','Priorizar: impacto y esfuerzo','Siguiente experimento'] },
  { id:'objetivos', title:'Objetivos', notes:['Mi objetivo concreto','Cómo mediré el progreso','Primer paso','Obstáculos y alternativas','Revisión semanal'] },
  { id:'compras', title:'Compras', notes:['Fruta y verdura','Despensa','Hogar','Pendiente de comparar'] },
  { id:'habitos', title:'Hábitos', notes:['Hábito\nL ☐ M ☐ X ☐ J ☐ V ☐ S ☐ D ☐','Señal para empezar','Versión de dos minutos','Revisión de la semana'] }
];
export const safeUrl = value => { try { const u = new URL(value); return ['https:','http:'].includes(u.protocol) ? u.href : null; } catch { return null; } };
export function metadata(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('INVALID_METADATA');
  return { tags: [...new Set((Array.isArray(value.tags) ? value.tags : []).filter(t => typeof t === 'string').map(t => t.trim().slice(0,32)).filter(Boolean))].slice(0,10), pinned: value.pinned === true, archived: value.archived === true };
}
export function cleanNote(note) {
  if (!note || typeof note.text !== 'string' || note.text.length > MAX_TEXT || !Number.isInteger(note.paper ?? 0) || (note.paper ?? 0) < 0 || note.paper > 5) throw Error('INVALID_NOTE');
  const marks = Array.isArray(note.marks) ? note.marks : [];
  if (marks.length > MAX_TEXT || marks.some(m => !Number.isInteger(m.start) || !Number.isInteger(m.end) || m.start < 0 || m.end < m.start || m.end > note.text.length || !['blue','red','marker-blue','marker-red'].includes(m.ink))) throw Error('INVALID_MARKS');
  const doodle = note.doodle ?? '';
  if (JSON.stringify(doodle).length > 100000) throw Error('INVALID_DOODLE');
  return { text:note.text, paper:note.paper ?? 0, marks:marks.map(m=>({start:m.start,end:m.end,ink:m.ink,highlight:m.highlight===true})), doodle,
    image: note.image?.url && safeUrl(note.image.url) ? { url:safeUrl(note.image.url) } : null,
    metadata:metadata(note.metadata), sourceId:typeof note.id === 'string' ? note.id : undefined };
}
export function createBackup(board) {
  if (!Array.isArray(board?.notes)) throw Error('INVALID_BOARD');
  const ordered = (board.order || board.notes.map(n=>n.id)).map(id=>board.notes.find(n=>n.id===id)).filter(Boolean);
  return { format:'postispop-backup', version:1, exportedAt:new Date().toISOString(), title:String(board.title || 'Mi pizarra').slice(0,120),
    notes:ordered.map(cleanNote), attachmentsIncluded:false, attachmentNotice:'Los archivos adjuntos de IndexedDB no están incluidos. Descárgalos desde cada nota antes de cambiar de dispositivo.' };
}
export function parseBackup(input) {
  if (typeof input === 'string') { if (input.length > 2000000) throw Error('BACKUP_TOO_LARGE'); input = JSON.parse(input); }
  if (input?.format !== 'postispop-backup' || input.version !== 1 || !Array.isArray(input.notes) || input.notes.length > MAX_NOTES || !input.notes.length) throw Error('INVALID_BACKUP');
  return { title:String(input.title || 'Pizarra importada').slice(0,120), notes:input.notes.map(cleanNote) };
}
export function filterNotes(notes, {query='',paper='',tag='',archived=false} = {}) {
  const term = query.toLocaleLowerCase('es');
  return notes.filter(n=>Boolean(n.metadata?.archived)===archived && (paper==='' || n.paper===Number(paper)) && (!tag || n.metadata?.tags?.includes(tag)) && (!term || `${n.text} ${(n.metadata?.tags || []).join(' ')}`.toLocaleLowerCase('es').includes(term)))
    .sort((a,b)=>Number(Boolean(b.metadata?.pinned))-Number(Boolean(a.metadata?.pinned)));
}
export function templateNotes(id) {
  const template = TEMPLATES.find(t=>t.id===id); if (!template) throw Error('INVALID_TEMPLATE');
  return { title:template.title, notes:template.notes.map((text,i)=>cleanNote({text,paper:i%6,marks:[],doodle:''})) };
}
export function calendarFile(label, date) {
  const when = new Date(date); if (!Number.isFinite(+when)) throw Error('INVALID_DATE');
  const esc = text => String(text).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  const stamp = d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//PostisPop//Recordatorios//ES','BEGIN:VEVENT',`UID:${crypto.randomUUID()}@postispop.com`,`DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(when)}`,`DTEND:${stamp(new Date(+when+900000))}`,`SUMMARY:${esc(label)}`,'BEGIN:VALARM','TRIGGER:-PT0M','ACTION:DISPLAY',`DESCRIPTION:${esc(label)}`,'END:VALARM','END:VEVENT','END:VCALENDAR',''].join('\r\n');
}
