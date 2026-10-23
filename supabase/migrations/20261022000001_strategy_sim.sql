-- Strategy Simulation — schema `falcon`
-- Isolated from the existing `public` schema so game data stays separate.
-- Idempotent: safe to re-run.
--
-- IMPORTANT after applying:
--   Supabase Dashboard → Project Settings → API → "Exposed schemas"
--   Add `falcon` to the comma-separated list (default is just `public`).
--   This is what makes PostgREST route /rest/v1/<table> and /rest/v1/rpc/<fn>
--   requests to the falcon schema and what makes the realtime publication reach
--   the browser.

create extension if not exists pgcrypto;

-- =====================================================================
-- SCHEMA
-- =====================================================================

create schema if not exists falcon;
grant usage on schema falcon to anon, authenticated;

-- =====================================================================
-- TABLES
-- =====================================================================

create table if not exists falcon.game_sessions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  phase text not null default 'lobby',
  round int not null default 0,
  phase_started_at timestamptz not null default now(),
  timer_seconds int not null default 0,
  prediction_hash text,
  prediction_text text,                 -- null until final_reveal
  ops_secret_hash text,                 -- sha256 of the ops passphrase for this session
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists falcon.firms (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references falcon.game_sessions(id) on delete cascade,
  name text not null,
  code text not null,
  member_count int not null default 0,
  created_at timestamptz not null default now(),
  unique (session_id, code)
);
create index if not exists idx_falcon_firms_session on falcon.firms(session_id);

create table if not exists falcon.players (
  id uuid primary key,                  -- client-generated so refresh rejoins
  session_id uuid not null references falcon.game_sessions(id) on delete cascade,
  firm_id uuid not null references falcon.firms(id) on delete cascade,
  display_name text not null,
  anchor_group text not null check (anchor_group in ('high','low')),
  framing_group text not null check (framing_group in ('gain','loss')),
  role text not null default 'cfo' check (role in ('cfo','cso','people','gc')),
  created_at timestamptz not null default now()
);
create index if not exists idx_falcon_players_session on falcon.players(session_id);
create index if not exists idx_falcon_players_firm on falcon.players(firm_id);

create table if not exists falcon.answers (
  player_id uuid not null references falcon.players(id) on delete cascade,
  test_key text not null,
  value text not null,
  updated_at timestamptz not null default now(),
  primary key (player_id, test_key)
);

create table if not exists falcon.submissions (
  firm_id uuid not null references falcon.firms(id) on delete cascade,
  round int not null,
  option_id text not null,
  pitch text not null,
  framework_tag text not null,
  tradeoff text,                        -- v2
  confidence int,                       -- v2: 0-100
  dissent text,                         -- v2: optional
  submitted_by uuid references falcon.players(id) on delete set null,
  locked boolean not null default false,
  session_id uuid references falcon.game_sessions(id) on delete cascade,
  updated_at timestamptz not null default now(),
  primary key (firm_id, round)
);
create index if not exists idx_falcon_submissions_session on falcon.submissions(session_id);

create table if not exists falcon.injects (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references falcon.game_sessions(id) on delete cascade,
  round int not null default 0,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_falcon_injects_session on falcon.injects(session_id);

-- =====================================================================
-- TRIGGERS
-- =====================================================================

create or replace function falcon.firms_member_count_sync() returns trigger
language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update falcon.firms set member_count = member_count + 1 where id = new.firm_id;
  elsif (tg_op = 'DELETE') then
    update falcon.firms set member_count = greatest(member_count - 1, 0) where id = old.firm_id;
  elsif (tg_op = 'UPDATE' and new.firm_id <> old.firm_id) then
    update falcon.firms set member_count = greatest(member_count - 1, 0) where id = old.firm_id;
    update falcon.firms set member_count = member_count + 1 where id = new.firm_id;
  end if;
  return null;
end $$;

drop trigger if exists trg_falcon_players_count on falcon.players;
create trigger trg_falcon_players_count
after insert or update or delete on falcon.players
for each row execute function falcon.firms_member_count_sync();

create or replace function falcon.submissions_fill_session() returns trigger
language plpgsql as $$
begin
  if new.session_id is null then
    select f.session_id into new.session_id from falcon.firms f where f.id = new.firm_id;
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_falcon_submissions_session on falcon.submissions;
create trigger trg_falcon_submissions_session
before insert or update on falcon.submissions
for each row execute function falcon.submissions_fill_session();

-- =====================================================================
-- OPS RPCs (SECURITY DEFINER — the only path to mutate game_sessions / injects)
-- NOTE: PostgREST calls these as falcon.<fn> since the schema is exposed.
-- =====================================================================

create or replace function falcon.create_session(p_code text, p_ops_secret text)
returns uuid
language plpgsql security definer
set search_path = falcon, public
as $$
declare
  v_id uuid;
begin
  insert into falcon.game_sessions (code, ops_secret_hash)
  values (p_code, encode(digest(p_ops_secret, 'sha256'), 'hex'))
  returning id into v_id;
  return v_id;
end $$;
grant execute on function falcon.create_session(text, text) to anon, authenticated;

create or replace function falcon.advance_session(
  p_session_id uuid,
  p_secret text,
  p_next_phase text,
  p_next_round int,
  p_timer_seconds int
) returns void
language plpgsql security definer
set search_path = falcon, public
as $$
declare
  v_hash text;
begin
  select ops_secret_hash into v_hash from falcon.game_sessions where id = p_session_id;
  if v_hash is null or v_hash <> encode(digest(p_secret, 'sha256'), 'hex') then
    raise exception 'ops secret mismatch';
  end if;
  update falcon.game_sessions
     set phase = p_next_phase,
         round = p_next_round,
         timer_seconds = p_timer_seconds,
         phase_started_at = now()
   where id = p_session_id;
end $$;
grant execute on function falcon.advance_session(uuid, text, text, int, int) to anon, authenticated;

create or replace function falcon.set_prediction_hash(
  p_session_id uuid,
  p_secret text,
  p_hash text
) returns void
language plpgsql security definer
set search_path = falcon, public
as $$
declare
  v_hash text;
begin
  select ops_secret_hash into v_hash from falcon.game_sessions where id = p_session_id;
  if v_hash is null or v_hash <> encode(digest(p_secret, 'sha256'), 'hex') then
    raise exception 'ops secret mismatch';
  end if;
  update falcon.game_sessions set prediction_hash = p_hash where id = p_session_id;
end $$;
grant execute on function falcon.set_prediction_hash(uuid, text, text) to anon, authenticated;

create or replace function falcon.reveal_prediction(
  p_session_id uuid,
  p_secret text,
  p_text text
) returns void
language plpgsql security definer
set search_path = falcon, public
as $$
declare
  v_hash text;
begin
  select ops_secret_hash into v_hash from falcon.game_sessions where id = p_session_id;
  if v_hash is null or v_hash <> encode(digest(p_secret, 'sha256'), 'hex') then
    raise exception 'ops secret mismatch';
  end if;
  update falcon.game_sessions set prediction_text = p_text where id = p_session_id;
end $$;
grant execute on function falcon.reveal_prediction(uuid, text, text) to anon, authenticated;

create or replace function falcon.fire_inject(
  p_session_id uuid,
  p_secret text,
  p_round int,
  p_title text,
  p_body text
) returns uuid
language plpgsql security definer
set search_path = falcon, public
as $$
declare
  v_hash text;
  v_id uuid;
begin
  select ops_secret_hash into v_hash from falcon.game_sessions where id = p_session_id;
  if v_hash is null or v_hash <> encode(digest(p_secret, 'sha256'), 'hex') then
    raise exception 'ops secret mismatch';
  end if;
  insert into falcon.injects (session_id, round, title, body)
  values (p_session_id, coalesce(p_round, 0), p_title, p_body)
  returning id into v_id;
  return v_id;
end $$;
grant execute on function falcon.fire_inject(uuid, text, int, text, text) to anon, authenticated;

-- =====================================================================
-- ROW LEVEL SECURITY (permissive classroom; no deletes; sessions/injects gated)
-- =====================================================================

alter table falcon.game_sessions enable row level security;
alter table falcon.firms enable row level security;
alter table falcon.players enable row level security;
alter table falcon.answers enable row level security;
alter table falcon.submissions enable row level security;
alter table falcon.injects enable row level security;

-- SELECT: everyone can read everything in falcon
do $$
declare t text;
begin
  for t in select unnest(array['game_sessions','firms','players','answers','submissions','injects']) loop
    execute format('drop policy if exists %I on falcon.%I', t||'_select', t);
    execute format('create policy %I on falcon.%I for select using (true)', t||'_select', t);
  end loop;
end $$;

-- INSERT/UPDATE for anon on firms/players/answers/submissions (no deletes anywhere)
do $$
declare t text;
begin
  for t in select unnest(array['firms','players','answers','submissions']) loop
    execute format('drop policy if exists %I on falcon.%I', t||'_insert', t);
    execute format('create policy %I on falcon.%I for insert with check (true)', t||'_insert', t);
    execute format('drop policy if exists %I on falcon.%I', t||'_update', t);
    execute format('create policy %I on falcon.%I for update using (true) with check (true)', t||'_update', t);
  end loop;
end $$;

-- game_sessions and injects: no direct insert/update from clients. RPCs only.
-- No DELETE policies anywhere → deletes blocked by default under RLS.

-- Explicit grants so anon/authenticated roles can hit the tables through RLS.
grant select, insert, update on falcon.firms, falcon.players, falcon.answers, falcon.submissions to anon, authenticated;
grant select on falcon.game_sessions, falcon.injects to anon, authenticated;

-- =====================================================================
-- REALTIME PUBLICATION
-- =====================================================================

alter publication supabase_realtime add table falcon.game_sessions;
alter publication supabase_realtime add table falcon.firms;
alter publication supabase_realtime add table falcon.players;
alter publication supabase_realtime add table falcon.answers;
alter publication supabase_realtime add table falcon.submissions;
alter publication supabase_realtime add table falcon.injects;
