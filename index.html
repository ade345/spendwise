<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#3157d5">
<meta name="description" content="SpendWise personal finance dashboard">

<link rel="icon" href="icon-192.png">
<title>SpendWise — Personal Finance (v10)</title>
<link rel="stylesheet" href="style.css?v=11">
<style>
.whatif-grid{display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr;gap:12px;align-items:end}.whatif-grid label{display:flex;flex-direction:column;gap:7px;font-weight:700}.whatif-grid input{padding:12px;border:1px solid #dbe2ed;border-radius:10px;font:inherit}.whatif-result{padding:14px;border:1px solid #e2e7ef;border-radius:12px}.whatif-result span{display:block;color:#647087;font-size:12px}.whatif-result strong{display:block;font-size:20px;margin-top:5px}.analysis-row{padding:12px 0;border-bottom:1px solid #e7ebf2}.analysis-row:last-child{border-bottom:0}.analysis-head,.analysis-meta{display:flex;justify-content:space-between;gap:12px}.analysis-head{font-weight:800}.analysis-meta{color:#647087;font-size:12px;margin-top:5px}.analysis-bar{height:8px;background:#e9edf5;border-radius:99px;overflow:hidden;margin-top:8px}.analysis-fill{height:100%;background:#3157d5;border-radius:99px}.recommendation{padding:12px;border:1px solid #e2e7ef;border-radius:12px;margin:8px 0}.recommendation b{display:block;margin-bottom:4px}.recommendation span{display:block;color:#647087;font-size:13px;line-height:1.45}.cut-strong{border-left:4px solid #c64b4b;padding-left:12px}.cut-warning{border-left:4px solid #e08a2e;padding-left:12px}.cut-good{border-left:4px solid #3157d5;padding-left:12px}.money-plan{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.money-plan>div{padding:16px;border:1px solid #e2e7ef;border-radius:14px}.money-plan strong{display:block;font-size:22px;margin-top:6px}.health-item{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #eef1f5;font-size:13px}.analysis-note{margin-top:18px}@media(max-width:800px){.whatif-grid{grid-template-columns:1fr 1fr}.money-plan{grid-template-columns:1fr}}@media(max-width:520px){.whatif-grid{grid-template-columns:1fr}}
</style>
</head>
<body>

<div id="authScreen" class="auth-screen">
  <div class="auth-card">
    <div class="auth-brand"><div class="logo">S</div><div><h1>SpendWise</h1><p>Personal finance, made clear.</p></div></div>
    <div id="loginView">
      <h2>Welcome back</h2><p class="auth-sub">Sign in to keep your finances organized.</p>
      <form id="loginForm" class="auth-form">
        <label>Email<input id="loginEmail" type="email" autocomplete="email" required placeholder="you@example.com"></label>
        <label>Password<input id="loginPassword" type="password" autocomplete="current-password" required placeholder="••••••••"></label>
        <button class="btn primary full" type="submit">Sign in</button>
      </form>
      <button id="forgotBtn" class="text-btn">Forgot password?</button>
      <p class="switch">New to SpendWise? <button id="showSignup" class="text-btn inline">Create account</button></p>
      <div class="demo-note">Demo mode: your account is stored securely in this browser until cloud authentication is connected.</div>
    </div>
    <div id="signupView" hidden>
      <h2>Create your account</h2><p class="auth-sub">Your personal finance dashboard starts here.</p>
      <form id="signupForm" class="auth-form">
        <label>Full name<input id="signupName" required placeholder="Your name"></label>
        <label>Email<input id="signupEmail" type="email" autocomplete="email" required placeholder="you@example.com"></label>
        <label>Password<input id="signupPassword" type="password" minlength="8" autocomplete="new-password" required placeholder="At least 8 characters"></label>
        <label>Confirm password<input id="signupConfirm" type="password" minlength="8" required placeholder="Repeat password"></label>
        <button class="btn primary full" type="submit">Create account</button>
      </form>
      <p class="switch">Already have an account? <button id="showLogin" class="text-btn inline">Sign in</button></p>
    </div>
  </div>
</div>

<header class="topbar">
  <div class="brand"><div class="logo">S</div><div><h1>SpendWise</h1><p>Track • Understand • Cut • Save</p></div></div>
  <div id="accountBox" class="account-box" hidden><span id="userInitial">U</span><div><b id="userName">User</b><small id="userEmail"></small></div><button id="logoutBtn" class="text-btn">Log out</button></div>
  <div class="top-actions">
    <button id="installBtn" class="btn primary" hidden>Install App</button>
    <button id="exportBtn" class="btn secondary">Backup</button>
    <label class="btn secondary file-btn">Restore<input id="importFile" type="file" accept=".json"></label>
  </div>
</header>

<main class="container">
  <section class="hero">
    <div><h2>Your money, under control.</h2><p>Record income and spending, build a budget, find waste, and turn your numbers into decisions.</p></div>
    <label class="month"><span>Month</span><input id="month" type="month"></label>
  </section>

  <nav class="tabs">
    <button class="tab active" data-tab="dashboard">Dashboard</button>
    <button class="tab" data-tab="transactions">Transactions</button>
    <button class="tab" data-tab="budget">Budget</button>
    <button class="tab" data-tab="recurring">Recurring</button>
    <button class="tab" data-tab="goals">Goals</button>
    <button class="tab" data-tab="analysis">Analysis</button>
    <button class="tab" data-tab="money">Money</button>
  </nav>

  <section id="dashboard" class="tab-panel active">
    <div class="stats">
      <article class="stat"><span>Income</span><strong id="income">€0.00</strong><small>This month</small></article>
      <article class="stat"><span>Spent</span><strong id="spent">€0.00</strong><small>This month</small></article>
      <article class="stat"><span>Balance</span><strong id="balance">€0.00</strong><small>Income minus spending</small></article>
      <article class="stat"><span>Potential savings</span><strong id="waste">€0.00</strong><small>Marked wants / unnecessary</small></article>
    </div>

    <div class="grid two">
      <article class="card">
        <div class="heading"><div><h3>Monthly snapshot</h3><p>How your money is being used.</p></div></div>
        <div id="categoryChart" class="bars"></div>
      </article>
      <article class="card">
  <h3>Monthly comparison</h3>
  <p class="muted">Current month versus the previous month.</p>
  <div id="monthlyComparison" class="recommendations"></div>
  </article>
      <article class="card">
        <div class="heading"><div><h3>What to cut first</h3><p>Highest-impact opportunities.</p></div></div>
        <div id="recommendations" class="recommendations"></div>
      </article>
    </div>

    <div class="grid three">
      <article class="card"><h3>Budget status</h3><div class="big" id="budgetStatus">No budget set</div><div class="progress"><i id="budgetBar"></i></div><p id="budgetText" class="muted">Set your monthly budget in Budget.</p></article>
      <article class="card"><h3>Savings goals</h3><div class="big" id="goalProgress">€0.00</div><p id="goalText" class="muted">No goals yet.</p></article>
      <article class="card"><h3>Top spending</h3><div class="big" id="topCategory">—</div><p id="topCategoryAmount" class="muted">€0.00</p></article>
    </div>
  </section>

  <section id="transactions" class="tab-panel">
    <article class="card">
      <div class="heading"><div><h3>Add transaction</h3><p>Enter income or an expense.</p></div></div>
      <form id="txForm" class="form-grid">
        <label>Type<select id="txType"><option value="expense">Expense</option><option value="income">Income</option></select></label>
        <label>Date<input id="txDate" type="date" required></label>
        <label>Amount<input id="txAmount" type="number" min="0.01" step="0.01" required></label>
        <label>Category<select id="txCategory" required></select></label>
        <label>Description<input id="txDescription" maxlength="100" placeholder="e.g. supermarket"></label>
        <label>Payment<select id="txPayment"><option>Cash</option><option>Debit Card</option><option>Credit Card</option><option>Bank Transfer</option><option>Mobile Payment</option></select></label>
        <label class="check"><input id="txWant" type="checkbox"><span><b>Want / unnecessary</b><small>Potential cut</small></span></label>
        <label class="check"><input id="txRecurring" type="checkbox"><span><b>Recurring</b><small>Regular payment/income</small></span></label>
        <button class="btn primary full" type="submit">Add transaction</button>
      </form>
    </article>
    <article class="card">
      <div class="heading"><div><h3>Transaction history</h3><p id="txCount"></p></div><input id="search" class="search" placeholder="Search..."></div>
      <div class="table-wrap"><table><thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Category</th><th>Amount</th><th>Flag</th><th></th></tr></thead><tbody id="txTable"></tbody></table></div>
      <div id="txEmpty" class="empty">No transactions found.</div>
    </article>
  </section>

  <section id="budget" class="tab-panel">
    <div class="grid two">
      <article class="card"><h3>Monthly budget</h3><p class="muted">Set the maximum amount you want to spend.</p>
        <label>Budget amount<input id="budgetInput" type="number" min="0" step="0.01"></label>
        <button id="saveBudget" class="btn primary full">Save budget</button>
      </article>
      <article class="card"><h3>Category limits</h3><p class="muted">Optional limits help identify overspending earlier.</p>
        <div id="categoryLimits"></div>
        <button id="saveLimits" class="btn primary full">Save category limits</button>
      </article>
    </div>
  </section>

  <section id="recurring" class="tab-panel">
    <article class="card"><div class="heading"><div><h3>Recurring expenses & income</h3><p>Track bills and regular money movements.</p></div></div>
      <form id="recurringForm" class="form-grid">
        <label>Name<input id="rName" required placeholder="Rent"></label>
        <label>Type<select id="rType"><option value="expense">Expense</option><option value="income">Income</option></select></label>
        <label>Amount<input id="rAmount" type="number" min="0.01" step="0.01" required></label>
        <label>Category<select id="rCategory"></select></label>
        <label>Day of month<input id="rDay" type="number" min="1" max="31" value="1"></label>
        <button class="btn primary full" type="submit">Add recurring item</button>
      </form>
      <div id="recurringList" class="list"></div>
    </article>
  </section>

  <section id="goals" class="tab-panel">
    <article class="card"><div class="heading"><div><h3>Savings goals</h3><p>Give your savings a purpose.</p></div></div>
      <form id="goalForm" class="form-grid">
        <label>Goal name<input id="gName" required placeholder="Emergency fund"></label>
        <label>Target amount<input id="gTarget" type="number" min="1" step="0.01" required></label>
        <label>Current saved<input id="gSaved" type="number" min="0" step="0.01" value="0"></label>
        <button class="btn primary full" type="submit">Add goal</button>
      </form>
      <div id="goalList" class="goals"></div>
    </article>
  </section>

  <section id="analysis" class="tab-panel">
  <div class="stats">
    <article class="stat"><span>Monthly income</span><strong id="analysisIncome">€0.00</strong><small>Money coming in this month</small></article>
    <article class="stat"><span>Monthly spending</span><strong id="analysisSpent">€0.00</strong><small>All recorded expenses</small></article>
    <article class="stat"><span>Savings rate</span><strong id="analysisSavingsRate">0%</strong><small>Share of income remaining</small></article>
    <article class="stat"><span>Recommended savings</span><strong id="analysisTarget">€0.00</strong><small>20% starting guideline</small></article>
  </div>

  <div class="grid two">
    <article class="card">
      <h3>Financial health</h3>
      <div id="healthScore" class="score">0</div>
      <p id="healthText" class="muted"></p>
      <div id="healthBreakdown" class="recommendations"></div>
    </article>
    <article class="card">
      <h3>Monthly position</h3>
      <div id="moneyPlan" class="money-plan"></div>
    </article>
  </div>

  <div class="grid two">
    <article class="card">
      <h3>Where your money is going</h3>
      <p class="muted">Spend is measured against both income and total expenses.</p>
      <div id="categoryAnalysis" class="recommendations"></div>
    </article>
    <article class="card">
      <h3>What to cut first</h3>
      <p class="muted">Prioritized by impact, flexibility and category type.</p>
      <div id="cutPlan" class="recommendations"></div>
    </article>
  </div>

  <article class="card">
    <h3>What-if savings calculator</h3>
    <p class="muted">Choose a monthly savings target and SpendWise calculates the spending limit and gap.</p>
    <div class="whatif-grid">
      <label>Monthly savings goal
        <input id="savingsGoalInput" type="number" min="0" step="10" value="400">
      </label>
      <div class="whatif-result"><span>Maximum spending</span><strong id="maxSpendResult">€0.00</strong></div>
      <div class="whatif-result"><span>Current spending</span><strong id="currentSpendResult">€0.00</strong></div>
      <div class="whatif-result"><span>Amount to cut</span><strong id="goalGapResult">€0.00</strong></div>
    </div>
    <div id="goalMessage" class="recommendation"></div>
  </article>

  <div class="grid two">
    <article class="card">
      <h3>Spending risk signals</h3>
      <div id="riskSignals" class="recommendations"></div>
    </article>
    <article class="card">
      <h3>Best opportunities</h3>
      <div id="opportunitySummary" class="recommendations"></div>
    </article>
  </div>
<section class="card analysis-section">
  <h3>Spending analysis</h3>
  <p class="muted">A closer look at where your money is going.</p>

  <div class="analysis-grid">

  <div id="analysisTarget" style="display:none"></div>
  <div id="analysisCapacity" style="display:none"></div>
  <div id="analysisStatus" style="display:none"></div>
  <div id="analysisGap" style="display:none"></div>

  <div class="analysis-box">
      <span class="analysis-label">Total spending</span>
      <strong id="analysisTotalSpend">€0.00</strong>
      <small id="analysisSpendMessage" class="muted">
        Your spending this month.
      </small>
    </div>

    <div class="analysis-box">
      <span class="analysis-label">Largest category</span>
      <strong id="analysisTopCategory">—</strong>
      <small id="analysisTopCategoryAmount" class="muted">
        No spending recorded.
      </small>
    </div>

    <div class="analysis-box">
      <span class="analysis-label">Savings position</span>
      <strong id="analysisSavingsPosition">€0.00</strong>
      <small id="analysisSavingsMessage" class="muted">
        Compared with your savings target.
      </small>
    </div>

    <div class="analysis-box">
      <span class="analysis-label">Potential monthly saving</span>
      <strong id="analysisPotentialSaving">€0.00</strong>
      <small id="analysisPotentialMessage" class="muted">
        Based on your highest-impact category.
      </small>
    </div>

  </div>

  <div class="analysis-recommendation" id="analysisRecommendation">
    <b>Smart recommendation</b>
    <p class="muted">SpendWise will generate a recommendation here.</p>
  </div>

  <div class="analysis-alerts" id="analysisAlerts"></div>

<div class="monthly-chart">
  <h4>Monthly spending</h4>
  <p class="muted">See how your spending changes from month to month.</p>
  <div id="monthlySpendingChart" class="monthly-bars"></div>
</div>

</section>
  <article class="card">
    <h3>Monthly action plan</h3>
    <div id="actionPlan" class="recommendations"></div>
    <p class="muted analysis-note">SpendWise uses transparent budgeting rules and your recorded transactions. Suggestions are planning estimates, not individualized financial advice.</p>
  </article>
</section>
 
<section id="money" class="tab-panel">

  <!-- MONEY OVERVIEW + ADD ACCOUNT -->
  <div class="grid two">

    <!-- MONEY OVERVIEW -->
    <article class="card">

      <div class="heading">
        <div>
          <h3>Money overview</h3>
          <p class="muted">
            See how much money you currently have.
          </p>
        </div>
      </div>

      <div class="analysis-grid">

        <div class="analysis-box">
          <span class="analysis-label">Available money</span>
          <strong id="totalAvailableMoney">€0.00</strong>
          <small class="muted">
            Bank, savings and cash
          </small>
        </div>

        <div class="analysis-box">
          <span class="analysis-label">Credit card debt</span>
          <strong id="totalCreditCardDebt">€0.00</strong>
          <small class="muted">
            Current card balances
          </small>
        </div>

        <div class="analysis-box">
          <span class="analysis-label">Total debt</span>
          <strong id="totalDebt">€0.00</strong>
          <small class="muted">
            Loans and credit cards
          </small>
        </div>

        <div class="analysis-box">
          <span class="analysis-label">Net position</span>
          <strong id="netFinancialPosition">€0.00</strong>
          <small class="muted">
            Money minus debt
          </small>
        </div>

      </div>

    </article>


    <!-- ADD ACCOUNT -->
    <article class="card">

      <div class="heading">
        <div>
          <h3>Add account</h3>
          <p class="muted">
            Add your current bank, card, savings or cash balance.
          </p>
        </div>
      </div>

      <form id="accountForm">

        <label>
          Account name
          <input
            id="accountName"
            type="text"
            placeholder="e.g. Main Bank Account"
            required
          >
        </label>

        <label>
          Account type
          <select id="accountType" required>
            <option value="bank">Bank account</option>
            <option value="debit_card">Debit card</option>
            <option value="savings">Savings</option>
            <option value="cash">Cash</option>
            <option value="credit_card">Credit card</option>
          </select>
        </label>

        <label>
          Current balance
          <input
            id="accountBalance"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            required
          >
        </label>

        <label>
          Last 4 digits
          <input
            id="accountLastFour"
            type="text"
            inputmode="numeric"
            maxlength="4"
            placeholder="Optional"
          >
        </label>

        <button
          class="btn primary full"
          type="submit"
        >
          Add account
        </button>

      </form>

    </article>

  </div>


  <!-- ACCOUNTS LIST -->
  <article class="card">

    <div class="heading">
      <div>
        <h3>Your accounts</h3>
        <p class="muted">
          Your current balances and accounts.
        </p>
      </div>

      <strong id="accountCount">
        0 accounts
      </strong>
    </div>

    <div
      id="accountsList"
      class="recommendations"
    >
      <div class="empty">
        No accounts added yet.
      </div>
    </div>

  </article>


  <!-- LOANS & DEBT -->
  <article class="card">

    <div class="heading">
      <div>
        <h3>Loans &amp; Debt</h3>
        <p class="muted">
          Track loans you are currently paying.
        </p>
      </div>

      <strong id="loanCount">
        0 loans
      </strong>
    </div>


    <!-- LOAN SUMMARY -->
    <div class="analysis-grid">

      <div class="analysis-box">
        <span class="analysis-label">Total loan balance</span>
        <strong id="totalLoanBalance">€0.00</strong>
        <small class="muted">
          Amount still owed
        </small>
      </div>

      <div class="analysis-box">
        <span class="analysis-label">Monthly loan payments</span>
        <strong id="totalMonthlyLoanPayment">€0.00</strong>
        <small class="muted">
          Required each month
        </small>
      </div>

      <div class="analysis-box">
        <span class="analysis-label">Average interest rate</span>
        <strong id="averageLoanInterest">0%</strong>
        <small class="muted">
          Across active loans
        </small>
      </div>

      <div class="analysis-box">
        <span class="analysis-label">Potential extra payment</span>
        <strong id="potentialExtraLoanPayment">€0.00</strong>
        <small class="muted">
          Based on recorded cash flow
        </small>
      </div>

    </div>


    <!-- ADD LOAN -->
    <div class="card" style="margin-top:16px">

      <div class="heading">
        <div>
          <h3>Add a loan</h3>
          <p class="muted">
            Enter the details of a loan you are paying.
          </p>
        </div>
      </div>

      <form id="loanForm" class="form-grid">

        <label>
          Loan name
          <input
            id="loanName"
            type="text"
            placeholder="e.g. Personal Loan"
            required
          >
        </label>

        <label>
          Original amount
          <input
            id="loanOriginalAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="5000"
            required
          >
        </label>

        <label>
          Remaining balance
          <input
            id="loanRemainingBalance"
            type="number"
            min="0"
            step="0.01"
            placeholder="3200"
            required
          >
        </label>

        <label>
          Interest rate (%)
          <input
            id="loanInterestRate"
            type="number"
            min="0"
            step="0.01"
            placeholder="8"
          >
        </label>

        <label>
          Monthly payment
          <input
            id="loanMonthlyPayment"
            type="number"
            min="0"
            step="0.01"
            placeholder="180"
            required
          >
        </label>

        <label>
          Payment due day
          <input
            id="loanDueDay"
            type="number"
            min="1"
            max="31"
            placeholder="15"
          >
        </label>

        <label>
          Start date
          <input
            id="loanStartDate"
            type="date"
          >
        </label>

        <label>
          Notes
          <input
            id="loanNotes"
            type="text"
            maxlength="200"
            placeholder="Optional"
          >
        </label>

        <button
          class="btn primary full"
          type="submit"
        >
          Add loan
        </button>

      </form>

    </div>


    <!-- LOAN LIST -->
    <div
      id="loansList"
      class="recommendations"
      style="margin-top:16px"
    >
      <div class="empty">
        No loans added yet.
      </div>
    </div>

  </article>


  <!-- LOAN REPAYMENT PLAN -->
  <article class="card">

    <div class="heading">
      <div>
        <h3>Loan repayment plan</h3>
        <p class="muted">
          See what your income and spending may allow.
        </p>
      </div>
    </div>

    <div class="money-plan">

      <div>
        <span>Monthly income</span>
        <strong id="loanPlanIncome">€0.00</strong>
      </div>

      <div>
        <span>Essential spending</span>
        <strong id="loanPlanEssentials">€0.00</strong>
      </div>

      <div>
        <span>Required loan payments</span>
        <strong id="loanPlanPayments">€0.00</strong>
      </div>

      <div>
  <span>Discretionary spending</span>
  <strong id="loanPlanDiscretionary">€0.00</strong>
  <small>Wants and non-essential spending</small>
</div>

<div>
  <span>Safety / savings buffer</span>
  <strong id="loanPlanBuffer">€0.00</strong>
  <small>20% of monthly income protected</small>
</div>

    </div>

    <div
      id="loanPlanMessage"
      class="recommendation"
      style="margin-top:16px"
    >
      Add your income, expenses and loan details to generate a repayment assessment.
    </div>

  

  </article>

<!-- LOAN PAYOFF PLANNER -->
<article class="card">

  <div class="heading">
    <div>
      <h3>Loan payoff planner</h3>
      <p class="muted">
        Compare your current payment with an accelerated payoff plan.
      </p>
    </div>
  </div>

  <div class="analysis-grid">

    <div class="analysis-box">
      <span class="analysis-label">
        Current monthly payment
      </span>
      <strong id="payoffCurrentPayment">€0.00</strong>
      <small>What you currently pay each month</small>
    </div>

    <div class="analysis-box">
      <span class="analysis-label">
        Accelerated monthly payment
      </span>
      <strong id="payoffAcceleratedPayment">€0.00</strong>
      <small>Current payment plus potential extra payment</small>
    </div>

    <div class="analysis-box">
      <span class="analysis-label">
        Current payoff time
      </span>
      <strong id="payoffCurrentMonths">0 months</strong>
      <small>Estimated time at your current payment</small>
    </div>

    <div class="analysis-box">
      <span class="analysis-label">
        Accelerated payoff time
      </span>
      <strong id="payoffAcceleratedMonths">0 months</strong>
      <small>Estimated time with the extra payment</small>
    </div>

    <div class="analysis-box">
      <span class="analysis-label">
        Interest remaining
      </span>
      <strong id="payoffCurrentInterest">€0.00</strong>
      <small>Estimated interest under current plan</small>
    </div>

    <div class="analysis-box">
      <span class="analysis-label">
        Interest saved
      </span>
      <strong id="payoffInterestSaved">€0.00</strong>
      <small>Potential interest saved by paying faster</small>
    </div>

  </div>

  <div class="insight-box" style="margin-top:16px;">

    <strong>
      Estimated debt-free date:
      <span id="payoffDebtFreeDate">—</span>
    </strong>

    <p class="muted">
      This is an estimate based on the remaining balance,
      interest rate and payment amounts.
    </p>

  </div>

</article>



</section>

</main>

<footer>SpendWise • Your account data is securely stored in SpendWise cloud storage.</footer>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="config.js?v=12"></script>
<script src="auth.js?v=12"></script>
<script src="script.js?v=13"></script>

<script src="advanced-analysis.js?v=12"></script>

<script>
/* SpendWise navigation fallback: works even if an older cached script is present. */
(function () {
  function activate(id, button) {
    document.querySelectorAll(".tab-panel").forEach(function (panel) {
      panel.classList.toggle("active", panel.id === id);
    });
    document.querySelectorAll(".tabs .tab").forEach(function (tab) {
      tab.classList.toggle("active", tab === button);
    });
  }
  function bind() {
    document.querySelectorAll(".tabs .tab").forEach(function (button) {
      if (button.dataset.bound === "1") return;
      button.dataset.bound = "1";
      button.addEventListener("click", function (event) {
        event.preventDefault();
        activate(button.getAttribute("data-tab"), button);
      });
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
</script>
</body></html>
