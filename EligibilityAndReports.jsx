import React, { useState } from "react";
import { useFinancials } from "../context/FinancialContext";
import { 
  FileCheck, 
  Printer, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  FileText,
  Building,
  FileSpreadsheet,
  Search,
  Home,
  FileCheck2
} from "lucide-react";

// Mock SME commercial database
const MOCK_COMPANIES = [
  { name: "Dutta Logistics Pvt Ltd", gstin: "19AAACD3322A1Z0", grade: "A+", delayDays: 4, cashflowHealth: "Stable", warning: "None", alertType: "green" },
  { name: "Vikas Manufacturing", gstin: "27BBBDE4455C2Z1", grade: "B-", delayDays: 14, cashflowHealth: "Slightly Stressed", warning: "GST filings delayed by 10 days", alertType: "yellow" },
  { name: "Kishore Textiles & Retail", gstin: "09CCCEF8899K3Z4", grade: "D", delayDays: 52, cashflowHealth: "Critical Stress", warning: "High probability of invoice defaults next 90 days. Delay spike.", alertType: "red" }
];

function EligibilityAndReports() {
  const { 
    profile, 
    cards, 
    goals, 
    currentMetrics, 
    aiRecommendations,
    predictLoanEligibility 
  } = useFinancials();

  // Navigation Sub-tab
  const [subTab, setSubTab] = useState("loan");

  // Predictor States
  const [loanType, setLoanType] = useState("auto");
  const [requestAmount, setRequestAmount] = useState("200000");
  const [prediction, setPrediction] = useState(null);

  // SME search
  const [smeQuery, setSmeQuery] = useState("");
  const [smeResult, setSmeResult] = useState(null);

  // Tenant Vetting
  const [tenantName, setTenantName] = useState("");
  const [tenantIncome, setTenantIncome] = useState("");
  const [tenantEmis, setTenantEmis] = useState("");
  const [tenantRent, setTenantRent] = useState("");
  const [tenantReport, setTenantReport] = useState(null);

  const handlePredict = (e) => {
    e.preventDefault();
    if (Number(requestAmount) <= 0) {
      alert("Please enter a valid loan amount.");
      return;
    }
    const result = predictLoanEligibility(loanType, Number(requestAmount));
    setPrediction(result);
  };

  const handleSmeSearch = (e) => {
    e.preventDefault();
    if (!smeQuery) return;
    const result = MOCK_COMPANIES.find(c => 
      c.name.toLowerCase().includes(smeQuery.toLowerCase()) || 
      c.gstin.toLowerCase().includes(smeQuery.toLowerCase())
    );
    if (result) {
      setSmeResult(result);
    } else {
      setSmeResult({ name: "Not Found", gstin: "N/A", grade: "N/A", delayDays: 0, cashflowHealth: "No record", warning: "GSTIN not validated in registry.", alertType: "red" });
    }
  };

  const handleTenantVetting = (e) => {
    e.preventDefault();
    const income = parseFloat(tenantIncome);
    const emis = parseFloat(tenantEmis);
    const rent = parseFloat(tenantRent);

    if (isNaN(income) || isNaN(emis) || isNaN(rent) || income <= 0) {
      alert("Please enter valid parameters.");
      return;
    }

    const dti = Math.round(((emis + rent) / income) * 100);
    let trustScore = 100 - (dti > 40 ? (dti - 40) * 1.5 : 0);
    if (emis / income > 0.4) trustScore -= 20;
    trustScore = Math.min(Math.max(Math.round(trustScore), 10), 99);

    let verdict = "Approved - Low Risk";
    let rating = "green";
    if (dti > 50) {
      verdict = "Warning - Extreme EMI/Rent Exposure";
      rating = "red";
    } else if (dti > 35) {
      verdict = "Moderate Risk - Check salary stability";
      rating = "yellow";
    }

    setTenantReport({
      name: tenantName,
      dti,
      trustScore,
      verdict,
      rating,
      obligationBreakdown: `Rent consumes ${Math.round((rent/income)*100)}% of income. EMIs consume ${Math.round((emis/income)*100)}%.`
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const getOddsColor = (odds) => {
    if (odds === "High") return "var(--success)";
    if (odds === "Medium") return "var(--warning)";
    return "var(--danger)";
  };

  return (
    <section aria-label="Loan Eligibility and Reports">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
            Underwriting & Vetting Tools
          </span>
          <h2 className="page-title">Eligibility & Reports</h2>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handlePrint}
          aria-label="Export report to PDF or print"
        >
          <Printer size={14} />
          Print / Save PDF
        </button>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="sub-tabs" style={{ display: "flex", gap: "8px", marginBottom: "20px", overflowX: "auto", paddingBottom: "4px" }}>
        <button className={`sub-tab-btn ${subTab === 'loan' ? 'active' : ''}`} onClick={() => setSubTab('loan')}>Personal Loan Calculator</button>
        <button className={`sub-tab-btn ${subTab === 'sme' ? 'active' : ''}`} onClick={() => setSubTab('sme')}>SME Buyer Check</button>
        <button className={`sub-tab-btn ${subTab === 'landlord' ? 'active' : ''}`} onClick={() => setSubTab('landlord')}>Tenant Trust Scanner</button>
      </div>

      {subTab === "loan" && (
        <div className="dashboard-grid">
          {/* Left Column: Loan Eligibility Predictor */}
          <div className="card grid-span-1" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 className="card-title">
              <FileCheck size={18} />
              Loan Eligibility Calculator
            </h3>
            
            <form onSubmit={handlePredict} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="loan-select">Select Loan Type</label>
                <select 
                  id="loan-select"
                  value={loanType} 
                  onChange={(e) => {
                    setLoanType(e.target.value);
                    if (e.target.value === "auto") setRequestAmount("250000");
                    else setRequestAmount("100000");
                  }}
                >
                  <option value="auto">Two-Wheeler / Car Loan</option>
                  <option value="personal">Personal Loan</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="amount-input">Requested Loan Amount (₹)</label>
                <input 
                  id="amount-input"
                  type="number" 
                  required 
                  min="1000"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full" aria-label="Calculate loan approval probability">
                Calculate Approval Odds
              </button>
            </form>

            {/* Recalculate odds display */}
            <div aria-live="polite" style={{ marginTop: "10px" }}>
              {prediction && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ textAlign: "center", background: "var(--bg-inner)", padding: "20px", borderRadius: "14px", border: "1px solid var(--border-light)" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
                      APPROVAL PROBABILITY
                    </span>
                    <h2 style={{ fontSize: "32px", fontWeight: "800", color: getOddsColor(prediction.probability), margin: "6px 0 0" }}>
                      {prediction.probability}
                    </h2>
                  </div>

                  <div>
                    <h4 style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "8px" }}>
                      Underwriting Criteria:
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {prediction.checkList.map((item, idx) => (
                        <div className="checklist-item" key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {item.met ? (
                            <CheckCircle size={14} className="checklist-check" aria-label="Requirement Met" />
                          ) : (
                            <XCircle size={14} className="checklist-cross" aria-label="Requirement Not Met" />
                          )}
                          <span style={{ fontSize: "13px" }}>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-light)", padding: "14px", borderRadius: "10px" }}>
                    <h4 style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <HelpCircle size={14} style={{ color: "var(--primary)" }} />
                      Lender Analysis:
                    </h4>
                    <ul style={{ paddingLeft: "16px", fontSize: "12px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {prediction.reasons.map((r, idx) => (
                        <li key={idx} style={{ listStyleType: "square" }}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Printable Executive Report Preview */}
          <div className="card grid-span-2" id="printable-report-section">
            <h3 className="card-title">
              <FileText size={18} />
              Financial Report Preview
            </h3>

            <div style={{ background: "var(--bg-inner)", border: "1px solid var(--border-light)", padding: "30px", borderRadius: "16px" }}>
              {/* Report Header */}
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid var(--border-light)", paddingBottom: "20px", marginBottom: "24px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>AURA FINANCIAL WORKSPACE</h2>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "1px" }}>PERSONAL CREDIT CERTIFICATE</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "12px", fontWeight: "600" }}>Report Date: {new Date().toLocaleDateString()}</span>
                  <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>ID: CR-IN-{Math.floor(Math.random() * 900000 + 100000)}</p>
                </div>
              </div>

              {/* Profile Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px", fontSize: "13px" }}>
                <div>
                  <strong style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", marginBottom: "4px" }}>APPLICANT DETAILS</strong>
                  <span>Full Name: {localStorage.getItem("userName") || "Valued User"}</span>
                  <p>Email: {localStorage.getItem("userEmail") || "user@example.com"}</p>
                  <p>Status: <span style={{ textTransform: "capitalize" }}>{profile.employmentStatus}</span></p>
                </div>
                <div>
                  <strong style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", marginBottom: "4px" }}>CREDIT & HEALTH METRICS</strong>
                  <span>CIBIL Score: <strong>{currentMetrics.creditScore}</strong></span>
                  <p>Health Index: <strong>{currentMetrics.healthScore}/100</strong></p>
                  <p>Savings: <strong>₹{profile.currentSavings.toLocaleString("en-IN")}</strong></p>
                </div>
              </div>

              {/* Debt & Cards Section */}
              <div style={{ marginBottom: "24px" }}>
                <strong style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", marginBottom: "8px" }}>LINKED CREDIT CARDS</strong>
                <table className="item-table" style={{ background: "rgba(255,255,255,0.01)", borderRadius: "10px" }}>
                  <thead>
                    <tr>
                      <th>Card Name</th>
                      <th>Balance</th>
                      <th>Limit</th>
                      <th>Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards.map(c => {
                      const util = c.limit > 0 ? (c.balance / c.limit) * 100 : 0;
                      return (
                        <tr key={c.id}>
                          <td>{c.name}</td>
                          <td>₹{c.balance.toLocaleString("en-IN")}</td>
                          <td>₹{c.limit.toLocaleString("en-IN")}</td>
                          <td>{Math.round(util)}%</td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td><strong>Total Credit Limit</strong></td>
                      <td><strong>₹{currentMetrics.totalBalance.toLocaleString("en-IN")}</strong></td>
                      <td><strong>₹{currentMetrics.totalLimit.toLocaleString("en-IN")}</strong></td>
                      <td><strong>{Math.round(currentMetrics.cardUtilization)}%</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Budget & Cashflow Section */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px", fontSize: "13px" }}>
                <div>
                  <strong style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", marginBottom: "6px" }}>CASH FLOW SUMMARY</strong>
                  <p>Monthly Income: ₹{profile.income.toLocaleString("en-IN")}</p>
                  <p>House Rent/EMI: ₹{profile.housingPayment.toLocaleString("en-IN")}</p>
                  <p>Other EMIs: ₹{profile.otherDebtPayments.toLocaleString("en-IN")}</p>
                  <p>Net Savings Rate: <strong>{Math.round(currentMetrics.savingsRate)}%</strong></p>
                </div>
                <div>
                  <strong style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", marginBottom: "6px" }}>GOALS</strong>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {goals.map(g => (
                      <div key={g.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                        <span>• {g.name}</span>
                        <span>₹{g.current.toLocaleString("en-IN")} / ₹{g.target.toLocaleString("en-IN")} ({Math.round((g.current / g.target) * 100)}%)</span>
                      </div>
                    ))}
                    {goals.length === 0 && <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>No active goals.</p>}
                  </div>
                </div>
              </div>

              {/* AI Advisor Advice checklist */}
              <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "16px", fontSize: "12px" }}>
                <strong style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", marginBottom: "6px" }}>IMPROVEMENT MANDATES</strong>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {aiRecommendations.map((rec, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "8px" }}>
                      <span>[{idx + 1}]</span>
                      <span><strong>{rec.title}</strong>: <span dangerouslySetInnerHTML={{ __html: rec.message }} /> ({rec.impact})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Signoff */}
              <div style={{ marginTop: "30px", borderTop: "1px solid var(--border-light)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", color: "var(--text-muted)" }}>
                <span>Verified under Aura Score Engine. Student Project.</span>
                <span style={{ borderBottom: "1px solid #555", width: "120px", display: "inline-block", height: "15px" }} aria-hidden="true"></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === "sme" && (
        <div className="dashboard-grid">
          <div className="card">
            <h3 className="card-title"><Building size={18} /> SME Buyer Credit Lookup</h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "14px" }}>
              Verify an Indian client company's registry data and payment history default markers before extending contract terms.
            </p>
            <form onSubmit={handleSmeSearch} style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <input 
                type="text" 
                placeholder="Enter client name or GSTIN..." 
                className="form-input" 
                value={smeQuery}
                onChange={(e) => setSmeQuery(e.target.value)}
                style={{ flex: 1, padding: "8px 12px", background: "var(--bg-inner)", border: "1px solid var(--border-light)", borderRadius: "8px", color: "var(--text-primary)" }}
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>

            <h4 style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>Demo Searches:</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button type="button" className="btn btn-secondary" style={{ textAlign: "left", fontSize: "11px", padding: "6px 12px" }} onClick={() => { setSmeQuery("Dutta Logistics"); setSmeResult(MOCK_COMPANIES[0]); }}>
                <strong>Dutta Logistics Pvt Ltd</strong> (GSTIN: 19AAACD3322A1Z0) - Grade A+
              </button>
              <button type="button" className="btn btn-secondary" style={{ textAlign: "left", fontSize: "11px", padding: "6px 12px" }} onClick={() => { setSmeQuery("Vikas Manufacturing"); setSmeResult(MOCK_COMPANIES[1]); }}>
                <strong>Vikas Manufacturing</strong> (GSTIN: 27BBBDE4455C2Z1) - Grade B-
              </button>
              <button type="button" className="btn btn-secondary" style={{ textAlign: "left", fontSize: "11px", padding: "6px 12px" }} onClick={() => { setSmeQuery("Kishore Textiles"); setSmeResult(MOCK_COMPANIES[2]); }}>
                <strong>Kishore Textiles & Retail</strong> (GSTIN: 09CCCEF8899K3Z4) - Grade D
              </button>
            </div>
          </div>

          <div className="card grid-span-2">
            <h3 className="card-title"><FileSpreadsheet size={18} /> Risk Assessment Report</h3>
            {smeResult ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "18px" }}>{smeResult.name}</h3>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>GSTIN: {smeResult.gstin}</span>
                  </div>
                  <span style={{ fontSize: "24px", fontWeight: "800", color: smeResult.alertType === "green" ? "var(--success)" : smeResult.alertType === "yellow" ? "var(--warning)" : "var(--danger)" }}>
                    {smeResult.grade}
                  </span>
                </div>

                <div className={`alert-box ${smeResult.alertType === 'green' ? 'info' : smeResult.alertType}`} style={{ marginBottom: "16px" }}>
                  <div>
                    <strong>Risk Rating: {smeResult.cashflowHealth}</strong>
                    <p style={{ marginTop: "4px", fontSize: "11px" }}>{smeResult.warning}</p>
                  </div>
                </div>

                <div className="metric-row">
                  <span>Avg Payment Delinquency Delay</span>
                  <strong>{smeResult.delayDays} days</strong>
                </div>
                <div className="metric-row">
                  <span>Underwriting Recommendation</span>
                  <strong style={{ color: smeResult.alertType === "red" ? "var(--danger)" : "inherit" }}>
                    {smeResult.alertType === "green" ? "Ship on standard 90-day credit terms." : smeResult.alertType === "yellow" ? "Require 30% upfront cash payment deposit." : "Seek 100% advance deposit. High credit default warnings."}
                  </strong>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                <Search size={32} style={{ display: "block", margin: "0 auto 10px", opacity: 0.5 }} />
                Select a client company to generate risk assessment report
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === "landlord" && (
        <div className="dashboard-grid">
          <div className="card">
            <h3 className="card-title"><Home size={18} /> Tenant Trust score Scanner</h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "14px" }}>
              Vet tenant applicants on their actual Debt-to-Income (DTI) exposure rather than salary slips.
            </p>
            <form onSubmit={handleTenantVetting} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Applicant Name</label>
                <input type="text" placeholder="e.g. Rahul Verma" value={tenantName} onChange={(e) => setTenantName(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Gross Monthly Salary (₹)</label>
                <input type="number" placeholder="60000" value={tenantIncome} onChange={(e) => setTenantIncome(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Active Monthly EMIs (₹)</label>
                <input type="number" placeholder="15000" value={tenantEmis} onChange={(e) => setTenantEmis(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Proposed Rent (₹)</label>
                <input type="number" placeholder="20000" value={tenantRent} onChange={(e) => setTenantRent(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary">Generate Trust Report</button>
            </form>
          </div>

          <div className="card grid-span-2">
            <h3 className="card-title"><FileCheck2 size={18} /> Tenant Trust Assessment</h3>
            {tenantReport ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{tenantReport.name}</h3>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Simulated Landlord Vetting Verification</span>
                  </div>
                  <span style={{ fontSize: "32px", fontWeight: "800", color: tenantReport.rating === "green" ? "var(--success)" : tenantReport.rating === "yellow" ? "var(--warning)" : "var(--danger)" }}>
                    {tenantReport.trustScore} / 100
                  </span>
                </div>

                <div className={`alert-box ${tenantReport.rating === 'green' ? 'info' : tenantReport.rating}`} style={{ marginBottom: "16px" }}>
                  <div>
                    <strong>Verdict: {tenantReport.verdict}</strong>
                    <p style={{ marginTop: "4px", fontSize: "11px" }}>{tenantReport.obligationBreakdown}</p>
                  </div>
                </div>

                <div className="metric-row">
                  <span>Rent + EMI to Income Exposure (DTI)</span>
                  <strong style={{ color: tenantReport.dti > dtiThreshold ? "var(--danger)" : "inherit" }}>{tenantReport.dti}%</strong>
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "10px" }}>
                  * The system-wide DTI threat threshold is currently configured to {dtiThreshold}%.
                </p>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                Fill applicant parameters on the left to estimate tenant trust score
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default EligibilityAndReports;
