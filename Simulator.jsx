import React, { useState, useEffect } from "react";
import { useFinancials } from "../context/FinancialContext";
import { 
  Sliders, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle, 
  Activity,
  Cog,
  AlertOctagon
} from "lucide-react";

// Comparative line chart for Simulator
function DualSVGLineChart({ currentData, simData }) {
  if (!currentData || !simData) return null;
  const width = 500;
  const height = 180;
  const padding = 35;

  const currentScores = currentData.map(d => d.score);
  const simScores = simData.map(d => d.score);
  const allScores = [...currentScores, ...simScores];

  const maxScore = Math.max(...allScores, 750);
  const minScore = Math.min(...allScores, 500) - 10;
  const scoreRange = maxScore - minScore;

  const getPoints = (data) => {
    return data.map((d, index) => {
      const x = padding + (index * (width - 2 * padding)) / (data.length - 1);
      const y = height - padding - ((d.score - minScore) * (height - 2 * padding)) / scoreRange;
      return `${x},${y}`;
    }).join(' ');
  };

  const currentPoints = getPoints(currentData);
  const simPoints = getPoints(simData);

  const gridLines = [];
  const gridCount = 3;
  for (let i = 0; i <= gridCount; i++) {
    const y = padding + (i * (height - 2 * padding)) / gridCount;
    const value = Math.round(maxScore - (i * scoreRange) / gridCount);
    gridLines.push({ y, value });
  }

  return (
    <div className="chart-container">
      <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`}>
        {/* Grid Lines */}
        {gridLines.map((gl, i) => (
          <g key={i}>
            <line
              className="chart-grid-line"
              x1={padding}
              y1={gl.y}
              x2={width - padding}
              y2={gl.y}
            />
            <text
              x={padding - 8}
              y={gl.y + 3}
              fill="var(--text-muted)"
              fontSize="9"
              textAnchor="end"
              fontWeight="500"
            >
              {gl.value}
            </text>
          </g>
        ))}

        {/* X Axis labels */}
        {currentData.map((d, i) => {
          const x = padding + (i * (width - 2 * padding)) / (currentData.length - 1);
          if (i % 2 !== 0 && i !== currentData.length - 1) return null;
          return (
            <text
              key={i}
              x={x}
              y={height - 10}
              className="chart-label"
              fontSize="9"
              fontWeight="600"
            >
              {d.month}
            </text>
          );
        })}

        {/* Current Trend Line (Solid Gray) */}
        <polyline
          className="chart-line"
          points={currentPoints}
          style={{ stroke: "rgba(156, 163, 175, 0.4)", strokeWidth: 2 }}
        />

        {/* Simulated Trend Line (Dashed Cyan) */}
        <polyline
          className="chart-line-forecast"
          points={simPoints}
          style={{ stroke: "var(--secondary)", strokeWidth: 3 }}
        />
      </svg>
    </div>
  );
}

function Simulator() {
  const {
    currentMetrics,
    simulatedMetrics,
    
    // Simulation controls & updates
    simExtraPayment, setSimExtraPayment,
    simNewCardBalance, setSimNewCardBalance,
    simOpenNewCard, setSimOpenNewCard,
    simTakeLoan, setSimTakeLoan,
    simMissedPayment, setSimMissedPayment,
    simIncreaseSavings, setSimIncreaseSavings,
    resetSimulation,

    forecastData,
    simForecastData
  } = useFinancials();

  // Sub-tabs for Simulator: Consumer Simulator vs Underwriter Admin Settings
  const [activeSubTab, setActiveSubTab] = useState("consumer");

  // Underwriter Weights (Local state persisted in localStorage)
  const [upiWeight, setUpiWeight] = useState(40);
  const [gstWeight, setGstWeight] = useState(30);
  const [paymentDelayPenalty, setPaymentDelayPenalty] = useState(60);
  const [dtiThreshold, setDtiThreshold] = useState(50);
  const [adminSuccess, setAdminSuccess] = useState(false);

  // Load admin values from local storage
  useEffect(() => {
    setUpiWeight(parseInt(localStorage.getItem("aura_upi_weight") || "40"));
    setGstWeight(parseInt(localStorage.getItem("aura_gst_weight") || "30"));
    setPaymentDelayPenalty(parseInt(localStorage.getItem("aura_penalty_weight") || "60"));
    setDtiThreshold(parseInt(localStorage.getItem("aura_dti_threshold") || "50"));
  }, []);

  const handleSaveAdminPolicies = () => {
    localStorage.setItem("aura_upi_weight", upiWeight.toString());
    localStorage.setItem("aura_gst_weight", gstWeight.toString());
    localStorage.setItem("aura_penalty_weight", paymentDelayPenalty.toString());
    localStorage.setItem("aura_dti_threshold", dtiThreshold.toString());
    setAdminSuccess(true);
    setTimeout(() => setAdminSuccess(false), 3000);
  };

  const creditDelta = simulatedMetrics.creditScore - currentMetrics.creditScore;
  const healthDelta = simulatedMetrics.healthScore - currentMetrics.healthScore;

  const getSimAIExplanation = () => {
    let explanations = [];

    if (simExtraPayment > 0) {
      explanations.push(
        `Paying off **₹${simExtraPayment.toLocaleString("en-IN")}** card balance reduces your card utilization from **${Math.round(currentMetrics.cardUtilization)}%** to **${Math.round(simulatedMetrics.cardUtilization)}%**. This helps boost your CIBIL score.`
      );
    }
    if (simNewCardBalance > 0) {
      explanations.push(
        `Adding **₹${simNewCardBalance.toLocaleString("en-IN")}** in credit card purchases increases utilization. High card usage (>30%) signals reliance on credit, dragging your score down.`
      );
    }
    if (simOpenNewCard) {
      explanations.push(
        `Opening a new card adds a **₹50,000 credit limit**, lowering your overall utilization rate. However, a new card query slightly lowers credit age initially.`
      );
    }
    if (simTakeLoan !== "none") {
      const loanEmi = simTakeLoan === "auto" ? 6000 : 4000;
      explanations.push(
        `Taking a new loan adds a monthly EMI of **₹${loanEmi}**, raising your DTI ratio to **${Math.round(simulatedMetrics.dti)}%**. This reduces your free savings rate.`
      );
    }
    if (simIncreaseSavings > 0) {
      explanations.push(
        `Adding **₹${simIncreaseSavings.toLocaleString("en-IN")}** to your savings improves your liquidity reserves and enhances your overall Financial Health score.`
      );
    }
    if (simMissedPayment) {
      explanations.push(
        `A missed payment is critical! Payment history makes up the largest chunk of your credit score. Simulating a late payment triggers a sharp drop of **~90 CIBIL points**.`
      );
    }

    if (explanations.length === 0) {
      return ["Use the controls on the left to simulate financial decisions and check how they alter your CIBIL score and financial health!"];
    }

    return explanations;
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
            Decision Playground & Controls
          </span>
          <h2 className="page-title">Financial Simulator</h2>
        </div>
        {activeSubTab === "consumer" && (
          <button className="btn btn-secondary" onClick={resetSimulation}>
            <RefreshCw size={14} />
            Reset Sliders
          </button>
        )}
      </div>

      {/* Sub tabs */}
      <div className="sub-tabs" style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <button className={`sub-tab-btn ${activeSubTab === 'consumer' ? 'active' : ''}`} onClick={() => setActiveSubTab('consumer')}>Consumer Decision Simulator</button>
        <button className={`sub-tab-btn ${activeSubTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveSubTab('admin')}>Underwriter Policy Weights</button>
      </div>

      {activeSubTab === "consumer" && (
        <div className="dashboard-grid">
          {/* Left Column - Controls */}
          <div className="card grid-span-1" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <h3 className="card-title">
              <Sliders size={18} />
              Simulation Controls
            </h3>

            {/* Debt Paydown Slider */}
            <div className="simulator-slider">
              <div className="slider-header">
                <span className="slider-label">Pay Down Card Debt</span>
                <span className="slider-value" style={{ color: "var(--success)" }}>+₹{simExtraPayment.toLocaleString("en-IN")}</span>
              </div>
              <input 
                type="range" 
                className="range-input" 
                min="0" 
                max="30000" 
                step="1000" 
                value={simExtraPayment}
                onChange={(e) => setSimExtraPayment(Number(e.target.value))}
              />
            </div>

            {/* New Purchases Slider */}
            <div className="simulator-slider">
              <div className="slider-header">
                <span className="slider-label">Add Card Purchases</span>
                <span className="slider-value" style={{ color: "var(--danger)" }}>-₹{simNewCardBalance.toLocaleString("en-IN")}</span>
              </div>
              <input 
                type="range" 
                className="range-input" 
                min="0" 
                max="30000" 
                step="1000" 
                value={simNewCardBalance}
                onChange={(e) => setSimNewCardBalance(Number(e.target.value))}
              />
            </div>

            {/* Boost Savings Slider */}
            <div className="simulator-slider">
              <div className="slider-header">
                <span className="slider-label">Increase Cash Savings</span>
                <span className="slider-value" style={{ color: "var(--secondary)" }}>+₹{simIncreaseSavings.toLocaleString("en-IN")}</span>
              </div>
              <input 
                type="range" 
                className="range-input" 
                min="0" 
                max="50000" 
                step="2000" 
                value={simIncreaseSavings}
                onChange={(e) => setSimIncreaseSavings(Number(e.target.value))}
              />
            </div>

            {/* Open Card Toggle */}
            <div className="toggle-group">
              <div className="toggle-info">
                <span className="toggle-title">Open New Credit Card</span>
                <span className="toggle-desc">Adds a ₹50,000 credit limit</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={simOpenNewCard}
                  onChange={(e) => setSimOpenNewCard(e.target.checked)}
                />
                <span className="slider-toggle"></span>
              </label>
            </div>

            {/* Missed Payment Toggle */}
            <div className="toggle-group">
              <div className="toggle-info">
                <span className="toggle-title" style={{ color: "var(--danger)" }}>Miss EMI Payment</span>
                <span className="toggle-desc">Simulates a late payment flag</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={simMissedPayment}
                  onChange={(e) => setSimMissedPayment(e.target.checked)}
                />
                <span className="slider-toggle"></span>
              </label>
            </div>

            {/* Loan Dropdown */}
            <div className="form-group" style={{ marginTop: "14px" }}>
              <label>Apply for Installment Loan</label>
              <select 
                value={simTakeLoan}
                onChange={(e) => setSimTakeLoan(e.target.value)}
              >
                <option value="none">No loan request</option>
                <option value="personal">Personal Loan (₹1 Lakh at ₹4,000/mo)</option>
                <option value="auto">Car Loan (₹4 Lakhs at ₹6,000/mo)</option>
              </select>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="card grid-span-2" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <h3 className="card-title">
              <Activity size={18} />
              Projected Score Changes
            </h3>

            {/* Score Impact Display */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ background: "var(--bg-inner)", border: "1px solid var(--border-light)", padding: "20px", borderRadius: "16px", textAlign: "center" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
                  CIBIL Score Outcome
                </span>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: "10px", margin: "10px 0" }}>
                  <span style={{ fontSize: "36px", fontWeight: "800", color: "var(--text-primary)" }}>{simulatedMetrics.creditScore}</span>
                  <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>from {currentMetrics.creditScore}</span>
                </div>
                <span className={`badge ${creditDelta > 0 ? "badge-green" : creditDelta < 0 ? "badge-red" : "badge-blue"}`}>
                  {creditDelta > 0 ? `+${creditDelta}` : creditDelta} Points
                </span>
              </div>

              <div style={{ background: "var(--bg-inner)", border: "1px solid var(--border-light)", padding: "20px", borderRadius: "16px", textAlign: "center" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
                  Financial Health Index
                </span>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: "10px", margin: "10px 0" }}>
                  <span style={{ fontSize: "36px", fontWeight: "800", color: "var(--text-primary)" }}>{simulatedMetrics.healthScore}</span>
                  <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>from {currentMetrics.healthScore}</span>
                </div>
                <span className={`badge ${healthDelta > 0 ? "badge-green" : healthDelta < 0 ? "badge-red" : "badge-blue"}`}>
                  {healthDelta > 0 ? `+${healthDelta}` : healthDelta} Points
                </span>
              </div>
            </div>

            {/* Forecast Comparison Chart */}
            <div>
              <h4 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: "600" }}>
                Comparative 12-Month Projections
              </h4>
              <DualSVGLineChart currentData={forecastData} simData={simForecastData} />
              <div style={{ display: "flex", justifyContent: "center", gap: "20px", fontSize: "11px", marginTop: "10px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                  <span style={{ display: "inline-block", width: "12px", height: "3px", background: "rgba(156, 163, 175, 0.4)" }}></span>
                  Current Path ({forecastData[11]?.score})
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--secondary)" }}>
                  <span style={{ display: "inline-block", width: "12px", height: "3px", borderBottom: "3px dashed var(--secondary)" }}></span>
                  Simulated Path ({simForecastData[11]?.score})
                </span>
              </div>
            </div>

            {/* Metric Deltas Table */}
            <div>
              <h4 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: "600" }}>
                Metrics Comparison
              </h4>
              <table className="item-table">
                <thead>
                  <tr>
                    <th>Metric Name</th>
                    <th>Current State</th>
                    <th>Simulated State</th>
                    <th>Status Impact</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Card Utilization</td>
                    <td>{Math.round(currentMetrics.cardUtilization)}%</td>
                    <td>{Math.round(simulatedMetrics.cardUtilization)}%</td>
                    <td style={{ color: simulatedMetrics.cardUtilization < currentMetrics.cardUtilization ? "var(--success)" : simulatedMetrics.cardUtilization > currentMetrics.cardUtilization ? "var(--danger)" : "inherit" }}>
                      {simulatedMetrics.cardUtilization < currentMetrics.cardUtilization ? "Lower Usage" : simulatedMetrics.cardUtilization > currentMetrics.cardUtilization ? "Higher Usage" : "No Change"}
                    </td>
                  </tr>
                  <tr>
                    <td>Debt-To-Income (DTI)</td>
                    <td>{Math.round(currentMetrics.dti)}%</td>
                    <td>{Math.round(simulatedMetrics.dti)}%</td>
                    <td style={{ color: simulatedMetrics.dti < currentMetrics.dti ? "var(--success)" : simulatedMetrics.dti > currentMetrics.dti ? "var(--danger)" : "inherit" }}>
                      {simulatedMetrics.dti < currentMetrics.dti ? "Better Cash Flow" : simulatedMetrics.dti > currentMetrics.dti ? "Higher Liabilities" : "No Change"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Explainable AI Advisor Simulator Text */}
            <div style={{ background: "rgba(139, 92, 246, 0.03)", border: "1px solid var(--border-light)", padding: "18px", borderRadius: "14px" }}>
              <h4 style={{ fontSize: "14px", color: "var(--text-primary)", marginBottom: "8px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                <HelpCircle size={16} style={{ color: "var(--primary)" }} />
                Impact Explanation
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {getSimAIExplanation().map((exp, i) => (
                  <p 
                    key={i} 
                    style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.4" }}
                    dangerouslySetInnerHTML={{ __html: exp }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "admin" && (
        <div className="dashboard-grid">
          {/* Underwriter policy config */}
          <div className="card">
            <h3 className="card-title"><Cog size={18} /> Underwriting Config Weights</h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "14px" }}>
              Configure backend weights for credit score evaluation models.
            </p>

            {adminSuccess && (
              <div className="alert-box info" style={{ padding: "10px", fontSize: "11px", marginBottom: "12px" }}>
                Underwriting policy saved. Registry updated.
              </div>
            )}

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span>UPI Velocity Weight</span>
                <strong>{upiWeight}%</strong>
              </div>
              <input type="range" min="10" max="80" step="5" className="range-input" value={upiWeight} onChange={(e) => setUpiWeight(parseInt(e.target.value))} />
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span>GST Filingconsistency Weight</span>
                <strong>{gstWeight}%</strong>
              </div>
              <input type="range" min="10" max="60" step="5" className="range-input" value={gstWeight} onChange={(e) => setGstWeight(parseInt(e.target.value))} />
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span>Payment Delinquency Penalty Weight</span>
                <strong>{paymentDelayPenalty}%</strong>
              </div>
              <input type="range" min="10" max="100" step="5" className="range-input" value={paymentDelayPenalty} onChange={(e) => setPaymentDelayPenalty(parseInt(e.target.value))} />
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span>Landlord DTI Exposure Threshold</span>
                <strong>{dtiThreshold}% DTI</strong>
              </div>
              <input type="range" min="20" max="70" step="5" className="range-input" value={dtiThreshold} onChange={(e) => setDtiThreshold(parseInt(e.target.value))} />
            </div>

            <button className="btn btn-primary btn-full" onClick={handleSaveAdminPolicies}>
              Apply Weights
            </button>
          </div>

          {/* System Aggregates & Fraud alerts */}
          <div className="card grid-span-2">
            <h3 className="card-title"><Activity size={18} /> System Risk Indicators</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
              <div style={{ background: "var(--bg-inner)", padding: "12px", borderRadius: "10px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Total Active Portfolio Exposure</span>
                <h4 style={{ margin: "2px 0 0", fontSize: "18px" }}>₹2,83,000</h4>
              </div>
              <div style={{ background: "var(--bg-inner)", padding: "12px", borderRadius: "10px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Average System CIBIL Score</span>
                <h4 style={{ margin: "2px 0 0", fontSize: "18px", color: "var(--primary)" }}>685</h4>
              </div>
            </div>

            <h3 className="card-title"><AlertOctagon size={18} style={{ color: "var(--danger)" }} /> Real-time Fraud Alerts</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div className="alert-box danger" style={{ margin: 0, padding: "8px 12px" }}>
                <div style={{ fontSize: "12px" }}>
                  <strong>Karan Mehta: Card utilization exceeds 90%</strong>
                  <p style={{ fontSize: "10px", marginTop: "2px" }}>Current usage ratio at 92%. Underwriter flags raised.</p>
                </div>
              </div>

              <div className="alert-box danger" style={{ margin: 0, padding: "8px 12px" }}>
                <div style={{ fontSize: "12px" }}>
                  <strong>Karan Mehta: Online Gambling Merchant Logs flagged</strong>
                  <p style={{ fontSize: "10px", marginTop: "2px" }}>Merchant tag casino_club detected. Distress integrity risks recorded.</p>
                </div>
              </div>

              <div className="alert-box info" style={{ margin: 0, padding: "8px 12px", background: "var(--success-glow)", color: "var(--success)", borderColor: "rgba(82, 117, 93, 0.1)" }}>
                <div style={{ fontSize: "12px" }}>
                  <strong>Aarav Patel: UPI Cashflow velocity verified</strong>
                  <p style={{ fontSize: "10px", marginTop: "2px", color: "var(--text-secondary)" }}>Alternate score bounds set to Good (710) based on 82 transactions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Simulator;
