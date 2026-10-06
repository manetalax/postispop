/** Paging is zero based; every note belongs to exactly one page. */
export const mobileBoardQuery = '(max-width:700px), (max-width:1000px) and (max-height:500px) and (orientation:landscape)';
export function boardPageSize(count, compact = typeof matchMedia === 'function' && matchMedia(mobileBoardQuery).matches) {
  return compact || count <= 6 ? 6 : 12;
}
export function boardPageCount(count, size = boardPageSize(count)) {
  return Math.max(1, Math.ceil(count / size));
}
export function clampBoardView(view, count, size = boardPageSize(count)) {
  return Math.max(0, Math.min(Number.isFinite(view) ? Math.floor(view) : 0, boardPageCount(count, size) - 1));
}
export function nextBoardView(view, count, size = boardPageSize(count)) {
  return Math.min(clampBoardView(view, count, size) + 1, boardPageCount(count, size) - 1);
}
export function boardViewNotes(notes, view, size = boardPageSize(notes.length)) {
  const start = clampBoardView(view, notes.length, size) * size;
  return notes.slice(start, start + size);
}
export function boardViewLabel(view, count, size = boardPageSize(count)) {
  return `Página ${clampBoardView(view, count, size) + 1} de ${boardPageCount(count, size)}`;
}
export function filterBoardNotes(notes, { query = '', color = '' } = {}) {
  const normalized = String(query).trim().toLocaleLowerCase();
  return notes.filter(note => (!normalized || (!note.protectedEnvelope && String(note.text || '').toLocaleLowerCase().includes(normalized))) && (color === '' || String(note.paper) === String(color)));
}
