create or replace function public.bootstrap_postispop_user()
returns trigger language plpgsql security definer set search_path='' as $$
declare new_board uuid;
begin
 insert into public.profiles(id,display_name,avatar_url)
 values(new.id,coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name',split_part(new.email,'@',1)),new.raw_user_meta_data->>'avatar_url') on conflict(id) do nothing;
 insert into public.board_trials(user_id,started_at,expires_at)
 values(new.id,new.created_at,new.created_at+interval '30 days') on conflict(user_id) do nothing;
 insert into public.boards(owner_id,title) values(new.id,'Mi pizarra') returning id into new_board;
 insert into public.notes(board_id,author_id,position,paper,marks,text)
 select new_board,new.id,position,mod(position,6),'[]'::jsonb,'' from generate_series(0,11) as position;
 return new;
end $$;
revoke all on function public.bootstrap_postispop_user() from public,anon,authenticated;