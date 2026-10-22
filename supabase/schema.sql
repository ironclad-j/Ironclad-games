create table public.profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 nickname text check (char_length(nickname) between 1 and 40),
 created_at timestamptz not null default now()
);
create table public.game_runs (
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 run_id uuid not null,
 game_id text not null check (game_id ~ '^[a-z][a-z0-9-]{0,39}$'),
 version integer not null default 1 check (version between 1 and 10000),
 score integer not null check (score between 0 and 1000000000),
 details jsonb not null default '{}'::jsonb check (jsonb_typeof(details)='object' and octet_length(details::text)<=8192),
 created_at timestamptz not null default now(),
 primary key (user_id,run_id)
);
create index game_runs_user_game on public.game_runs(user_id,game_id,created_at desc);
create table public.game_checkpoints (
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 game_id text not null check (game_id ~ '^[a-z][a-z0-9-]{0,39}$'),
 revision integer not null default 1 check (revision>0),
 data jsonb not null check (jsonb_typeof(data)='object' and octet_length(data::text)<=65536),
 updated_at timestamptz not null default now(),
 primary key(user_id,game_id)
);
alter table public.profiles enable row level security;
alter table public.game_runs enable row level security;
alter table public.game_checkpoints enable row level security;
revoke all on public.profiles,public.game_runs,public.game_checkpoints from anon,authenticated;
grant select,insert,update on public.profiles to authenticated;
grant select,insert on public.game_runs to authenticated;
grant select,insert,update on public.game_checkpoints to authenticated;
create policy profiles_read on public.profiles for select to authenticated using ((select auth.uid())=user_id);
create policy profiles_insert on public.profiles for insert to authenticated with check ((select auth.uid())=user_id);
create policy profiles_update on public.profiles for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy runs_read on public.game_runs for select to authenticated using ((select auth.uid())=user_id);
create policy runs_insert on public.game_runs for insert to authenticated with check ((select auth.uid())=user_id);
create policy checkpoints_read on public.game_checkpoints for select to authenticated using ((select auth.uid())=user_id);
create policy checkpoints_insert on public.game_checkpoints for insert to authenticated with check ((select auth.uid())=user_id);
create policy checkpoints_update on public.game_checkpoints for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create function public.save_checkpoint(p_game_id text,p_expected_revision integer,p_data jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare saved public.game_checkpoints; current_save public.game_checkpoints;
begin
 if auth.uid() is null then raise exception 'Sign in to save progress'; end if;
 if p_expected_revision is null or p_expected_revision<0 then raise exception 'Invalid revision'; end if;
 if p_expected_revision=0 then
  insert into public.game_checkpoints(user_id,game_id,revision,data)
  values(auth.uid(),p_game_id,1,p_data) on conflict(user_id,game_id) do nothing returning * into saved;
 else
  update public.game_checkpoints set data=p_data,revision=revision+1,updated_at=now()
  where user_id=auth.uid() and game_id=p_game_id and revision=p_expected_revision returning * into saved;
 end if;
 if saved.user_id is not null then return jsonb_build_object('conflict',false,'current',jsonb_build_object('revision',saved.revision,'data',saved.data,'updated_at',saved.updated_at)); end if;
 select * into current_save from public.game_checkpoints where user_id=auth.uid() and game_id=p_game_id;
 return jsonb_build_object('conflict',true,'current',case when current_save.user_id is null then null else jsonb_build_object('revision',current_save.revision,'data',current_save.data,'updated_at',current_save.updated_at) end);
end; $$;
revoke all on function public.save_checkpoint(text,integer,jsonb) from public,anon;
grant execute on function public.save_checkpoint(text,integer,jsonb) to authenticated;
