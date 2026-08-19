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
  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  document.getElementById("accountBox").hidden = false;
  document.getElementById("userName").textContent = name;
  document.getElementById("userEmail").textContent = user.email || "";
  document.getElementById("userInitial").textContent = name.trim().charAt(0).toUpperCase();
  hideAuth();
}

function clearAccount() {
  window.spendwiseUser = null;
  document.getElementById("accountBox").hidden = true;
  showAuth("login");
}

async function initAuth() {
  const { data: { session } } = await window.spendwiseSupabase.auth.getSession();
  if (session?.user) setAccount(session.user);
  else showAuth("login");

  window.spendwiseSupabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) setAccount(session.user);
    else clearAccount();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  window.spendwiseSupabase = window.supabase.createClient(
    window.SPENDWISE_CONFIG.SUPABASE_URL,
    window.SPENDWISE_CONFIG.SUPABASE_PUBLISHABLE_KEY
  );

  document.getElementById("showSignup").onclick = () => showAuth("signup");
  document.getElementById("showLogin").onclick = () => showAuth("login");
  document.getElementById("logoutBtn").onclick = async () => {
    await window.spendwiseSupabase.auth.signOut();
  };
  document.getElementById("forgotBtn").onclick = async () => {
    const email = document.getElementById("loginEmail").value.trim();
    if (!email) return alert("Enter your email first.");
    const { error } = await window.spendwiseSupabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://ade345.github.io/spendwise/"
    });
    alert(error ? error.message : "Password reset instructions have been sent if that email is registered.");
  };

  document.getElementById("signupForm").onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("signupConfirm").value;
    if (password !== confirm) return alert("Passwords do not match.");
    const { data, error } = await window.spendwiseSupabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: "https://ade345.github.io/spendwise/"
      }
    });
    if (error) return alert(error.message);
    if (data.session) {
      setAccount(data.user);
      if (typeof window.refreshSpendWise === "function") window.refreshSpendWise();
    } else {
      alert("Account created. Check your email to confirm your address, then sign in.");
      showAuth("login");
    }
    e.target.reset();
  };

  document.getElementById("loginForm").onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const { data, error } = await window.spendwiseSupabase.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);
    setAccount(data.user);
    if (typeof window.refreshSpendWise === "function") window.refreshSpendWise();
    e.target.reset();
  };

  await initAuth();
});
