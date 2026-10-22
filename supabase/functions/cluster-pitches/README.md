# cluster-pitches (stub)

Reserved slot for a later Supabase Edge Function that will call the Anthropic Claude API
to cluster firms' pitches (`submissions.pitch`) into themes for a given round.

**Not yet implemented** — kept here so the deploy wiring is obvious when we add it:

- POST body: `{ session_id, round, ops_secret }`
- Returns: `{ clusters: [{ label, firm_ids, exemplar_pitch }] }`
- Secrets needed (set via `supabase secrets set` when enabling):
  - `ANTHROPIC_API_KEY`
  - `SERVICE_ROLE_KEY` (to read `submissions` server-side)

Deploy later with:

```bash
supabase functions deploy cluster-pitches
supabase secrets set ANTHROPIC_API_KEY=... SERVICE_ROLE_KEY=...
```
