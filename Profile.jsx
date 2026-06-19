import React, { useState, useEffect } from "react";
import { useFinancials } from "../context/FinancialContext";
import { 
  User, 
  CreditCard, 
  Trash2, 
  Plus, 
  Percent,
  Lock,
  Globe,
  Plane,
  Wallet,
  Gift,
  CheckSquare
} from "lucide-react";

export default function Profile() {
  const { 
    profile, 
    cards, 
    updateProfile, 
    addCard, 
    deleteCard 
  } = useFinancials();

  // Profile Form States
  const [income, setIncome] = useState(profile.income);
  const [housing, setHousing] = useState(profile.housingPayment);
  const [otherDebt, setOtherDebt] = useState(profile.otherDebtPayments);
  const savings = Math.max(0, Number(income) - Number(housing) - Number(otherDebt));
  const [lateCount, setLateCount] = useState(profile.latePaymentsCount);
  const [employment, setEmployment] = useState(profile.employmentStatus);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Credit Card Form States
  const [cardName, setCardName] = useState("");
  const [cardLimit, setCardLimit] = useState("");
  const [cardBalance, setCardBalance] = useState("");
  const [cardApr, setCardApr] = useState("");
  const [cardError, setCardError] = useState("");

  // Card Controls (Persisted locally)
  const [cardFrozen, setCardFrozen] = useState(false);
  const [allowOnline, setAllowOnline] = useState(true);
  const [allowInternational, setAllowInternational] = useState(false);
  const [atmCashout, setAtmCashout] = useState(false);

  // Rewards state
  const [points, setPoints] = useState(2450);

  // Load local state configurations
  useEffect(() => {
    const frozen = localStorage.getItem("aura_card_frozen") === "true";
    const pts = parseInt(localStorage.getItem("aura_rewards_points") || "2450");
    setCardFrozen(frozen);
    setPoints(pts);
  }, []);

  const saveFrozenState = (val) => {
    setCardFrozen(val);
    localStorage.setItem("aura_card_frozen", val ? "true" : "false");
  };

  const savePointsState = (val) => {
    setPoints(val);
    localStorage.setItem("aura_rewards_points", val.toString());
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (income <= 0 || housing < 0 || otherDebt < 0 || lateCount < 0) {
      alert("Please enter valid positive numbers.");
      return;
    }

    updateProfile({
      income: Number(income),
      housingPayment: Number(housing),
      otherDebtPayments: Number(otherDebt),
      currentSavings: Number(savings),
      latePaymentsCount: Number(lateCount),
      employmentStatus: employment
    });

    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    setCardError("");

    if (!cardName || !cardLimit || !cardBalance || !cardApr) {
      setCardError("All credit card fields are required.");
      return;
    }

    const limitNum = Number(cardLimit);
    const balanceNum = Number(cardBalance);
    const aprNum = Number(cardApr);

    if (limitNum <= 0 || balanceNum < 0 || aprNum < 0) {
      setCardError("Please enter valid numbers.");
      return;
    }

    if (balanceNum > limitNum) {
      setCardError("Balance cannot be higher than limit.");
      return;
    }

    addCard({
      name: cardName,
      limit: limitNum,
      balance: balanceNum,
      apr: aprNum
    });

    setCardName("");
    setCardLimit("");
    setCardBalance("");
    setCardApr("");
  };

  const redeemPoints = (cost, label) => {
    if (points < cost) {
      alert("Insufficient rewards points balance");
      return;
    }
    const newPoints = points - cost;
    savePointsState(newPoints);
    alert(`Successfully redeemed points for: ${label}`);
  };

  const getLenderOdds = () => {
    const score = profile.income > 50000 && profile.latePaymentsCount === 0 ? 760 : 580;
    if (score >= 750) return { prob: "Pre-Approved", color: "var(--success)" };
    if (score >= 650) return { prob: "High Probability", color: "var(--primary)" };
    return { prob: "Medium/Low Odds", color: "var(--danger)" };
  };

  return (
    <section aria-label="User Financial Profile settings">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
            Underwriting Configurations
          </span>
          <h2 className="page-title">Profile Settings</h2>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Base Parameters */}
        <div className="card grid-span-2">
          <h3 className="card-title">
            <User size={18} />
            Modify Financial Metrics
          </h3>

          {profileSuccess && (
            <div className="alert-box info" style={{ padding: "12px", marginBottom: "20px" }}>
              <p>Profile metrics updated and score re-calculated!</p>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="income-input">Monthly Net Income (₹)</label>
              <input 
                id="income-input"
                type="number" 
                required 
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="savings-input">Calculated Savings Balance (₹)</label>
              <input 
                id="savings-input"
                type="number" 
                disabled
                value={savings}
                style={{ opacity: 0.7, cursor: "not-allowed" }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="housing-input">Monthly Rent / House EMI (₹)</label>
              <input 
                id="housing-input"
                type="number" 
                required 
                value={housing}
                onChange={(e) => setHousing(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="debt-input">Other Monthly EMIs (₹)</label>
              <input 
                id="debt-input"
                type="number" 
                required 
                value={otherDebt}
                onChange={(e) => setOtherDebt(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="late-count-input">Late Payment Flags Count</label>
              <input 
                id="late-count-input"
                type="number" 
                required 
                min="0"
                value={lateCount}
                onChange={(e) => setLateCount(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="employment-select">Employment Status</label>
              <select 
                id="employment-select"
                value={employment} 
                onChange={(e) => setEmployment(e.target.value)}
              >
                <option value="employed">Employed (Salaried)</option>
                <option value="self_employed">Self-Employed (Business)</option>
                <option value="unemployed">Unemployed</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ gridColumn: "span 2", marginTop: "10px" }}
              aria-label="Save profile and recalculate score"
            >
              Save Profile Parameters
            </button>
          </form>
        </div>

        {/* Right Column: Manage Credit Cards */}
        <div className="card grid-span-1" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h3 className="card-title">
              <CreditCard size={18} />
              Add Credit Card
            </h3>

            {cardError && (
              <div className="alert-box danger" style={{ padding: "10px", fontSize: "12px", marginBottom: "14px" }}>
                <p>{cardError}</p>
              </div>
            )}

            <form onSubmit={handleAddCard} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input 
                type="text" 
                required 
                placeholder="Card Issuer (e.g. SBI, HDFC)" 
                style={{ padding: "8px 12px", background: "var(--bg-inner)", border: "1px solid var(--border-light)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "12px" }}
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />

              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <span style={{ position: "absolute", left: "8px", top: "8px", color: "var(--text-muted)", fontSize: "11px", fontWeight: "600" }}>₹</span>
                  <input 
                    type="number" 
                    required 
                    placeholder="Limit" 
                    style={{ width: "100%", padding: "8px 8px 8px 20px", background: "var(--bg-inner)", border: "1px solid var(--border-light)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "12px" }}
                    value={cardLimit}
                    onChange={(e) => setCardLimit(e.target.value)}
                  />
                </div>

                <div style={{ position: "relative", flex: 1 }}>
                  <span style={{ position: "absolute", left: "8px", top: "8px", color: "var(--text-muted)", fontSize: "11px", fontWeight: "600" }}>₹</span>
                  <input 
                    type="number" 
                    required 
                    placeholder="Balance" 
                    style={{ width: "100%", padding: "8px 8px 8px 20px", background: "var(--bg-inner)", border: "1px solid var(--border-light)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "12px" }}
                    value={cardBalance}
                    onChange={(e) => setCardBalance(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ position: "relative" }}>
                <Percent size={12} style={{ position: "absolute", left: "8px", top: "11px", color: "var(--text-muted)" }} />
                <input 
                  type="number" 
                  required 
                  step="0.01"
                  placeholder="APR Rate %" 
                  style={{ width: "100%", padding: "8px 8px 8px 20px", background: "var(--bg-inner)", border: "1px solid var(--border-light)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "12px" }}
                  value={cardApr}
                  onChange={(e) => setCardApr(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-secondary btn-full" style={{ padding: "8px" }}>
                <Plus size={14} />
                <span>Add Card Account</span>
              </button>
            </form>
          </div>

          <div>
            <h3 className="card-title">Active Credit Cards</h3>
            {cards.length === 0 ? (
              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>No credit cards linked.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {cards.map(c => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-light)", padding: "10px 14px", borderRadius: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{c.name}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        Bal: ₹{c.balance.toLocaleString("en-IN")} / Limit: ₹{c.limit.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="badge badge-blue" style={{ fontSize: "10px" }}>{c.apr}% APR</span>
                      <button 
                        onClick={() => deleteCard(c.id)}
                        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                        aria-label={`Unlink card ${c.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NEW SECTION: CredShield Card Operations Panel & Rewards */}
      <div className="dashboard-grid" style={{ marginTop: "24px" }}>
        
        {/* Card Mockup visual block */}
        <div className="card">
          <h3 className="card-title"><CreditCard size={18} /> Mock Card Visualizer</h3>
          
          <div className="credit-card-wrapper">
            <div className={`credit-card ${cardFrozen ? "frozen" : ""}`} style={{ maxWidth: "340px", height: "190px" }}>
              <div className="card-glass-glow"></div>
              <div className="card-top">
                <span className="card-brand" style={{ color: "white" }}>AURA PREMIUM</span>
                <div className="card-chip"></div>
              </div>
              <div className="card-number" style={{ fontSize: "1.15rem", margin: "1rem 0" }}>•••• •••• •••• 1045</div>
              <div className="card-bottom">
                <div>
                  <div className="card-label">Card Holder</div>
                  <div className="card-holder" style={{ color: "white" }}>{localStorage.getItem("userName") || "Valued Customer"}</div>
                </div>
                <div>
                  <div className="card-label">Expiry</div>
                  <div style={{ color: "white" }}>12/30</div>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-toggle-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <div className={`toggle-card ${cardFrozen ? "active" : ""}`} onClick={() => saveFrozenState(!cardFrozen)} style={{ padding: "8px", border: "1px solid var(--border-light)", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <span style={{ fontSize: "11px", fontWeight: "600" }}><Lock size={12} style={{ marginRight: "4px", display: "inline" }} /> Freeze</span>
              <label className="switch">
                <input type="checkbox" checked={cardFrozen} readOnly />
                <span className="slider-toggle"></span>
              </label>
            </div>

            <div className={`toggle-card ${allowOnline ? "active" : ""}`} onClick={() => setAllowOnline(!allowOnline)} style={{ padding: "8px", border: "1px solid var(--border-light)", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <span style={{ fontSize: "11px", fontWeight: "600" }}><Globe size={12} style={{ marginRight: "4px", display: "inline" }} /> Online</span>
              <label className="switch">
                <input type="checkbox" checked={allowOnline} readOnly />
                <span className="slider-toggle"></span>
              </label>
            </div>

            <div className={`toggle-card ${allowInternational ? "active" : ""}`} onClick={() => setAllowInternational(!allowInternational)} style={{ padding: "8px", border: "1px solid var(--border-light)", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <span style={{ fontSize: "11px", fontWeight: "600" }}><Plane size={12} style={{ marginRight: "4px", display: "inline" }} /> Intl</span>
              <label className="switch">
                <input type="checkbox" checked={allowInternational} readOnly />
                <span className="slider-toggle"></span>
              </label>
            </div>

            <div className={`toggle-card ${atmCashout ? "active" : ""}`} onClick={() => setAtmCashout(!atmCashout)} style={{ padding: "8px", border: "1px solid var(--border-light)", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <span style={{ fontSize: "11px", fontWeight: "600" }}><Wallet size={12} style={{ marginRight: "4px", display: "inline" }} /> ATM</span>
              <label className="switch">
                <input type="checkbox" checked={atmCashout} readOnly />
                <span className="slider-toggle"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Rewards Redemptions */}
        <div className="card">
          <h3 className="card-title"><Gift size={18} /> Rewards Tracker</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Available Points</span>
              <h3 style={{ fontSize: "24px", color: "var(--warning)", fontWeight: "800" }}>{points} pts</h3>
            </div>
            <span className="badge badge-yellow">Platinum Tier</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-inner)", padding: "8px 12px", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "600" }}>₹500 Amazon Voucher</span>
              <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => redeemPoints(500, "₹500 Amazon Voucher")}>Redeem 500</button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-inner)", padding: "8px 12px", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "600" }}>₹1000 Cashback Voucher</span>
              <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => redeemPoints(1000, "₹1000 Cashback Statement Credit")}>Redeem 1000</button>
            </div>
          </div>
        </div>

        {/* Lender Matched odds */}
        <div className="card">
          <h3 className="card-title"><CheckSquare size={18} /> Pre-Check Lender Matches</h3>
          <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "12px" }}>
            Dynamically pre-qualified loan deals. Apply without affecting credit files.
          </p>

          <div className="lender-grid" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-inner)", padding: "10px", borderRadius: "8px", fontSize: "12px" }}>
              <div>
                <strong>HDFC Card Offer</strong>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Limit up to ₹2 Lakhs</div>
              </div>
              <span className="badge badge-green" style={{ background: getLenderOdds().color, color: "white" }}>
                {getLenderOdds().prob}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-inner)", padding: "10px", borderRadius: "8px", fontSize: "12px" }}>
              <div>
                <strong>slice Instant EMI</strong>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>UPI Credit line</div>
              </div>
              <span className="badge badge-green" style={{ background: "var(--success)", color: "white" }}>
                Pre-Approved
              </span>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}
