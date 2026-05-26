/**
 * patch-build.js — run ONCE after every Cocos Creator build:
 *
 *   node patch-build.js
 *
 * Injects Firebase auth overlay (CSS + HTML + JS) inline into
 * build/web-desktop/index.html so it works in any serve environment.
 *
 * Files that survive rebuilds automatically (never need patching):
 *   build/web-desktop/firebase-config.js  ← your API keys live here
 */

'use strict';
const fs   = require('fs');
const path = require('path');

const HTML = path.join(__dirname, 'build', 'web-desktop', 'index.html');
let html   = fs.readFileSync(HTML, 'utf8');

if (html.includes('id="auth-overlay"')) {
  console.log('✓  index.html already patched — nothing to do.');
  process.exit(0);
}

// ── 1. HEAD: font + Firebase SDK + config + inline CSS ───────────
const headInject = `
  <!-- Mario pixel font -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">

  <!-- Firebase SDK -->
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
  <!-- Firebase init inline — to update keys, edit this block AND firebase-config.js -->
  <script>
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
      firebase.initializeApp({
        apiKey:            "AIzaSyCX8Z96nVYQlEOSnVTcdSmZrnKr2kilfes",
        authDomain:        "sshw2-c74c3.firebaseapp.com",
        projectId:         "sshw2-c74c3",
        storageBucket:     "sshw2-c74c3.appspot.com",
        messagingSenderId: "979191970902",
        appId:             "1:979191970902:web:c6b52fb7a5fb387bec4ff7"
      });
    }
  <\/script>

  <style>
    .hidden { display: none !important; }
    #auth-overlay {
      position: fixed; top:0; left:0; width:100%; height:100%;
      z-index: 9999; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: linear-gradient(180deg,#5dc8f5 0%,#8ed8f8 50%,#b5eaff 100%);
      font-family: 'Press Start 2P','Courier New',monospace;
      overflow: hidden; transition: opacity .5s ease;
    }
    #auth-overlay.fade-out { opacity:0; pointer-events:none; }
    #auth-overlay::after {
      content:''; position:absolute; bottom:0; left:0; right:0; height:72px;
      background: repeating-linear-gradient(90deg,#d4b896 0 40px,#c8a878 40px 80px);
      border-top: 6px solid #8b5e20;
    }
    #auth-overlay::before {
      content:''; position:absolute; left:3%; bottom:72px; width:160px; height:90px;
      background:
        radial-gradient(ellipse 55px 55px at 30px  55px,#50b838 99%,transparent),
        radial-gradient(ellipse 70px 70px at 80px  70px,#48b030 99%,transparent),
        radial-gradient(ellipse 50px 50px at 130px 50px,#52bc3c 99%,transparent);
      filter: drop-shadow(0 2px 0 #309020);
    }
    .auth-card { position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; gap:48px; margin-top:-40px; }
    .auth-logo { text-align:center; line-height:1.6; user-select:none; }
    .auth-logo span { display:block; }
    .auth-logo .l1 { font-size:clamp(18px,2.8vw,30px); letter-spacing:4px; color:#f87060; text-shadow:3px 3px 0 #902010,-1px -1px 0 #701010,1px -1px 0 #701010,-1px 1px 0 #701010; }
    .auth-logo .l2 { font-size:clamp(28px,4.5vw,52px); letter-spacing:3px; color:#50c830; text-shadow:3px 3px 0 #207010,-1px -1px 0 #104808,1px -1px 0 #104808,-1px 1px 0 #104808; }
    .auth-logo .l3 { font-size:clamp(20px,3.2vw,36px); letter-spacing:3px; color:#f8d020; text-shadow:3px 3px 0 #907000,-1px -1px 0 #604800,1px -1px 0 #604800,-1px 1px 0 #604800; }
    .btn-row { display:flex; gap:20px; flex-wrap:wrap; justify-content:center; }
    .mario-btn {
      font-family:'Press Start 2P','Courier New',monospace;
      font-size:clamp(10px,1.4vw,14px); padding:15px 34px;
      border:none; border-radius:4px; cursor:pointer; color:#fff;
      letter-spacing:1px; text-transform:uppercase;
      box-shadow: inset 2px 2px 0 rgba(255,255,255,.4), inset -2px -2px 0 rgba(0,0,0,.25), 4px 4px 0 rgba(0,0,0,.30);
      transition: transform .08s, box-shadow .08s; outline:none;
    }
    .mario-btn:active { transform:translate(3px,4px); box-shadow:inset 2px 2px 0 rgba(255,255,255,.4),inset -2px -2px 0 rgba(0,0,0,.25),1px 1px 0 rgba(0,0,0,.30); }
    .mario-btn.blue   { background:#2898d8; text-shadow:1px 1px 0 #005090; }
    .mario-btn.orange { background:#e07820; text-shadow:1px 1px 0 #7a3000; }
    .mario-btn.grey   { background:#6878a0; text-shadow:1px 1px 0 #304060; font-size:clamp(8px,1.1vw,11px); padding:10px 20px; }
    .auth-form { display:flex; flex-direction:column; align-items:center; gap:12px; width:min(340px,90vw); }
    .form-title { font-size:clamp(10px,1.4vw,14px); color:#fff; letter-spacing:2px; text-shadow:2px 2px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000; margin-bottom:4px; }
    .mario-input { width:100%; box-sizing:border-box; font-family:'Press Start 2P','Courier New',monospace; font-size:clamp(8px,1vw,10px); padding:12px 14px; background:#f8f8e8; border:3px solid #888060; border-radius:3px; outline:none; color:#222; box-shadow:inset 2px 2px 0 rgba(0,0,0,.12),2px 2px 0 rgba(0,0,0,.15); }
    .mario-input:focus { border-color:#e07820; }
    .mario-input::placeholder { color:#aaa890; }
    .form-row { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; }
    .msg-box { display:none; font-size:clamp(7px,.9vw,9px); text-align:center; padding:7px 10px; border-radius:3px; width:100%; box-sizing:border-box; }
    .msg-box.error   { display:block; background:#b81808; color:#fff; border:2px solid #700; text-shadow:1px 1px 0 #500; }
    .msg-box.success { display:block; background:#387018; color:#fff; border:2px solid #204010; }
    .mario-loading { display:none; font-size:9px; color:#fff; text-shadow:1px 1px 0 #000; animation:blink .8s step-end infinite; }
    .mario-loading.visible { display:block; }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
    #user-bar { position:fixed; top:0; right:0; z-index:8888; display:none; align-items:center; gap:10px; background:rgba(0,0,0,.82); color:#fff; font-family:'Press Start 2P','Courier New',monospace; font-size:8px; padding:7px 13px; border-radius:0 0 0 6px; }
    #user-bar.visible { display:flex; }
    #user-bar .ue { color:#f8d020; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    #btn-logout { font-family:'Press Start 2P',monospace; font-size:7px; padding:4px 8px; background:#b81808; color:#fff; border:2px solid #700; border-radius:2px; cursor:pointer; }
    #btn-logout:hover { background:#901206; }
  </style>`;

html = html.replace('</head>', headInject + '\n</head>');

// ── 2. Auth overlay HTML before GameDiv ──────────────────────────
const overlayHTML = `
<div id="auth-overlay">
  <div class="auth-card">
    <div class="auth-logo">
      <span class="l1">SUPER</span>
      <span class="l2">MARIO</span>
      <span class="l3">BROS.</span>
    </div>
    <div id="auth-main-panel" class="btn-row">
      <button class="mario-btn blue"   id="btn-show-login">LOG IN</button>
      <button class="mario-btn orange" id="btn-show-signup">SIGN UP</button>
    </div>
    <div id="login-form" class="auth-form hidden">
      <div class="form-title">LOG IN</div>
      <input id="login-email" class="mario-input" type="email"    placeholder="EMAIL"    autocomplete="email"/>
      <input id="login-pass"  class="mario-input" type="password" placeholder="PASSWORD" autocomplete="current-password"/>
      <div id="login-msg"     class="msg-box"></div>
      <div id="login-loading" class="mario-loading">LOADING...</div>
      <div class="form-row">
        <button class="mario-btn blue" id="btn-login">LOG IN</button>
        <button class="mario-btn grey" id="btn-back-login">BACK</button>
      </div>
    </div>
    <div id="signup-form" class="auth-form hidden">
      <div class="form-title">SIGN UP</div>
      <input id="signup-email" class="mario-input" type="email"    placeholder="EMAIL"            autocomplete="email"/>
      <input id="signup-pass"  class="mario-input" type="password" placeholder="PASSWORD"         autocomplete="new-password"/>
      <input id="signup-pass2" class="mario-input" type="password" placeholder="CONFIRM PASSWORD" autocomplete="new-password"/>
      <div id="signup-msg"     class="msg-box"></div>
      <div id="signup-loading" class="mario-loading">LOADING...</div>
      <div class="form-row">
        <button class="mario-btn orange" id="btn-signup">SIGN UP</button>
        <button class="mario-btn grey"   id="btn-back-signup">BACK</button>
      </div>
    </div>
  </div>
</div>

<div id="user-bar">
  <span class="ue" id="user-email-display"></span>
  <button id="btn-logout">LOGOUT</button>
</div>

`;
html = html.replace('<div id="GameDiv"', overlayHTML + '<div id="GameDiv"');

// ── 3. Inline auth logic before </body> ──────────────────────────
const authScript = `
<script>
(function(){
  'use strict';
  function waitForFirebase(cb){
    if(typeof firebase!=='undefined'&&firebase.apps&&firebase.apps.length>0){cb(firebase.auth());}
    else{setTimeout(function(){waitForFirebase(cb);},100);}
  }
  waitForFirebase(function(auth){
    var overlay=document.getElementById('auth-overlay'),userBar=document.getElementById('user-bar'),
        emailEl=document.getElementById('user-email-display'),btnLogout=document.getElementById('btn-logout'),
        mainPanel=document.getElementById('auth-main-panel'),loginForm=document.getElementById('login-form'),
        signupForm=document.getElementById('signup-form'),loginEmail=document.getElementById('login-email'),
        loginPass=document.getElementById('login-pass'),btnLogin=document.getElementById('btn-login'),
        loginMsg=document.getElementById('login-msg'),loginLoad=document.getElementById('login-loading'),
        signupEmail=document.getElementById('signup-email'),signupPass=document.getElementById('signup-pass'),
        signupPass2=document.getElementById('signup-pass2'),btnSignup=document.getElementById('btn-signup'),
        signupMsg=document.getElementById('signup-msg'),signupLoad=document.getElementById('signup-loading');
    auth.onAuthStateChanged(function(user){
      if(user){overlay.classList.add('fade-out');setTimeout(function(){overlay.style.display='none';},500);
        userBar.classList.add('visible');if(emailEl)emailEl.textContent=user.email||'Player';}
      else{overlay.style.display='';overlay.classList.remove('fade-out');userBar.classList.remove('visible');showPanel('main');}
    });
    function showPanel(n){mainPanel.classList.add('hidden');loginForm.classList.add('hidden');signupForm.classList.add('hidden');
      clearMsg(loginMsg);clearMsg(signupMsg);
      if(n==='main')mainPanel.classList.remove('hidden');
      if(n==='login'){loginForm.classList.remove('hidden');loginEmail.focus();}
      if(n==='signup'){signupForm.classList.remove('hidden');signupEmail.focus();}
    }
    function showMsg(el,t,tp){el.textContent=t;el.className='msg-box '+tp;}
    function clearMsg(el){el.textContent='';el.className='msg-box';}
    function setLoad(el,btn,on){if(on){el.classList.add('visible');btn.disabled=true;}else{el.classList.remove('visible');btn.disabled=false;}}
    function errMsg(c){return({'auth/invalid-email':'Invalid email.','auth/user-not-found':'No account found.','auth/wrong-password':'Wrong password.',
      'auth/invalid-credential':'Invalid email or password.','auth/email-already-in-use':'Email already registered.',
      'auth/weak-password':'Password needs 6+ chars.','auth/too-many-requests':'Too many attempts.',
      'auth/network-request-failed':'Network error.'})[c]||'Something went wrong.';}
    document.getElementById('btn-show-login').onclick=function(){showPanel('login');};
    document.getElementById('btn-show-signup').onclick=function(){showPanel('signup');};
    document.getElementById('btn-back-login').onclick=function(){showPanel('main');};
    document.getElementById('btn-back-signup').onclick=function(){showPanel('main');};
    btnLogin.onclick=function(){var e=loginEmail.value.trim(),p=loginPass.value;clearMsg(loginMsg);
      if(!e||!p){showMsg(loginMsg,'Fill in all fields.','error');return;}
      setLoad(loginLoad,btnLogin,true);
      auth.signInWithEmailAndPassword(e,p).catch(function(er){setLoad(loginLoad,btnLogin,false);showMsg(loginMsg,errMsg(er.code),'error');});};
    btnSignup.onclick=function(){var e=signupEmail.value.trim(),p=signupPass.value,p2=signupPass2.value;clearMsg(signupMsg);
      if(!e||!p||!p2){showMsg(signupMsg,'Fill in all fields.','error');return;}
      if(p!==p2){showMsg(signupMsg,'Passwords do not match.','error');return;}
      if(p.length<6){showMsg(signupMsg,'Password needs 6+ chars.','error');return;}
      setLoad(signupLoad,btnSignup,true);
      auth.createUserWithEmailAndPassword(e,p)
        .then(function(){showMsg(signupMsg,'Account created!','success');})
        .catch(function(er){setLoad(signupLoad,btnSignup,false);showMsg(signupMsg,errMsg(er.code),'error');});};
    [loginEmail,loginPass].forEach(function(el){el.onkeydown=function(e){if(e.key==='Enter')btnLogin.click();};});
    [signupEmail,signupPass,signupPass2].forEach(function(el){el.onkeydown=function(e){if(e.key==='Enter')btnSignup.click();};});
    if(btnLogout)btnLogout.onclick=function(){auth.signOut();};
  });
})();
<\/script>`;

html = html.replace('</body>', authScript + '\n</body>');

fs.writeFileSync(HTML, html, 'utf8');
console.log('✓  index.html patched successfully.');
