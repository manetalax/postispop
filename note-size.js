// Decimal MB: the limit covers note metadata and stored attachment bytes.
export const MAX_NOTE_BYTES = 10_000_000;
const encode = value => new TextEncoder().encode(JSON.stringify(value));
export function noteSize(note) {
  const {attachments = [], protectedEnvelope, ...metadata} = note;
  if (protectedEnvelope) {
    const {ciphertext = '', ...header} = protectedEnvelope;
    return encode({...metadata, protectedEnvelope:header}).length + Math.floor(ciphertext.length * 3 / 4);
  }
  return encode({...metadata, attachments:attachments.map(({data,blob,...item})=>item)}).length + attachments.reduce((sum,item)=>sum+(item.blob?.size ?? item.size ?? 0),0);
}
export function assertNoteSize(note, {previousBytes = 0, maxBytes = MAX_NOTE_BYTES} = {}) {
  const bytes = noteSize(note);
  if (bytes > maxBytes) throw Object.assign(new Error('NOTE_TOO_LARGE'), {status:413});
  return bytes;
}
export const noteSizeMessages = {
 es:'La nota completa supera los 10 MB. Reduce o elimina algún adjunto.',
 en:'The complete note exceeds 10 MB. Reduce or remove an attachment.',
 de:'Die gesamte Notiz überschreitet 10 MB. Verkleinere oder entferne einen Anhang.',
 fr:'La note complète dépasse 10 Mo. Réduisez ou supprimez une pièce jointe.',
 pt:'A nota completa excede 10 MB. Reduza ou remova um anexo.',
 it:'La nota completa supera 10 MB. Riduci o rimuovi un allegato.',
 ja:'ノート全体が10 MBを超えています。添付ファイルを小さくするか削除してください。',
 ko:'전체 메모가 10MB를 초과합니다. 첨부 파일을 줄이거나 삭제하세요.'
};

export function prospectiveNote(note, kind, payload) {
  if(kind==='protect'||kind==='protected-save')return {paper:note.paper,protectedEnvelope:payload.protectedEnvelope};
  if(kind==='image')return {...note,image:(payload.url||payload.image?.url)?{url:payload.url||payload.image.url}:null};
  if(kind==='style')return {...note,style:payload.style};
  if(kind==='paper'||kind==='doodle')return {...note,[kind]:payload[kind]};
  return {...note,text:payload.text,marks:payload.marks||[]};
}
