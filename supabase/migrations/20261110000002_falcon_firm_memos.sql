-- falcon.firm_memos — generated case-study memos per firm, post-Final-reveal.
-- Additive: no existing table/RPC is modified. Reading is anon-safe (students
-- open their firm's memo by firm id). Writing is DEFINER-only (edge function
-- calls insert_firm_memo with the ops secret).

begin;

create table if not exists falcon.firm_memos (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references falcon.firms(id) on delete cascade,
  session_id uuid not null references falcon.game_sessions(id) on delete cascade,
  memo_json jsonb not null,
  grade_json jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists firm_memos_firm_idx on falcon.firm_memos(firm_id);
create index if not exists firm_memos_session_idx on falcon.firm_memos(session_id);

alter table falcon.firm_memos enable row level security;

-- Anon can SELECT a memo by firm_id (one row per firm). No PII is stored;
-- the content is the firm's own submissions + the generated analysis.
drop policy if exists firm_memos_select on falcon.firm_memos;
create policy firm_memos_select on falcon.firm_memos
  for select using (true);

-- No insert / update / delete policies — writes happen only through the
-- SECURITY DEFINER RPC below, so the ops secret gates all writes.
grant select on falcon.firm_memos to anon, authenticated;

-- Realtime so phones get notified when their firm's memo is ready.
alter publication supabase_realtime add table falcon.firm_memos;

-- insert_firm_memo: PIN-gated write. Edge function calls this once per firm
-- after it has produced the memo. Idempotent — replaces an existing memo for
-- the same (firm_id, session_id) pair so re-generation works.
create or replace function falcon.insert_firm_memo(
  p_session_id uuid,
  p_secret text,
  p_firm_id uuid,
  p_memo jsonb,
  p_grade jsonb
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

  delete from falcon.firm_memos
   where firm_id = p_firm_id and session_id = p_session_id;

  insert into falcon.firm_memos (firm_id, session_id, memo_json, grade_json)
  values (p_firm_id, p_session_id, p_memo, p_grade)
  returning id into v_id;

  return v_id;
end $$;

grant execute on function falcon.insert_firm_memo(uuid, text, uuid, jsonb, jsonb)
  to anon, authenticated;

commit;
