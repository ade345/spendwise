const CATS = ["Food & Groceries","Eating Out","Transport","Housing","Utilities","Shopping","Entertainment","Health","Education","Family","Subscriptions","Debt","Other"];
const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat("en-IE",{style:"currency",currency:"EUR"}).format(Number(n)||0);
const today = () => new Date().toISOString().slice(0,10);
const selectedMonth = () => $("month").value || today().slice(0,7);

async function userOrNull() {
  const { data: { user } } = await window.spendwiseSupabase.auth.getUser();
  return user || null;
}
async function monthTransactions() {
  const user = await userOrNull();
  if (!user) return [];
  const start = selectedMonth() + "-01";
  const d = new Date(start + "T12:00:00");
  d.setMonth(d.getMonth()+1);
  const end = d.toISOString().slice(0,10);
  const { data, error } = await window.spendwiseSupabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .gte("transaction_date", start)
    .lt("transaction_date", end)
    .order("transaction_date", {ascending:false});
  if (error) { console.error(error); alert(error.message); return []; }
  return data || [];
}
async function getBudget() {
  const user = await userOrNull(); if (!user) return 0;
  const { data, error } = await window.spendwiseSupabase.from("budgets").select("amount").eq("month", selectedMonth()+"-01").maybeSingle();
  if (error) { console.error(error); return 0; }
  return Number(data?.amount || 0);
}
function fillCategories() {
  const expenseOptions = CATS.map(c=>`<option value="${c}">${c}</option>`).join("");
  const txCategory = $("txCategory");
  if (txCategory) txCategory.innerHTML = expenseOptions;
  const rCategory = $("rCategory");
  if (rCategory) rCategory.innerHTML = expenseOptions;
  syncTransactionTypeUI();
}
function syncTransactionTypeUI() {
  const type = $("txType")?.value || "expense";
  const category = $("txCategory");
  const help = $("txCategoryHelp");
  const want = $("txWant");
  const wantWrap = $("txWantWrap");
  if (!category) return;
  if (type === "income") {
    category.innerHTML = `<option value="Income">Income</option>`;
    category.value = "Income";
    category.disabled = true;
    if (help) help.textContent = "Income is automatically classified as Income.";
    if (want) { want.checked = false; want.disabled = true; }
    if (wantWrap) wantWrap.style.opacity = ".55";
  } else {
    category.disabled = false;
    category.innerHTML = CATS.map(c=>`<option value="${c}">${c}</option>`).join("");
    if (help) help.textContent = "Choose a spending category.";
    if (want) want.disabled = false;
    if (wantWrap) wantWrap.style.opacity = "1";
  }
}

const CUT_RATES={"Eating Out":0.25,"Shopping":0.20,"Entertainment":0.20,"Subscriptions":0.30,"Other":0.10,"Food & Groceries":0.08,"Transport":0.05};
const NEED_CATEGORIES=new Set(["Housing","Utilities","Food & Groceries","Transport","Health","Education","Family","Debt"]);
function eur(v){return money(v);}
function renderAnalysis(tx){
    if (!document.getElementById("analysisTotalSpend")) {
    return;
  }
  const income=tx.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount||0),0);
  const expenses=tx.filter(t=>t.type==="expense");
  const spent=expenses.reduce((s,t)=>s+Number(t.amount||0),0);
  const capacity=Math.max(0,income-spent), target=income*0.20, gap=Math.max(0,target-capacity);
  const by={}; expenses.forEach(t=>by[t.category]=(by[t.category]||0)+Number(t.amount||0));
  const rows=Object.entries(by).sort((a,b)=>b[1]-a[1]);
  const opportunities=rows.map(([cat,amount])=>{
    const flagged=expenses.filter(t=>t.category===cat&&t.is_want).reduce((s,t)=>s+Number(t.amount||0),0);
    const rate=CUT_RATES[cat]??0;
    const suggested=flagged>0?flagged*0.35:amount*rate;
    return {cat,amount,flagged,suggested,shareSpend:spent?amount/spent*100:0,shareIncome:income?amount/income*100:0};
  }).filter(x=>x.suggested>0.5).sort((a,b)=>b.suggested-a.suggested);
  const cutTotal=opportunities.reduce((s,x)=>s+x.suggested,0);
  const recommended=Math.min(cutTotal, Math.max(0,gap>0?gap:cutTotal));

 document.getElementById("analysisTarget").textContent = eur(target);
document.getElementById("analysisCapacity").textContent = eur(capacity);
document.getElementById("analysisStatus").textContent = eur(recommended);
document.getElementById("analysisGap").textContent = eur(gap);

  $("categoryAnalysis").innerHTML=rows.length?rows.slice(0,8).map(([cat,amount])=>`<div class="analysis-row"><div class="analysis-head"><span>${cat}</span><span>${eur(amount)}</span></div><div class="analysis-meta"><span>${(income?amount/income*100:0).toFixed(1)}% of income</span><span>${(spent?amount/spent*100:0).toFixed(1)}% of spending</span></div><div class="analysis-bar"><div class="analysis-fill" style="width:${Math.min(100,spent?amount/spent*100:0)}%"></div></div></div>`).join(""):`<div class="empty">Add expenses to generate analysis.</div>`;

  $("cutPlan").innerHTML=opportunities.length?opportunities.slice(0,5).map((x,i)=>{
    const cls=x.suggested>Math.max(50,income*.08)?"cut-strong":x.suggested>Math.max(20,income*.03)?"cut-warning":"cut-good";
    const reason=x.flagged?`You marked ${eur(x.flagged)} here as wants/unnecessary.`:`A conservative review rate was applied to this category.`;
    return `<div class="recommendation ${cls}"><b>${i+1}. Review ${x.cat}</b><span>Potential reduction: <strong>${eur(x.suggested)}</strong>. ${reason}</span></div>`;
  }).join(""):`<div class="empty">${income?"No discretionary cut opportunity is large enough to flag yet.":"Add income to calculate your savings plan."}</div>`;

  const needs=expenses.filter(t=>NEED_CATEGORIES.has(t.category)).reduce((s,t)=>s+Number(t.amount||0),0);
  const wants=expenses.filter(t=>t.is_want||!NEED_CATEGORIES.has(t.category)).reduce((s,t)=>s+Number(t.amount||0),0);
  $("moneyPlan").innerHTML=`<div><span>Needs guideline</span><strong>${eur(income*.50)}</strong><small>Actual: ${eur(needs)}</small></div><div><span>Wants guideline</span><strong>${eur(income*.30)}</strong><small>Actual: ${eur(wants)}</small></div><div><span>Savings guideline</span><strong>${eur(target)}</strong><small>Current capacity: ${eur(capacity)}</small></div>`;

  let score=0,msg="Add income to unlock your financial-health score.";
  if(income){
    score=100;
    if(spent>income)score-=40;else if(spent>income*.9)score-=25;else if(spent>income*.8)score-=15;
    if(capacity<target)score-=15;
    if(opportunities.length)score-=Math.min(15,opportunities.length*3);
    score=Math.max(0,Math.round(score));
    msg=score>=80?"Strong month. Keep your savings habit and review your biggest discretionary categories.":score>=60?"Fair month. You have room to improve by controlling the highest-impact categories.":"Needs attention. Start with the largest non-essential expenses and protect a savings amount each month.";
  }
  $("healthScore").textContent=score;$("healthText").textContent=msg;

  const actions=[];
  if(!income)actions.push(["Add income","Enter your income so SpendWise can calculate what you can safely aim to save."]);
  else if(gap>0)actions.push(["Close the savings gap",`You are ${eur(gap)} below the 20% starting savings target.`]);
  if(opportunities[0])actions.push(["Start here",`Review ${opportunities[0].cat}. A conservative reduction is about ${eur(opportunities[0].suggested)}.`]);
  if(spent>income&&income>0)actions.push(["Stop the overspend",`Spending is ${eur(spent-income)} above income.`]);
  if(!expenses.some(t=>t.is_want))actions.push(["Mark wants","Flag purchases you could live without. This makes recommendations more personalized."]);
  actions.push(["Review weekly","Record transactions regularly so your recommendations stay current."]);
  $("actionPlan").innerHTML=actions.map(([a,b])=>`<div class="recommendation"><b>${a}</b><span>${b}</span></div>`).join("");
 const monthlyComparison = document.getElementById("monthlyComparison");

if (monthlyComparison) {
  monthlyComparison.innerHTML = `
    <div class="recommendation">
      <b>August spending: ${eur(spent)}</b>
      <span>
        Income: ${eur(income)} ·
        Current capacity: ${eur(capacity)} ·
        Target savings: ${eur(target)}
      </span>
    </div>
  `;
}
   const topCategory = rows[0] || ["", 0];
  const topOpportunity = opportunities[0] || null;

  $("#analysisTotalSpend").textContent = eur(spent);

  $("#analysisSpendMessage").textContent =
    income > 0
      ? `${((spent / income) * 100).toFixed(1)}% of your income is being spent.`
      : "Add income to measure spending against income.";

  $("#analysisTopCategory").textContent =
    topCategory[0] || "No spending";

  $("#analysisTopCategoryAmount").textContent =
    topCategory[0]
      ? eur(topCategory[1])
      : "No spending recorded.";

  const savingsDifference = capacity - target;

  $("#analysisSavingsPosition").textContent =
    eur(Math.abs(savingsDifference));

  $("#analysisSavingsMessage").textContent =
    savingsDifference >= 0
      ? `${eur(savingsDifference)} above your savings target.`
      : `${eur(Math.abs(savingsDifference))} below your savings target.`;

  const potentialSaving = topOpportunity
    ? Number(topOpportunity.suggested || 0)
    : 0;

  $("#analysisPotentialSaving").textContent =
    eur(potentialSaving);

  $("#analysisPotentialMessage").textContent =
    topOpportunity
      ? `Estimated reduction from ${topOpportunity.cat}.`
      : "No reduction opportunity identified.";

  if (topOpportunity) {
    $("#analysisRecommendation").innerHTML = `
      <b>Smart recommendation</b>
      <p>
        Review <strong>${topOpportunity.cat}</strong>.
        A realistic reduction could free up approximately
        <strong>${eur(potentialSaving)}</strong> each month.
      </p>
    `;
  } else {
    $("#analysisRecommendation").innerHTML = `
      <b>Smart recommendation</b>
      <p class="muted">
        Your current spending pattern does not show a major reduction opportunity.
      </p>
    `;
  }

  $("#analysisAlerts").innerHTML = opportunities.length
    ? opportunities.slice(0, 3).map((item, index) => `
        <div class="recommendation">
          <b>${index + 1}. ${item.cat}</b>
          <span>
            Spending: ${eur(item.amount)} ·
            Suggested reduction: ${eur(item.suggested)}
          </span>
        </div>
      `).join("")
    : `<div class="empty">No spending alerts right now.</div>`;


}
async function renderMonthlySpendingChart() {
  const chart = $("#monthlySpendingChart");
  if (!chart) return;

  const { data, error } = await window.spendwiseSupabase
    .from("transactions")
    .select("transaction_date, amount, type")
.order("transaction_date", { ascending: true });

  if (error) {
    chart.innerHTML =
      `<div class="empty">Unable to load monthly spending.</div>`;
    return;
  }

  const monthly = {};

  (data || [])
    .filter(t => t.type === "expense")
    .forEach(t => {
      const date = new Date(t.transaction_date);

      if (Number.isNaN(date.getTime())) return;

      const key =
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      monthly[key] =
        (monthly[key] || 0) + Number(t.amount || 0);
    });

  const months = Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12);

  if (!months.length) {
    chart.innerHTML =
      `<div class="empty">No monthly spending data yet.</div>`;
    return;
  }

  const maxSpend =
    Math.max(...months.map(([, amount]) => amount), 1);

  chart.innerHTML = months.map(([key, amount]) => {
    const [year, month] = key.split("-");

    const date = new Date(
      Number(year),
      Number(month) - 1,
      1
    );

    const label = date.toLocaleDateString("en", {
      month: "short",
      year: "2-digit"
    });

    const height =
      Math.max(4, (amount / maxSpend) * 100);

    return `
      <div class="monthly-bar-item">
        <div class="monthly-bar-value">${eur(amount)}</div>

        <div class="monthly-bar-track">
          <div
            class="monthly-bar-fill"
            style="height:${height}%"
            title="${label}: ${eur(amount)}">
          </div>
        </div>

        <div class="monthly-bar-label">${label}</div>
      </div>
    `;
  }).join("");
}

  async function renderCloud() {
      if (document.readyState === "loading") {
    await new Promise(resolve => {
      document.addEventListener("DOMContentLoaded", resolve, { once: true });
    });
  }
  const tx = await monthTransactions();
  renderAnalysis(tx);
  await renderMonthlySpendingChart();
  const inc=tx.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
  const spent=tx.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);
  const waste=tx.filter(t=>t.type==="expense"&&t.is_want).reduce((s,t)=>s+Number(t.amount),0);
  const autoReview=tx.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount)*(CUT_RATES[t.category]||0),0);
  $("income").textContent=money(inc);$("spent").textContent=money(spent);$("balance").textContent=money(inc-spent);$("waste").textContent=money(Math.max(waste,autoReview));
  const map={};tx.filter(t=>t.type==="expense").forEach(t=>map[t.category]=(map[t.category]||0)+Number(t.amount));
  const entries=Object.entries(map).sort((a,b)=>b[1]-a[1]),total=spent;
  $("categoryChart").innerHTML=entries.length?entries.map(([c,v])=>`<div><div class="bar-head"><span>${c}</span><b>${money(v)} · ${total?(v/total*100).toFixed(0):0}%</b></div><div class="bar-track"><div class="bar-fill" style="width:${total?v/total*100:0}%"></div></div></div>`).join(""):`<div class="empty">No expenses recorded.</div>`;
  $("topCategory").textContent=entries[0]?.[0]||"—";$("topCategoryAmount").textContent=money(entries[0]?.[1]||0);
  const wants={};tx.filter(t=>t.type==="expense"&&t.is_want).forEach(t=>wants[t.category]=(wants[t.category]||0)+Number(t.amount));
  const ranked=Object.entries(wants).sort((a,b)=>b[1]-a[1]);
  $("recommendations").innerHTML=(ranked.length?ranked.slice(0,4).map(([c,v])=>`<div class="recommendation"><b>Review ${c}</b><span>You marked ${money(v)} as potentially unnecessary.</span></div>`):[['Mark wants','Flag purchases you could reduce to unlock useful cutting recommendations.']]).map(r=>`<div class="recommendation"><b>${r[0]}</b><span>${r[1]}</span></div>`).join("");
  const budget=await getBudget();
  $("budgetInput").value=budget||"";$("budgetStatus").textContent=budget?money(spent)+" / "+money(budget):"No budget set";$("budgetText").textContent=budget?(spent<=budget?money(budget-spent)+" remaining":money(spent-budget)+" over budget"):"Set your monthly budget in Budget.";$("budgetBar").style.width=budget?Math.min(100,spent/budget*100)+"%":"0%";$("budgetBar").classList.toggle("over",spent>budget);
  $("txCount").textContent=`${tx.length} transaction${tx.length===1?"":"s"} in ${selectedMonth()}`;$("txEmpty").style.display=tx.length?"none":"block";
  $("txTable").innerHTML=tx.map(t=>`<tr><td>${t.transaction_date}</td><td>${t.type}</td><td>${t.description||"—"}</td><td>${t.category}</td><td class="${t.type==="income"?"income-text":"expense-text"}">${t.type==="income"?"+":"-"}${money(t.amount)}</td><td>${t.is_want?'<span class="badge">Want</span>':""}${t.is_recurring?'<span class="badge">Recurring</span>':""}</td><td><button class="delete" data-id="${t.id}">Delete</button></td></tr>`).join("");
  document.querySelectorAll(".delete").forEach(b=>b.onclick=async()=>{const {error}=await window.spendwiseSupabase.from("transactions").delete().eq("id",b.dataset.id);if(error)alert(error.message);else renderCloud()});
}
window.refreshSpendWise = renderCloud;
window.forceCloudRefresh = async function(){ await renderCloud(); };

document.addEventListener("DOMContentLoaded",()=>{
  $("month").value=today().slice(0,7);$("txDate").value=today();fillCategories();
  setTimeout(()=>{ if(window.spendwiseUser) renderCloud(); }, 1200);
  $("month").onchange = async () => {
  await renderCloud();
  await loadLoans();
};
  $("txType").onchange=syncTransactionTypeUI;
  $("txForm").onsubmit=async e=>{
    e.preventDefault();const user=await userOrNull();if(!user)return alert("Please sign in.");
    const {error}=await window.spendwiseSupabase.from("transactions").insert({
      user_id:user.id,type:$("txType").value,transaction_date:$("txDate").value,amount:Number($("txAmount").value),
      category:$("txType").value==="income" ? "Income" : $("txCategory").value,description:$("txDescription").value.trim(),payment_method:$("txPayment").value,
      is_want:$("txWant").checked,is_recurring:$("txRecurring").checked
    });
    if(error)return alert(error.message);e.target.reset();$("txDate").value=today();syncTransactionTypeUI();renderCloud();
  };
  $("saveBudget").onclick=async()=>{
    const user=await userOrNull();if(!user)return alert("Please sign in.");
    const amount=Number($("budgetInput").value)||0;
    const {error}=await window.spendwiseSupabase.from("budgets").upsert({user_id:user.id,month:selectedMonth()+"-01",amount},{onConflict:"user_id,month"});
    if(error)alert(error.message);else renderCloud();
  };
});

// ============================================================
// LOANS & DEBT
// ============================================================

async function loadLoans() {
  const user = await userOrNull();

  if (!user) return;

  const { data, error } = await window.spendwiseSupabase
    .from("loans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Unable to load loans:", error);
    return;
  }

  const loans = data || [];

  const loanCount = $("loanCount");
  const loansList = $("loansList");
  const totalLoanBalance = $("totalLoanBalance");
  const totalMonthlyLoanPayment = $("totalMonthlyLoanPayment");
  const averageLoanInterest = $("averageLoanInterest");

  if (loanCount) {
    loanCount.textContent =
      `${loans.length} loan${loans.length === 1 ? "" : "s"}`;
  }

  const totalBalance = loans.reduce(
    (sum, loan) => sum + Number(loan.remaining_balance || 0),
    0
  );

  const totalPayment = loans.reduce(
    (sum, loan) => sum + Number(loan.monthly_payment || 0),
    0
  );

  const activeLoans = loans.filter(
    loan => (loan.status || "active") === "active"
  );

  const averageInterest = activeLoans.length
    ? activeLoans.reduce(
        (sum, loan) => sum + Number(loan.interest_rate || 0),
        0
      ) / activeLoans.length
    : 0;

  if (totalLoanBalance) {
    totalLoanBalance.textContent = money(totalBalance);
  }

  if (totalMonthlyLoanPayment) {
    totalMonthlyLoanPayment.textContent = money(totalPayment);
  }

  if (averageLoanInterest) {
    averageLoanInterest.textContent =
      `${averageInterest.toFixed(2)}%`;
  }

  if (!loansList) return;

  if (!loans.length) {
    loansList.innerHTML = `
      <div class="empty">
        No loans added yet.
      </div>
    `;
    return;
  }

  loansList.innerHTML = loans.map(loan => `
    <div class="recommendation">

      <b>${loan.name || "Unnamed loan"}</b>

      <span>
        Remaining balance:
        <strong>${money(loan.remaining_balance)}</strong>
        · Monthly payment:
        <strong>${money(loan.monthly_payment)}</strong>
        · Interest:
        <strong>${Number(loan.interest_rate || 0).toFixed(2)}%</strong>
        ${loan.due_day ? ` · Due day: ${loan.due_day}` : ""}
      </span>

      <button
        class="delete-loan"
        data-id="${loan.id}"
        type="button"
      >
        Delete
      </button>

    </div>
  `).join("");

  document.querySelectorAll(".delete-loan").forEach(button => {

    button.onclick = async () => {

      const loanId = button.dataset.id;

      if (!confirm("Delete this loan?")) return;

      const { error } = await window.spendwiseSupabase
        .from("loans")
        .delete()
        .eq("id", loanId)
        .eq("user_id", user.id);

      if (error) {
        alert(error.message);
        return;
      }

      await loadLoans();
      await updateLoanPlan();
    };

  });

  await updateLoanPlan();
}


// ============================================================
// ADD LOAN
// ============================================================

async function addLoan(event) {

  event.preventDefault();

  const user = await userOrNull();

  if (!user) {
    alert("Please sign in.");
    return;
  }

  const name = $("loanName")?.value.trim();

  const originalAmount =
    Number($("loanOriginalAmount")?.value || 0);

  const remainingBalance =
    Number($("loanRemainingBalance")?.value || 0);

  const interestRate =
    Number($("loanInterestRate")?.value || 0);

  const monthlyPayment =
    Number($("loanMonthlyPayment")?.value || 0);

  const dueDay =
    Number($("loanDueDay")?.value || 0) || null;

  const startDate =
    $("loanStartDate")?.value || null;

  const notes =
    $("loanNotes")?.value.trim() || null;

  if (!name) {
    alert("Please enter the loan name.");
    return;
  }

  if (originalAmount < 0 || remainingBalance < 0) {
    alert("Loan amounts cannot be negative.");
    return;
  }

  if (monthlyPayment < 0) {
    alert("Monthly payment cannot be negative.");
    return;
  }

  const { error } = await window.spendwiseSupabase
    .from("loans")
    .insert({
      user_id: user.id,
      name,
      original_amount: originalAmount,
      remaining_balance: remainingBalance,
      interest_rate: interestRate,
      monthly_payment: monthlyPayment,
      due_day: dueDay,
      start_date: startDate,
      status: "active",
      notes
    });

  if (error) {
    console.error("Unable to save loan:", error);
    alert(error.message);
    return;
  }

  event.target.reset();

  await loadLoans();
}

// ============================================================
// LOAN PAYOFF CALCULATOR
// ============================================================

function calculateLoanPayoff(balance, annualRate, monthlyPayment) {
  balance = Number(balance) || 0;
  annualRate = Number(annualRate) || 0;
  monthlyPayment = Number(monthlyPayment) || 0;

  if (balance <= 0) {
    return {
      months: 0,
      interest: 0,
      possible: true
    };
  }

  if (monthlyPayment <= 0) {
    return {
      months: 0,
      interest: 0,
      possible: false
    };
  }

  const monthlyRate = annualRate / 100 / 12;

  // No-interest loan
  if (monthlyRate === 0) {
    const months = Math.ceil(balance / monthlyPayment);
    const totalPaid = Math.min(months * monthlyPayment, balance);

    return {
      months,
      interest: Math.max(0, totalPaid - balance),
      possible: true
    };
  }

  // Payment must be greater than the monthly interest
  const firstMonthInterest = balance * monthlyRate;

  if (monthlyPayment <= firstMonthInterest) {
    return {
      months: 0,
      interest: 0,
      possible: false
    };
  }

  let remaining = balance;
  let totalInterest = 0;
  let months = 0;

  // Safety limit prevents an accidental infinite loop
  while (remaining > 0.01 && months < 1200) {
    const interest = remaining * monthlyRate;
    const principal = monthlyPayment - interest;

    if (principal <= 0) {
      return {
        months: 0,
        interest: 0,
        possible: false
      };
    }

    totalInterest += interest;
    remaining -= principal;
    months++;

    if (remaining < 0) remaining = 0;
  }

  return {
    months,
    interest: totalInterest,
    possible: remaining <= 0.01
  };
}


function updateLoanPayoffPlanner(loans, potentialExtraPayment) {

  const currentPaymentEl = $("payoffCurrentPayment");
  const acceleratedPaymentEl = $("payoffAcceleratedPayment");
  const currentMonthsEl = $("payoffCurrentMonths");
  const acceleratedMonthsEl = $("payoffAcceleratedMonths");
  const currentInterestEl = $("payoffCurrentInterest");
  const interestSavedEl = $("payoffInterestSaved");
  const debtFreeDateEl = $("payoffDebtFreeDate");

  if (!currentPaymentEl) return;

  const activeLoans = (loans || []).filter(
    loan => (loan.status || "active") === "active"
  );

  // No active loans
  if (!activeLoans.length) {
    currentPaymentEl.textContent = money(0);
    acceleratedPaymentEl.textContent = money(0);
    currentMonthsEl.textContent = "0 months";
    acceleratedMonthsEl.textContent = "0 months";
    currentInterestEl.textContent = money(0);
    interestSavedEl.textContent = money(0);
    debtFreeDateEl.textContent = "—";
    return;
  }

  // For now the planner uses the first active loan.
  // We will add a loan selector later if multiple loans are used.
  const loan = activeLoans[0];

  const balance = Number(loan.remaining_balance || 0);
  const interestRate = Number(loan.interest_rate || 0);
  const currentPayment = Number(loan.monthly_payment || 0);
  const extraPayment = Math.max(0, Number(potentialExtraPayment || 0));

 

 const acceleratedPayment = currentPayment + extraPayment;

const currentPlan = calculateLoanPayoff(
  balance,
  interestRate,
  currentPayment
);

let acceleratedPlan;
let payOffNow = false;

if (balance > 0 && acceleratedPayment >= balance) {
  payOffNow = true;

  acceleratedPlan = {
    months: 0,
    interest: 0,
    possible: true
  };
} else {
  acceleratedPlan = calculateLoanPayoff(
    balance,
    interestRate,
    acceleratedPayment
  );
}

 currentPaymentEl.textContent = money(currentPayment);

acceleratedPaymentEl.textContent =
  payOffNow
    ? `${money(balance)} — Pay off now`
    : money(acceleratedPayment);

currentMonthsEl.textContent =
  currentPlan.possible
    ? `${currentPlan.months} month${currentPlan.months === 1 ? "" : "s"}`
    : "Payment too low";

acceleratedMonthsEl.textContent =
  payOffNow
    ? "Pay off now"
    : acceleratedPlan.possible
      ? `${acceleratedPlan.months} month${acceleratedPlan.months === 1 ? "" : "s"}`
      : "Payment too low";

    currentInterestEl.textContent =
    currentPlan.possible
      ? money(currentPlan.interest)
      : "—";

  const interestSaved =
    currentPlan.possible && acceleratedPlan.possible
      ? Math.max(0, currentPlan.interest - acceleratedPlan.interest)
      : 0;

  interestSavedEl.textContent = money(interestSaved);

  // Estimate debt-free date using the accelerated plan
  if (payOffNow) {

    debtFreeDateEl.textContent = "Pay off now";

  } else if (acceleratedPlan.possible && acceleratedPlan.months > 0) {

    const debtFreeDate = new Date();

    debtFreeDate.setMonth(
      debtFreeDate.getMonth() + acceleratedPlan.months
    );

    debtFreeDateEl.textContent =
      debtFreeDate.toLocaleDateString("en-IE", {
        month: "long",
        year: "numeric"
      });

  } else if (balance <= 0) {

    debtFreeDateEl.textContent = "Paid off";

  } else {

    debtFreeDateEl.textContent = "—";

  }
}
// ============================================================
// LOAN REPAYMENT PLAN
// ============================================================

async function updateLoanPlan() {

  const user = await userOrNull();

  if (!user) return;

  const tx = await monthTransactions();

  // ----------------------------------------------------------
  // INCOME
  // ----------------------------------------------------------

  const income = tx
    .filter(t => t.type === "income")
    .reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );


  // ----------------------------------------------------------
  // EXPENSES
  // ----------------------------------------------------------

  const expenses = tx.filter(
    t => t.type === "expense"
  );


  // Essential spending
  // We deliberately exclude "Debt" here because the
  // scheduled loan payment is calculated separately below.

  const essentialSpending = expenses
    .filter(t =>
      NEED_CATEGORIES.has(t.category) &&
      t.category !== "Debt"
    )
    .reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );


  // Discretionary spending
  const discretionarySpending = expenses
    .filter(t =>
      !NEED_CATEGORIES.has(t.category)
    )
    .reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );


  // ----------------------------------------------------------
  // ACTIVE LOANS
  // ----------------------------------------------------------

  const { data: loans, error } =
    await window.spendwiseSupabase
      .from("loans")
      .select(
  "remaining_balance,monthly_payment,interest_rate,status"
)
      .eq("user_id", user.id);

  if (error) {
    console.error(
      "Unable to calculate loan plan:",
      error
    );
    return;
  }


  const activeLoans = (loans || []).filter(
    loan =>
      (loan.status || "active") === "active"
  );


  const monthlyPayments = activeLoans.reduce(
    (sum, loan) =>
      sum + Number(loan.monthly_payment || 0),
    0
  );


  // ----------------------------------------------------------
  // CASH-FLOW ANALYSIS
  // ----------------------------------------------------------

  // 20% of income is protected as a savings/safety buffer.
  const savingsBuffer = income * 0.20;


  // Money remaining after essential spending.
  const afterEssentials =
    Math.max(
      0,
      income - essentialSpending
    );


  // Money remaining after discretionary spending.
  const afterCurrentSpending =
    Math.max(
      0,
      afterEssentials - discretionarySpending
    );


  // Money remaining after required loan payments.
  const afterLoanPayments =
    Math.max(
      0,
      afterCurrentSpending - monthlyPayments
    );


  // Money available for an additional loan payment
  // while keeping the 20% safety/savings buffer.
// Money available for an additional loan payment
// while keeping the 20% safety/savings buffer.
const availableExtraPayment =
  Math.max(
    0,
    afterLoanPayments - savingsBuffer
  );

// Never recommend paying more than the remaining loan balance.
const firstLoanBalance =
  activeLoans.length
    ? Number(activeLoans[0].remaining_balance || 0)
    : 0;

const potentialExtraPayment =
  Math.min(
    availableExtraPayment,
    firstLoanBalance
  );

  // ----------------------------------------------------------
  // UPDATE SCREEN
  // ----------------------------------------------------------

  const incomeEl =
    $("loanPlanIncome");

  const essentialsEl =
    $("loanPlanEssentials");

  const paymentsEl =
    $("loanPlanPayments");

  const extraEl =
    $("potentialExtraLoanPayment");
  const planGrid = document.querySelector(
  "#loanPlanIncome"
)?.closest(".analysis-grid");

if (planGrid) {

  if (!$("loanPlanDiscretionary")) {
    const box = document.createElement("div");

    box.className = "analysis-box";

    box.innerHTML = `
      <span class="analysis-label">Discretionary spending</span>
      <strong id="loanPlanDiscretionary">€0.00</strong>
      <small>Wants and non-essential spending</small>
    `;

    planGrid.appendChild(box);
  }

  if (!$("loanPlanBuffer")) {
    const box = document.createElement("div");

    box.className = "analysis-box";

    box.innerHTML = `
      <span class="analysis-label">Safety / savings buffer</span>
      <strong id="loanPlanBuffer">€0.00</strong>
      <small>20% of monthly income protected</small>
    `;

    planGrid.appendChild(box);
  }
}

  if (incomeEl) {
    incomeEl.textContent =
      money(income);
  }

  if (essentialsEl) {
    essentialsEl.textContent =
      money(essentialSpending);
  }

  if (paymentsEl) {
    paymentsEl.textContent =
      money(monthlyPayments);
  }

  if (extraEl) {
    extraEl.textContent =
      money(potentialExtraPayment);
  }
if ($("loanPlanDiscretionary")) {
  $("loanPlanDiscretionary").textContent =
    money(discretionarySpending);
}

if ($("loanPlanBuffer")) {
  $("loanPlanBuffer").textContent =
    money(savingsBuffer);
}
updateLoanPayoffPlanner(
  activeLoans,
  potentialExtraPayment
);
  // ----------------------------------------------------------
  // REPAYMENT MESSAGE
  // ----------------------------------------------------------

  const message =
    $("loanPlanMessage");

  if (!message) return;


  if (!income) {

    message.innerHTML = `
      <b>Add your income first.</b>

      <span>
        SpendWise needs your recorded income and
        spending before estimating a safe additional
        loan payment.
      </span>
    `;

    return;
  }


  if (!activeLoans.length) {

    message.innerHTML = `
      <b>No active loans.</b>

      <span>
        Add a loan above to create a repayment plan.
      </span>
    `;

    return;
  }


  if (potentialExtraPayment > 0) {

    message.innerHTML = `
      <b>
        Potential extra payment:
        ${money(potentialExtraPayment)}
      </b>

      <span>
        After essential spending of
        ${money(essentialSpending)},
        discretionary spending of
        ${money(discretionarySpending)},
        required loan payments of
        ${money(monthlyPayments)},
        and a 20% income safety/savings buffer,
        approximately
        ${money(potentialExtraPayment)}
        may be available for an additional payment.
      </span>
    `;

  } else {

    message.innerHTML = `
      <b>Keep the scheduled payment for now.</b>

      <span>
        Your current income and spending do not show
        enough additional capacity for an extra loan
        payment while maintaining the 20% safety/savings
        buffer.
      </span>
    `;
  }
}

// ============================================================
// CONNECT LOAN FORM
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  const loanForm = $("loanForm");

  if (loanForm) {
    loanForm.addEventListener("submit", addLoan);
  }

  setTimeout(() => {

    if (window.spendwiseUser) {
      loadLoans();
    }

  }, 1500);

});
