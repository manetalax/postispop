// A quote is a suggestion, never stored as a user note until it is edited.
export function quoteLocation(filled,choice){
 if(choice==='banner')return 'banner';
 if(filled.length>=12&&filled.slice(0,12).every(Boolean))return choice==='declined'?null:'ask';
 if(filled.length>=6&&!filled[5])return 6;
 if(filled.length>=12&&!filled[11])return 12;
 return null;
}
export const quotePreferenceKey=boardId=>'pp:daily-quote-layout-v1:'+boardId;
