import { Printer, Download, Mail, MapPin, Linkedin, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Resume = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Helmet>
        <title>Resume | Zachary Smith | The Fulcrum Memo</title>
        <meta
          name="description"
          content="Resume of Zachary Smith - Army veteran, operator, and restructuring analyst candidate with experience in financial modeling, distressed situations, and capital structure analysis."
        />
      </Helmet>

      <div className="min-h-screen bg-background print:bg-white print:min-h-0">
        <Navbar />

        <main className="container mx-auto px-6 pt-24 pb-12 max-w-4xl print:pt-0 print:px-0 print:max-w-none">
          {/* Back Link & Print Button - Hide on print */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-end mb-8 print:hidden"
          >
            <div className="flex items-center gap-3">
              <a
                href="/resume/Zachary_Smith_Resume.pdf"
                download
                className="inline-flex items-center gap-2 px-4 py-2 border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground text-xs uppercase tracking-wider transition-all duration-300"
              >
                <Download size={14} />
                Download PDF
              </a>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs uppercase tracking-wider glow-subtle hover:bg-gold-glow transition-all duration-300"
              >
                <Printer size={14} />
                Print Resume
              </button>
            </div>
          </motion.div>

          {/* Resume Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="surface-elevated border border-border p-8 md:p-12 print:border-0 print:shadow-none print:p-0"
          >
            {/* Header */}
            <header className="text-center mb-8 pb-6 border-b border-border print:border-black/20">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 print:text-black">
                Zachary Smith
              </h1>
              <p className="text-primary text-sm mb-4 print:text-gray-700">
                Restructuring Analyst Candidate
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground text-xs print:text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} />
                  Mobile, AL
                </span>
                <span className="inline-flex items-center gap-1">
                  <Mail size={12} />
                  zac.ty.smith@gmail.com
                </span>
                <span className="inline-flex items-center gap-1">
                  <Linkedin size={12} />
                  linkedin.com/in/zachary-smith
                </span>
              </div>
            </header>

            {/* Professional Summary */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-3 uppercase tracking-wider print:text-black">
                Professional Summary
              </h2>
              <div className="gold-line-left w-16 mb-4 print:hidden" />
              <p className="text-muted-foreground text-sm leading-[1.8] print:text-gray-700">
                Finance student at the University of Mobile (Dec 2026), U.S. Army veteran, and
                former founder of a restoration company he took through a restructuring. Scaled
                Best Option Restoration from $0 to $100K in monthly revenue within 5 months
                before 90–120 day insurance collection cycles produced an 18-month creditor
                workout and orderly wind-down. Internships and programs with Pivoton Capital,
                Goldman Sachs, Citi, Morgan Stanley, and BlockCrowd. Seeking full-time 2027
                analyst roles in restructuring, credit, and distressed investing.
              </p>
            </section>

            {/* Experience */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-3 uppercase tracking-wider print:text-black">
                Experience
              </h2>
              <div className="gold-line-left w-16 mb-4 print:hidden" />
              <div className="space-y-6">
                {/* Gulf Coast Restoration */}
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <h3 className="text-base font-semibold text-foreground print:text-black">
                      Gulf Coast Restoration Group
                    </h3>
                    <span className="text-muted-foreground text-xs print:text-gray-600">
                      2024 – 2025
                    </span>
                  </div>
                  <p className="text-primary text-xs mb-2 print:text-gray-700">
                    Founder & CEO | Mobile, AL & Pensacola, FL
                  </p>
                  <ul className="space-y-1 text-muted-foreground text-xs print:text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-primary print:text-gray-500">•</span>
                      Raised $300K institutional capital via scenario-based growth modeling and valuation analysis
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary print:text-gray-500">•</span>
                      Scaled to $100K monthly revenue within 5 months; managed P&L and 8-person field team
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary print:text-gray-500">•</span>
                      Built 13-week cash flow models navigating 90-120 day insurance collection cycles
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary print:text-gray-500">•</span>
                      Executed controlled wind-down following going-concern vs. liquidation analysis; returned majority of investor capital
                    </li>
                  </ul>
                </div>

                {/* Goldman Sachs */}
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <h3 className="text-base font-semibold text-foreground print:text-black">
                      Goldman Sachs
                    </h3>
                    <span className="text-muted-foreground text-xs print:text-gray-600">
                      Summer 2019
                    </span>
                  </div>
                  <p className="text-primary text-xs mb-2 print:text-gray-700">
                    Summer Insight Program — Sales & Trading | New York, NY
                  </p>
                  <ul className="space-y-1 text-muted-foreground text-xs print:text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-primary print:text-gray-500">•</span>
                      Selected from 2,800+ applicants for competitive program in fixed income and equities divisions
                    </li>
                  </ul>
                </div>

                {/* BlockCrowd */}
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <h3 className="text-base font-semibold text-foreground print:text-black">
                      BlockCrowd Financial Group
                    </h3>
                    <span className="text-muted-foreground text-xs print:text-gray-600">
                      Winter 2019
                    </span>
                  </div>
                  <p className="text-primary text-xs mb-2 print:text-gray-700">
                    Investment Banking Winter Analyst | New York, NY
                  </p>
                  <ul className="space-y-1 text-muted-foreground text-xs print:text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-primary print:text-gray-500">•</span>
                      Built pitch materials, financial models (DCF, LBO, comps), and valuation analyses for M&A and capital raises
                    </li>
                  </ul>
                </div>

                {/* Pivoton Capital */}
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <h3 className="text-base font-semibold text-foreground print:text-black">
                      Pivoton Capital
                    </h3>
                    <span className="text-muted-foreground text-xs print:text-gray-600">
                      Spring 2019
                    </span>
                  </div>
                  <p className="text-primary text-xs mb-2 print:text-gray-700">
                    Private Equity Spring Analyst | Stamford, CT
                  </p>
                  <ul className="space-y-1 text-muted-foreground text-xs print:text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-primary print:text-gray-500">•</span>
                      Built LBO and DCF models for Voxco acquisition ($34M EV); prepared IC materials supporting 2024 portfolio exit
                    </li>
                  </ul>
                </div>

                {/* U.S. Army */}
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <h3 className="text-base font-semibold text-foreground print:text-black">
                      U.S. Army — 4th Infantry Division
                    </h3>
                    <span className="text-muted-foreground text-xs print:text-gray-600">
                      2013 – 2017
                    </span>
                  </div>
                  <p className="text-primary text-xs mb-2 print:text-gray-700">
                    Specialist — Infantry & Security | Ft. Carson, CO
                  </p>
                  <ul className="space-y-1 text-muted-foreground text-xs print:text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-primary print:text-gray-500">•</span>
                      Provided security coordination during visits by senior government officials including a former U.S. President
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary print:text-gray-500">•</span>
                      Honorable discharge after four years of service
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Early Insight Programs */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-3 uppercase tracking-wider print:text-black">
                Early Insight Programs
              </h2>
              <div className="gold-line-left w-16 mb-4 print:hidden" />
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground print:text-black">
                    Citi — IB Early ID Program
                  </h3>
                  <p className="text-muted-foreground text-xs print:text-gray-600">
                    Jan – Mar 2019
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground print:text-black">
                    Morgan Stanley — WM Winter Analyst
                  </h3>
                  <p className="text-muted-foreground text-xs print:text-gray-600">
                    Dec 2018 – Mar 2019
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground print:text-black">
                    Morgan Stanley — IB Military Early Insight
                  </h3>
                  <p className="text-muted-foreground text-xs print:text-gray-600">
                    Nov 2018
                  </p>
                </div>
              </div>
            </section>

            {/* Education */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-3 uppercase tracking-wider print:text-black">
                Education
              </h2>
              <div className="gold-line-left w-16 mb-4 print:hidden" />
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <h3 className="text-base font-semibold text-foreground print:text-black">
                  University of Mobile
                </h3>
                <span className="text-muted-foreground text-xs print:text-gray-600">
                  Expected December 2026
                </span>
              </div>
              <p className="text-primary text-xs mb-2 print:text-gray-700">
                Bachelor of Science in Finance | GPA: 3.71
              </p>
              <p className="text-muted-foreground text-xs print:text-gray-700">
                Relevant Coursework: Financial Statement Analysis, Corporate Finance, Investments, Accounting
              </p>
            </section>

            {/* Skills */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-3 uppercase tracking-wider print:text-black">
                Skills & Certifications
              </h2>
              <div className="gold-line-left w-16 mb-4 print:hidden" />
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 print:text-black">
                    Technical Skills
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed print:text-gray-700">
                    Financial Modeling (DCF, LBO, Comps) • Capital Structure Analysis •
                    Liquidation Waterfalls • 13-Week Cash Flow • Excel/Google Sheets •
                    Bloomberg Terminal • CapIQ • Pitchbook
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 print:text-black">
                    Industry Knowledge
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed print:text-gray-700">
                    Distressed Debt • Restructuring • Chapter 11 Bankruptcy • Special Situations •
                    Credit Analysis • Covenant Analysis • Working Capital Management
                  </p>
                </div>
              </div>
            </section>

            {/* Additional */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3 uppercase tracking-wider print:text-black">
                Additional
              </h2>
              <div className="gold-line-left w-16 mb-4 print:hidden" />
              <p className="text-muted-foreground text-xs leading-relaxed print:text-gray-700">
                <strong className="text-foreground print:text-black">Interests:</strong> Distance running (5:52 mile PR), restructuring case studies, financial history
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed mt-2 print:text-gray-700">
                <strong className="text-foreground print:text-black">Military:</strong> U.S. Army Veteran, Honorable Discharge, Security Clearance (inactive)
              </p>
            </section>
          </motion.div>
        </main>

        <div className="print:hidden">
          <Footer />
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          nav, footer, .print\\:hidden {
            display: none !important;
          }
          .surface-elevated {
            background: white !important;
            border: none !important;
          }
          .gold-line-left {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default Resume;
