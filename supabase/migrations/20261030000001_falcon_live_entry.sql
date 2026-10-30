-- Falcon live session entry flow lockdown.
-- Deletes stale test sessions, seeds a permanent FALCON session,
-- locks ops_secret_hash from client reads, hardens SECURITY DEFINER
-- functions (search_path = '', fully-qualified extensions.digest),
-- adds verify_ops_secret + reset_session RPCs.
-- Idempotent; safe to re-run.

begin;

-- -------------------------------------------------------------------------
-- 1. CLEANUP: delete stale test sessions by exact code list.
--    FK cascades delete firms, players, answers, submissions, injects.
--    DELETE is irreversible; codes not present are silent no-ops.
-- -------------------------------------------------------------------------
delete from falcon.game_sessions
 where code in (
   'TEST','TEST01','TEST02','TEST03','TEST04','TEST05',
   'P6TEST','P6T2','DEMO'
 );

-- -------------------------------------------------------------------------
-- 2. SEED: single permanent live session, code FALCON.
--    ops_secret_hash left NULL. Set it with a one-line UPDATE in the SQL
--    editor (owner connection) AFTER this migration applies:
--
--      update falcon.game_sessions
--         set ops_secret_hash = encode(extensions.digest('YOUR_PIN','sha256'),'hex')
--       where code = 'FALCON';
--
--    Until you do that, verify_ops_secret returns false and every ops RPC
--    refuses to run (hash is null -> mismatch).
-- -------------------------------------------------------------------------
insert into falcon.game_sessions (code, phase, round, timer_seconds)
values ('FALCON', 'lobby', 0, 0)
on conflict (code) do nothing;

-- -------------------------------------------------------------------------
-- 3. COLUMN-LEVEL LOCKDOWN on falcon.game_sessions.
--    Column REVOKE won't override a table-level grant, so revoke the
--    table-level grant and re-grant each non-hash column explicitly.
--    Narrow the realtime publication to the same column set.
-- -------------------------------------------------------------------------
revoke select on falcon.game_sessions from anon, authenticated, public;

grant select
  ( id, code, phase, round, phase_started_at, timer_seconds,
    prediction_hash, prediction_text, metadata, created_at )
  on falcon.game_sessions to anon, authenticated;

-- Narrow the realtime publication: emit everything EXCEPT ops_secret_hash.
alter publication supabase_realtime drop table falcon.game_sessions;
alter publication supabase_realtime add  table falcon.game_sessions
  ( id, code, phase, round, phase_started_at, timer_seconds,
    prediction_hash, prediction_text, metadata, created_at );

-- -------------------------------------------------------------------------
-- 4. HARDEN existing SECURITY DEFINER functions.
--    search_path = '' prevents search-path hijack; every identifier is
--    fully qualified (falcon.*, extensions.digest, pg_catalog.now).
-- -------------------------------------------------------------------------
create or replace function falcon.create_session(p_code text, p_ops_secret text)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare v_id uuid;
begin
  insert into falcon.game_sessions (code, ops_secret_hash)
  values (p_code, encode(extensions.digest(p_ops_secret, 'sha256'), 'hex'))
  returning id into v_id;
  return v_id;
end $$;

create or replace function falcon.advance_session(
  p_session_id uuid, p_secret text, p_next_phase text,
  p_next_round int, p_timer_seconds int
) returns void
language plpgsql security definer
set search_path = ''
as $$
declare v_hash text;
begin
  select ops_secret_hash into v_hash
    from falcon.game_sessions where id = p_session_id;
  if v_hash is null or v_hash <> encode(extensions.digest(p_secret,'sha256'),'hex') then
    raise exception 'ops secret mismatch';
  end if;
  update falcon.game_sessions
     set phase = p_next_phase,
         round = p_next_round,
         timer_seconds = p_timer_seconds,
         phase_started_at = pg_catalog.now()
   where id = p_session_id;
end $$;

create or replace function falcon.set_prediction_hash(
  p_session_id uuid, p_secret text, p_hash text
) returns void
language plpgsql security definer
set search_path = ''
as $$
declare v_hash text;
begin
  select ops_secret_hash into v_hash
    from falcon.game_sessions where id = p_session_id;
  if v_hash is null or v_hash <> encode(extensions.digest(p_secret,'sha256'),'hex') then
    raise exception 'ops secret mismatch';
  end if;
  update falcon.game_sessions set prediction_hash = p_hash where id = p_session_id;
end $$;

create or replace function falcon.reveal_prediction(
  p_session_id uuid, p_secret text, p_text text
) returns void
language plpgsql security definer
set search_path = ''
as $$
declare v_hash text;
begin
  select ops_secret_hash into v_hash
    from falcon.game_sessions where id = p_session_id;
  if v_hash is null or v_hash <> encode(extensions.digest(p_secret,'sha256'),'hex') then
    raise exception 'ops secret mismatch';
  end if;
  update falcon.game_sessions set prediction_text = p_text where id = p_session_id;
end $$;

create or replace function falcon.fire_inject(
  p_session_id uuid, p_secret text, p_round int, p_title text, p_body text
) returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare v_hash text; v_id uuid;
begin
  select ops_secret_hash into v_hash
    from falcon.game_sessions where id = p_session_id;
  if v_hash is null or v_hash <> encode(extensions.digest(p_secret,'sha256'),'hex') then
    raise exception 'ops secret mismatch';
  end if;
  insert into falcon.injects (session_id, round, title, body)
  values (p_session_id, coalesce(p_round, 0), p_title, p_body)
  returning id into v_id;
  return v_id;
end $$;

-- Revoke anon/auth EXECUTE on create_session. With a permanent FALCON
-- session, no client needs to mint sessions. Owner (SQL editor) retains it.
revoke execute on function falcon.create_session(text, text) from anon, authenticated, public;

-- -------------------------------------------------------------------------
-- 5. NEW RPCs
-- -------------------------------------------------------------------------

-- verify_ops_secret: boolean PIN check. Lets /#/falcon gate the console
-- without ever handing out ops_secret_hash. anon-callable.
create or replace function falcon.verify_ops_secret(
  p_session_id uuid, p_secret text
) returns boolean
language plpgsql security definer
set search_path = ''
as $$
declare v_hash text;
begin
  select ops_secret_hash into v_hash
    from falcon.game_sessions where id = p_session_id;
  return v_hash is not null
     and v_hash = encode(extensions.digest(p_secret, 'sha256'), 'hex');
end $$;
grant execute on function falcon.verify_ops_secret(uuid, text) to anon, authenticated;

-- reset_session: deletes firms/players/answers/subs/injects for the session
-- and resets mutable session columns. PRESERVES id, code, ops_secret_hash,
-- created_at. Verifies PIN first. anon-callable (gated by PIN).
create or replace function falcon.reset_session(
  p_session_id uuid, p_secret text
) returns void
language plpgsql security definer
set search_path = ''
as $$
declare v_hash text;
begin
  select ops_secret_hash into v_hash
    from falcon.game_sessions where id = p_session_id;
  if v_hash is null or v_hash <> encode(extensions.digest(p_secret,'sha256'),'hex') then
    raise exception 'ops secret mismatch';
  end if;

  -- Explicit child deletes (do NOT delete the session row).
  delete from falcon.injects     where session_id = p_session_id;
  delete from falcon.submissions where session_id = p_session_id;
  delete from falcon.answers
   where player_id in (select id from falcon.players where session_id = p_session_id);
  delete from falcon.players     where session_id = p_session_id;
  delete from falcon.firms       where session_id = p_session_id;

  update falcon.game_sessions
     set phase            = 'lobby',
         round            = 0,
         phase_started_at = pg_catalog.now(),
         timer_seconds    = 0,
         prediction_hash  = null,
         prediction_text  = null,
         metadata         = '{}'::jsonb
   where id = p_session_id;
end $$;
grant execute on function falcon.reset_session(uuid, text) to anon, authenticated;

commit;
