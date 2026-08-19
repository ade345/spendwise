window.spendwiseUser = null;

function showAuth(mode) {
  const auth = document.getElementById("authScreen");
  if (!auth) return;
  auth.style.display = "grid";
  document.getElementById("loginView").hidden = mode !== "login";
  document.getElementById("signupView").hidden = mode !== "signup";
}
function hideAuth() {
  const auth = document.getElementById("authScreen");
  if (auth) auth.style.display = "none";
}
function setAccount(user) {
  window.spendwiseUser = user;
  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  document.getElementById("accountBox").hidden = false;
  document.getElementById("userName").textContent = name;
  document.getElementById("userEmail").textContent = user?.email || "";
  document.getElementById("userInitial").textContent = name.trim().charAt(0).toUpperCase();
  hideAuth();
}
function clearAccount() {
  window.spendwiseUser = null;
  const box=document.getElementById("accountBox"); if(box) box.hidden=true;
  showAuth("login");
}

async function startAuth() {
  try {
    if (!window.supabase?.createClient) throw new Error("Supabase library did not load. Refresh the page and try again.");
    if (!window.SPENDWISE_CONFIG?.SUPABASE_URL || !window.SPENDWISE_CONFIG?.SUPABASE_PUBLISHABLE_KEY)
      throw new Error("SpendWise configuration is missing.");

    window.spendwiseSupabase = window.supabase.createClient(
      window.SPENDWISE_CONFIG.SUPABASE_URL,
      window.SPENDWISE_CONFIG.SUPABASE_PUBLISHABLE_KEY
    );

    document.getElementById("showSignup").onclick = () => showAuth("signup");
    document.getElementById("showLogin").onclick = () => showAuth("login");
    document.getElementById("logoutBtn").onclick = async () => {
      const {error}=await window.spendwiseSupabase.auth.signOut();
      if(error) alert(error.message);
    };
    document.getElementById("forgotBtn").onclick = async () => {
      const email=document.getElementById("loginEmail").value.trim().toLowerCase();
      if(!email) return alert("Enter your email first.");
      const {error}=await window.spendwiseSupabase.auth.resetPasswordForEmail(email,{
        redirectTo:"https://ade345.github.io/spendwise/"
      });
      alert(error ? error.message : "Password reset instructions have been sent if that email is registered.");
    };

    document.getElementById("signupForm").onsubmit = async (e) => {
      e.preventDefault();
      const name=document.getElementById("signupName").value.trim();
      const email=document.getElementById("signupEmail").value.trim().toLowerCase();
      const password=document.getElementById("signupPassword").value;
      const confirm=document.getElementById("signupConfirm").value;
      if(password!==confirm) return alert("Passwords do not match.");
      const button=e.submitter; if(button) button.disabled=true;
      try {
        const {data,error}=await window.spendwiseSupabase.auth.signUp({
          email,password,
          options:{data:{full_name:name},emailRedirectTo:"https://ade345.github.io/spendwise/"}
        });
        if(error) return alert(error.message);
        if(data?.session && data?.user){
          setAccount(data.user);
          if(typeof window.refreshSpendWise==="function") await window.refreshSpendWise();
        } else {
          alert("Account created. Check your email to confirm your address, then sign in.");
          showAuth("login");
        }
        e.target.reset();
      } finally { if(button) button.disabled=false; }
    };

    document.getElementById("loginForm").onsubmit = async (e) => {
      e.preventDefault();
      const email=document.getElementById("loginEmail").value.trim().toLowerCase();
      const password=document.getElementById("loginPassword").value;
      const button=e.submitter; if(button) button.disabled=true;
      try {
        const {data,error}=await window.spendwiseSupabase.auth.signInWithPassword({email,password});
        if(error) return alert(error.message);
        if(data?.user) {
          setAccount(data.user);
          if(typeof window.refreshSpendWise==="function") await window.refreshSpendWise();
        }
        e.target.reset();
      } finally { if(button) button.disabled=false; }
    };

    const {data:{session},error}=await window.spendwiseSupabase.auth.getSession();
    if(error) console.warn(error);
    if(session?.user){
      setAccount(session.user);
      if(typeof window.refreshSpendWise==="function") await window.refreshSpendWise();
    } else showAuth("login");

    window.spendwiseSupabase.auth.onAuthStateChange(async (_event,session)=>{
      if(session?.user){
        setAccount(session.user);
        if(typeof window.refreshSpendWise==="function") await window.refreshSpendWise();
      } else clearAccount();
    });
  } catch(err) {
    console.error(err);
    showAuth("login");
    alert("SpendWise could not start its cloud login. " + (err.message || err));
  }
}

// These scripts are loaded at the end of index.html, but this also works if the page is already ready.
if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", startAuth);
else startAuth();
