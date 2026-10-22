begin;
insert into auth.users(id,aud,role,email) values
('180889c4-b563-4aee-8d16-a5f601a18b01','authenticated','authenticated','ironclad-rls-a@example.invalid'),
('180889c4-b563-4aee-8d16-a5f601a18b02','authenticated','authenticated','ironclad-rls-b@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','180889c4-b563-4aee-8d16-a5f601a18b01',true);
insert into public.game_runs(run_id,game_id,score) values('c85948d9-3a7e-4223-a8b5-7b07368e7a01','snake',50);
select public.save_checkpoint('snake',0,'{"version":1,"state":{"test":"a"}}');
do $$ begin
 if (select count(*) from public.game_runs)<>1 then raise exception 'owner cannot read own run'; end if;
 begin
  insert into public.game_runs(user_id,run_id,game_id,score) values('180889c4-b563-4aee-8d16-a5f601a18b02','c85948d9-3a7e-4223-a8b5-7b07368e7a02','snake',99);
  raise exception 'cross-user insert succeeded';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.game_runs(run_id,game_id,score) values('c85948d9-3a7e-4223-a8b5-7b07368e7a01','snake',50);
  raise exception 'duplicate run succeeded';
 exception when unique_violation then null; end;
 if (public.save_checkpoint('snake',0,'{"version":1,"state":{}}')->>'conflict')::boolean is not true then raise exception 'stale revision was accepted'; end if;
 if (public.save_checkpoint('snake',1,'{"version":1,"state":{"test":"new"}}')->>'conflict')::boolean is not false then raise exception 'valid revision failed'; end if;
 begin
  update public.game_checkpoints set user_id='180889c4-b563-4aee-8d16-a5f601a18b02';
  raise exception 'ownership change succeeded';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','180889c4-b563-4aee-8d16-a5f601a18b02',true);
do $$ begin
 if (select count(*) from public.game_runs)<>0 then raise exception 'player B can see A runs'; end if;
 if (select count(*) from public.game_checkpoints)<>0 then raise exception 'player B can see A saves'; end if;
 if (select count(*) from public.profiles)<>0 then raise exception 'player B can see A profiles'; end if;
end $$;
select public.save_checkpoint('snake',0,'{"version":1,"state":{"test":"b"}}');
set local role anon;
do $$ begin
 begin
  perform * from public.game_runs;
  raise exception 'guest can read private runs';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'PASS: owner reads, cross-account isolation, immutable ownership, retry uniqueness, atomic revisions, guest denial' as result;
rollback;
