const KEY="spendwise_full_v1";
const cats=["Food & Groceries","Eating Out","Transport","Housing","Utilities","Shopping","Entertainment","Health","Education","Family","Subscriptions","Debt","Other"];
let state=load()||{transactions:[],budgets:{},limits:{},recurring:[],goals:[]};
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat("en-IE",{style:"currency",currency:"EUR"}).format(Number(n)||0);
const today=()=>new Date().toISOString().slice(0,10);
const monthNow=()=>today().slice(0,7);
const selected=()=>$("month").value||monthNow();
function load(){try{return JSON.parse(localStorage.getItem(KEY))}catch{return null}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function esc(x){return String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function fillCategories(){["txCategory","rCategory"].forEach(id=>$(id).innerHTML=cats.map(c=>`<option>${c}</option>`).join(""))}
function monthTx(m=selected()){return state.transactions.filter(t=>t.date.slice(0,7)===m)}
function totals(m=selected()){const a=monthTx(m);return {income:a.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0),expense:a.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0),waste:a.filter(t=>t.type==="expense"&&t.want).reduce((s,t)=>s+t.amount,0)}}
function render(){
 const t=totals(), balance=t.income-t.expense;
 $("income").textContent=money(t.income);$("spent").textContent=money(t.expense);$("balance").textContent=money(balance);$("waste").textContent=money(t.waste);
 renderCategories();renderRecommendations();renderBudget();renderTransactions();renderRecurring();renderGoals();renderAnalysis();
}
function renderCategories(){
 const list=monthTx().filter(t=>t.type==="expense"), map={};list.forEach(t=>map[t.category]=(map[t.category]||0)+t.amount);
 const entries=Object.entries(map).sort((a,b)=>b[1]-a[1]), total=list.reduce((s,t)=>s+t.amount,0);
 $("categoryChart").innerHTML=entries.length?entries.map(([c,v])=>`<div><div class="bar-head"><span>${esc(c)}</span><b>${money(v)} · ${total?(v/total*100).toFixed(0):0}%</b></div><div class="bar-track"><div class="bar-fill" style="width:${total?v/total*100:0}%"></div></div></div>`).join(""):`<div class="empty">No expenses recorded.</div>`;
 $("topCategory").textContent=entries[0]?.[0]||"—";$("topCategoryAmount").textContent=money(entries[0]?.[1]||0);
}
function renderRecommendations(){
 const list=monthTx().filter(t=>t.type==="expense"&&t.want), map={};list.forEach(t=>map[t.category]=(map[t.category]||0)+t.amount);
 const ranked=Object.entries(map).sort((a,b)=>b[1]-a[1]);
 const rec=[];
 if(!list.length)rec.push(["Mark wants","When adding an expense, flag purchases you could reduce or avoid."]);
 if(ranked[0])rec.push([`Reduce ${ranked[0][0]}`,`You marked ${money(ranked[0][1])} here as potentially unnecessary.`]);
 const budget=state.budgets[selected()]||0, spent=totals().expense;
 if(budget&&spent>budget)rec.push(["Budget alert",`You are ${money(spent-budget)} over this month's budget.`]);
 if(totals().income>0&&spent/totals().income>.7)rec.push(["Spending ratio",`You are using ${((spent/totals().income)*100).toFixed(0)}% of income.`]);
 $("recommendations").innerHTML=rec.map(r=>`<div class="recommendation"><b>${esc(r[0])}</b><span>${esc(r[1])}</span></div>`).join("");
}
function renderBudget(){
 const b=state.budgets[selected()]||0,s=totals().expense;
 $("budgetInput").value=b||"";
 $("budgetStatus").textContent=b?money(s)+" / "+money(b):"No budget set";
 $("budgetText").textContent=b?(s<=b?money(b-s)+" remaining":money(s-b)+" over budget"):"Set your monthly budget in Budget.";
 $("budgetBar").style.width=b?Math.min(100,s/b*100)+"%":"0%";$("budgetBar").classList.toggle("over",s>b);
 $("budgetStatus").dataset.x="";
 const limitBox=$("categoryLimits");
 limitBox.innerHTML=cats.map(c=>`<label style="display:block;margin:9px 0">${c}<input data-limit="${esc(c)}" type="number" min="0" step=".01" value="${state.limits[selected()]?.[c]||""}" placeholder="No limit"></label>`).join("");
}
function renderTransactions(){
 const q=$("search").value.trim().toLowerCase(), list=monthTx().filter(t=>[t.description,t.category,t.payment].join(" ").toLowerCase().includes(q)).sort((a,b)=>b.date.localeCompare(a.date));
 $("txCount").textContent=`${list.length} transaction${list.length===1?"":"s"} in ${selected()}`;$("txEmpty").style.display=list.length?"none":"block";
 $("txTable").innerHTML=list.map(t=>`<tr><td>${esc(t.date)}</td><td>${t.type}</td><td>${esc(t.description||"—")}</td><td>${esc(t.category)}</td><td class="${t.type==="income"?"income-text":"expense-text"}">${t.type==="income"?"+":"-"}${money(t.amount)}</td><td>${t.want?'<span class="badge">Want</span>':""}${t.recurring?'<span class="badge">Recurring</span>':""}</td><td><button class="delete" data-id="${t.id}">Delete</button></td></tr>`).join("");
 document.querySelectorAll(".delete").forEach(b=>b.onclick=()=>{state.transactions=state.transactions.filter(t=>t.id!==b.dataset.id);save();render()});
}
function renderRecurring(){
 $("recurringList").innerHTML=state.recurring.length?state.recurring.map(r=>`<div class="list-item"><div><b>${esc(r.name)}</b><div class="muted">${r.type} · ${esc(r.category)} · day ${r.day}</div></div><strong>${r.type==="income"?"+":"-"}${money(r.amount)}</strong><button class="delete" data-rid="${r.id}">Delete</button></div>`).join(""):`<div class="empty">No recurring items yet.</div>`;
 document.querySelectorAll("[data-rid]").forEach(b=>b.onclick=()=>{state.recurring=state.recurring.filter(r=>r.id!==b.dataset.rid);save();render()});
}
function renderGoals(){
 $("goalList").innerHTML=state.goals.length?state.goals.map(g=>{const p=Math.min(100,g.saved/g.target*100);return `<div class="goal"><div class="goal-head"><b>${esc(g.name)}</b><b>${money(g.saved)} / ${money(g.target)}</b></div><div class="progress"><i style="width:${p}%"></i></div><p class="muted">${p.toFixed(0)}% complete · ${money(Math.max(0,g.target-g.saved))} remaining</p><button class="delete" data-gid="${g.id}">Delete</button></div>`}).join(""):`<div class="empty">No savings goals yet.</div>`;
 const total=state.goals.reduce((s,g)=>s+g.saved,0);$("goalProgress").textContent=money(total);$("goalText").textContent=state.goals.length?`${state.goals.length} active goal${state.goals.length===1?"":"s"}`:"No goals yet.";
 document.querySelectorAll("[data-gid]").forEach(b=>b.onclick=()=>{state.goals=state.goals.filter(g=>g.id!==b.dataset.gid);save();render()});
}
function renderAnalysis(){
 const months=[];let d=new Date(selected()+"-01T12:00:00");for(let i=5;i>=0;i--){const x=new Date(d);x.setMonth(d.getMonth()-i);const m=x.toISOString().slice(0,7);months.push([m,totals(m).expense])}
 const max=Math.max(...months.map(x=>x[1]),1);$("monthlyComparison").innerHTML=months.map(([m,v])=>`<div><div class="bar-head"><span>${m}</span><b>${money(v)}</b></div><div class="bar-track"><div class="bar-fill" style="width:${v/max*100}%"></div></div></div>`).join("");
 const t=totals(), b=state.budgets[selected()]||0, income=t.income, ratio=income?1-t.expense/income:0;
 let score=50;if(income>0)score+=Math.max(-30,Math.min(30,ratio*50));if(b)score+=(t.expense<=b?15:-15);score+=Math.max(-10,10-(t.waste/(t.expense||1))*20);score=Math.max(0,Math.min(100,Math.round(score)));
 $("healthScore").textContent=score;$("healthScore").className="score "+(score>=70?"good":score>=45?"warn":"bad");
 $("healthText").textContent=score>=70?"Good direction. Protect your savings rate.":score>=45?"There is room to improve. Focus on the biggest categories.":"Your spending needs attention. Start with unnecessary and recurring costs.";
 const actions=[];if(!income)actions.push("Record your monthly income so the app can calculate a realistic spending ratio.");if(t.waste)actions.push(`Review ${money(t.waste)} of wants/unnecessary spending and choose what to eliminate.`);if(b&&t.expense>b)actions.push(`Reduce spending by at least ${money(t.expense-b)} to return to budget.`);if(!b)actions.push("Set a monthly spending budget.");if(t.expense&&income&&t.expense/income<.6)actions.push("Your spending is below 60% of income; consider directing the difference toward a savings goal.");
 $("actionPlan").innerHTML=actions.map(x=>`<div class="recommendation"><b>Next action</b><span>${esc(x)}</span></div>`).join("")||`<div class="empty">Add a few transactions and income entries to generate an action plan.</div>`;
}
$("month").value=monthNow();$("txDate").value=today();fillCategories();render();
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab,.tab-panel").forEach(x=>x.classList.remove("active"));b.classList.add("active");$(b.dataset.tab).classList.add("active")});
$("month").onchange=()=>{ $("txDate").value=selected()+"-01";render()};$("search").oninput=renderTransactions;
$("txForm").onsubmit=e=>{e.preventDefault();state.transactions.push({id:crypto.randomUUID(),type:$("txType").value,date:$("txDate").value,amount:+$("txAmount").value,category:$("txCategory").value,description:$("txDescription").value.trim(),payment:$("txPayment").value,want:$("txWant").checked,recurring:$("txRecurring").checked});save();e.target.reset();$("txDate").value=selected()==monthNow()?today():selected()+"-01";render()};
$("saveBudget").onclick=()=>{state.budgets[selected()]=+$("budgetInput").value||0;save();render()};
$("saveLimits").onclick=()=>{state.limits[selected()]={};document.querySelectorAll("[data-limit]").forEach(i=>state.limits[selected()][i.dataset.limit]=+i.value||0);save();render();alert("Category limits saved.")};
$("recurringForm").onsubmit=e=>{e.preventDefault();state.recurring.push({id:crypto.randomUUID(),name:$("rName").value.trim(),type:$("rType").value,amount:+$("rAmount").value,category:$("rCategory").value,day:+$("rDay").value});save();e.target.reset();render()};
$("goalForm").onsubmit=e=>{e.preventDefault();state.goals.push({id:crypto.randomUUID(),name:$("gName").value.trim(),target:+$("gTarget").value,saved:+$("gSaved").value||0});save();e.target.reset();render()};
$("exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="spendwise-backup.json";a.click();URL.revokeObjectURL(u)};
$("importFile").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!x.transactions)throw 0;state=x;save();render();alert("Backup restored.")}catch{alert("That backup file is not valid SpendWise data.")}};r.readAsText(f)};
let deferred;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;$("installBtn").hidden=false;$("installBtn").onclick=async()=>{deferred.prompt();deferred=null;$("installBtn").hidden=true}});
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js"));
