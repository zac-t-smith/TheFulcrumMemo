// Closing Dispatch — the one final entry that closes out the Iran field-note
// series. Scaffolded Nov 4, 2026. Narrative only (no marketSnapshot tile).
// Zac supplies the title, lede, and body.

export type ClosingDispatchPlaceholder = {
  date: string;      // pretty date, e.g. "November 4, 2026"
  isoDate: string;   // ISO for machines
  title: string;
  lede: string;      // 1–2 sentence standfirst
  body: string[];    // paragraphs (markdown-free prose; renderer wraps in <p>)
};

export const closingDispatch: ClosingDispatchPlaceholder = {
  date: 'November 4, 2026',
  isoDate: '2026-11-04',
  title: '[CLOSING DISPATCH TITLE — ZAC TO WRITE]',
  lede: '[CLOSING DISPATCH LEDE — ZAC TO WRITE]',
  body: [
    '[CLOSING DISPATCH BODY — ZAC TO WRITE]',
  ],
};
