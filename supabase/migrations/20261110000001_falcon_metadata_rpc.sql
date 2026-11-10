-- falcon.set_session_metadata — PIN-gated merge update of game_sessions.metadata.
-- Backs the "Auto-events: on/off" toggle in the ops console. Idempotent; safe
-- to re-run. If this migration hasn't been applied, the toggle shows a
-- friendly error and auto-events default to ON (safe for live show).

begin;

create or replace function falcon.set_session_metadata(
  p_session_id uuid, p_secret text, p_patch jsonb
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
  -- Merge semantics: top-level keys in p_patch overwrite existing keys;
  -- others are preserved. Null p_patch is a no-op.
  if p_patch is null then return; end if;
  update falcon.game_sessions
     set metadata = coalesce(metadata, '{}'::jsonb) || p_patch
   where id = p_session_id;
end $$;

grant execute on function falcon.set_session_metadata(uuid, text, jsonb) to anon, authenticated;

commit;
