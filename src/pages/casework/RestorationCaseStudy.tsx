import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Mail, TrendingDown, TrendingUp, AlertTriangle, ChevronDown, ChevronUp, DollarSign, TrendingDownIcon, BarChart3, Layout, PlayCircle, PauseCircle, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Animated counter component
const AnimatedNumber = ({ value, prefix = "", suffix = "", duration = 1 }: { value: number; prefix?: string; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// Cap Table stage data with detailed metrics
const capTableStages = [
  {
    id: "steady",
    name: "Steady State",
    date: "September 2024",
    color: "green",
    icon: TrendingUp,
    narrative: "Strong revenue growth masked underlying working capital issues. The business was scaling rapidly with $100K monthly revenue, but the fundamental timing mismatch between payables and receivables was creating pressure.",
    assets: {
      total: 234,
      cash: 3.6,
      ar: 189,
      arDetails: "DSO: 57 days, 9% >60 days",
      vehicles: 36,
      inventory: 5,
      arAging: {
        current: 172,
        days30: 10,
        days60: 5,
        days90: 2
      },
      cashBurnRate: -12
    },
    liabilities: {
      total: 31,
      revolving: 31,
      ap: 0,
      trade: 0,
      apTerms: "Current on all obligations"
    },
    equity: 203,
    workingCapital: 156,
    wcHealth: "healthy"
  },
  {
    id: "distress",
    name: "Peak Distress",
    date: "November 2024",
    color: "amber",
    icon: AlertTriangle,
    narrative: "Collections slowed as insurance carriers extended payment timelines. AR aging deteriorated rapidly while operational expenses continued. Vendors began tightening payment terms, creating a liquidity squeeze despite continued revenue.",
    assets: {
      total: 188,
      cash: 2.5,
      ar: 144,
      arDetails: "DSO: 103 days, 30% >60 days",
      vehicles: 36,
      inventory: 5,
      arAging: {
        current: 100,
        days30: 15,
        days60: 20,
        days90: 9
      },
      cashBurnRate: -28
    },
    liabilities: {
      total: 89,
      revolving: 26,
      ap: 51,
      trade: 12,
      apTerms: "30+ days past due on 65% of payables"
    },
    equity: 98,
    workingCapital: 45,
    wcHealth: "warning",
    wcChange: -71
  },
  {
    id: "liquidation",
    name: "Liquidation",
    date: "June 2025",
    color: "red",
    icon: TrendingDown,
    narrative: "After exhausting capital raising options and evaluating strategic alternatives, made the decision to pursue orderly liquidation. Focused on maximizing creditor recovery while preserving reputation and relationships for future endeavors.",
    assets: {
      total: 149,
      cash: 1,
      ar: 90,
      arDetails: "DSO: N/A, 70% >60 days, 52% >90 days",
      vehicles: 55,
      inventory: 3,
      arAging: {
        current: 27,
        days30: 16,
        days60: 20,
        days90: 27
      },
      cashBurnRate: 0
    },
    liabilities: {
      total: 140,
      revolving: 47,
      ap: 75,
      trade: 18,
      apTerms: "Negotiating settlements across all classes"
    },
    equity: 9,
    workingCapital: -1,
    wcHealth: "critical"
  }
];

// Detailed waterfall data with negotiation details
const waterfallData = [
  {
    label: "Priority 1 - Secured/Related",
    amount: 25,
    recovery: 100,
    color: "bg-green-600",
    originalAmount: 25,
    settlementTerms: "Paid in full",
    approach: "Related party debt paid 100% to maintain relationships and personal credibility. No negotiation—immediate payment upon liquidation.",
    timeline: "Immediate"
  },
  {
    label: "Priority 2 - Credit Facilities",
    amount: 16,
    recovery: 71,
    color: "bg-green-400",
    originalAmount: 22.5,
    settlementTerms: "71% settlement with immediate payment",
    approach: "Negotiated with lender using liquidation value of collateral as baseline. Emphasized orderly wind-down vs. forced liquidation to achieve better terms.",
    timeline: "30 days"
  },
  {
    label: "Priority 3 - Trade/Unsecured",
    amount: 37,
    recovery: 50,
    color: "bg-yellow-500",
    originalAmount: 74,
    settlementTerms: "50% settlement, staggered payments",
    approach: "Individual negotiations with each vendor. Highlighted: (1) higher recovery than bankruptcy, (2) preservation of business relationship for future, (3) immediate vs. delayed payment.",
    timeline: "60-90 days"
  },
  {
    label: "Investor Recovery",
    amount: 2,
    recovery: 0.89,
    color: "bg-red-500",
    originalAmount: 224,
    settlementTerms: "0.89% recovery",
    approach: "After all creditor payments, remaining proceeds distributed pro-rata to equity holders. Transparent communication throughout process maintained relationships despite minimal recovery.",
    timeline: "Post-settlement"
  }
];

const RestructuringCaseStudy = () => {
  const [activeStage, setActiveStage] = useState(0);
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"timeline" | "compare">("timeline");
  const [storyMode, setStoryMode] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<{
    title: string;
    data: any;
    stage?: typeof capTableStages[0];
  } | null>(null);
  const [selectedCreditor, setSelectedCreditor] = useState<typeof waterfallData[0] | null>(null);

  // Story mode auto-advance
  useEffect(() => {
    if (!storyMode) return;

    const interval = setInterval(() => {
      setActiveStage((prev) => {
        if (prev >= capTableStages.length - 1) {
          setStoryMode(false);
          return prev;
        }
        return prev + 1;
      });
    }, 8000); // 8 seconds per stage

    return () => clearInterval(interval);
  }, [storyMode]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode === "compare") return;
      if (e.key === "ArrowLeft" && activeStage > 0) {
        setActiveStage(activeStage - 1);
      } else if (e.key === "ArrowRight" && activeStage < capTableStages.length - 1) {
        setActiveStage(activeStage + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeStage, viewMode]);

  const currentStage = capTableStages[activeStage];

  const openMetricDetail = (title: string, data: any, stage?: typeof capTableStages[0]) => {
    setSelectedMetric({ title, data, stage });
  };

  return (
    <PageLayout
      title="Best Option Restoration — a lived restructuring case"
      description="How a $300K-raised restoration company scaled from zero to $100K monthly revenue in five months, hit a 90-120 day collection crunch, and spent 18 months managing creditors before an orderly wind-down."
      bare
    >
      <div className="min-h-screen">

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-8 lg:px-16 max-w-7xl">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
              Best Option Restoration
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground italic max-w-4xl mx-auto">
              A firsthand perspective on managing liquidity crises, creditor negotiations, and strategic alternatives analysis
            </p>
          </div>
        </div>
      </section>

      {/* Executive Summary */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-8 lg:px-16 max-w-7xl">
          <div className="border-b-2 border-primary pb-4 mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Executive Summary</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-lg">
            <div>
              <p className="mb-2"><span className="font-semibold">Company:</span> Gulf Coast Restoration Group</p>
              <p className="mb-2"><span className="font-semibold">Industry:</span> Property Restoration Services</p>
              <p className="mb-2"><span className="font-semibold">Founded:</span> March 2024</p>
            </div>
            <div>
              <p className="mb-2"><span className="font-semibold">Peak Revenue:</span> $100K/month (Sept 2024)</p>
              <p className="mb-2"><span className="font-semibold">Timeline:</span> March 2024 - September 2025</p>
              <p className="mb-2"><span className="font-semibold">Outcome:</span> Orderly liquidation with negotiated creditor settlements</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-8 lg:px-16 max-w-7xl">
          <div className="border-b-2 border-primary pb-4 mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Key Metrics</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-6 bg-background rounded-lg border-2 border-border"
            >
              <p className="text-4xl font-bold text-primary mb-2">$<AnimatedNumber value={300} />K</p>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Capital Raised</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-6 bg-background rounded-lg border-2 border-border"
            >
              <p className="text-4xl font-bold text-primary mb-2"><AnimatedNumber value={5} /> Months</p>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">0 to $100K MRR</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 bg-background rounded-lg border-2 border-border"
            >
              <p className="text-4xl font-bold text-primary mb-2"><AnimatedNumber value={18} /> Months</p>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Distressed Operations</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-6 bg-background rounded-lg border-2 border-border"
            >
              <p className="text-4xl font-bold text-primary mb-2"><AnimatedNumber value={38} />.<AnimatedNumber value={3} />%</p>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">AR Recovery Rate</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cap Table Evolution Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-8 lg:px-16 max-w-7xl">
          <div className="border-b-2 border-primary pb-4 mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground">Cap Table Evolution</h2>
                <p className="text-sm tracking-widest text-muted-foreground uppercase mt-2">
                  Balance Sheet Deterioration Timeline
                </p>
              </div>

              {/* View Mode Toggle & Story Mode */}
              <div className="flex gap-3">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "timeline" | "compare")}>
                  <TabsList>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="compare">Compare</TabsTrigger>
                  </TabsList>
                </Tabs>

                {viewMode === "timeline" && (
                  <Button
                    variant={storyMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setStoryMode(!storyMode);
                      if (!storyMode) setActiveStage(0);
                    }}
                    className="gap-2"
                  >
                    {storyMode ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                    {storyMode ? "Pause" : "Story Mode"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Timeline View */}
          {viewMode === "timeline" && (
            <>
              {/* Timeline Navigation */}
              <div className="mb-12">
                <div className="relative">
                  <div className="absolute top-6 left-0 right-0 h-0.5 bg-border hidden md:block" />
                  <div className="flex justify-between items-center relative z-10">
                    {capTableStages.map((stage, index) => (
                      <button
                        key={stage.id}
                        onClick={() => setActiveStage(index)}
                        className="flex flex-col items-center group"
                        aria-label={`View ${stage.name}`}
                      >
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                          ${activeStage === index
                            ? stage.color === 'green' ? 'bg-green-500 scale-110 shadow-lg' :
                              stage.color === 'amber' ? 'bg-amber-500 scale-110 shadow-lg' :
                              'bg-red-500 scale-110 shadow-lg'
                            : 'bg-muted hover:bg-muted-foreground/20'}
                        `}>
                          <stage.icon className={`w-6 h-6 ${activeStage === index ? 'text-white' : 'text-muted-foreground'}`} />
                        </div>
                        <span className={`text-xs mt-2 font-semibold transition-colors ${activeStage === index ? 'text-primary' : 'text-muted-foreground'}`}>
                          {stage.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  {storyMode ? "Story mode active - Auto-advancing every 8 seconds" : "Click stages or use arrow keys to navigate"}
                </p>
              </div>

              {/* Narrative Overlay */}
              <AnimatePresence mode="wait">
                {storyMode && (
                  <motion.div
                    key={`narrative-${activeStage}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mb-8 p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg"
                  >
                    <p className="text-base leading-relaxed italic">
                      {currentStage.narrative}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active Stage Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-3xl mx-auto"
                >
                  <Card className={`border-2 ${
                    currentStage.color === 'green' ? 'border-green-300' :
                    currentStage.color === 'amber' ? 'border-amber-300' :
                    'border-red-300'
                  }`}>
                    <CardHeader className={`${
                      currentStage.color === 'green' ? 'bg-green-50 dark:bg-green-950/20' :
                      currentStage.color === 'amber' ? 'bg-amber-50 dark:bg-amber-950/20' :
                      'bg-red-50 dark:bg-red-950/20'
                    }`}>
                      <div className="flex items-center gap-3">
                        <currentStage.icon className={`w-8 h-8 ${
                          currentStage.color === 'green' ? 'text-green-600' :
                          currentStage.color === 'amber' ? 'text-amber-600' :
                          'text-red-600'
                        }`} />
                        <div>
                          <CardTitle className="text-3xl">{currentStage.name}</CardTitle>
                          <CardDescription className="text-base font-semibold">{currentStage.date}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-8">
                      <div className="space-y-8">
                        {/* Assets - Clickable */}
                        <div>
                          <button
                            onClick={() => openMetricDetail("Accounts Receivable Aging", currentStage.assets.arAging, currentStage)}
                            className="w-full text-left group"
                          >
                            <h4 className="font-bold text-2xl mb-4 text-primary flex items-center gap-2 group-hover:underline">
                              Assets: $<AnimatedNumber value={currentStage.assets.total} duration={0.8} />K
                              <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">Click for details</span>
                            </h4>
                          </button>
                          <div className="grid md:grid-cols-2 gap-4 text-base">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Cash:</span>
                              <span className="font-semibold">${currentStage.assets.cash}K</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">AR:</span>
                              <span className="font-semibold">${currentStage.assets.ar}K</span>
                            </div>
                            <div className="col-span-2 text-xs text-muted-foreground pl-4">
                              {currentStage.assets.arDetails}
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Vehicles/Equipment:</span>
                              <span className="font-semibold">${currentStage.assets.vehicles}K</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Inventory:</span>
                              <span className="font-semibold">${currentStage.assets.inventory}K</span>
                            </div>
                          </div>
                        </div>

                        {/* Liabilities - Clickable */}
                        <div>
                          <button
                            onClick={() => openMetricDetail("Accounts Payable Terms", { terms: currentStage.liabilities.apTerms }, currentStage)}
                            className="w-full text-left group"
                          >
                            <h4 className="font-bold text-2xl mb-4 flex items-center gap-2 group-hover:underline">
                              Liabilities: $<AnimatedNumber value={currentStage.liabilities.total} duration={0.8} />K
                              <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">Click for details</span>
                            </h4>
                          </button>
                          <div className="grid md:grid-cols-2 gap-4 text-base">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Revolving Credit:</span>
                              <span className="font-semibold">${currentStage.liabilities.revolving}K</span>
                            </div>
                            {currentStage.liabilities.ap > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">AP (aged):</span>
                                <span className="font-semibold">${currentStage.liabilities.ap}K</span>
                              </div>
                            )}
                            {currentStage.liabilities.trade > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Trade Payables:</span>
                                <span className="font-semibold">${currentStage.liabilities.trade}K</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Cash Burn Rate - Clickable */}
                        <button
                          onClick={() => openMetricDetail("Cash Burn Analysis", { burnRate: currentStage.assets.cashBurnRate }, currentStage)}
                          className="w-full"
                        >
                          <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Monthly Cash Burn:</span>
                              <span className={`font-bold text-lg ${currentStage.assets.cashBurnRate < -20 ? 'text-red-600' : currentStage.assets.cashBurnRate < 0 ? 'text-amber-600' : 'text-green-600'}`}>
                                ${currentStage.assets.cashBurnRate}K/mo
                              </span>
                            </div>
                          </div>
                        </button>

                        {/* Equity & Working Capital */}
                        <div className="pt-4 border-t-2 border-border">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-muted-foreground text-sm mb-1">Equity</p>
                              <p className="font-bold text-2xl">${currentStage.equity}K</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-sm mb-1">Working Capital</p>
                              <p className={`font-bold text-2xl ${
                                currentStage.wcHealth === 'healthy' ? 'text-green-600' :
                                currentStage.wcHealth === 'warning' ? 'text-amber-600' :
                                'text-red-600'
                              }`}>
                                ${currentStage.workingCapital}K
                                {currentStage.wcChange && (
                                  <span className="text-sm ml-2">
                                    (↓{currentStage.wcChange}%)
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>

              {/* Navigation arrows */}
              <div className="flex justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setActiveStage(Math.max(0, activeStage - 1))}
                  disabled={activeStage === 0}
                  aria-label="Previous stage"
                >
                  ← Previous
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setActiveStage(Math.min(capTableStages.length - 1, activeStage + 1))}
                  disabled={activeStage === capTableStages.length - 1}
                  aria-label="Next stage"
                >
                  Next →
                </Button>
              </div>
            </>
          )}

          {/* Comparison View */}
          {viewMode === "compare" && (
            <div className="grid md:grid-cols-3 gap-8">
              {capTableStages.map((stage, index) => (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`border-2 ${
                    stage.color === 'green' ? 'border-green-300' :
                    stage.color === 'amber' ? 'border-amber-300' :
                    'border-red-300'
                  } h-full`}>
                    <CardHeader className={`${
                      stage.color === 'green' ? 'bg-green-50 dark:bg-green-950/20' :
                      stage.color === 'amber' ? 'bg-amber-50 dark:bg-amber-950/20' :
                      'bg-red-50 dark:bg-red-950/20'
                    }`}>
                      <div className="flex items-center gap-2">
                        <stage.icon className={`w-6 h-6 ${
                          stage.color === 'green' ? 'text-green-600' :
                          stage.color === 'amber' ? 'text-amber-600' :
                          'text-red-600'
                        }`} />
                        <div>
                          <CardTitle className="text-lg">{stage.name}</CardTitle>
                          <CardDescription className="text-xs">{stage.date}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4 text-sm">
                        <div>
                          <p className="font-bold text-primary mb-2">Assets: ${stage.assets.total}K</p>
                          <ul className="space-y-1 text-xs">
                            <li>Cash: ${stage.assets.cash}K</li>
                            <li>AR: ${stage.assets.ar}K</li>
                            <li className="text-muted-foreground">{stage.assets.arDetails}</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-bold mb-2">Liabilities: ${stage.liabilities.total}K</p>
                          <ul className="space-y-1 text-xs">
                            <li>Revolving: ${stage.liabilities.revolving}K</li>
                            {stage.liabilities.ap > 0 && <li>AP: ${stage.liabilities.ap}K</li>}
                            {stage.liabilities.trade > 0 && <li>Trade: ${stage.liabilities.trade}K</li>}
                          </ul>
                        </div>
                        <div className="pt-3 border-t">
                          <div className="flex justify-between mb-1">
                            <span className="text-muted-foreground">Equity:</span>
                            <span className="font-bold">${stage.equity}K</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">WC:</span>
                            <span className={`font-bold ${
                              stage.wcHealth === 'healthy' ? 'text-green-600' :
                              stage.wcHealth === 'warning' ? 'text-amber-600' :
                              'text-red-600'
                            }`}>
                              ${stage.workingCapital}K
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Interactive Liquidation Waterfall */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-8 lg:px-16 max-w-7xl">
          <div className="border-b-2 border-primary pb-4 mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Liquidation Proceeds</h2>
            <p className="text-sm tracking-widest text-muted-foreground uppercase mt-2">
              Interactive Creditor Waterfall - $79K Total Realized (53% of book value)
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Interactive Waterfall Chart */}
            <div>
              <h3 className="text-xl font-bold mb-6">Recovery Waterfall (Click for Details)</h3>
              <div className="space-y-3">
                {waterfallData.map((item, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={() => setSelectedCreditor(item)}
                    className="group w-full text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold group-hover:text-primary transition-colors">{item.label}</span>
                      <span className="text-sm text-muted-foreground">{item.recovery}% recovery</span>
                    </div>
                    <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(item.amount / 79) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`h-full ${item.color} flex items-center justify-center text-white font-bold group-hover:opacity-90 transition-opacity cursor-pointer`}
                      >
                        ${item.amount}K
                      </motion.div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Asset Recovery Details */}
            <div>
              <h3 className="text-xl font-bold mb-6">Asset Recovery</h3>
              <Card className="border-2">
                <CardContent className="pt-6">
                  <ul className="space-y-4 text-base">
                    <li className="flex justify-between items-center">
                      <span className="text-muted-foreground">AR Recovery:</span>
                      <span className="font-bold text-lg">
                        $34K <span className="text-sm text-muted-foreground font-normal">(38%)</span>
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-muted-foreground">Vehicles:</span>
                      <span className="font-bold text-lg">$32K</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-muted-foreground">Equipment:</span>
                      <span className="font-bold text-lg">$12K</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-muted-foreground">Inventory:</span>
                      <span className="font-bold text-lg">$1K</span>
                    </li>
                    <li className="pt-4 border-t-2 flex justify-between items-center">
                      <span className="font-semibold">Total Realized:</span>
                      <span className="font-bold text-xl text-primary">$79K</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Lessons Learned - Enhanced */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-8 lg:px-16 max-w-7xl">
          <div className="border-b-2 border-primary pb-4 mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Lessons Learned</h2>
            <p className="text-sm tracking-widest text-muted-foreground uppercase mt-2">
              Key Takeaways from Distressed Operations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: DollarSign,
                title: "Capital Structure Mismatch",
                summary: [
                  "Business model: 30-day payables",
                  "Revenue collections: 120-180 days",
                  "Result: Structural working capital deficit"
                ],
                detail: "The fundamental issue wasn't operational execution—it was a timing mismatch between cash outflows and inflows. Even with strong revenue growth, the business was structurally undercapitalized for its working capital needs. This taught me the critical importance of matching capital structure to business model characteristics, especially in businesses with extended collection cycles."
              },
              {
                icon: TrendingDownIcon,
                title: "Covenant Management",
                summary: [
                  "Learned to distinguish operational fixes vs. structural problems",
                  "DSO deterioration was indicator, not root cause",
                  "Sometimes no amount of operational excellence can fix capital structure"
                ],
                detail: "Managing through covenant breaches revealed an important lesson: some problems can't be solved operationally. While we improved collections processes and tightened credit policies, these operational improvements couldn't overcome the structural capital deficit. Recognizing when you're fighting a capital structure problem versus an operational problem is crucial for creditor negotiations and strategic decision-making."
              },
              {
                icon: BarChart3,
                title: "Strategic Alternatives",
                summary: [
                  "Evaluated bankruptcy vs. workout vs. liquidation",
                  "Reputational risk drove decision-making",
                  "Orderly wind-down preserved creditor relationships"
                ],
                detail: "When facing distress, the goal isn't always to save the business at all costs. We carefully evaluated Chapter 11 reorganization, out-of-court workout, and orderly liquidation. The decision to pursue liquidation was driven by: (1) preserving creditor relationships for future endeavors, (2) minimizing legal costs that would reduce creditor recovery, and (3) maintaining personal reputation in the restoration industry. Sometimes the best outcome is an orderly exit that treats stakeholders fairly."
              }
            ].map((lesson, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="border-2 hover:shadow-xl transition-all duration-300 h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <lesson.icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{lesson.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm leading-relaxed mb-4">
                      {lesson.summary.map((point, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => setExpandedLesson(expandedLesson === index ? null : index)}
                      className="flex items-center gap-2 text-primary hover:text-primary/80 font-semibold text-sm transition-colors"
                      aria-expanded={expandedLesson === index}
                    >
                      {expandedLesson === index ? 'Show Less' : 'Read More'}
                      {expandedLesson === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <AnimatePresence>
                      {expandedLesson === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                            {lesson.detail}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-8 lg:px-16 max-w-4xl text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Full Financial Analysis
          </h3>
          <p className="text-lg text-muted-foreground mb-8">
            Download the complete case study with detailed financial statements, covenant analysis, and restructuring timeline.
          </p>
          {/* Phase A: PDF button hidden until Phase 5 pipeline generates a real file */}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-8 lg:px-16 max-w-4xl text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-8">
            Want to Discuss This Case?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-primary-foreground text-secondary-foreground hover:bg-secondary-foreground/10 font-semibold text-lg px-8"
              onClick={() => window.location.href = '/#contact'}
            >
              <Mail className="mr-2 w-5 h-5" />
              Get In Touch
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-secondary border-t border-secondary-foreground/10">
        <div className="container mx-auto px-8 lg:px-16 text-center">
          <p className="text-secondary-foreground/60 text-sm">
            © 2025 Zachary T. Smith | The Fulcrum Memo
          </p>
        </div>
      </footer>

      {/* Metric Deep-Dive Modal */}
      <Dialog open={!!selectedMetric} onOpenChange={() => setSelectedMetric(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              {selectedMetric?.title}
              {selectedMetric?.stage && (
                <span className="text-sm font-normal text-muted-foreground">
                  - {selectedMetric.stage.name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedMetric?.title === "Accounts Receivable Aging" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  AR aging breakdown showing collection timeline deterioration
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded">
                    <span className="font-semibold">Current (0-30 days):</span>
                    <span className="text-lg font-bold">${selectedMetric.data.current}K</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                    <span className="font-semibold">30-60 days:</span>
                    <span className="text-lg font-bold">${selectedMetric.data.days30}K</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded">
                    <span className="font-semibold">60-90 days:</span>
                    <span className="text-lg font-bold">${selectedMetric.data.days60}K</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded">
                    <span className="font-semibold">90+ days:</span>
                    <span className="text-lg font-bold">${selectedMetric.data.days90}K</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 italic">
                  Insurance carrier payment delays drove AR aging deterioration. Collections efforts focused on newest balances while older receivables became increasingly difficult to collect.
                </p>
              </div>
            )}
            {selectedMetric?.title === "Accounts Payable Terms" && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold mb-2">Payment Status:</p>
                  <p className="text-lg">{selectedMetric.data.terms}</p>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  As liquidity tightened, vendor relationships became critical. Prioritized strategic vendors while negotiating extended terms with others.
                </p>
              </div>
            )}
            {selectedMetric?.title === "Cash Burn Analysis" && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold mb-2">Monthly Cash Burn Rate:</p>
                  <p className={`text-3xl font-bold ${selectedMetric.data.burnRate < -20 ? 'text-red-600' : selectedMetric.data.burnRate < 0 ? 'text-amber-600' : 'text-green-600'}`}>
                    ${selectedMetric.data.burnRate}K/month
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Primary Drivers:</span></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Delayed AR collections from insurance carriers</li>
                    <li>Ongoing operational expenses (labor, materials)</li>
                    <li>Debt service on revolving credit facility</li>
                    <li>Limited ability to reduce fixed costs short-term</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Creditor Detail Modal */}
      <Dialog open={!!selectedCreditor} onOpenChange={() => setSelectedCreditor(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedCreditor?.label}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Original Amount</p>
                <p className="text-2xl font-bold">${selectedCreditor?.originalAmount}K</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Amount Recovered</p>
                <p className="text-2xl font-bold text-green-600">${selectedCreditor?.amount}K</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Recovery Rate</p>
                <p className="text-2xl font-bold">{selectedCreditor?.recovery}%</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Settlement Timeline</p>
                <p className="text-xl font-bold">{selectedCreditor?.timeline}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-2">Settlement Terms:</h4>
              <p className="text-base bg-primary/5 p-4 rounded-lg">{selectedCreditor?.settlementTerms}</p>
            </div>

            <div>
              <h4 className="font-bold mb-2">Negotiation Approach:</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedCreditor?.approach}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </PageLayout>
  );
};

export default RestructuringCaseStudy;
