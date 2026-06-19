import React, { createContext, useState, useEffect, useContext } from 'react';

const FinancialContext = createContext();

// Indian defaults (INR ₹)
const DEFAULT_PROFILE = {
  income: 65000, // Monthly income in ₹
  housingPayment: 15000, // Rent/EMI in ₹
  otherDebtPayments: 8000, // Loan EMIs in ₹
  currentSavings: 75000, // Savings in ₹
  employmentStatus: 'employed',
  latePaymentsCount: 0,
};

const DEFAULT_CARDS = [
  { id: '1', name: 'SBI SimplyClick', balance: 18000, limit: 80000, apr: 14.5 },
  { id: '2', name: 'HDFC MoneyBack', balance: 5000, limit: 50000, apr: 15.0 }
];

const DEFAULT_TRANSACTIONS = [
  { id: 't1', description: 'Monthly Salary', amount: 65000, category: 'Income', date: '2026-06-08', type: 'income' },
  { id: 't2', description: 'House Rent', amount: 15000, category: 'Housing', date: '2026-06-01', type: 'expense' },
  { id: 't3', description: 'Bike EMI', amount: 4500, category: 'Bills', date: '2026-06-03', type: 'expense' },
  { id: 't4', description: 'Groceries', amount: 3500, category: 'Groceries', date: '2026-06-05', type: 'expense' },
  { id: 't5', description: 'Dining Out', amount: 2000, category: 'Dining', date: '2026-06-07', type: 'expense' }
];

const DEFAULT_GOALS = [
  { id: 'g1', name: 'Emergency Savings', target: 120000, current: 75000, date: '2026-12-31' },
  { id: 'g2', name: 'Pay Off SBI Card', target: 18000, current: 6000, date: '2026-10-15' }
];

export const FinancialProvider = ({ children }) => {
  const [userKey, setUserKey] = useState(null);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [transactions, setTransactions] = useState(DEFAULT_TRANSACTIONS);
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  
  // Simulation Controls
  const [simExtraPayment, setSimExtraPayment] = useState(0);
  const [simNewCardBalance, setSimNewCardBalance] = useState(0);
  const [simOpenNewCard, setSimOpenNewCard] = useState(false);
  const [simTakeLoan, setSimTakeLoan] = useState('none'); // 'none', 'auto', 'personal'
  const [simMissedPayment, setSimMissedPayment] = useState(false);
  const [simIncreaseSavings, setSimIncreaseSavings] = useState(0);

  useEffect(() => {
    const handleAuthChange = () => {
      const email = localStorage.getItem('userEmail');
      if (email) {
        setUserKey(`aura_user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`);
      } else {
        setUserKey(null);
      }
    };

    handleAuthChange();
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    if (!userKey) return;
    
    const savedData = localStorage.getItem(userKey);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setProfile(parsed.profile || DEFAULT_PROFILE);
        setCards(parsed.cards || DEFAULT_CARDS);
        setTransactions(parsed.transactions || DEFAULT_TRANSACTIONS);
        setGoals(parsed.goals || DEFAULT_GOALS);
      } catch (e) {
        console.error('Error loading stored user data', e);
      }
    } else {
      setProfile(DEFAULT_PROFILE);
      setCards(DEFAULT_CARDS);
      setTransactions(DEFAULT_TRANSACTIONS);
      setGoals(DEFAULT_GOALS);
      saveData(DEFAULT_PROFILE, DEFAULT_CARDS, DEFAULT_TRANSACTIONS, DEFAULT_GOALS);
    }
    resetSimulation();
  }, [userKey]);

  const saveData = (newProfile, newCards, newTransactions, newGoals) => {
    if (!userKey) return;
    const data = {
      profile: newProfile || profile,
      cards: newCards || cards,
      transactions: newTransactions || transactions,
      goals: newGoals || goals
    };
    localStorage.setItem(userKey, JSON.stringify(data));
  };

  const updateProfile = (updated) => {
    const newProfile = { ...profile, ...updated };
    setProfile(newProfile);
    saveData(newProfile, null, null, null);
  };

  const addCard = (card) => {
    const newCards = [...cards, { ...card, id: Date.now().toString() }];
    setCards(newCards);
    saveData(null, newCards, null, null);
  };

  const deleteCard = (id) => {
    const newCards = cards.filter(c => c.id !== id);
    setCards(newCards);
    saveData(null, newCards, null, null);
  };

  const addTransaction = (t) => {
    const newT = { ...t, id: Date.now().toString() };
    const newTransactions = [newT, ...transactions];
    setTransactions(newTransactions);
    
    if (t.category === 'Savings') {
      const adjustment = t.type === 'income' ? Number(t.amount) : -Number(t.amount);
      const newSavings = Math.max(0, profile.currentSavings + adjustment);
      updateProfile({ currentSavings: newSavings });
    }
    
    saveData(null, null, newTransactions, null);
  };

  const deleteTransaction = (id) => {
    const newTransactions = transactions.filter(t => t.id !== id);
    setTransactions(newTransactions);
    saveData(null, null, newTransactions, null);
  };

  const addGoal = (g) => {
    const newG = { ...g, id: Date.now().toString() };
    const newGoals = [...goals, newG];
    setGoals(newGoals);
    saveData(null, null, null, newGoals);
  };

  const updateGoalProgress = (id, currentAmount) => {
    const newGoals = goals.map(g => g.id === id ? { ...g, current: Number(currentAmount) } : g);
    setGoals(newGoals);
    saveData(null, null, null, newGoals);
  };

  const deleteGoal = (id) => {
    const newGoals = goals.filter(g => g.id !== id);
    setGoals(newGoals);
    saveData(null, null, null, newGoals);
  };

  const resetSimulation = () => {
    setSimExtraPayment(0);
    setSimNewCardBalance(0);
    setSimOpenNewCard(false);
    setSimTakeLoan('none');
    setSimMissedPayment(false);
    setSimIncreaseSavings(0);
  };

  // Simplified score calculations
  const computeScores = (stateParams) => {
    const {
      activeIncome,
      activeHousing,
      activeDebtPayments,
      activeSavings,
      activeCards,
      activeLatePayments,
      simParams
    } = stateParams;

    let finalSavings = activeSavings + (simParams.savingsIncrease || 0);
    let finalLatePayments = activeLatePayments + (simParams.missedPayment ? 1 : 0);
    
    let finalCards = activeCards.map(c => ({ ...c }));
    let extraRemaining = simParams.extraPayment || 0;
    
    // Pay down balance
    for (let c of finalCards) {
      if (extraRemaining <= 0) break;
      const payAmount = Math.min(extraRemaining, c.balance);
      c.balance -= payAmount;
      extraRemaining -= payAmount;
    }

    if (simParams.newCardBalance > 0 && finalCards.length > 0) {
      finalCards[0].balance += simParams.newCardBalance;
    }

    let totalLimit = finalCards.reduce((acc, c) => acc + c.limit, 0);
    let totalBalance = finalCards.reduce((acc, c) => acc + c.balance, 0);

    if (simParams.openNewCard) {
      totalLimit += 50000; // ₹50,000 limit card
    }

    let simLoanPayment = 0;
    let loanAddedDesc = '';
    if (simParams.takeLoan === 'auto') {
      simLoanPayment = 6000; // ₹6,000 EMI
      loanAddedDesc = 'Car Loan (₹4 Lakhs)';
    } else if (simParams.takeLoan === 'personal') {
      simLoanPayment = 4000; // ₹4,000 EMI
      loanAddedDesc = 'Personal Loan (₹1 Lakh)';
    }

    const finalDebtPayments = activeDebtPayments + simLoanPayment;
    
    // Simple indicators
    const savingsRate = Math.max(0, ((activeIncome - activeHousing - finalDebtPayments) / activeIncome) * 100);
    const dti = ((activeHousing + finalDebtPayments) / activeIncome) * 100;
    const cardUtilization = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;
    const emergencyBuffer = activeHousing > 0 ? finalSavings / activeHousing : 0;

    // Simple CIBIL Score logic (300 to 900)
    let cibil = 650; // Average base score

    // Utilization impact
    if (cardUtilization < 10) cibil += 100;
    else if (cardUtilization < 30) cibil += 60;
    else if (cardUtilization > 70) cibil -= 80;
    else cibil -= 20;

    // Late payment impact
    if (finalLatePayments === 0) cibil += 80;
    else cibil -= (finalLatePayments * 90);

    // DTI impact
    if (dti < 30) cibil += 50;
    else if (dti > 50) cibil -= 60;

    // Savings impact
    if (savingsRate > 20) cibil += 20;

    cibil = Math.min(900, Math.max(300, Math.round(cibil)));

    // Simple health score (0 - 100)
    let health = 50;
    if (dti < 35) health += 20;
    else health -= 10;
    if (savingsRate > 20) health += 20;
    if (cardUtilization < 30) health += 10;
    if (emergencyBuffer > 3) health += 10;

    health = Math.min(100, Math.max(0, Math.round(health)));

    return {
      creditScore: cibil,
      healthScore: health,
      dti,
      savingsRate,
      cardUtilization,
      emergencyBuffer,
      totalLimit,
      totalBalance,
      loanAddedDesc
    };
  };

  const currentMetrics = computeScores({
    activeIncome: profile.income,
    activeHousing: profile.housingPayment,
    activeDebtPayments: profile.otherDebtPayments,
    activeSavings: profile.currentSavings,
    activeCards: cards,
    activeLatePayments: profile.latePaymentsCount,
    simParams: { extraPayment: 0, newCardBalance: 0, openNewCard: false, takeLoan: 'none', missedPayment: false, savingsIncrease: 0 }
  });

  const simulatedMetrics = computeScores({
    activeIncome: profile.income,
    activeHousing: profile.housingPayment,
    activeDebtPayments: profile.otherDebtPayments,
    activeSavings: profile.currentSavings,
    activeCards: cards,
    activeLatePayments: profile.latePaymentsCount,
    simParams: {
      extraPayment: simExtraPayment,
      newCardBalance: simNewCardBalance,
      openNewCard: simOpenNewCard,
      takeLoan: simTakeLoan,
      missedPayment: simMissedPayment,
      savingsIncrease: simIncreaseSavings
    }
  });

  // Simple 12-month projections
  const generate12MonthForecast = (scoreStart, isSimulated = false) => {
    let forecast = [];
    let currentTempScore = scoreStart;
    const utilization = isSimulated ? simulatedMetrics.cardUtilization : currentMetrics.cardUtilization;
    const change = utilization < 30 ? 4 : -2;

    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
    for (let i = 0; i < 12; i++) {
      currentTempScore += change;
      forecast.push({
        month: months[i],
        score: Math.min(900, Math.max(300, Math.round(currentTempScore)))
      });
    }
    return forecast;
  };

  // Simple warnings list
  const getAlerts = () => {
    let alertsList = [];
    if (currentMetrics.cardUtilization > 60) {
      alertsList.push({
        id: 'r1',
        type: 'danger',
        title: 'High Credit Utilization',
        message: `Your credit card usage is at ${Math.round(currentMetrics.cardUtilization)}%. Keep it under 30% to maintain a good CIBIL score.`
      });
    }
    if (profile.latePaymentsCount > 0) {
      alertsList.push({
        id: 'r2',
        type: 'danger',
        title: 'Missed EMIs Flagged',
        message: `${profile.latePaymentsCount} late payments recorded. Set up auto-debits to avoid score drops.`
      });
    }
    if (currentMetrics.dti > 45) {
      alertsList.push({
        id: 'r3',
        type: 'warning',
        title: 'High Monthly Debt',
        message: `Your EMI obligations exceed 45% of your income. Control your borrowing.`
      });
    }
    return alertsList;
  };

  // Simple advice list
  const getAIRecommendations = () => {
    let recs = [];
    if (currentMetrics.cardUtilization > 30) {
      recs.push({
        title: 'Lower Credit Card Balance',
        message: 'Pay off outstanding card balances early in the month to drop usage below 30%.',
        impact: '+40 CIBIL Points',
        priority: 'High'
      });
    }
    if (profile.latePaymentsCount > 0) {
      recs.push({
        title: 'Clear Overdue EMIs',
        message: 'Pay any late installments immediately to stop further CIBIL score drops.',
        impact: 'Stop Score Damage',
        priority: 'Critical'
      });
    }
    if (currentMetrics.emergencyBuffer < 3) {
      recs.push({
        title: 'Build Emergency Savings',
        message: 'Save at least 3 months of rent and basic expenses to handle financial emergencies.',
        impact: '+15 Health Points',
        priority: 'Medium'
      });
    }
    if (recs.length === 0) {
      recs.push({
        title: 'Maintain Active History',
        message: 'Your financials look optimized! Keep making prompt card payments to maintain score stability.',
        impact: 'Stable Growth',
        priority: 'Low'
      });
    }
    return recs;
  };

  const predictLoanEligibility = (loanType, requestAmount = 0) => {
    const { creditScore, dti } = currentMetrics;
    let probability = 'Low';
    let reasons = [];
    let checkList = [
      { name: 'CIBIL Score > 700', met: creditScore >= 700 },
      { name: 'Monthly DTI < 40%', met: dti < 40 },
      { name: 'Income Status Verified', met: profile.employmentStatus === 'employed' }
    ];

    if (creditScore >= 750 && dti <= 35) {
      probability = 'High';
      reasons.push('Excellent CIBIL score is prime for approval.');
      reasons.push('Low debt-to-income ratio meets underwriting criteria.');
    } else if (creditScore >= 680 && dti <= 45) {
      probability = 'Medium';
      reasons.push('Fair credit score. Might require collateral or have higher interest.');
    } else {
      probability = 'Low';
      if (creditScore < 680) reasons.push('CIBIL score is too low.');
      if (dti > 45) reasons.push('Monthly EMIs consume too much income.');
    }

    return { probability, reasons, checkList };
  };

  return (
    <FinancialContext.Provider value={{
      profile, cards, transactions, goals,
      currentMetrics, simulatedMetrics,
      
      // Simulation variables
      simExtraPayment, setSimExtraPayment,
      simNewCardBalance, setSimNewCardBalance,
      simOpenNewCard, setSimOpenNewCard,
      simTakeLoan, setSimTakeLoan,
      simMissedPayment, setSimMissedPayment,
      simIncreaseSavings, setSimIncreaseSavings,
      resetSimulation,
      
      updateProfile, addCard, deleteCard,
      addTransaction, deleteTransaction,
      addGoal, updateGoalProgress, deleteGoal,
      
      forecastData: generate12MonthForecast(currentMetrics.creditScore, false),
      simForecastData: generate12MonthForecast(simulatedMetrics.creditScore, true),
      alerts: getAlerts(),
      aiRecommendations: getAIRecommendations(),
      predictLoanEligibility
    }}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancials = () => useContext(FinancialContext);
