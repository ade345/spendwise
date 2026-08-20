window.spendwiseUser = null;

function showAuth(mode) {
  const auth = document.getElementById("authScreen");
  if (!auth) return;

  auth.style.display = "grid";

  const loginView = document.getElementById("loginView");
  const signupView = document.getElementById("signupView");

  if (loginView) loginView.hidden = mode !== "login";
  if (signupView) signupView.hidden = mode !== "signup";
}

function hideAuth() {
  const auth = document.getElementById("authScreen");
  if (auth) auth.style.display = "none";
}

function setAccount(user) {
  window.spendwiseUser = user;

  const name =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const accountBox = document.getElementById("accountBox");
  const userName = document.getElementById("userName");
  const userEmail = document.getElementById("userEmail");
  const userInitial = document.getElementById("userInitial");

  if (accountBox) accountBox.hidden = false;
  if (userName) userName.textContent = name;
  if (userEmail) userEmail.textContent = user?.email || "";
  if (userInitial) {
    userInitial.textContent =
      name.trim().charAt(0).toUpperCase();
  }

  hideAuth();
}

function clearAccount() {
  window.spendwiseUser = null;

  const box = document.getElementById("accountBox");
  if (box) box.hidden = true;

  showAuth("login");
}


/* ============================================================
   REFRESH APP DATA
   IMPORTANT:
   A data-loading error must NOT log the user out.
   ============================================================ */

async function refreshAppData() {
  try {
    if (typeof window.refreshSpendWise === "function") {
      await window.refreshSpendWise();
    }
  } catch (err) {
    console.error(
      "SpendWise data refresh failed:",
      err
    );

    // Do NOT call showAuth().
    // The user's Supabase session is still valid.
  }
}


/* ============================================================
   START AUTH
   ============================================================ */

async function startAuth() {
  try {

    /*
      Keep the login screen hidden while Supabase
      restores an existing session.
    */
    hideAuth();


    /* --------------------------------------------------------
       CHECK SUPABASE
       -------------------------------------------------------- */

    if (!window.supabase?.createClient) {
      throw new Error(
        "Supabase library did not load. Refresh the page and try again."
      );
    }


    if (
      !window.SPENDWISE_CONFIG?.SUPABASE_URL ||
      !window.SPENDWISE_CONFIG?.SUPABASE_PUBLISHABLE_KEY
    ) {
      throw new Error(
        "SpendWise configuration is missing."
      );
    }


    /* --------------------------------------------------------
       CREATE SUPABASE CLIENT
       -------------------------------------------------------- */

    window.spendwiseSupabase =
      window.supabase.createClient(
        window.SPENDWISE_CONFIG.SUPABASE_URL,
        window.SPENDWISE_CONFIG.SUPABASE_PUBLISHABLE_KEY
      );


    /* --------------------------------------------------------
       AUTH SCREEN BUTTONS
       -------------------------------------------------------- */

    const showSignupBtn =
      document.getElementById("showSignup");

    const showLoginBtn =
      document.getElementById("showLogin");

    const logoutBtn =
      document.getElementById("logoutBtn");

    const forgotBtn =
      document.getElementById("forgotBtn");


    if (showSignupBtn) {
      showSignupBtn.onclick = () =>
        showAuth("signup");
    }


    if (showLoginBtn) {
      showLoginBtn.onclick = () =>
        showAuth("login");
    }


    /* --------------------------------------------------------
       LOGOUT
       -------------------------------------------------------- */

    if (logoutBtn) {
      logoutBtn.onclick = async () => {

        const { error } =
          await window.spendwiseSupabase.auth.signOut();

        if (error) {
          alert(error.message);
        }
      };
    }


    /* --------------------------------------------------------
       FORGOT PASSWORD
       -------------------------------------------------------- */

    if (forgotBtn) {
      forgotBtn.onclick = async () => {

        const email =
          document
            .getElementById("loginEmail")
            ?.value
            .trim()
            .toLowerCase();

        if (!email) {
          alert("Enter your email first.");
          return;
        }

        const { error } =
          await window.spendwiseSupabase.auth
            .resetPasswordForEmail(email, {
              redirectTo:
                "https://ade345.github.io/spendwise/"
            });

        alert(
          error
            ? error.message
            : "Password reset instructions have been sent if that email is registered."
        );
      };
    }


    /* ========================================================
       SIGNUP
       ======================================================== */

    const signupForm =
      document.getElementById("signupForm");

    if (signupForm) {

      signupForm.onsubmit = async (e) => {

        e.preventDefault();

        const name =
          document
            .getElementById("signupName")
            .value
            .trim();

        const email =
          document
            .getElementById("signupEmail")
            .value
            .trim()
            .toLowerCase();

        const password =
          document
            .getElementById("signupPassword")
            .value;

        const confirm =
          document
            .getElementById("signupConfirm")
            .value;


        if (password !== confirm) {
          alert("Passwords do not match.");
          return;
        }


        const button = e.submitter;

        if (button) {
          button.disabled = true;
        }


        try {

          const { data, error } =
            await window.spendwiseSupabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  full_name: name
                },
                emailRedirectTo:
                  "https://ade345.github.io/spendwise/"
              }
            });


          if (error) {
            alert(error.message);
            return;
          }


          if (data?.session && data?.user) {

            setAccount(data.user);

            await refreshAppData();

          } else {

            alert(
              "Account created. Check your email to confirm your address, then sign in."
            );

            showAuth("login");
          }


          e.target.reset();

        } finally {

          if (button) {
            button.disabled = false;
          }
        }
      };
    }


    /* ========================================================
       LOGIN
       ======================================================== */

    const loginForm =
      document.getElementById("loginForm");

    if (loginForm) {

      loginForm.onsubmit = async (e) => {

        e.preventDefault();

        const email =
          document
            .getElementById("loginEmail")
            .value
            .trim()
            .toLowerCase();

        const password =
          document
            .getElementById("loginPassword")
            .value;


        const button = e.submitter;

        if (button) {
          button.disabled = true;
        }


        try {

          const { data, error } =
            await window.spendwiseSupabase.auth
              .signInWithPassword({
                email,
                password
              });


          if (error) {
            alert(error.message);
            return;
          }


          if (data?.user) {

            setAccount(data.user);

            await refreshAppData();
          }


          e.target.reset();

        } finally {

          if (button) {
            button.disabled = false;
          }
        }
      };
    }


    /* ========================================================
       RESTORE EXISTING SESSION
       ======================================================== */

    const {
      data: { session },
      error
    } =
      await window.spendwiseSupabase.auth.getSession();


    if (error) {
      console.warn(
        "Session restore warning:",
        error
      );
    }


    if (session?.user) {

      /*
        Existing login found.
        Restore the account immediately.
      */

      setAccount(session.user);

      /*
        Load application data separately.
        If this fails, DO NOT log the user out.
      */

      await refreshAppData();

    } else {

      /*
        No existing session.
        Only now do we show login.
      */

      showAuth("login");
    }


    /* ========================================================
       AUTH STATE CHANGES
       ======================================================== */

    window.spendwiseSupabase.auth
      .onAuthStateChange((_event, session) => {

        if (session?.user) {

          setAccount(session.user);

          /*
            Let Supabase finish its auth event before
            loading the rest of the application.
          */

          setTimeout(() => {
            refreshAppData();
          }, 0);

        } else {

          clearAccount();
        }
      });


  } catch (err) {

    console.error(
      "SpendWise startup error:",
      err
    );

    /*
      IMPORTANT:
      Only show login if there is genuinely
      no authenticated user.
    */

    if (!window.spendwiseUser) {
      showAuth("login");
    }
  }
}


/* ============================================================
   START WHEN PAGE IS READY
   ============================================================ */

if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    startAuth
  );

} else {

  startAuth();
}
