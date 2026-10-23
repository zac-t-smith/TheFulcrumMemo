-- Fix: Supabase hosts pgcrypto in the `extensions` schema, not `public`.
-- The original RPCs set search_path = falcon, public which can't see `digest()`.
-- Qualify the calls explicitly.

create or replace function falcon.create_session(p_code text, p_ops_secret text)
returns uuid
language plpgsql security definer
set search_path = falcon, extensions, public
as $$
declare
  v_id uuid;
begin
  insert into falcon.game_sessions (code, ops_secret_hash)
  values (p_code, encode(extensions.digest(p_ops_secret, 'sha256'), 'hex'))
  returning id into v_id;
  return v_id;
end $$;

create or replace function falcon.advance_session(
  p_session_id uuid,
  p_secret text,
  p_next_phase text,
  p_next_round int,
  p_timer_seconds int
) returns void
language plpgsql security definer
set search_path = falcon, extensions, public
as $$
declare
  v_hash text;
begin
  select ops_secret_hash into v_hash from falcon.game_sessions where id = p_session_id;
  if v_hash is null or v_hash <> encode(extensions.digest(p_secret, 'sha256'), 'hex') then
    raise exception 'ops secret mismatch';
  end if;
  update falcon.game_sessions
     set phase = p_next_phase,
         round = p_next_round,
         timer_seconds = p_timer_seconds,
         phase_started_at = now()
   where id = p_session_id;
end $$;

create or replace function falcon.set_prediction_hash(
  p_session_id uuid,
  p_secret text,
  p_hash text
) returns void
language plpgsql security definer
set search_path = falcon, extensions, public
as $$
declare
  v_hash text;
begin
  select ops_secret_hash into v_hash from falcon.game_sessions where id = p_session_id;
  if v_hash is null or v_hash <> encode(extensions.digest(p_secret, 'sha256'), 'hex') then
    raise exception 'ops secret mismatch';
  end if;
  update falcon.game_sessions set prediction_hash = p_hash where id = p_session_id;
end $$;

create or replace function falcon.reveal_prediction(
  p_session_id uuid,
  p_secret text,
  p_text text
) returns void
language plpgsql security definer
set search_path = falcon, extensions, public
as $$
declare
  v_hash text;
begin
  select ops_secret_hash into v_hash from falcon.game_sessions where id = p_session_id;
  if v_hash is null or v_hash <> encode(extensions.digest(p_secret, 'sha256'), 'hex') then
    raise exception 'ops secret mismatch';
  end if;
  update falcon.game_sessions set prediction_text = p_text where id = p_session_id;
end $$;

create or replace function falcon.fire_inject(
  p_session_id uuid,
  p_secret text,
  p_round int,
  p_title text,
  p_body text
) returns uuid
language plpgsql security definer
set search_path = falcon, extensions, public
as $$
declare
  v_hash text;
  v_id uuid;
begin
  select ops_secret_hash into v_hash from falcon.game_sessions where id = p_session_id;
  if v_hash is null or v_hash <> encode(extensions.digest(p_secret, 'sha256'), 'hex') then
    raise exception 'ops secret mismatch';
  end if;
  insert into falcon.injects (session_id, round, title, body)
  values (p_session_id, coalesce(p_round, 0), p_title, p_body)
  returning id into v_id;
  return v_id;
end $$;
