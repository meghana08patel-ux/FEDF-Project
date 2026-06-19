import React, { useState } from "react";
import { useFinancials } from "../context/FinancialContext";
import { 
  PieChart, 
  Plus, 
  Trash2, 
  Target, 
  Calendar
} from "lucide-react";

function IncomeExpenseSVGBarChart({ income, expense }) {
  const width = 220;
  const height = 180;
  const padding = 30;
  const maxVal = Math.max(income, expense, 1000);
  
  const incomeHeight = ((height - 2 * padding) * income) / maxVal;
  const expenseHeight = ((height - 2 * padding) * expense) / maxVal;

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <line 
          x1={padding} 
          y1={height - padding} 
          x2={width - padding} 
          y2={height - padding} 
          stroke="rgba(255,255,255,0.08)" 
        />
        
        {/* Income Bar */}
        <rect
          x={45}
          y={height - padding - incomeHeight}
          width={35}
          height={incomeHeight}
          fill="var(--success)"
          opacity="0.85"
          rx="5"
        />
        <text x={62} y={height - padding + 15} fill="var(--text-muted)" fontSize="9" fontWeight="600" textAnchor="middle">INCOME</text>
        <text x={62} y={height - padding - incomeHeight - 6} fill="white" fontSize="10" fontWeight="700" textAnchor="middle">₹{Math.round(income)}</text>

        {/* Expense Bar */}
        <rect
          x={135}
          y={height - padding - expenseHeight}
          width={35}
          height={expenseHeight}
          fill="var(--danger)"
          opacity="0.85"
          rx="5"
        />
        <text x={152} y={height - padding + 15} fill="var(--text-muted)" fontSize="9" fontWeight="600" textAnchor="middle">EXPENSES</text>
        <text x={152} y={height - padding - expenseHeight - 6} fill="white" fontSize="10" fontWeight="700" textAnchor="middle">₹{Math.round(expense)}</text>
      </svg>
    </div>
  );
}

function Analytics() {
  const { 
    transactions, 
    goals, 
    addTransaction, 
    deleteTransaction,
    addGoal,
    updateGoalProgress,
    deleteGoal
  } = useFinancials();

  // Transaction Form States
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Groceries");
  const [type, setType] = useState("expense");
  const [date, setDate] = useState("");

  // Goal Form States
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalDate, setGoalDate] = useState("");

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!desc || !amount) return;

    addTransaction({
      description: desc,
      amount: Number(amount),
      category,
      date: date || new Date().toISOString().split("T")[0],
      type
    });

    setDesc("");
    setAmount("");
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!goalName || !goalTarget) return;

    addGoal({
      name: goalName,
      target: Number(goalTarget),
      current: 0,
      date: goalDate || new Date().toISOString().split("T")[0]
    });

    setGoalName("");
    setGoalTarget("");
    setGoalDate("");
  };

  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  // Group by category
  const expensesByCategory = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const categoriesColors = {
    Housing: "#f59e0b",
    Groceries: "#10b981",
    Dining: "#3b82f6",
    Entertainment: "#8b5cf6",
    Bills: "#ec4899",
    Utilities: "#06b6d4",
    Other: "#6b7280"
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
            Ledger & Analytics
          </span>
          <h2 className="page-title">Analytics & Budgeting</h2>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Transaction Add & List */}
        <div className="card grid-span-2">
          <h3 className="card-title">
            <Plus size={18} />
            Log New Transaction
          </h3>
          
          <form onSubmit={handleAddTransaction} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "30px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Description</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Groceries Shop, Salary" 
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Amount (₹)</label>
              <input 
                type="number" 
                required 
                placeholder="0" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Transaction Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="expense">Expense (Outflow)</option>
                <option value="income">Income (Inflow)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {type === "expense" ? (
                  <>
                    <option value="Groceries">Groceries</option>
                    <option value="Housing">Housing (Rent/EMI)</option>
                    <option value="Bills">Bills & EMI</option>
                    <option value="Dining">Dining Out</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Other">Other Expenses</option>
                  </>
                ) : (
                  <>
                    <option value="Salary">Salary / Income</option>
                    <option value="Other">Other Returns</option>
                  </>
                )}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0, gridColumn: "span 2" }}>
              <label>Transaction Date</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ gridColumn: "span 2" }}>
              <Plus size={16} />
              <span>Log Transaction</span>
            </button>
          </form>

          {/* Transactions List */}
          <h3 className="card-title" style={{ borderTop: "1px solid var(--border-light)", paddingTop: "20px" }}>
            <Calendar size={18} />
            Recent Transactions
          </h3>
          
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {transactions.length === 0 ? (
              <p style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>No transactions logged yet.</p>
            ) : (
              <table className="item-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td>{t.date}</td>
                      <td>{t.description}</td>
                      <td>
                        <span className="badge badge-blue" style={{ fontSize: "10px" }}>{t.category}</span>
                      </td>
                      <td className={t.type === "income" ? "amount-income" : "amount-expense"}>
                        {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
                      </td>
                      <td>
                        <button 
                          onClick={() => deleteTransaction(t.id)}
                          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Charts & Goals */}
        <div className="card grid-span-1" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h3 className="card-title">
              <PieChart size={18} />
              Monthly Cash Flow
            </h3>
            <IncomeExpenseSVGBarChart income={totalIncome} expense={totalExpense} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", borderTop: "1px solid var(--border-light)", paddingTop: "14px", marginTop: "10px" }}>
              <span style={{ color: "var(--text-secondary)" }}>Net Monthly Savings:</span>
              <strong style={{ color: totalIncome >= totalExpense ? "var(--success)" : "var(--danger)" }}>
                ₹{(totalIncome - totalExpense).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          {/* Spending list */}
          <div>
            <h4 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "12px", fontWeight: "600" }}>
              Expenses by Category
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {Object.keys(expensesByCategory).length === 0 ? (
                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>No logged expenses found.</p>
              ) : (
                Object.keys(expensesByCategory).map(cat => {
                  const amt = expensesByCategory[cat];
                  const percent = totalExpense > 0 ? (amt / totalExpense) * 100 : 0;
                  const color = categoriesColors[cat] || "var(--primary)";
                  return (
                    <div key={cat} style={{ fontSize: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: color }} />
                          {cat}
                        </span>
                        <span>₹{amt.toLocaleString("en-IN")} ({Math.round(percent)}%)</span>
                      </div>
                      <div className="goal-progress-bg" style={{ height: "4px" }}>
                        <div className="goal-progress-fill" style={{ width: `${percent}%`, background: color }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Goal Tracker */}
          <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "20px" }}>
            <h3 className="card-title">
              <Target size={18} />
              Savings Goals Tracker
            </h3>
            
            <form onSubmit={handleAddGoal} style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              <input 
                type="text" 
                required 
                placeholder="e.g. Save for a laptop" 
                style={{ padding: "8px 12px", background: "var(--bg-inner)", border: "1px solid var(--border-light)", borderRadius: "8px", color: "white", fontSize: "12px" }}
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <input 
                  type="number" 
                  required 
                  placeholder="Target Amount (₹)" 
                  style={{ flex: 1, padding: "8px 12px", background: "var(--bg-inner)", border: "1px solid var(--border-light)", borderRadius: "8px", color: "white", fontSize: "12px" }}
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                />
                <input 
                  type="date" 
                  style={{ flex: 1, padding: "8px 12px", background: "var(--bg-inner)", border: "1px solid var(--border-light)", borderRadius: "8px", color: "white", fontSize: "12px" }}
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-secondary btn-full" style={{ padding: "8px" }}>
                <Plus size={14} />
                <span>Create Goal</span>
              </button>
            </form>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {goals.map(g => {
                const percent = g.target > 0 ? (g.current / g.target) * 100 : 0;
                return (
                  <div key={g.id} className="goal-item" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-light)", padding: "14px", borderRadius: "12px" }}>
                    <div className="goal-meta">
                      <span style={{ fontWeight: "600", color: "white" }}>{g.name}</span>
                      <span style={{ color: "var(--text-muted)" }}>by {g.date}</span>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "8px 0" }}>
                      <div className="goal-progress-bg" style={{ flex: 1 }}>
                        <div className="goal-progress-fill" style={{ width: `${Math.min(100, percent)}%` }} />
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--secondary)" }}>
                        {Math.round(percent)}%
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Current: ₹</span>
                        <input 
                          type="number"
                          style={{ width: "70px", padding: "4px", fontSize: "11px", height: "22px", background: "var(--bg-inner)", border: "1px solid var(--border-light)", borderRadius: "4px", color: "white" }}
                          value={g.current}
                          onChange={(e) => updateGoalProgress(g.id, e.target.value)}
                        />
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>of ₹{g.target.toLocaleString("en-IN")}</span>
                      </div>
                      <button 
                        onClick={() => deleteGoal(g.id)}
                        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Analytics;
