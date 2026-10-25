// Iran Memo Data - Corrected as of March 4, 2026

export const costAsymmetryData = {
  iranianWeapons: [
    { name: 'Shahed Drones', costLow: 35000, costHigh: 35000, category: 'drone' },
    { name: 'Ballistic Missiles', costLow: 200000, costHigh: 500000, category: 'missile' },
  ],
  interceptors: [
    { name: 'Arrow 2/3', costLow: 1000000, costHigh: 3000000, category: 'interceptor' },
    { name: 'Patriot PAC-3', costLow: 3700000, costHigh: 3700000, category: 'interceptor' },
    { name: 'THAAD', costLow: 12700000, costHigh: 12700000, category: 'interceptor' },
    { name: 'SM-3', costLow: 9700000, costHigh: 27900000, category: 'interceptor' },
  ],
  keyInsights: {
    droneAsymmetry: '100:1',
    missileVsSM3Asymmetry: '8-56:1',
    sm3FiredOctober2024: 12,
    june2025WarInterceptorCost: { low: 2000000000, high: 4000000000, source: 'Norsk Luftvern' },
    heritageFoundingAssessment: 'High-end interceptor stockpiles (SM-3, SM-6, PAC-3 MSE, THAAD) would likely be exhausted within days of sustained combat with Iran',
    heritageAssessmentDate: 'January 2026',
  },
};

export const shippingDisruptionData = {
  tankerTransits: [
    { date: 'Feb 28', count: 100, event: 'Pre-conflict baseline' },
    { date: 'Mar 1', count: 18, event: 'Initial disruption - insurance withdrawal begins' },
    { date: 'Mar 2', count: 7, event: 'Major insurers exit, Lloyd\'s cancellation announced' },
    { date: 'Mar 3', count: 5, event: 'Trump announces naval escorts' },
    { date: 'Mar 4', count: 4, event: 'P&I coverage expires midnight Mar 5' },
  ],
  vlccRates: [
    { date: 'Feb 28', rate: 85000, event: 'Pre-conflict' },
    { date: 'Mar 1', rate: 280000, event: 'Initial spike' },
    { date: 'Mar 2', rate: 423736, event: 'Record high (original)' },
    { date: 'Mar 3', rate: 445200, event: 'New record (Poten & Partners AG/FE)', source: 'Poten & Partners' },
  ],
  keyMetrics: {
    transitCollapsePercent: 81,
    tankersStranded: '150-200+',
    shipsUnableToExit: '700+',
    crudeBoundForIndia: '12 million barrels',
    minervaFixture: { rate: 436000, vessel: 'Pantanassa', charterer: 'GS Caltex' },
  },
  events: [
    { date: 'Mar 1', title: 'Insurance Withdrawal Begins', description: 'Major war risk insurers begin withdrawing coverage for Hormuz transits' },
    { date: 'Mar 2', title: 'QatarEnergy Suspends LNG', description: 'All LNG production suspended after drone attack on Ras Laffan facility' },
    { date: 'Mar 3', title: 'Lloyd\'s P&I Cancellation', description: 'Lloyd\'s-linked P&I clubs cancelling war risk coverage effective midnight March 5' },
    { date: 'Mar 3', title: 'Trump Naval Escorts', description: 'Trump announces naval escorts for tankers and U.S. political risk insurance guarantees' },
    { date: 'Mar 3', title: 'Iraq Production Cuts', description: 'Iraq announces forced production cuts of 1.5M bpd due to storage saturation' },
  ],
  additionalFactors: [
    'Dark-fleet (shadow) tankers attempting night transits with AIS off',
    'GPS spoofing/jamming reported in the strait area',
    'Lloyd\'s step not taken at this scale during Russia-Ukraine',
  ],
};

export const casualtyData = {
  iranianKilled: {
    count: 1045,
    asOf: 'Day 5',
    note: '1,045+ killed',
  },
  minabSchool: {
    deaths: 180,
    description: 'Minab school death toll',
    note: '~180 children',
  },
  navalLosses: [
    {
      vessel: 'IRIS Jamaran',
      type: 'Frigate',
      location: 'Indian Ocean, ~40 nautical miles south of Sri Lanka',
      personnelUnaccounted: '50+',
      note: 'Not sunk in Strait of Hormuz - reinforces insurance-driven leverage thesis',
    },
    {
      vessel: 'IRIS Dena',
      type: 'Frigate',
      location: 'Indian Ocean, ~40 nautical miles south of Sri Lanka',
      personnelUnaccounted: '50+',
      note: 'Not sunk in Strait of Hormuz - reinforces insurance-driven leverage thesis',
    },
  ],
  usKilled: 6,
};

export const creditMarketData = {
  hySpread: {
    current: 281,
    thirtyYearAverage: 525,
    unit: 'bps',
    note: 'Entered crisis at historic lows - maximum widening potential',
  },
  tenYearYield: {
    value: 4.117,
    unit: '%',
  },
  ismPricesPaid: {
    value: 70.5,
    jump: 11.5,
    note: 'Jumped 11.5 points to 70.5',
  },
  gasPriceJump: 'Biggest single-day jump since Ukraine invasion',
  leveragedLoanDefaultRate: {
    current: 7.5,
    projected: 7.9,
    unit: '%',
  },
};

export const scenarioData = [
  {
    name: 'Quick Resolution',
    probability: 20,
    oilPriceRange: '$70-80/bbl',
    gccDamage: '$10-50B',
    iranLeverage: 'Moderate (proven capability)',
    description: 'Trump redefines objectives: "We eliminated Khamenei, destroyed the nuclear program, degraded the military. Mission accomplished." U.S. withdraws within 2-4 weeks.',
    color: '#2E7D4F',
  },
  {
    name: 'Protracted Attrition',
    probability: 45,
    oilPriceRange: '$90-120/bbl',
    gccDamage: '$50-200B',
    iranLeverage: 'Strong (negotiated concessions)',
    description: 'Iran sustains asymmetric campaign for 4-12 weeks. Strait of Hormuz remains contested. GCC infrastructure damage compounds. Oil exceeds $100/bbl.',
    color: '#B7791F',
    isBaseCase: true,
  },
  {
    name: 'Full Escalation',
    probability: 35,
    oilPriceRange: '$100-150/bbl',
    gccDamage: '$200B+',
    iranLeverage: 'Strong (insurgency leverage)',
    description: 'Air campaign fails to achieve regime change. Trump commits ground troops. Multi-year occupation in mountainous terrain against 90M-person nation.',
    color: '#C8102E',
  },
];

export const sectorVulnerabilityData = [
  {
    sector: 'Retail',
    leverage: 85,
    refinancingExposure: 90,
    oilSensitivity: 70,
    consumerDependence: 95,
    currentSpread: 75,
    notes: 'Already distressed subsectors face accelerating consumer pullback',
  },
  {
    sector: 'Commercial RE',
    leverage: 90,
    refinancingExposure: 95,
    oilSensitivity: 40,
    consumerDependence: 60,
    currentSpread: 85,
    notes: 'Office, mall, and hotel REITs face distressed refinancings',
  },
  {
    sector: 'Airlines',
    leverage: 80,
    refinancingExposure: 70,
    oilSensitivity: 95,
    consumerDependence: 85,
    currentSpread: 70,
    notes: 'Double hit: fuel costs spike while Middle East routes shut',
  },
  {
    sector: 'Cruise Lines',
    leverage: 95,
    refinancingExposure: 85,
    oilSensitivity: 80,
    consumerDependence: 100,
    currentSpread: 90,
    notes: 'Most leveraged consumer discretionary subsector',
  },
  {
    sector: 'Speculative Tech',
    leverage: 60,
    refinancingExposure: 80,
    oilSensitivity: 20,
    consumerDependence: 40,
    currentSpread: 65,
    notes: 'Pre-revenue companies burning cash faster than they can raise it',
  },
  {
    sector: 'Energy E&P',
    leverage: 50,
    refinancingExposure: 45,
    oilSensitivity: 30,
    consumerDependence: 15,
    currentSpread: 40,
    notes: 'Short-term windfall, long-term policy headwind',
  },
  {
    sector: 'Healthcare',
    leverage: 35,
    refinancingExposure: 40,
    oilSensitivity: 25,
    consumerDependence: 50,
    currentSpread: 30,
    notes: 'Economic stress + Democratic trifecta = expanded coverage',
  },
];

export const macroTransmissionChain = [
  {
    id: 'energy-shock',
    label: 'Energy Shock',
    description: 'Strait of Hormuz closure, 20% global oil disrupted',
    metrics: ['Brent +7.5% to $83.58', 'VLCC rates $445K/day', '81% transit collapse'],
    color: '#C8102E',
  },
  {
    id: 'inflation',
    label: 'Inflation',
    description: 'Energy costs propagate through economy',
    metrics: ['ISM Prices Paid: 70.5 (+11.5 pts)', 'Gas: biggest jump since Ukraine', '$14B annualized per $10/bbl'],
    color: '#B07D2B',
  },
  {
    id: 'fed-constraint',
    label: 'Fed Constraint',
    description: 'Rate cuts blocked by inflation spike',
    metrics: ['10Y yield: 4.117%', 'Cutting cycle disrupted', 'Stagflation risk'],
    color: '#B7791F',
  },
  {
    id: 'spread-widening',
    label: 'Spread Widening',
    description: 'Credit markets reprice risk',
    metrics: ['HY OAS: 281 bps (historic low)', '30-yr avg: 525 bps', 'Max widening potential'],
    color: '#2E7D4F',
  },
  {
    id: 'defaults',
    label: 'Defaults',
    description: 'Zombie companies hit refinancing wall',
    metrics: ['Leveraged loan default: 7.9%', '2026-27 maturity wall', 'Zombie company population'],
    color: '#4F7F7A',
  },
  {
    id: 'restructuring',
    label: 'Restructuring Cycle',
    description: 'Largest since 2008-2009',
    metrics: ['Retail, CRE, Airlines', 'Cruise, Speculative Tech', 'Advisory mandates surge'],
    color: '#7A6C9D',
  },
];

export const gccWaterData = [
  { country: 'Saudi Arabia', gdp: '~$1.1T', desalinationDependency: '~60%', waterReserves: 'Days-weeks', damage: 'Riyadh and Eastern Province targeted' },
  { country: 'UAE', gdp: '~$500B', desalinationDependency: '90%+', waterReserves: '2-5 days', damage: 'Amazon data center burning, Jebel Ali port fire, Burj Al Arab hit, Dubai airport 70% canceled' },
  { country: 'Qatar', gdp: '~$250B', desalinationDependency: '90%+', waterReserves: '2-5 days', damage: 'Ras Laffan energy facility, Mesaieed water/power plant hit; all flights grounded' },
  { country: 'Kuwait', gdp: '~$160B', desalinationDependency: '90%+', waterReserves: '2-5 days', damage: '6 U.S. troops killed at base; air raid sirens active' },
  { country: 'Bahrain', gdp: '~$45B', desalinationDependency: '90%+', waterReserves: '2-3 days', damage: 'U.S. Naval base targeted; commercial district hit' },
];

export const conflictTimeline = [
  { date: 'January 13, 2026', event: 'Iranian officials warn they are "ready for war"; U.S. begins largest Middle East military buildup since 2003 Iraq invasion' },
  { date: 'February 24, 2026', event: 'Trump\'s State of the Union accuses Iran of reviving nuclear weapons program, warns U.S. "prepared to act"' },
  { date: 'February 28, 2026', event: 'U.S. and Israel launch "Operation Epic Fury"—joint strikes across Iran. Supreme Leader Khamenei killed. Iran launches retaliatory strikes on 27 U.S. bases and Israeli targets within hours' },
  { date: 'March 1, 2026', event: 'Iran targets GCC civilian infrastructure: energy facilities in Qatar\'s Ras Laffan and Mesaieed, Dubai hotels and ports, Amazon data centers in UAE and Bahrain. Interim Leadership Council formed. Iran rejects U.S. ceasefire proposal via Italian mediator' },
  { date: 'March 2, 2026', event: 'U.S. death toll rises to 6. Trump says campaign could last 4-5 weeks. Hezbollah enters conflict from Lebanon. Strait of Hormuz shipping halted. Congress begins war powers resolution proceedings' },
  { date: 'March 3, 2026', event: 'Lloyd\'s P&I clubs announce coverage cancellation effective midnight March 5. Trump announces naval escorts and political risk insurance guarantees. QatarEnergy suspends all LNG production.' },
  { date: 'March 4, 2026', event: 'Iranian casualties exceed 1,045. IRIS Jamaran and IRIS Dena sunk in Indian Ocean. Tanker transits collapse to ~4/day. Iraq announces 1.5M bpd forced production cuts.' },
];

export const glossaryTerms: Record<string, { term: string; definition: string; category: string }> = {
  'vlcc': {
    term: 'VLCC',
    definition: 'Very Large Crude Carrier - tankers capable of carrying 200,000+ deadweight tons of crude oil. The workhorses of global oil transport.',
    category: 'shipping',
  },
  'pni': {
    term: 'P&I Insurance',
    definition: 'Protection & Indemnity insurance - maritime liability coverage that protects shipowners against third-party claims. Without P&I, ships cannot legally operate.',
    category: 'insurance',
  },
  'hyspread': {
    term: 'HY Spread (OAS)',
    definition: 'High-Yield Option-Adjusted Spread - the yield premium investors demand for holding high-yield (junk) bonds over risk-free Treasuries. Wider spreads = higher perceived risk.',
    category: 'credit',
  },
  'refinancingwall': {
    term: 'Refinancing Wall',
    definition: 'The cluster of debt maturities coming due in a specific period. Companies that borrowed at low rates in 2020-2021 face much higher rates when refinancing in 2026-2027.',
    category: 'credit',
  },
  'zombiecompany': {
    term: 'Zombie Company',
    definition: 'A firm whose interest costs exceed its operating income - surviving only through continued access to cheap debt. Rising rates make refinancing impossible.',
    category: 'credit',
  },
  'desalination': {
    term: 'Desalination',
    definition: 'The process of removing salt from seawater to produce drinking water. GCC states depend on coastal desalination plants for 90%+ of potable water.',
    category: 'infrastructure',
  },
  'blockingposition': {
    term: 'Blocking Position',
    definition: 'In restructuring, holding enough debt to veto a plan of reorganization (typically 33%+ of a class). Iran\'s control of Hormuz gives it a "blocking position" on global energy.',
    category: 'restructuring',
  },
  'irgc': {
    term: 'IRGC',
    definition: 'Islamic Revolutionary Guard Corps - Iran\'s parallel military force responsible for asymmetric warfare, missile programs, and regional proxy operations.',
    category: 'military',
  },
  'ism': {
    term: 'ISM Prices Paid',
    definition: 'A component of the ISM Manufacturing Index measuring input price inflation. Readings above 50 indicate rising prices; 70.5 signals significant inflationary pressure.',
    category: 'macro',
  },
};
