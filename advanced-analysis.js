(function(){
  const NEEDS=new Set(["Housing","Utilities","Food & Groceries","Transport","Health","Education","Family","Debt"]);
  const FLEX={"Eating Out":.25,"Shopping":.20,"Entertainment":.20,"Subscriptions":.30,"Other":.10,"Food & Groceries":.08,"Transport":.05};
  const $=id=>document.getElementById(id);
  const fmt=n=>new Intl.NumberFormat("en-IE",{style:"currency",currency:"EUR"}).format(Number(n||0));
  let lastTx=[];
  function monthRange(){const m=$("month")?.value||new Date().toISOString().slice(0,7); const [y,mo]=m.split("-").map(Number); const start=`${y}-${String(mo).padStart(2,"0")}-01`; const next=new Date(Date.UTC(y,mo,1)); const end=`${next.getUTCFullYear()}-${String(next.getUTCMonth()+1).padStart(2,"0")}-01`; return {start,end};}
  async function fetchTx(){
    const sb=window.spendwiseSupabase;
    const user=window.spendwiseUser;
    if(!sb||!user) return null;
    const {start,end}=monthRange();
    const {data,error}=await sb.from("transactions").select("type,amount,category,description,transaction_date,is_want").eq("user_id",user.id).gte("transaction_date",start).lt("transaction_date",end).order("transaction_date",{ascending:false});
    if(error){console.error("Advanced analysis:",error);return null;}
    return data||[];
  }
  function render(tx){
    lastTx=tx||[];
    const inc=lastTx.filter(x=>x.type==="income").reduce((a,x)=>a+Number(x.amount||0),0);
    const exp=lastTx.filter(x=>x.type==="expense");
    const spent=exp.reduce((a,x)=>a+Number(x.amount||0),0);
    const left=inc-spent, rate=inc?left/inc*100:0, target=inc*.20;
    const by={}; exp.forEach(x=>by[x.category]=(by[x.category]||0)+Number(x.amount||0));
    const rows=Object.entries(by).sort((a,b)=>b[1]-a[1]);
    const opp=rows.map(([cat,amount])=>{const flagged=exp.filter(x=>x.category===cat&&x.is_want).reduce((a,x)=>a+Number(x.amount||0),0);const suggest=flagged?flagged*.35:amount*(FLEX[cat]||0);const flexible=!NEEDS.has(cat);return {cat,amount,flagged,suggest,flexible,si:spent?amount/spent*100:0,ii:inc?amount/inc*100:0};}).filter(x=>x.suggest>.5).sort((a,b)=>(b.suggest+(b.flexible?10:0))-(a.suggest+(a.flexible?10:0)));
    const needs=exp.filter(x=>NEEDS.has(x.category)).reduce((a,x)=>a+Number(x.amount||0),0);
    const wants=exp.filter(x=>x.is_want||!NEEDS.has(x.category)).reduce((a,x)=>a+Number(x.amount||0),0);
    if($("analysisIncome")) $("analysisIncome").textContent=fmt(inc);
    if($("analysisSpent")) $("analysisSpent").textContent=fmt(spent);
    if($("analysisSavingsRate")) $("analysisSavingsRate").textContent=(isFinite(rate)?rate:0).toFixed(1)+"%";
    if($("analysisTarget")) $("analysisTarget").textContent=fmt(target);
    let score=inc?100:0;if(inc){if(left<0)score-=45;else if(rate<10)score-=25;else if(rate<20)score-=12;if(spent&&wants/spent>.35)score-=15;if(spent>inc*.9)score-=10;score=Math.max(0,Math.round(score));}
    $("healthScore") && ($("healthScore").textContent=score);
    $("healthText") && ($("healthText").textContent=!inc?"Add income to generate an affordability and savings assessment.":score>=85?"Strong position. Protect the surplus and keep a consistent savings habit.":score>=70?"Healthy but improvable. Review flexible categories and keep savings intentional.":score>=50?"Needs attention. Target the largest flexible categories before cutting essentials.":"High pressure. Spending is consuming too much income; restore positive cash flow first.");
    if($("healthBreakdown")) $("healthBreakdown").innerHTML=`<div class="health-item"><span>Savings rate</span><strong>${rate.toFixed(1)}%</strong></div><div class="health-item"><span>Spending / income</span><strong>${inc?(spent/inc*100).toFixed(1):0}%</strong></div><div class="health-item"><span>Flexible spending</span><strong>${spent?(wants/spent*100).toFixed(1):0}%</strong></div>`;
    if($("moneyPlan")) $("moneyPlan").innerHTML=`<div><span>Essential spending</span><strong>${fmt(needs)}</strong><small>${inc?(needs/inc*100).toFixed(1):0}% of income</small></div><div><span>Flexible spending</span><strong>${fmt(wants)}</strong><small>${inc?(wants/inc*100).toFixed(1):0}% of income</small></div><div><span>Available after spending</span><strong>${fmt(left)}</strong><small>${rate.toFixed(1)}% of income</small></div>`;
    if($("categoryAnalysis")) $("categoryAnalysis").innerHTML=rows.length?rows.slice(0,10).map(([cat,a])=>`<div class="analysis-row"><div class="analysis-head"><span>${cat}</span><span>${fmt(a)}</span></div><div class="analysis-meta"><span>${inc?(a/inc*100).toFixed(1):0}% of income</span><span>${spent?(a/spent*100).toFixed(1):0}% of spending</span></div><div class="analysis-bar"><div class="analysis-fill" style="width:${Math.min(100,spent?a/spent*100:0)}%"></div></div></div>`).join(""):"<div class='empty'>Add expenses to generate analysis.</div>";
    if($("cutPlan")) $("cutPlan").innerHTML=opp.length?opp.slice(0,5).map((x,i)=>`<div class="recommendation ${x.flexible&&x.suggest>Math.max(40,inc*.04)?'cut-strong':x.flexible?'cut-warning':'cut-good'}"><b>${i+1}. Review ${x.cat} — ${fmt(x.amount)}</b><span>${x.ii.toFixed(1)}% of income and ${x.si.toFixed(1)}% of spending. ${x.flagged?`You marked ${fmt(x.flagged)} as wants/unnecessary.`:x.flexible?`This is flexible spending, so a moderate reduction is a reasonable first review.`:`This category is treated cautiously because it may contain essentials.`}</span><span><strong>Estimated reduction: ${fmt(x.suggest)}</strong></span></div>`).join(""):"<div class='empty'>No meaningful reduction opportunity identified yet.</div>";
    if($("riskSignals")){
      const r=[];if(inc&&spent>inc)r.push(["Overspending",`Expenses exceed income by ${fmt(spent-inc)}.`]);if(inc&&rate<10)r.push(["Low savings capacity","Less than 10% of income remains after recorded spending."]);if(inc&&by["Eating Out"]>inc*.10)r.push(["Eating Out is high","Eating Out is above 10% of monthly income."]);if(inc&&by["Shopping"]>inc*.10)r.push(["Shopping is high","Shopping is above 10% of monthly income."]);if(spent&&wants/spent>.35)r.push(["Flexible spending concentration","More than 35% of spending is flexible or discretionary."]);if(!r.length)r.push(["No major signal","Your current records do not trigger a major spending-risk rule."]);$("riskSignals").innerHTML=r.map(x=>`<div class="recommendation"><b>${x[0]}</b><span>${x[1]}</span></div>`).join("");
    }
    if($("opportunitySummary")) $("opportunitySummary").innerHTML=opp.slice(0,3).map((x,i)=>`<div class="recommendation"><b>${i+1}. ${x.cat}</b><span>A conservative review could free about <strong>${fmt(x.suggest)}</strong> per month. Redirecting that amount to savings would raise your monthly surplus.</span></div>`).join("")||"<div class='empty'>No opportunities yet.</div>";
    if($("actionPlan")){
      const a=[];if(!inc)a.push(["Add income","SpendWise needs income before it can calculate affordability or savings capacity."]);else if(left<0)a.push(["Restore positive cash flow",`Reduce spending by at least ${fmt(Math.abs(left))} to stop spending above income.`]);else if(left<target)a.push(["Close the savings gap",`You have ${fmt(left)} available; a 20% starting target is ${fmt(target)}.`]);else a.push(["Protect your surplus",`You have ${fmt(left)} available after recorded spending.`]);if(opp[0])a.push([`Start with ${opp[0].cat}`,`A moderate review could free about ${fmt(opp[0].suggest)}.`]);a.push(["Set a personal target","Use the What-if calculator below to test the amount you want to save each month."]);$("actionPlan").innerHTML=a.map(x=>`<div class="recommendation"><b>${x[0]}</b><span>${x[1]}</span></div>`).join("");
    }
    const gi=$("savingsGoalInput");const calc=()=>{const goal=Math.max(0,Number(gi?.value||0));const max=Math.max(0,inc-goal);const gap=Math.max(0,spent-max);if($("maxSpendResult"))$("maxSpendResult").textContent=fmt(max);if($("currentSpendResult"))$("currentSpendResult").textContent=fmt(spent);if($("goalGapResult"))$("goalGapResult").textContent=fmt(gap);if($("goalMessage"))$("goalMessage").innerHTML=!inc?"<b>Add income first.</b>":gap?`<b>To save ${fmt(goal)} each month</b><span>You need to reduce spending by <strong>${fmt(gap)}</strong> from the current ${fmt(spent)}.</span>`:`<b>${fmt(goal)} is currently achievable.</b><span>Your current spending is ${fmt(spent)} and your available amount is ${fmt(left)}.</span>`;};
    if(gi){if(!gi.dataset.bound){gi.dataset.bound="1";gi.addEventListener("input",calc);}if(inc&&!gi.value)gi.value=Math.round(target);calc();}
  }
  async function load(){const tx=await fetchTx();if(tx)render(tx);}
  function start(){let tries=0;const t=setInterval(()=>{tries++;if(window.spendwiseSupabase&&window.spendwiseUser){clearInterval(t);load();}if(tries>30)clearInterval(t);},500);const m=$("month");if(m&&!m.dataset.analysisBound){m.dataset.analysisBound="1";m.addEventListener("change",load);}document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{if(b.dataset.tab==="analysis")setTimeout(load,100); }));}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
