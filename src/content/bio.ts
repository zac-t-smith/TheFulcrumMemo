// Single source of truth for identity, contact, and biographical copy.
// Every page, memo, footer, and meta tag pulls from here.
// If you change your email, bio, or revenue claim, change it ONCE here.

export const EMAIL = "zac.ty.smith@gmail.com";

export const EMAIL_MAILTO = `mailto:${EMAIL}`;

export const LINKEDIN_URL = "https://www.linkedin.com/in/zac-t-smith/";

export const TWITTER_HANDLE = "@TheFulcrumMemo";

export const RESUME_PDF = `${import.meta.env.BASE_URL}Smith_Zachary_Resume.pdf`;

export const SITE_URL = "https://zac-t-smith.github.io/TheFulcrumMemo";

// The one bio line used everywhere a bio appears (memo footers, About,
// Resume sidebar, meta descriptions when short, etc.).
export const BIO_SHORT =
  "Finance student at the University of Mobile (Dec 2026), U.S. Army veteran, and former founder of a restoration company he took through a restructuring. Internships and programs with Pivoton Capital, Goldman Sachs, Citi, Morgan Stanley, and BlockCrowd.";

// The current recruiting stance.
export const RECRUITING_LINE =
  "seeking full-time 2027 analyst roles in restructuring, credit, and distressed investing";

// The revenue claim about the restoration business — one wording, used everywhere.
export const REVENUE_CLAIM =
  "scaled from $0 to $100K in monthly revenue within 5 months";

// Credential strip values (About/Home/Resume reuse these).
export const CREDENTIALS = {
  capitalRaised: "$300K",
  revenueScale: "$0 to $100K MRR in 5 months",
  distressedOps: "18 months managing creditor negotiations",
  army: "3.5 years Army infantry, 4th Infantry Division",
} as const;

// Author display name, used for mastheads, memo bylines, print footers.
export const AUTHOR_NAME = "Zachary T. Smith";

// The site tagline shown next to the brand mark.
export const SITE_TAGLINE =
  "Independent credit research · Restructuring & special situations";
