-- READ ONLY: run on a staging clone first, then inspect the definitions.
-- No credentials, note bodies, emails or user identities are returned.
-- The repository does not contain the deployed base schema.
select n.nspname as schema_name,p.proname,pg_get_function_identity_arguments(p.oid) as arguments,pg_get_functiondef(p.oid) as definition
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname in('public','postispop_private') and
 (p.proname in('can_access_note','limit_notes','board_access','add_board_note','restore_archived_board_note','postispop_is_owner')
 or p.prosrc ~* '(insert\s+into\s+(public\.)?(boards|notes)|delete\s+from\s+(public\.)?notes|board_trials)');
select schemaname,tablename,policyname,roles,cmd,qual,with_check from pg_policies
where schemaname='public' and tablename in('boards','notes','board_members','postispop_note_style');
select c.relname as table_name,t.tgname,pg_get_triggerdef(t.oid) as definition
from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace
where not t.tgisinternal and (n.nspname='public' and c.relname in('boards','notes') or n.nspname='auth' and c.relname='users');
select schemaname,tablename,indexname,indexdef from pg_indexes
where schemaname='public' and tablename in('boards','notes');
-- If pg_cron is installed, inspect cron.job separately in the dashboard. The
-- operator must disable any old note-expiry/purge job before enabling this model.

select c.relname as table_name,k.conname,pg_get_constraintdef(k.oid) as definition
from pg_constraint k join pg_class c on c.oid=k.conrelid join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in('boards','notes');
