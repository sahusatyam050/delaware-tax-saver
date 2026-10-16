import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Calculator, 
  Copy, 
  Check, 
  Printer, 
  Share2, 
  ExternalLink, 
  HelpCircle, 
  Sparkles,
  ChevronDown,
  Building2,
  FileText,
  DollarSign
} from 'lucide-react';

interface Preset {
  id: string;
  name: string;
  auth: number;
  issued: number;
  assets: number;
  par: number;
}

const PRESETS: Preset[] = [
  {
    id: 'stripe-atlas',
    name: '🚀 Standard Stripe Atlas / Clerky',
    auth: 10000000,
    issued: 8000000,
    assets: 25000,
    par: 0.0001,
  },
  {
    id: 'pre-revenue',
    name: '🌱 Pre-Revenue / Bootstrapped',
    auth: 10000000,
    issued: 5000000,
    assets: 5000,
    par: 0.00001,
  },
  {
    id: 'funded-seed',
    name: '💼 Funded Seed ($1.5M Cash)',
    auth: 10000000,
    issued: 9000000,
    assets: 1500000,
    par: 0.0001,
  },
  {
    id: 'solo-founder',
    name: '⚡ Solo Founder (5M Shares)',
    auth: 5000000,
    issued: 5000000,
    assets: 2000,
    par: 0.0001,
  }
];

export const App: React.FC = () => {
  const [entityType, setEntityType] = useState<'corp' | 'llc'>('corp');
  const [activePreset, setActivePreset] = useState<string>('stripe-atlas');
  
  // Corporation Inputs
  const [authorizedShares, setAuthorizedShares] = useState<number>(10000000);
  const [issuedShares, setIssuedShares] = useState<number>(8000000);
  const [grossAssets, setGrossAssets] = useState<number>(25000);
  const [statedParValue, setStatedParValue] = useState<number>(0.0001);

  // UI helpers
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; mins: number }>({ days: 0, hours: 0, mins: 0 });

  // Countdown to March 1 (next deadline)
  useEffect(() => {
    const calcDeadline = () => {
      const now = new Date();
      let targetYear = now.getFullYear();
      let deadline = new Date(targetYear, 2, 1, 23, 59, 59); // March 1st
      if (now > deadline) {
        deadline = new Date(targetYear + 1, 2, 1, 23, 59, 59);
      }
      const diff = deadline.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / 1000 / 60) % 60);
      setTimeLeft({ days, hours, mins });
    };

    calcDeadline();
    const interval = setInterval(calcDeadline, 60000);
    return () => clearInterval(interval);
  }, []);

  // Parse URL Hash on Load
  useEffect(() => {
    try {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const params = new URLSearchParams(hash);
        if (params.has('auth')) setAuthorizedShares(Number(params.get('auth')) || 10000000);
        if (params.has('issued')) setIssuedShares(Number(params.get('issued')) || 8000000);
        if (params.has('assets')) setGrossAssets(Number(params.get('assets')) || 25000);
        if (params.has('par')) setStatedParValue(Number(params.get('par')) || 0.0001);
        if (params.has('type')) setEntityType(params.get('type') === 'llc' ? 'llc' : 'corp');
        setActivePreset('custom');
      }
    } catch {
      // fallback to defaults
    }
  }, []);

  // Update URL hash when values change
  const updateHash = (auth: number, issued: number, assets: number, par: number, type: 'corp' | 'llc') => {
    const params = new URLSearchParams();
    params.set('auth', auth.toString());
    params.set('issued', issued.toString());
    params.set('assets', assets.toString());
    params.set('par', par.toString());
    params.set('type', type);
    window.history.replaceState(null, '', `#${params.toString()}`);
  };

  const handleApplyPreset = (preset: Preset) => {
    setActivePreset(preset.id);
    setAuthorizedShares(preset.auth);
    setIssuedShares(preset.issued);
    setGrossAssets(preset.assets);
    setStatedParValue(preset.par);
    updateHash(preset.auth, preset.issued, preset.assets, preset.par, entityType);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  // --- MATHEMATICAL TAX ENGINE (8 Del. C. § 503) ---

  // 1. Authorized Shares Method
  const calculateAuthorizedSharesMethod = (shares: number): number => {
    if (shares <= 5000) return 175;
    if (shares <= 10000) return 250;
    const extraShares = shares - 10000;
    const blocks = Math.ceil(extraShares / 10000);
    const tax = 250 + (blocks * 85);
    return Math.min(tax, 200000);
  };

  const authorizedTax = calculateAuthorizedSharesMethod(authorizedShares);
  const authorizedReportFee = 50;
  const authorizedTotalBill = authorizedTax + authorizedReportFee;

  // 2. Assumed Par Value Capital Method
  const validIssued = issuedShares > 0 ? issuedShares : 1;
  const assumedParValue = grossAssets / validIssued;
  const effectivePar = Math.max(assumedParValue, statedParValue);
  const assumedParValueCapital = authorizedShares * effectivePar;
  const millionBlocks = Math.max(1, Math.ceil(assumedParValueCapital / 1000000));
  const rawAssumedTax = millionBlocks * 400;
  const assumedTax = Math.max(400, Math.min(rawAssumedTax, 200000));
  const assumedReportFee = 50;
  const assumedTotalBill = assumedTax + assumedReportFee;

  // 3. Savings
  const savings = Math.max(0, authorizedTotalBill - assumedTotalBill);
  const savingsPct = authorizedTotalBill > 0 ? ((savings / authorizedTotalBill) * 100).toFixed(1) : '0';

  // Copy helper
  const triggerCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Copy AI Prompt / Citation
  const copyAiCitation = () => {
    const citation = `Delaware Franchise Tax Calculation (Assumed Par Value Capital Method - 8 Del. C. § 503):
• Entity: Delaware General Corporation
• Authorized Shares: ${authorizedShares.toLocaleString()}
• Issued Shares: ${issuedShares.toLocaleString()}
• Total Gross Assets (IRS Form 1120 Schedule L): $${grossAssets.toLocaleString()}
• Assumed Par Value: $${assumedParValue.toFixed(6)}
• Assumed Par Value Capital: $${assumedParValueCapital.toLocaleString(undefined, { maximumFractionDigits: 2 })}
• Calculated Tax: $${assumedTax.toLocaleString()}.00 (+ $50 Annual Report Fee = $${assumedTotalBill.toLocaleString()}.00 Total)
• Default Authorized Shares Bill: $${authorizedTotalBill.toLocaleString()}.00
• Net Legal Tax Savings: $${savings.toLocaleString()}.00 (${savingsPct}% Reduction)
Verified with TaxDrop DE: https://delaware-tax-saver.vercel.app/`;
    triggerCopy(citation, 'ai-citation');
  };

  return (
    <div className="container">
      {/* Urgency Notification Banner */}
      <aside className="urgency-banner" aria-label="Deadline alert">
        <div className="urgency-left">
          <div className="pulse-dot"></div>
          <strong>Delaware Tax Deadline:</strong>
          <span>Corporations must file & pay by March 1st. Avoid $200 late penalty + 1.5% monthly interest.</span>
        </div>
        <div className="countdown-box">
          ⏳ {timeLeft.days}d {timeLeft.hours}h {timeLeft.mins}m Remaining
        </div>
      </aside>

      {/* Header */}
      <header className="site-header">
        <div className="logo-group">
          <div className="logo-icon">
            <ShieldCheck size={26} color="#FFFFFF" />
          </div>
          <div className="logo-text">
            <h1>TaxDrop DE <span className="badge-official">8 Del. C. § 503</span></h1>
          </div>
        </div>

        <div className="header-actions" style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn-secondary" 
            onClick={() => {
              triggerCopy(window.location.href, 'share-url');
            }}
            title="Copy Sharable Link with Pre-filled Calculation"
          >
            {copiedType === 'share-url' ? <Check size={16} /> : <Share2 size={16} />}
            {copiedType === 'share-url' ? 'Link Copied!' : 'Share Link'}
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => window.print()}
            title="Print or Save Official Calculation PDF"
          >
            <Printer size={16} />
            Print Certificate
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pill">
          <Sparkles size={14} />
          Don't Panic — You Almost Certainly Do Not Owe $85k
        </div>
        <h2 className="hero-title">
          Don't Pay Delaware <span className="strike">$85,165</span>.<br />
          Pay Your Legal <span className="green-glow">$400</span> Tax.
        </h2>
        <p className="hero-desc">
          When formation services like Stripe Atlas or Clerky set up your Delaware C-Corp with 10M shares, the State sends a shocking bill calculated via the <strong>Authorized Shares Method</strong>. Use the official <strong>Assumed Par Value Capital Method</strong> to drop it to the legal minimum in 60 seconds.
        </p>
      </section>

      {/* Entity Switcher */}
      <nav className="entity-toggle" aria-label="Select entity type">
        <button 
          className={`toggle-btn ${entityType === 'corp' ? 'active' : ''}`}
          onClick={() => {
            setEntityType('corp');
            updateHash(authorizedShares, issuedShares, grossAssets, statedParValue, 'corp');
          }}
        >
          <Building2 size={16} />
          Delaware C-Corporation (10M Shares)
        </button>
        <button 
          className={`toggle-btn ${entityType === 'llc' ? 'active' : ''}`}
          onClick={() => {
            setEntityType('llc');
            updateHash(authorizedShares, issuedShares, grossAssets, statedParValue, 'llc');
          }}
        >
          <FileText size={16} />
          Delaware LLC (Flat $300 Tax)
        </button>
      </nav>

      {entityType === 'llc' ? (
        /* Delaware LLC View */
        <section className="llc-card">
          <ShieldCheck size={48} color="#10B981" style={{ margin: '0 auto 16px' }} />
          <h2>Delaware LLCs Pay a Flat $300 Annual Tax</h2>
          <p className="hero-desc" style={{ marginTop: '12px' }}>
            Good news! If your company is a <strong>Delaware Limited Liability Company (LLC)</strong>, you do <em>not</em> need to calculate authorized shares, gross assets, or par value.
          </p>
          <div className="llc-amount">$300.00 / year</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '520px', margin: '0 auto 24px' }}>
            Delaware LLCs are charged a flat annual tax of $300, due on or before <strong>June 1st</strong> of each year. LLCs do not file an Annual Report (no $50 filing fee).
          </p>
          <a 
            href="https://corp.delaware.gov/paytaxes/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-primary" 
            style={{ display: 'inline-flex', width: 'auto', margin: '0 auto' }}
          >
            Go to Official Delaware LLC Payment Portal <ExternalLink size={16} />
          </a>
        </section>
      ) : (
        /* Delaware Corporation View */
        <>
          {/* Quick 1-Click Presets */}
          <div className="presets-row">
            <span className="presets-label">Common Presets:</span>
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                className={`preset-chip ${activePreset === preset.id ? 'active' : ''}`}
                onClick={() => handleApplyPreset(preset)}
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Main Calculation Grid */}
          <main className="calc-grid">
            {/* Input Card */}
            <section className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Calculator size={20} color="#3B82F6" />
                  Your Corporate Balance Sheet
                </h3>
                <p className="card-subtitle">
                  Data from your corporate capitalization table and IRS Form 1120.
                </p>
              </div>

              {/* Total Authorized Shares */}
              <div className="form-group">
                <label className="form-label" htmlFor="auth-shares">
                  <span>Total Authorized Shares</span>
                  <span className="input-hint" title="Found in your Certificate of Incorporation">
                    <HelpCircle size={13} /> Cert of Inc.
                  </span>
                </label>
                <div className="input-wrapper">
                  <input
                    id="auth-shares"
                    type="number"
                    className="text-input"
                    value={authorizedShares || ''}
                    onChange={(e) => {
                      const val = Math.max(1, Number(e.target.value) || 0);
                      setAuthorizedShares(val);
                      setActivePreset('custom');
                      updateHash(val, issuedShares, grossAssets, statedParValue, entityType);
                    }}
                  />
                </div>
                <div className="quick-shares-row">
                  <button className="quick-share-btn" onClick={() => { setAuthorizedShares(10000000); setActivePreset('custom'); }}>10M (Standard)</button>
                  <button className="quick-share-btn" onClick={() => { setAuthorizedShares(5000000); setActivePreset('custom'); }}>5M</button>
                  <button className="quick-share-btn" onClick={() => { setAuthorizedShares(1000000); setActivePreset('custom'); }}>1M</button>
                  <button className="quick-share-btn" onClick={() => { setAuthorizedShares(20000000); setActivePreset('custom'); }}>20M</button>
                </div>
              </div>

              {/* Total Issued Shares */}
              <div className="form-group">
                <label className="form-label" htmlFor="issued-shares">
                  <span>Total Issued Shares</span>
                  <span className="input-hint" title="Total shares actually allocated to founders, employees, and investors">
                    <HelpCircle size={13} /> Cap Table
                  </span>
                </label>
                <div className="input-wrapper">
                  <input
                    id="issued-shares"
                    type="number"
                    className="text-input"
                    value={issuedShares || ''}
                    onChange={(e) => {
                      const val = Math.max(1, Number(e.target.value) || 0);
                      setIssuedShares(val);
                      setActivePreset('custom');
                      updateHash(authorizedShares, val, grossAssets, statedParValue, entityType);
                    }}
                  />
                </div>
                {issuedShares > authorizedShares && (
                  <p style={{ color: 'var(--rose)', fontSize: '12px', marginTop: '4px' }}>
                    ⚠️ Issued shares cannot exceed authorized shares.
                  </p>
                )}
              </div>

              {/* Total Gross Assets */}
              <div className="form-group">
                <label className="form-label" htmlFor="gross-assets">
                  <span>Total Gross Assets ($ USD)</span>
                  <span className="input-hint" title="Form 1120, Page 4, Schedule L, Line 15, column (d). Pre-revenue? Use Dec 31 bank balance.">
                    <HelpCircle size={13} /> Form 1120 Sched L
                  </span>
                </label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    id="gross-assets"
                    type="number"
                    className="text-input has-prefix"
                    value={grossAssets || ''}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value) || 0);
                      setGrossAssets(val);
                      setActivePreset('custom');
                      updateHash(authorizedShares, issuedShares, val, statedParValue, entityType);
                    }}
                  />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '5px' }}>
                  💡 <strong>Where to find this:</strong> Line 15, Column (d) on IRS Form 1120 Schedule L. If filing for your first year, use total cash in bank as of Dec 31st.
                </p>
              </div>

              {/* Stated Par Value */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="par-value">
                  <span>Stated Par Value per Share</span>
                  <span className="input-hint" title="Usually $0.0001 or $0.00001">
                    <HelpCircle size={13} /> Formation Docs
                  </span>
                </label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    id="par-value"
                    type="number"
                    step="0.00001"
                    className="text-input has-prefix"
                    value={statedParValue || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0.0001;
                      setStatedParValue(val);
                      setActivePreset('custom');
                      updateHash(authorizedShares, issuedShares, grossAssets, val, entityType);
                    }}
                  />
                </div>
              </div>
            </section>

            {/* Results Output Card */}
            <section className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <DollarSign size={20} color="#10B981" />
                  Tax Comparison & Legal Verdict
                </h3>
                <p className="card-subtitle">
                  Under 8 Del. C. § 503, you are legally entitled to pay whichever method is lower.
                </p>
              </div>

              {/* Savings Banner */}
              <div className="savings-banner">
                <div className="savings-left">
                  <div className="savings-icon-wrap">
                    <Sparkles size={22} />
                  </div>
                  <div className="savings-text">
                    <h4>Your Legal Tax Savings</h4>
                    <p>${savings.toLocaleString()}</p>
                  </div>
                </div>
                <div className="savings-pct-badge">
                  Save {savingsPct}%
                </div>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="comparison-container">
                {/* Method 1: The Trap */}
                <div className="comp-box bad">
                  <div className="comp-tag">
                    <AlertTriangle size={13} /> Default State Bill
                  </div>
                  <div className="comp-method-name">
                    Authorized Shares Method (What DE auto-sends)
                  </div>
                  <div className="comp-amount">
                    ${authorizedTotalBill.toLocaleString()}
                  </div>
                  <div className="comp-breakdown">
                    Tax: ${authorizedTax.toLocaleString()} + $50 Report Fee
                  </div>
                </div>

                {/* Method 2: The Real Legal Tax */}
                <div className="comp-box good">
                  <div className="comp-tag">
                    <ShieldCheck size={14} /> Legal Minimum
                  </div>
                  <div className="comp-method-name">
                    Assumed Par Value Capital Method (Your actual tax)
                  </div>
                  <div className="comp-amount">
                    ${assumedTotalBill.toLocaleString()}
                  </div>
                  <div className="comp-breakdown">
                    Tax: ${assumedTax.toLocaleString()} + $50 Report Fee
                  </div>
                </div>
              </div>

              {/* Step-by-Step Mathematical Proof */}
              <details className="steps-details">
                <summary>
                  <span>View Official Delaware Statutory Math Proof (8 Del. C. § 503)</span>
                  <ChevronDown size={14} />
                </summary>
                <div className="formula-card">
                  <div className="math-row">
                    <span className="math-label">1. Assumed Par Value:</span>
                    <span className="math-val">
                      ${grossAssets.toLocaleString()} ÷ {validIssued.toLocaleString()} = ${assumedParValue.toFixed(6)}
                    </span>
                  </div>
                  <div className="math-row">
                    <span className="math-label">2. Effective Par Value:</span>
                    <span className="math-val">
                      max(${assumedParValue.toFixed(6)}, ${statedParValue}) = ${effectivePar.toFixed(6)}
                    </span>
                  </div>
                  <div className="math-row">
                    <span className="math-label">3. Assumed Par Value Capital:</span>
                    <span className="math-val">
                      {authorizedShares.toLocaleString()} × ${effectivePar.toFixed(6)} = ${assumedParValueCapital.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="math-row">
                    <span className="math-label">4. Capital Tax Brackets ($400 / $1M):</span>
                    <span className="math-val">
                      {millionBlocks} Million Bracket × $400 = ${rawAssumedTax.toLocaleString()}
                    </span>
                  </div>
                  <div className="math-row">
                    <span className="math-label">5. Final Statutory Tax (Min $400):</span>
                    <span className="math-val">${assumedTax.toLocaleString()} + $50 = ${assumedTotalBill.toLocaleString()}</span>
                  </div>
                </div>
              </details>

              {/* Action Buttons */}
              <div className="action-buttons-group">
                <button 
                  className="btn-primary" 
                  onClick={() => triggerCopy(`${assumedTotalBill}`, 'tax-val')}
                >
                  {copiedType === 'tax-val' ? <Check size={16} /> : <Copy size={16} />}
                  Copy Legal Tax (${assumedTotalBill})
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={copyAiCitation}
                  title="Copy formatted formula & numbers for ChatGPT, Perplexity, or Claude"
                >
                  {copiedType === 'ai-citation' ? <Check size={16} /> : <Sparkles size={16} />}
                  Copy Citation for AI / CPA
                </button>
              </div>
            </section>
          </main>

          {/* Official Delaware Portal Cheat Sheet */}
          <section className="portal-guide-card">
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building2 size={22} color="#3B82F6" />
              Official Delaware Portal 5-Minute Filing Cheat Sheet
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '6px' }}>
              Follow these exact steps on the State of Delaware portal to make your $85,000 bill vanish:
            </p>

            <div className="guide-step-list">
              <div className="guide-step">
                <div className="step-num">1</div>
                <h4>Go to State Portal</h4>
                <p>Visit the official Delaware Division of Corporations portal and enter your 7-digit Entity File Number.</p>
                <a 
                  href="https://corp.delaware.gov/paytaxes/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '10px', fontSize: '13px' }}
                >
                  Open Delaware Portal <ExternalLink size={13} />
                </a>
              </div>

              <div className="guide-step">
                <div className="step-num">2</div>
                <h4>Enter Issued Shares</h4>
                <p>Scroll to the stock section. Do not alter authorized shares. Enter your exact issued shares:</p>
                <div className="copy-val-box">
                  <span>{issuedShares.toLocaleString()}</span>
                  <button 
                    className="copy-mini-btn" 
                    onClick={() => triggerCopy(issuedShares.toString(), 'issued-val')}
                    title="Copy value"
                  >
                    {copiedType === 'issued-val' ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="guide-step">
                <div className="step-num">3</div>
                <h4>Enter Gross Assets</h4>
                <p>Input your gross assets from Line 15, Schedule L of Form 1120 (or Dec 31 bank balance):</p>
                <div className="copy-val-box">
                  <span>${grossAssets.toLocaleString()}</span>
                  <button 
                    className="copy-mini-btn" 
                    onClick={() => triggerCopy(grossAssets.toString(), 'assets-val')}
                    title="Copy value"
                  >
                    {copiedType === 'assets-val' ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="guide-step">
                <div className="step-num">4</div>
                <h4>Click "Recalculate Tax"</h4>
                <p>Click the <strong>Recalculate Tax</strong> button. Delaware will immediately refresh the bill to <strong>${assumedTotalBill}</strong>. Complete your filing!</p>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Real Founder FAQ Section (Scraped from Reddit & Hacker News Pain Points) */}
      <section className="faq-section" id="faq">
        <div className="section-head">
          <h2>Frequently Asked Questions by Founders</h2>
          <p>Real questions asked by thousands of startup founders on Reddit and Hacker News every tax season.</p>
        </div>

        {[
          {
            q: "Why did Delaware send me an $85,165 bill if my startup made zero dollars?",
            a: "This is a rite of passage for first-time founders. Delaware's online portal defaults to the 'Authorized Shares Method'. Standard tech startups set up with 10,000,000 shares (via Stripe Atlas, Clerky, or LegalZoom) trigger a statutory calculation of $85,165. It completely ignores your revenue, profits, or funding. You do not owe $85,000; simply recalculate using the Assumed Par Value Capital Method."
          },
          {
            q: "Is it completely legal to switch to the Assumed Par Value Capital Method?",
            a: "Yes, 100% legal and standard procedure. Under Title 8, Section 503 of the Delaware General Corporation Law (8 Del. C. § 503), the State explicitly provides both methods and legally permits corporations to pay whichever method results in the lower tax amount. Over 95% of venture-backed startups use the Assumed Par Value Method."
          },
          {
            q: "Where exactly on IRS Form 1120 do I find 'Total Gross Assets'?",
            a: "Delaware law defines Gross Assets as the 'Total Assets' reported on U.S. Form 1120, Page 4, Schedule L, Line 15, Column (d) for the ending date of your company's fiscal year. If your startup is brand new or pre-revenue and has not filed Form 1120 yet, use your total corporate bank balance and capital assets as of December 31st."
          },
          {
            q: "What if I haven't issued any shares yet (Issued Shares = 0)?",
            a: "Do not put 0. If you enter 0 issued shares on the Delaware portal, the Assumed Par Value method cannot divide by zero and will revert back to the $85,000 bill. Check your founding documents or Board Consent—founders almost always receive an initial allocation of shares (e.g. 8,000,000 shares) upon incorporation."
          },
          {
            q: "What happens if I miss the March 1st deadline?",
            a: "Delaware imposes an immediate $200 late penalty plus a 1.5% monthly interest charge on the unpaid tax balance. It also puts your corporation into 'Not in Good Standing' status, preventing you from raising venture capital, taking bank loans, or registering in foreign states."
          },
          {
            q: "Does this calculation apply to Delaware LLCs?",
            a: "No! Delaware LLCs pay a flat annual tax of $300, due on or before June 1st of each year. LLCs do not file an Annual Report and do not pay the $50 filing fee or calculate par value."
          }
        ].map((item, idx) => (
          <div key={idx} className="faq-item">
            <button 
              className="faq-question" 
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              aria-expanded={openFaq === idx}
            >
              <span>{item.q}</span>
              <ChevronDown 
                size={18} 
                style={{ 
                  transform: openFaq === idx ? 'rotate(180deg)' : 'none', 
                  transition: 'transform 0.2s ease',
                  flexShrink: 0
                }} 
              />
            </button>
            {openFaq === idx && (
              <div className="faq-answer">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-links">
          <a href="https://corp.delaware.gov/" target="_blank" rel="noopener noreferrer">Delaware Division of Corporations</a>
          <span>•</span>
          <a href="https://delcode.delaware.gov/title8/c005/index.html" target="_blank" rel="noopener noreferrer">8 Del. C. § 503 Statute</a>
          <span>•</span>
          <a href="https://github.com/sahusatyam050" target="_blank" rel="noopener noreferrer">Built by Satyam Sahu</a>
        </div>
        <p>
          Disclaimer: TaxDrop DE is an educational calculation utility based on official Delaware statutory guidelines (8 Del. C. § 503). Not legal or certified tax advice. Always verify with your CPA or legal counsel before filing.
        </p>
      </footer>
    </div>
  );
};

export default App;
