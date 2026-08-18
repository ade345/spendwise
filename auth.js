const AUTH_KEY="spendwise_auth_v1";
const SESSION_KEY="spendwise_session_v1";
function authLoad(){try{return JSON.parse(localStorage.getItem(AUTH_KEY))||null}catch{return null}}
function authSave(x){localStorage.setItem(AUTH_KEY,JSON.stringify(x))}
function session(){try{return JSON.parse(localStorage.getItem(SESSION_KEY))||null}catch{return null}}
function setSession(x){if(x)localStorage.setItem(SESSION_KEY,JSON.stringify(x));else localStorage.removeItem(SESSION_KEY)}
function authHash(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16)}
function showAuth(mode){$("loginView").hidden=mode!=="login";$("signupView").hidden=mode!=="signup"}
function enterApp(user){
 $("authScreen").style.display="none";$("accountBox").hidden=false;
 $("userName").textContent=user.name;$("userEmail").textContent=user.email;$("userInitial").textContent=(user.name||"U").trim().charAt(0).toUpperCase();
}
function leaveApp(){$("authScreen").style.display="grid";$("accountBox").hidden=true;showAuth("login")}
function currentUser(){return session()}
document.addEventListener("DOMContentLoaded",()=>{
 const user=session(); if(user) enterApp(user);
 $("showSignup").onclick=()=>showAuth("signup");$("showLogin").onclick=()=>showAuth("login");
 $("logoutBtn").onclick=()=>{setSession(null);leaveApp()};
 $("forgotBtn").onclick=()=>alert("For the cloud version, password reset will be sent to your email. Demo mode does not send email.");
 $("signupForm").onsubmit=e=>{e.preventDefault();const name=$("signupName").value.trim(),email=$("signupEmail").value.trim().toLowerCase(),p=$("signupPassword").value,c=$("signupConfirm").value;if(p!==c)return alert("Passwords do not match.");if(p.length<8)return alert("Use at least 8 characters.");authSave({name,email,passwordHash:authHash(p)});setSession({name,email});enterApp({name,email});e.target.reset()};
 $("loginForm").onsubmit=e=>{e.preventDefault();const email=$("loginEmail").value.trim().toLowerCase(),p=$("loginPassword").value,u=authLoad();if(!u||u.email!==email||u.passwordHash!==authHash(p))return alert("Email or password is incorrect.");setSession({name:u.name,email:u.email});enterApp(u);e.target.reset()};
});
