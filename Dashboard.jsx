import { useEffect, useState } from "react";
import { useFinancials } from "../context/FinancialContext";
import { 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  ShieldCheck, 
  CreditCard,
  Briefcase,
  DollarSign,
  TrendingDown,
  Activity
} from "lucide-react";

// Reusable Circular Gauge Component
function Gauge({ value, min, max, label, color, status }) {
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius; // ~282.7
  const angle = 270;
  const strokeLength = (circumference * angle) / 360; // ~212
  const strokeOffset = strokeLength - (strokeLength * percentage) / 100;
  
  return (
    <div className="gauge-wrapper" style={{ width: "130px", height: "130px" }}>
      <svg className="gauge-svg" viewBox="0 0 110 110" style={{ transform: "rotate(-225deg)" }}>
        <circle
          className="gauge-bg"
          cx="55"
          cy="55"
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${strokeLength} ${circumference}`}
          strokeLinecap="round"
        />
        <circle
          className="gauge-fill"
          cx="55"
          cy="55"
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${strokeLength} ${circumference}`}
          strokeDashoffset={strokeOffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="gauge-text" style={{ transform: "translate(-50%, -50%)" }}>
        <span className="gauge-value" style={{ fontSize: "28px" }}>{value}</span>
        <span className="gauge-label" style={{ fontSize: "10px", fontWeight: "600", color: color }}>{status}</span>
      </div>
    </div>
  );
}

// Custom Line Chart Component
function SVGLineChart({ data }) {
  if (!data || data.length === 0) return null;
  const width = 500;
  const height = 180;
  const padding = 35;
  
  const scores = data.map(d => d.score);
  const maxScore = Math.max(...scores, 750);
  const minScore = Math.min(...scores, 500) - 10;
  const scoreRange = maxScore - minScore;

  const points = data.map((d, index) => {
    const x = padding + (index * (width - 2 * padding)) / (data.length - 1);
    const y = height - padding - ((d.score - minScore) * (height - 2 * padding)) / scoreRange;
    return `${x},${y}`;
  }).join(' ');

  // Create horizontal grid lines
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
        <defs>
          <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
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
        {data.map((d, i) => {
          const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
          if (i % 2 !== 0 && i !== data.length - 1) return null;
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

        {/* Area Fill */}
        <path
          d={`M ${padding},${height - padding} L ${points} L ${width - padding},${height - padding} Z`}
          fill="url(#chart-glow)"
        />

        {/* Polyline path */}
        <polyline
          className="chart-line"
          points={points}
        />

        {/* Highlight points */}
        {data.map((d, i) => {
          const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
          const y = height - padding - ((d.score - minScore) * (height - 2 * padding)) / scoreRange;
          if (i === 0 || i === data.length - 1) {
            return (
              <g key={i}>
                <circle cx={x} cy={y} className="chart-dot" />
                <rect x={x - 18} y={y - 20} width="36" height="14" rx="3" fill="#151822" stroke="var(--border-light)" strokeWidth="1" />
                <text x={x} y={y - 10} fill="white" fontSize="8" fontWeight="700" textAnchor="middle">{d.score}</text>
              </g>
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
}

function Dashboard() {
  const { 
    profile, 
    cards, 
    currentMetrics, 
    forecastData, 
    alerts, 
    aiRecommendations 
  } = useFinancials();

  const [dateString, setDateString] = useState("");

  useEffect(() => {
    const today = new Date();
    setDateString(today.toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" }));
  }, []);

  const getCreditColor = (score) => {
    if (score >= 750) return "var(--success)";
    if (score >= 685) return "var(--secondary)";
    if (score >= 600) return "var(--warning)";
    return "var(--danger)";
  };

  const getCreditStatus = (score) => {
    if (score >= 750) return "Excellent";
    if (score >= 685) return "Good";
    if (score >= 600) return "Average";
    return "Poor";
  };

  const getHealthColor = (score) => {
    if (score >= 80) return "var(--success)";
    if (score >= 60) return "var(--secondary)";
    if (score >= 40) return "var(--warning)";
    return "var(--danger)";
  };

  const getHealthStatus = (score) => {
    if (score >= 80) return "Optimized";
    if (score >= 60) return "Healthy";
    if (score >= 40) return "Average";
    return "Risky";
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
            {dateString}
          </span>
          <h2 className="page-title">Financial Health Dashboard</h2>
        </div>
        <div className="header-actions">
          <div className="badge badge-green">
            <ShieldCheck size={14} style={{ marginRight: "6px" }} />
            Profile Monitored
          </div>
        </div>
      </div>

      {/* Scores Row */}
      <div className="scores-container">
        <div className="card score-card">
          <h3 className="card-title">
            <TrendingUp size={18} />
            CIBIL Credit Score
          </h3>
          <Gauge 
            value={currentMetrics.creditScore} 
            min={300} 
            max={900} 
            color={getCreditColor(currentMetrics.creditScore)} 
            status={getCreditStatus(currentMetrics.creditScore)}
          />
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "10px" }}>
            CIBIL Credit Score range (300 - 900)
          </p>
        </div>

        <div className="card score-card">
          <h3 className="card-title">
            <Activity size={18} />
            Financial Health Index
          </h3>
          <Gauge 
            value={currentMetrics.healthScore} 
            min={0} 
            max={100} 
            color={getHealthColor(currentMetrics.healthScore)} 
            status={getHealthStatus(currentMetrics.healthScore)}
          />
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "10px" }}>
            Overall Stability Score (0 - 100)
          </p>
        </div>
      </div>

      {/* KPIs Row */}
      <div className="kpi-row">
        <div className="card kpi-card">
          <div className="kpi-header">
            <span>MONTHLY INCOME</span>
            <span style={{ fontSize: "12px", fontWeight: "700" }}>₹</span>
          </div>
          <div className="kpi-value">₹{profile.income.toLocaleString("en-IN")}</div>
          <div className="kpi-subtext" style={{ color: "var(--text-muted)" }}>
            Monthly Income
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-header">
            <span>SAVINGS RATE</span>
            <TrendingUp size={14} style={{ color: "var(--success)" }} />
          </div>
          <div className="kpi-value">{Math.round(currentMetrics.savingsRate)}%</div>
          <div className="kpi-subtext" style={{ color: currentMetrics.savingsRate > 20 ? "var(--success)" : "var(--warning)" }}>
            {currentMetrics.savingsRate > 20 ? "Good: Above 20%" : "Low: Increase savings"}
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-header">
            <span>DEBT-TO-INCOME (DTI)</span>
            <Briefcase size={14} />
          </div>
          <div className="kpi-value">{Math.round(currentMetrics.dti)}%</div>
          <div className="kpi-subtext" style={{ color: currentMetrics.dti < 40 ? "var(--success)" : "var(--danger)" }}>
            {currentMetrics.dti < 40 ? "Healthy (<40%)" : "Overleveraged DTI"}
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-header">
            <span>SAVINGS BALANCE</span>
            <span style={{ fontSize: "12px", fontWeight: "700" }}>₹</span>
          </div>
          <div className="kpi-value">₹{profile.currentSavings.toLocaleString("en-IN")}</div>
          <div className="kpi-subtext" style={{ color: "var(--text-muted)" }}>
            Liquid Savings
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Projections Line Chart */}
        <div className="card grid-span-2">
          <h3 className="card-title">
            <TrendingUp size={18} />
            12-Month CIBIL Projection Trend
          </h3>
          <SVGLineChart data={forecastData} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginTop: "14px" }}>
            <span>Start Score: {currentMetrics.creditScore}</span>
            <span>Forecast Mode: Active payment behavior</span>
            <span>Projected Max: {forecastData[11]?.score || 900}</span>
          </div>
        </div>

        {/* Alerts Drawer */}
        <div className="card">
          <h3 className="card-title">
            <AlertTriangle size={18} style={{ color: "var(--warning)" }} />
            Risk Notifications
          </h3>
          
          <div style={{ maxHeight: "200px", overflowY: "auto", paddingRight: "4px" }}>
            {alerts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-muted)", fontSize: "13px" }}>
                <ShieldCheck size={36} style={{ color: "var(--success)", display: "block", margin: "0 auto 10px", opacity: 0.8 }} />
                No negative flags. Profile healthy.
              </div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className={`alert-box ${alert.type}`}>
                  <AlertTriangle size={14} className="alert-icon" />
                  <div className="alert-content">
                    <h4>{alert.title}</h4>
                    <p>{alert.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="card grid-span-2">
          <h3 className="card-title">
            <Lightbulb size={18} style={{ color: "var(--warning)" }} />
            Personalized Improvement Advice
          </h3>
          
          <div className="insights-list">
            {aiRecommendations.map((rec, idx) => (
              <div className="insight-item" key={idx}>
                <div className="insight-avatar">
                  <Lightbulb size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "white" }}>{rec.title}</span>
                    <span className={`badge ${rec.priority === "Critical" || rec.priority === "High" ? "badge-red" : "badge-yellow"}`} style={{ fontSize: "10px" }}>
                      {rec.priority} Priority
                    </span>
                  </div>
                  <p className="insight-text" dangerouslySetInnerHTML={{ __html: rec.message }} style={{ marginTop: "4px" }} />
                  <div className="insight-impact">
                    Estimated Impact: {rec.impact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credit Cards Summary */}
        <div className="card">
          <h3 className="card-title">
            <CreditCard size={18} />
            Linked Credit Cards
          </h3>
          
          {cards.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "13px" }}>
              No active credit lines added. Please add cards in Profile settings.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {cards.map(c => {
                const util = c.limit > 0 ? (c.balance / c.limit) * 100 : 0;
                return (
                  <div key={c.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-light)", padding: "14px", borderRadius: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "white" }}>{c.name}</span>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>APR: {c.apr}%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                      <span>Bal: ₹{c.balance.toLocaleString("en-IN")}</span>
                      <span>Limit: ₹{c.limit.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="goal-progress-bg">
                      <div 
                        className="goal-progress-fill" 
                        style={{ 
                          width: `${Math.min(100, util)}%`,
                          background: util > 50 ? "var(--danger)" : util > 30 ? "var(--warning)" : "var(--success)" 
                        }} 
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", marginTop: "4px" }}>
                      <span style={{ color: "var(--text-muted)" }}>Card Utilization</span>
                      <span style={{ fontWeight: "700", color: util > 30 ? "var(--danger)" : "var(--success)" }}>
                        {Math.round(util)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;