function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.toggle("active", t === tab));
      panels.forEach(p => p.classList.toggle("active", p.id === target));
      window.scrollTo({top: 0, behavior: "smooth"});
    });
  });
}
function setupSearch() {
  const input = $("search");
  if (!input) return;
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll("#txTable tr").forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  });
}

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
  ["txCategory","rCategory"].forEach(id => { const el=$(id); if(el) el.innerHTML=CATS.map(c=>`<option>${c}</option>`).join(""); });
}
async function renderCloud() {
  const tx = await monthTransactions();
  const inc=tx.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
  const spent=tx.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);
  const waste=tx.filter(t=>t.type==="expense"&&t.is_want).reduce((s,t)=>s+Number(t.amount),0);
  $("income").textContent=money(inc);$("spent").textContent=money(spent);$("balance").textContent=money(inc-spent);$("waste").textContent=money(waste);
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

document.addEventListener("DOMContentLoaded",()=>{
  setupTabs();
  setupSearch();
  $("month").value=today().slice(0,7);$("txDate").value=today();fillCategories();
  $("month").onchange=renderCloud;
  $("txForm").onsubmit=async e=>{
    e.preventDefault();const user=await userOrNull();if(!user)return alert("Please sign in.");
    const {error}=await window.spendwiseSupabase.from("transactions").insert({
      user_id:user.id,type:$("txType").value,transaction_date:$("txDate").value,amount:Number($("txAmount").value),
      category:$("txCategory").value,description:$("txDescription").value.trim(),payment_method:$("txPayment").value,
      is_want:$("txWant").checked,is_recurring:$("txRecurring").checked
    });
    if(error)return alert(error.message);e.target.reset();$("txDate").value=today();renderCloud();
  };
  $("saveBudget").onclick=async()=>{
    const user=await userOrNull();if(!user)return alert("Please sign in.");
    const amount=Number($("budgetInput").value)||0;
    const {error}=await window.spendwiseSupabase.from("budgets").upsert({user_id:user.id,month:selectedMonth()+"-01",amount},{onConflict:"user_id,month"});
    if(error)alert(error.message);else renderCloud();
  };
});
