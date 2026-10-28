// ==========================================
// SpendWise - Core Application Engine
// ==========================================

const EXPENSE_CATEGORIES = [
  "Food & Groceries",
  "Housing & Rent",
  "Utilities & Bills",
  "Transportation",
  "Entertainment",
  "Shopping & Gadgets",
  "Healthcare",
  "Education",
  "Other Expense"
];

const INCOME_CATEGORIES = [
  "Salary & Wages",
  "Freelance & Consulting",
  "Investment & Dividends",
  "Business Profits",
  "Rental Income",
  "Gifts & Grants",
  "Other Income"
];

const SAMPLE_TRANSACTIONS = [
  { id: "tx-1", title: "Monthly Tech Salary", amount: 5200.00, type: "income", category: "Salary & Wages", date: "2026-10-01", payment: "Bank Transfer" },
  { id: "tx-2", title: "Apartment Monthly Rent", amount: 1450.00, type: "expense", category: "Housing & Rent", date: "2026-10-02", payment: "Bank Transfer" },
  { id: "tx-3", title: "Whole Foods Market", amount: 168.45, type: "expense", category: "Food & Groceries", date: "2026-10-04", payment: "Credit Card" },
  { id: "tx-4", title: "Freelance UI Project", amount: 850.00, type: "income", category: "Freelance & Consulting", date: "2026-10-07", payment: "Bank Transfer" },
  { id: "tx-5", title: "High-Speed Internet Bill", amount: 75.00, type: "expense", category: "Utilities & Bills", date: "2026-10-10", payment: "Debit Card" },
  { id: "tx-6", title: "Gasoline & Car Wash", amount: 62.50, type: "expense", category: "Transportation", date: "2026-10-12", payment: "Credit Card" },
  { id: "tx-7", title: "Trader Joe's Groceries", amount: 112.30, type: "expense", category: "Food & Groceries", date: "2026-10-15", payment: "Credit Card" },
  { id: "tx-8", title: "Streaming Subscriptions", amount: 35.99, type: "expense", category: "Entertainment", date: "2026-10-18", payment: "Apple / Google Pay" },
  { id: "tx-9", title: "Dinner with Friends", amount: 84.20, type: "expense", category: "Food & Groceries", date: "2026-10-22", payment: "Credit Card" },
  { id: "tx-10", title: "Fitness Club Membership", amount: 55.00, type: "expense", category: "Healthcare", date: "2026-10-25", payment: "Debit Card" }
];

const SAMPLE_BUDGETS = [
  { category: "Food & Groceries", limit: 600 },
  { category: "Housing & Rent", limit: 1500 },
  { category: "Utilities & Bills", limit: 200 },
  { category: "Transportation", limit: 180 },
  { category: "Entertainment", limit: 120 }
];

const SAMPLE_GOALS = [
  { id: "g-1", title: "Emergency Fund (6 Months)", target: 6000, current: 4250, date: "2026-12-31" },
  { id: "g-2", title: "Japan Summer Vacation", target: 2500, current: 1400, date: "2027-06-15" },
  { id: "g-3", title: "New M3 MacBook Pro", target: 1800, current: 1100, date: "2026-11-30" }
];

// App State
let appData = {
  currency: "$",
  transactions: [],
  budgets: [],
  goals: []
};

let cashflowChartInstance = null;
let categoryChartInstance = null;

// ==========================================
// Initialization & Storage
// ==========================================
function initApp() {
  loadFromStorage();
  initTheme();
  setupCategoryDropdowns();
  setTodayDate();
  renderAll();
}

function loadFromStorage() {
  const saved = localStorage.getItem("spendwise_data");
  if (saved) {
    try {
      appData = JSON.parse(saved);
    } catch (e) {
      loadSampleData(false);
    }
  } else {
    loadSampleData(false);
  }
  document.getElementById("settingCurrency").value = appData.currency || "$";
}

function saveToStorage() {
  localStorage.setItem("spendwise_data", JSON.stringify(appData));
  renderAll();
}

function loadSampleData(shouldAlert = true) {
  appData = {
    currency: "$",
    transactions: [...SAMPLE_TRANSACTIONS],
    budgets: [...SAMPLE_BUDGETS],
    goals: [...SAMPLE_GOALS]
  };
  localStorage.setItem("spendwise_data", JSON.stringify(appData));
  if (shouldAlert) {
    alert("Realistic starter data has been loaded successfully!");
    renderAll();
  }
}

function resetAllData() {
  if (confirm("Are you sure you want to clear all your financial logs? This action cannot be undone.")) {
    appData = {
      currency: "$",
      transactions: [],
      budgets: [],
      goals: []
    };
    saveToStorage();
  }
}

// ==========================================
// Theme Management
// ==========================================
function initTheme() {
  const isDark = localStorage.getItem("spendwise_theme") === "dark" || 
    (!localStorage.getItem("spendwise_theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (isDark) {
    document.documentElement.classList.add("dark");
    document.getElementById("themeIcon").className = "fa-solid fa-sun text-amber-400";
  } else {
    document.documentElement.classList.remove("dark");
    document.getElementById("themeIcon").className = "fa-solid fa-moon";
  }
}

function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("spendwise_theme", isDark ? "dark" : "light");
  document.getElementById("themeIcon").className = isDark ? "fa-solid fa-sun text-amber-400" : "fa-solid fa-moon";
  renderCharts();
}

function toggleMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  menu.classList.toggle("hidden");
}

function switchTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
  document.querySelectorAll(".nav-link").forEach(el => el.classList.remove("active"));
  
  const target = document.getElementById(`tab-${tabId}`);
  const navBtn = document.getElementById(`nav-${tabId}`);
  if (target) target.classList.remove("hidden");
  if (navBtn) navBtn.classList.add("active");

  if (tabId === "dashboard") {
    renderCharts();
  }
}

// ==========================================
// Category & Form Handlers
// ==========================================
function setupCategoryDropdowns() {
  const txFilter = document.getElementById("filterCategory");
  const allCategories = Array.from(new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]));
  
  txFilter.innerHTML = '<option value="all">All Categories</option>';
  allCategories.forEach(cat => {
    txFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
  });

  updateCategoryOptions("expense");
}

function updateCategoryOptions(type) {
  const sel = document.getElementById("txCategory");
  const cats = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  sel.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join("");
}

function setTodayDate() {
  const today = new Date().toISOString().split("T")[0];
  const txDate = document.getElementById("txDate");
  const goalDate = document.getElementById("goalDate");
  if (txDate) txDate.value = today;
  if (goalDate) {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    goalDate.value = nextYear.toISOString().split("T")[0];
  }
}

function updateCurrency(val) {
  appData.currency = val;
  saveToStorage();
}

// ==========================================
// Rendering Logic
// ==========================================
function renderAll() {
  renderSummaryStats();
  renderTransactionsTable();
  renderRecentTransactions();
  renderBudgets();
  renderGoals();
  renderCharts();
}

function formatMoney(amount) {
  return `${appData.currency || "$"}${Number(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function renderSummaryStats() {
  let income = 0;
  let expense = 0;

  appData.transactions.forEach(t => {
    if (t.type === "income") income += Number(t.amount);
    if (t.type === "expense") expense += Number(t.amount);
  });

  const netBalance = income - expense;
  const savingsRate = income > 0 ? Math.max(0, ((income - expense) / income) * 100) : 0;

  document.getElementById("statNetBalance").textContent = formatMoney(netBalance);
  document.getElementById("statTotalIncome").textContent = formatMoney(income);
  document.getElementById("statTotalExpense").textContent = formatMoney(expense);
  document.getElementById("statSavingsRate").textContent = `${savingsRate.toFixed(1)}%`;

  const statusLabel = document.getElementById("statBalanceStatus");
  if (netBalance >= 0) {
    statusLabel.textContent = "Positive Cashflow";
    statusLabel.className = "inline-block text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1";
  } else {
    statusLabel.textContent = "Deficit Spending";
    statusLabel.className = "inline-block text-xs font-medium text-rose-600 dark:text-rose-400 mt-1";
  }
}

// ------------------------------------------
// Transactions
// ------------------------------------------
function renderTransactionsTable() {
  const tbody = document.getElementById("transactionsTableBody");
  const emptyMsg = document.getElementById("noTransactionsMsg");
  const search = (document.getElementById("filterSearch").value || "").toLowerCase();
  const typeFilter = document.getElementById("filterType").value;
  const catFilter = document.getElementById("filterCategory").value;

  const filtered = appData.transactions.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search) || (t.payment || "").toLowerCase().includes(search);
    const matchType = typeFilter === "all" || t.type === typeFilter;
    const matchCat = catFilter === "all" || t.category === catFilter;
    return matchSearch && matchType && matchCat;
  });

  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  tbody.innerHTML = "";
  if (filtered.length === 0) {
    emptyMsg.classList.remove("hidden");
    return;
  }
  emptyMsg.classList.add("hidden");

  filtered.forEach(t => {
    const isIncome = t.type === "income";
    const amountClass = isIncome ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-900 dark:text-white font-semibold";
    const sign = isIncome ? "+" : "-";

    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-50 dark:hover:bg-slate-700/30 transition";
    tr.innerHTML = `
      <td class="py-3 px-4 text-slate-500 whitespace-nowrap">${t.date}</td>
      <td class="py-3 px-4 font-medium text-slate-900 dark:text-white">${t.title}</td>
      <td class="py-3 px-4">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isIncome ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}">
          ${t.category}
        </span>
      </td>
      <td class="py-3 px-4 text-slate-500 text-xs">${t.payment || "Other"}</td>
      <td class="py-3 px-4 text-right ${amountClass}">${sign}${formatMoney(t.amount)}</td>
      <td class="py-3 px-4 text-center">
        <button onclick="deleteTransaction('${t.id}')" class="text-slate-400 hover:text-rose-500 transition px-2 py-1">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderRecentTransactions() {
  const container = document.getElementById("recentTransactionsList");
  const recent = [...appData.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  container.innerHTML = "";
  if (recent.length === 0) {
    container.innerHTML = '<p class="text-xs text-slate-400 py-3">No activity recorded yet.</p>';
    return;
  }

  recent.forEach(t => {
    const isIncome = t.type === "income";
    container.innerHTML += `
      <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded-lg ${isIncome ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-rose-100 dark:bg-rose-950 text-rose-600'} flex items-center justify-center text-xs">
            <i class="fa-solid ${isIncome ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
          </div>
          <div>
            <p class="text-xs font-semibold text-slate-900 dark:text-white">${t.title}</p>
            <p class="text-[11px] text-slate-500">${t.category} • ${t.date}</p>
          </div>
        </div>
        <span class="text-xs font-bold ${isIncome ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-200'}">
          ${isIncome ? '+' : '-'}${formatMoney(t.amount)}
        </span>
      </div>
    `;
  });
}

function handleTransactionSubmit(e) {
  e.preventDefault();
  const title = document.getElementById("txTitle").value;
  const amount = parseFloat(document.getElementById("txAmount").value);
  const type = document.getElementById("txType").value;
  const category = document.getElementById("txCategory").value;
  const date = document.getElementById("txDate").value;
  const payment = document.getElementById("txPayment").value;

  const newTx = {
    id: "tx-" + Date.now(),
    title,
    amount,
    type,
    category,
    date,
    payment
  };

  appData.transactions.push(newTx);
  saveToStorage();
  closeModal("transactionModal");
  e.target.reset();
  setTodayDate();
}

function deleteTransaction(id) {
  if (confirm("Delete this transaction entry?")) {
    appData.transactions = appData.transactions.filter(t => t.id !== id);
    saveToStorage();
  }
}

// ------------------------------------------
// Budgets
// ------------------------------------------
function renderBudgets() {
  const grid = document.getElementById("budgetsGrid");
  const quickList = document.getElementById("quickBudgetList");

  grid.innerHTML = "";
  quickList.innerHTML = "";

  if (appData.budgets.length === 0) {
    grid.innerHTML = '<p class="text-sm text-slate-400 col-span-3">No budgets set yet. Click "Set New Budget" to begin.</p>';
    quickList.innerHTML = '<p class="text-xs text-slate-400 py-3">No budgets active yet.</p>';
    return;
  }

  // Calculate actual spending per category
  const spending = {};
  appData.transactions.filter(t => t.type === "expense").forEach(t => {
    spending[t.category] = (spending[t.category] || 0) + Number(t.amount);
  });

  appData.budgets.forEach(b => {
    const spent = spending[b.category] || 0;
    const pct = Math.min(100, Math.round((spent / b.limit) * 100));
    const isExceeded = spent > b.limit;
    const isWarning = pct >= 80 && !isExceeded;

    let barColor = "bg-emerald-500";
    let badgeColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
    let statusText = "On Track";

    if (isExceeded) {
      barColor = "bg-rose-500";
      badgeColor = "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300";
      statusText = "Over Budget!";
    } else if (isWarning) {
      barColor = "bg-amber-500";
      badgeColor = "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
      statusText = "Near Limit";
    }

    // Full Card
    grid.innerHTML += `
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-base font-bold text-slate-900 dark:text-white">${b.category}</h4>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}">${statusText}</span>
          </div>
          <div class="flex justify-between text-xs text-slate-500 mb-2">
            <span>Spent: <b>${formatMoney(spent)}</b></span>
            <span>Limit: <b>${formatMoney(b.limit)}</b></span>
          </div>
          <div class="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div class="${barColor} h-full rounded-full transition-all duration-300" style="width: ${pct}%"></div>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
          <span class="text-slate-400">${isExceeded ? 'Exceeded by ' + formatMoney(spent - b.limit) : formatMoney(b.limit - spent) + ' remaining'}</span>
          <button onclick="deleteBudget('${b.category}')" class="text-slate-400 hover:text-rose-500 transition">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;

    // Quick list item
    quickList.innerHTML += `
      <div>
        <div class="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          <span>${b.category}</span>
          <span>${formatMoney(spent)} / ${formatMoney(b.limit)} (${pct}%)</span>
        </div>
        <div class="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
          <div class="${barColor} h-full rounded-full" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  });
}

function handleBudgetSubmit(e) {
  e.preventDefault();
  const category = document.getElementById("budgetCategory").value;
  const limit = parseFloat(document.getElementById("budgetLimit").value);

  // Replace existing or push new
  const idx = appData.budgets.findIndex(b => b.category === category);
  if (idx >= 0) {
    appData.budgets[idx].limit = limit;
  } else {
    appData.budgets.push({ category, limit });
  }

  saveToStorage();
  closeModal("budgetModal");
  e.target.reset();
}

function deleteBudget(category) {
  if (confirm(`Remove budget for ${category}?`)) {
    appData.budgets = appData.budgets.filter(b => b.category !== category);
    saveToStorage();
  }
}

// ------------------------------------------
// Goals
// ------------------------------------------
function renderGoals() {
  const grid = document.getElementById("goalsGrid");
  grid.innerHTML = "";

  if (appData.goals.length === 0) {
    grid.innerHTML = '<p class="text-sm text-slate-400 col-span-3">No savings goals set. Click "Create New Goal" to build your targets.</p>';
    return;
  }

  appData.goals.forEach(g => {
    const pct = Math.min(100, Math.round(((g.current || 0) / g.target) * 100));
    grid.innerHTML += `
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-base font-bold text-slate-900 dark:text-white">${g.title}</h4>
            <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">${pct}%</span>
          </div>
          <p class="text-xs text-slate-400 mb-3">Target Date: ${g.date}</p>
          <div class="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Saved: <b>${formatMoney(g.current)}</b></span>
            <span>Goal: <b>${formatMoney(g.target)}</b></span>
          </div>
          <div class="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300" style="width: ${pct}%"></div>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
          <button onclick="addFundsToGoal('${g.id}')" class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition">
            <i class="fa-solid fa-plus-circle mr-1"></i> Add Funds
          </button>
          <button onclick="deleteGoal('${g.id}')" class="text-slate-400 hover:text-rose-500 transition px-2">
            <i class="fa-solid fa-trash-can text-xs"></i>
          </button>
        </div>
      </div>
    `;
  });
}

function handleGoalSubmit(e) {
  e.preventDefault();
  const title = document.getElementById("goalTitle").value;
  const target = parseFloat(document.getElementById("goalTarget").value);
  const current = parseFloat(document.getElementById("goalCurrent").value || 0);
  const date = document.getElementById("goalDate").value;

  appData.goals.push({
    id: "g-" + Date.now(),
    title,
    target,
    current,
    date
  });

  saveToStorage();
  closeModal("goalModal");
  e.target.reset();
}

function addFundsToGoal(id) {
  const goal = appData.goals.find(g => g.id === id);
  if (!goal) return;
  const amountStr = prompt(`Deposit funds into "${goal.title}":`, "100");
  const amount = parseFloat(amountStr);
  if (!isNaN(amount) && amount > 0) {
    goal.current = (goal.current || 0) + amount;
    saveToStorage();
  }
}

function deleteGoal(id) {
  if (confirm("Delete this savings goal?")) {
    appData.goals = appData.goals.filter(g => g.id !== id);
    saveToStorage();
  }
}

// ==========================================
// Charts via Chart.js
// ==========================================
function renderCharts() {
  const isDark = document.documentElement.classList.contains("dark");
  const textColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "rgba(51, 65, 85, 0.4)" : "rgba(226, 232, 240, 0.8)";

  // 1. Cashflow Trend Chart
  const cfCtx = document.getElementById("cashflowChart");
  if (cfCtx) {
    if (cashflowChartInstance) cashflowChartInstance.destroy();

    // Group transactions by month
    const months = {};
    appData.transactions.forEach(t => {
      const m = t.date ? t.date.substring(0, 7) : "Other";
      if (!months[m]) months[m] = { income: 0, expense: 0 };
      if (t.type === "income") months[m].income += Number(t.amount);
      if (t.type === "expense") months[m].expense += Number(t.amount);
    });

    const sortedMonths = Object.keys(months).sort();
    const incomeData = sortedMonths.map(m => months[m].income);
    const expenseData = sortedMonths.map(m => months[m].expense);

    cashflowChartInstance = new Chart(cfCtx, {
      type: "bar",
      data: {
        labels: sortedMonths.length ? sortedMonths : ["Current Month"],
        datasets: [
          {
            label: "Income",
            data: sortedMonths.length ? incomeData : [0],
            backgroundColor: "#10b981",
            borderRadius: 6
          },
          {
            label: "Expenses",
            data: sortedMonths.length ? expenseData : [0],
            backgroundColor: "#f43f5e",
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: { color: textColor, boxWidth: 12 }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor }
          }
        }
      }
    });
  }

  // 2. Spending Category Donut Chart
  const catCtx = document.getElementById("categoryChart");
  if (catCtx) {
    if (categoryChartInstance) categoryChartInstance.destroy();

    const spending = {};
    appData.transactions.filter(t => t.type === "expense").forEach(t => {
      spending[t.category] = (spending[t.category] || 0) + Number(t.amount);
    });

    const labels = Object.keys(spending);
    const data = Object.values(spending);

    categoryChartInstance = new Chart(catCtx, {
      type: "doughnut",
      data: {
        labels: labels.length ? labels : ["No Expenses Recorded"],
        datasets: [{
          data: data.length ? data : [1],
          backgroundColor: [
            "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", 
            "#ec4899", "#f59e0b", "#f97316", "#ef4444", "#64748b"
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: textColor, boxWidth: 10, font: { size: 11 } }
          }
        },
        cutout: "68%"
      }
    });
  }
}

// ==========================================
// Modal Helpers
// ==========================================
function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

// ==========================================
// Export & Import
// ==========================================
function exportCSV() {
  if (appData.transactions.length === 0) {
    alert("No transactions available to export.");
    return;
  }

  let csv = "ID,Date,Title,Type,Category,Amount,Payment Method\n";
  appData.transactions.forEach(t => {
    csv += `"${t.id}","${t.date}","${t.title}","${t.type}","${t.category}",${t.amount},"${t.payment || ''}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `spendwise_transactions_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
}

function exportJSONBackup() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
  const dlAnchorElem = document.createElement("a");
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", `spendwise_backup_${new Date().toISOString().split("T")[0]}.json`);
  dlAnchorElem.click();
}

function importJSONBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported && Array.isArray(imported.transactions)) {
        appData = imported;
        saveToStorage();
        alert("Backup restored successfully!");
      } else {
        alert("Invalid backup file structure.");
      }
    } catch (err) {
      alert("Error reading JSON file.");
    }
  };
  reader.readAsText(file);
}

// Auto start
window.addEventListener("DOMContentLoaded", initApp);
