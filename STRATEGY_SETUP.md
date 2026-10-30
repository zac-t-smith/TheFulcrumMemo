# Strategy Simulation — Setup & Run-Day

Everything you need to go from clean clone to live classroom in ~20 minutes.

## 1. Supabase migration

The migration creates 6 tables, triggers, RLS policies, 5 SECURITY DEFINER RPCs, and adds all 6 tables to the realtime publication. It is idempotent (safe to re-run).

### Option A — Supabase CLI (recommended)

```bash
# From repo root. Links the local supabase/ folder to your remote project.
supabase link --project-ref YOUR-PROJECT-REF
supabase db push                 # applies supabase/migrations/0001_strategy_sim.sql
```

If `supabase/config.toml` doesn't exist yet, run `supabase init` first (accept defaults). The CLI will prompt for your DB password once.

### Option B — Paste into the SQL editor

Open your project → **SQL Editor → New query**, paste the full contents of `supabase/migrations/0001_strategy_sim.sql`, run.

### Verify

In the Supabase dashboard:
- **Table Editor** should show: `game_sessions`, `firms`, `players`, `answers`, `submissions`, `injects`
- **Database → Replication → supabase_realtime** should list all six tables
- **Database → Functions** should list: `create_session`, `advance_session`, `set_prediction_hash`, `reveal_prediction`, `fire_inject`, `firms_member_count_sync`, `submissions_fill_session`

## 2. Env vars

### Local (`.env.local`)

Copy `.env.local.example` and fill in:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...        # Supabase → Project Settings → API → anon public

# Only used by scripts/simulate-class.ts — never ships to the browser
SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...     # Supabase → Project Settings → API → service_role
```

The ops console no longer has a build-time PIN. The facilitator PIN is a
per-session value stored as a SHA-256 hash on the FALCON session row and
verified server-side via the `falcon.verify_ops_secret` RPC. Set it with:

```sql
update falcon.game_sessions
   set ops_secret_hash = encode(extensions.digest('YOUR_PIN','sha256'),'hex')
 where code = 'FALCON';
```

### GitHub Pages (production build)

Add these as **Repository secrets** (Settings → Secrets and variables → Actions → New repository secret):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The deploy workflow (`.github/workflows/deploy.yml`) already reads them at build time. Push to `main` or run the workflow manually to deploy.

## 3. Run a rehearsal (no network needed)

```bash
npm run dev
# open http://localhost:8080/TheFulcrumMemo/strategy?demo=1
# Arrow keys → / ← or space advance phases
```

Demo mode runs the entire flow locally with 5 synthetic firms (ALP, BRV, CDR, DLT, ECH), auto-populates submissions on each decide phase, and auto-reveals the sealed prediction on `final_reveal`. This is also your backup if class-day Wi-Fi dies — just open the projector in demo mode and play solo.

## 4. Run with real students

Three windows:

1. **Projector** — `/TheFulcrumMemo/#/strategy?s=FALCON` (large screen)
2. **Facilitator phone / laptop** — `/TheFulcrumMemo/#/falcon` (enter PIN)
3. **Student phones** — scan the QR code on the projector; it links to `/TheFulcrumMemo/#/join`

### Facilitator flow

1. Open `/#/falcon`, enter the team PIN. Server verifies via `verify_ops_secret`; wrong PIN never opens the console.
2. The console header has **Open board** (new tab), **Rehearsal** (demo mode), and **Reset session** (type `RESET` to confirm; calls `reset_session` RPC which preserves the FALCON row and PIN hash).
3. In the **Sealed predictions** card: paste your pre-written prediction text, click **Commit hash**. The projector's kickoff screen now shows the hash.
4. Hit **Next phase →** to drive: lobby → kickoff → anchor → teach_1 → decide_1 → reveal_1 → teach_2 → decide_2 → reveal_2 → teach_3 → decide_3 → reveal_3 → final_reveal → done.
5. On `final_reveal`: re-paste the SAME prediction text and click **Reveal text**. The projector live-recomputes SHA-256 and shows a MATCH badge.

Buttons available: Next / Back / Reset timer / Lock submissions, pre-canned injects + free-form inject, Q&A bank search.

## 5. Load test before class

With `.env.local` populated:

```bash
# In one terminal: ops console creates a session FALCON
# In another terminal:
npm run simulate FALCON
```

The script spawns 5 firms and 20 bot players, then auto-submits randomly whenever you advance to a `decide_*` phase in the ops console. Watch the firm grid light up in real time. The script exits automatically when you advance to `done`.

## 6. Routes added

| URL (relative) | Who | What |
|---|---|---|
| `/#/strategy` | projector | Chooser (Rehearsal + FALCON console link) |
| `/#/strategy?demo=1` | projector (rehearsal) | Offline run, keyboard-driven |
| `/#/strategy?s=FALCON` | projector (live) | Live session view |
| `/#/join` | student phones | Auto-attach to FALCON (QR target) |
| `/#/falcon` | facilitator | PIN-gated console (server verify) |
| `/#/strategy/play?s=…` | legacy student | Still works; equivalent to `/#/join` |
| `/#/strategy/ops` | legacy facilitator | Redirects to `/#/falcon` |

Existing portfolio routes (`/`, `/memos`, etc.) are untouched.

## 7. Known limits & intentional punts

- **Balanced group counters**: full balance across the room requires an unprotected counters table or widening RLS on `game_sessions`. For 20-student rooms, current independent-flip assignment is within ±2 of balanced in practice. Expand later if you run bigger cohorts.
- **Submission lock**: ops console flips `submissions.locked` directly (anon has update rights). If you want this gated by ops secret, add a `lock_round` RPC and swap the call in `OpsView.lockRound`.
- **cluster-pitches edge function**: stub only — see `supabase/functions/cluster-pitches/README.md` for the plan when you want Claude-API theme clustering.
- **Bundle size**: ~840 KB (framer-motion + recharts + supabase-js). Fine for projector/phones; code-split later if needed.
