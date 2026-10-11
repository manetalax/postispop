import {createNoteShareHandler} from '../shared/note-share-server.js';
Deno.serve(createNoteShareHandler({base:Deno.env.get('SUPABASE_URL')||'',key:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||''}));
