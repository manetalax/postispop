// A quote is a suggestion, never stored as a user note until it is edited.
export function quoteLocation(filled,choice){
 if(choice==='banner')return 'banner';
 if(filled.length!==12)return null;
 if(filled.every(Boolean))return choice==='declined'?null:'ask';
 if(!filled[5])return 6;
 if(!filled[11])return 12;
 return null;
}
export const quotePreferenceKey=boardId=>'pp:daily-quote-layout-v1:'+boardId;
