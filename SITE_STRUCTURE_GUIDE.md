# FulcrumMemo Site Structure Guide

**Generated:** April 2, 2026
**Purpose:** Reference guide for adding new field notes and understanding site architecture

---

## Framework & Deployment

| Question | Answer |
|----------|--------|
| **Framework** | **Vite + React + TypeScript** with shadcn-ui and Tailwind CSS |
| **Deployment** | **GitHub Pages** via GitHub Actions (`.github/workflows/deploy.yml`) |
| **Root URL** | `https://zac-t-smith.github.io/TheFulcrumMemo/` |
| **Main Branch** | `main` (deploys automatically on push) |

---

## Content Structure

**This is NOT a markdown-based static site.** Content is **data-driven via TypeScript**.

| Item | Location |
|------|----------|
| **Field Notes Data** | `src/data/iranConflictData.ts` |
| **Field Notes Index Page** | `src/pages/field-notes/FieldNotesIndex.tsx` |
| **Field Note Day Template** | `src/pages/field-notes/FieldNoteDay.tsx` |
| **Memos** | `src/pages/memos/*.tsx` (React components, not markdown) |

---

## Field Note Data Structure

Field notes are stored in `src/data/iranConflictData.ts` as a `Record<number, FieldNoteDay>`:

```typescript
export interface FieldNoteDay {
  day: number;                    // Day number (e.g., 6, 7, 8...)
  date: string;                   // 'March 5, 2026'
  title: string;                  // Short title
  summary: string;                // 1-2 paragraph summary
  thesisScorecard: ThesisScorecard[];  // Array of thesis updates
  scenarioUpdate: ScenarioUpdate;      // Reference to scenario
  keyDevelopments: {                   // Categorized bullet points
    category: string;
    items: string[];
  }[];
  marketSnapshot: {               // Market data
    brentCrude: number;
    vlccRate: number;
    hySpread: number;
    vix: number;
    usGas: number;
  };
  tradingImplications: string[];  // Array of trading implications
}
```

### ThesisScorecard Structure

```typescript
export interface ThesisScorecard {
  thesis: string;
  initialConfidence: number;      // 0-100
  currentConfidence: number;      // 0-100
  status: 'confirmed' | 'developing' | 'challenged' | 'invalidated';
  evidence: string[];             // Array of evidence points
}
```

### ScenarioUpdate Structure

```typescript
export interface ScenarioUpdate {
  date: string;
  timestamp: number;
  day: number;
  probabilities: ScenarioProbability[];  // [{scenario: string, probability: number}]
  rationale: string;
  keyDevelopments: string[];
}
```

---

## Git Setup

| Item | Status |
|------|--------|
| **Remote** | `origin → https://github.com/zac-t-smith/TheFulcrumMemo.git` |
| **Branch** | `main` |
| **Deploys On** | Push to `main` triggers GitHub Actions |
| **GitHub Actions** | `deploy.yml` — builds main site + worldview-fm, deploys to GitHub Pages |

---

## How to Add New Field Notes

### Step 1: Edit the data file

Open `src/data/iranConflictData.ts`

### Step 2: Update metadata (lines 9-13)

```typescript
export const conflictMetadata = {
  lastUpdated: '2026-04-01T08:00:00Z',  // Update timestamp
  conflictDay: 32,                       // Update day number
  conflictStartDate: '2026-02-28',
};
```

### Step 3: Add scenario update (if probabilities changed)

Find the `scenarioUpdates` array and add a new entry:

```typescript
{
  date: 'March 31, 2026',
  timestamp: Date.parse('2026-03-31'),
  day: 32,
  probabilities: [
    { scenario: 'Quick Resolution', probability: 10 },
    { scenario: 'Protracted Attrition', probability: 55 },
    { scenario: 'Regional Escalation', probability: 35 },
  ],
  rationale: 'Your rationale here...',
  keyDevelopments: ['Development 1', 'Development 2'],
},
```

### Step 4: Add new field note entry

Find `export const fieldNotes: Record<number, FieldNoteDay>` (around line 1232) and add:

```typescript
32: {
  day: 32,
  date: 'March 31, 2026',
  title: 'Your Title Here',
  summary: 'Summary paragraph describing the key developments of the day...',
  thesisScorecard: [
    {
      thesis: 'Insurance mechanism as primary leverage tool',
      initialConfidence: 75,
      currentConfidence: 97,
      status: 'confirmed',
      evidence: [
        'Evidence point 1',
        'Evidence point 2',
        'Evidence point 3',
      ],
    },
    // Add more theses...
  ],
  scenarioUpdate: scenarioUpdates[XX],  // Reference the index of your new scenario update
  keyDevelopments: [
    {
      category: 'Military',
      items: [
        'Development 1',
        'Development 2',
      ],
    },
    {
      category: 'Shipping',
      items: [
        'Development 1',
        'Development 2',
      ],
    },
    // Add more categories...
  ],
  marketSnapshot: {
    brentCrude: 104,
    vlccRate: 495000,
    hySpread: 580,
    vix: 31,
    usGas: 3.98,
  },
  tradingImplications: [
    'Implication 1',
    'Implication 2',
    'Implication 3',
  ],
},
```

### Step 5: Add conflict events for the map (optional)

Find the `conflictEvents` array and add entries for new events:

```typescript
{
  date: '2026-03-31',
  day: 32,
  lat: 27.1832,
  lng: 56.2666,
  type: 'shipping',
  target: 'Strait of Hormuz',
  description: 'Description of event',
  impact: 'Impact description',
  status: 'confirmed'
},
```

**Event types:** `'strike_us' | 'strike_iran' | 'strike_israel' | 'shipping' | 'infrastructure_energy' | 'infrastructure_water' | 'naval' | 'ground_offensive' | 'interception' | 'military' | 'political' | 'diplomatic'`

### Step 6: Preview locally

```bash
cd "C:\Users\Amber\OneDrive\Documents\Finance Internships\Website\FulcrumMemo-main"
npm run dev
```

Open http://localhost:5173/field-notes/day-32

### Step 7: Push to deploy

```bash
git add src/data/iranConflictData.ts
git commit -m "Add Day 32 field note: [title]"
git push origin main
```

GitHub Actions will automatically build and deploy to GitHub Pages (~2-3 minutes).

---

## Key Files Reference

| Purpose | Path |
|---------|------|
| All field notes data | `src/data/iranConflictData.ts` |
| Field notes list page | `src/pages/field-notes/FieldNotesIndex.tsx` |
| Individual field note page | `src/pages/field-notes/FieldNoteDay.tsx` |
| Map component | `src/components/maps/ConflictMap.tsx` |
| Deploy workflow | `.github/workflows/deploy.yml` |
| Iran memo data | `src/data/iranMemoData.ts` |

---

## Existing Content

- **Field Notes:** Days 6-31 currently exist
- **Iran Analysis:** `iran_analysis_complete.md` (working notes/compilation)
- **Memos:** Iran Part I, Iran Part II, Kirklands, Lycra, Party City

---

## Useful Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check git status
git status

# View recent commits
git log --oneline -10
```
