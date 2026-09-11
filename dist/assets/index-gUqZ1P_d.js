import{io as re}from"https://cdn.socket.io/4.7.5/socket.io.esm.min.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function n(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(o){if(o.ep)return;o.ep=!0;const r=n(o);fetch(o.href,r)}})();const se="modulepreload",le=function(e,t){return new URL(e,t).href},M={},p=function(t,n,i){let o=Promise.resolve();if(n&&n.length>0){const s=document.getElementsByTagName("link"),l=document.querySelector("meta[property=csp-nonce]"),d=(l==null?void 0:l.nonce)||(l==null?void 0:l.getAttribute("nonce"));o=Promise.allSettled(n.map(c=>{if(c=le(c,i),c in M)return;M[c]=!0;const g=c.endsWith(".css"),x=g?'[rel="stylesheet"]':"";if(!!i)for(let h=s.length-1;h>=0;h--){const I=s[h];if(I.href===c&&(!g||I.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${c}"]${x}`))return;const v=document.createElement("link");if(v.rel=g?"stylesheet":se,g||(v.as="script"),v.crossOrigin="",v.href=c,d&&v.setAttribute("nonce",d),document.head.appendChild(v),g)return new Promise((h,I)=>{v.addEventListener("load",h),v.addEventListener("error",()=>I(new Error(`Unable to preload CSS for ${c}`)))})}))}function r(s){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=s,window.dispatchEvent(l),!l.defaultPrevented)throw s}return o.then(s=>{for(const l of s||[])l.status==="rejected"&&r(l.reason);return t().catch(r)})},G=[];function m(e,t,n={}){const i=[],o=e.replace(/:([^/]+)/g,(r,s)=>(i.push(s),"([^/]+)"));G.push({pattern:e,regex:new RegExp(`^${o}$`),paramNames:i,handler:t,meta:n})}function ce(e){location.hash=`#${e}`}function de(e){const t=e.replace(/^#/,"")||"/";for(const n of G){const i=t.match(n.regex);if(i){const o={};return n.paramNames.forEach((r,s)=>{o[r]=i[s+1]}),{route:n,params:o,path:t}}}return null}async function O(){const e=location.hash||"#/",t=de(e);if(!t){document.getElementById("main").innerHTML=`
      <div style="text-align:center; padding:60px 20px;">
        <div style="font-size:3em; margin-bottom:16px;">🕌</div>
        <h2>404 — Page not found</h2>
        <p style="color:var(--muted); margin:12px 0;">This page doesn't exist.</p>
        <a href="#/" class="btn btn-primary">← Home</a>
      </div>`;return}await t.route.handler(t.params),me(t.path)}function me(e){document.querySelectorAll("#main-nav a, #mobile-nav a").forEach(t=>{var i;const n=((i=t.getAttribute("href"))==null?void 0:i.replace("#",""))||"";t.classList.toggle("active",e.startsWith(n)&&n!=="/")})}function ue(){window.addEventListener("hashchange",O),O()}const E={ar:{dir:"rtl",label:"العربية"},fr:{dir:"ltr",label:"Français"},en:{dir:"ltr",label:"English"},nl:{dir:"ltr",label:"Nederlands"},de:{dir:"ltr",label:"Deutsch"},es:{dir:"ltr",label:"Español"},tr:{dir:"ltr",label:"Türkçe"},ur:{dir:"rtl",label:"اردو"},bn:{dir:"ltr",label:"বাংলা"},ha:{dir:"ltr",label:"Hausa"},wo:{dir:"ltr",label:"Wolof"},it:{dir:"ltr",label:"Italiano"},pt:{dir:"ltr",label:"Português"},id:{dir:"ltr",label:"Bahasa Indonesia"}};let _=localStorage.getItem("uiLang")||"fr",K={},j={};function ge(){return _}function ve(e){return E[e]}function he(){return Object.keys(E)}async function pe(e){E[e]&&(_=e,localStorage.setItem("uiLang",e),j[e]||await U(e),W(),document.documentElement.lang=e,document.documentElement.dir=E[e].dir)}async function U(e){try{const t=await fetch(`../lang/${e}.json`);t.ok&&(K[e]=await t.json(),j[e]=!0)}catch{}j[e]=j[e]||!0}function a(e,t){var i;return((i=K[_])==null?void 0:i[e])||t||e}function W(){document.querySelectorAll("[data-i18n]").forEach(e=>{const t=e.getAttribute("data-i18n"),n=a(t);n!==t&&(e.textContent=n)}),document.querySelectorAll("[data-i18n-placeholder]").forEach(e=>{const t=e.getAttribute("data-i18n-placeholder"),n=a(t);n!==t&&(e.placeholder=n)})}async function ye(){await U(_),W(),document.documentElement.lang=_,E[_]&&(document.documentElement.dir=E[_].dir)}function fe(e){e==="auto"?(localStorage.removeItem("theme"),document.documentElement.removeAttribute("data-theme")):(localStorage.setItem("theme",e),document.documentElement.setAttribute("data-theme",e))}function be(e){e?(localStorage.setItem("contrast","high"),document.documentElement.setAttribute("data-contrast","high")):(localStorage.removeItem("contrast"),document.documentElement.removeAttribute("data-contrast"))}function xe(e){e?(localStorage.setItem("senior-mode","true"),document.documentElement.setAttribute("data-senior","true")):(localStorage.removeItem("senior-mode"),document.documentElement.removeAttribute("data-senior"))}function $e(){const e=localStorage.getItem("theme");e&&document.documentElement.setAttribute("data-theme",e),localStorage.getItem("contrast")==="high"&&document.documentElement.setAttribute("data-contrast","high"),localStorage.getItem("senior-mode")==="true"&&document.documentElement.setAttribute("data-senior","true")}var F;const J=((F=window.__CONFIG__)==null?void 0:F.BACKEND_URL)||(location.hostname==="localhost"?"http://localhost:8000":location.origin),z=J;let b=localStorage.getItem("accessToken")||"",k=localStorage.getItem("refreshToken")||"",T=null;function Q(e){T=e}function _e(){return b}function q(){return!!b}function Y(e,t){b=e,k=t,localStorage.setItem("accessToken",e),localStorage.setItem("refreshToken",t),T&&T(!0)}function X(){b="",k="",localStorage.removeItem("accessToken"),localStorage.removeItem("refreshToken"),T&&T(!1)}async function we(){if(!k)return!1;try{const e=await fetch(`${z}/api/auth/refresh`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refreshToken:k})});return e.ok?(b=(await e.json()).accessToken,localStorage.setItem("accessToken",b),!0):(X(),!1)}catch{return!1}}async function f(e,t={}){const{method:n="GET",body:i,headers:o={},auth:r=!0}=t,s=e.startsWith("http")?e:`${z}${e}`,l={...o};r&&b&&(l.Authorization=`Bearer ${b}`),i&&!(i instanceof FormData)&&(l["Content-Type"]="application/json");let d=await fetch(s,{method:n,headers:l,body:i instanceof FormData?i:i?JSON.stringify(i):void 0});if(d.status===401&&r&&k&&await we()&&(l.Authorization=`Bearer ${b}`,d=await fetch(s,{method:n,headers:l,body:i instanceof FormData?i:i?JSON.stringify(i):void 0})),!d.ok){const g=await d.json().catch(()=>({error:d.statusText}));throw new Error(g.error||`HTTP ${d.status}`)}const c=d.headers.get("content-type")||"";return c.includes("application/json")?d.json():c.includes("image/")?d.blob():d.text()}const Ie=Object.freeze(Object.defineProperty({__proto__:null,API_BASE:z,api:f,clearTokens:X,getAccessToken:_e,isAuthenticated:q,setAuthChangeCallback:Q,setTokens:Y},Symbol.toStringTag,{value:"Module"}));function w(e,t="info",n=4e3){const i=document.getElementById("toast-container"),o=document.createElement("div");o.className=`toast toast-${t}`,o.textContent=e,i.appendChild(o),setTimeout(()=>{o.style.opacity="0",setTimeout(()=>o.remove(),300)},n)}function u(e){const t=document.getElementById("main");typeof e=="string"?t.innerHTML=e:e instanceof HTMLElement&&(t.innerHTML="",t.appendChild(e))}const Ee=Object.assign({"../modules/admin/index.js":()=>p(()=>Promise.resolve().then(()=>Le),void 0,import.meta.url),"../modules/announcements/index.js":()=>p(()=>Promise.resolve().then(()=>Ce),void 0,import.meta.url),"../modules/auth/index.js":()=>p(()=>Promise.resolve().then(()=>Oe),void 0,import.meta.url),"../modules/display/index.js":()=>p(()=>Promise.resolve().then(()=>He),void 0,import.meta.url),"../modules/events/index.js":()=>p(()=>Promise.resolve().then(()=>Fe),void 0,import.meta.url),"../modules/home/index.js":()=>p(()=>Promise.resolve().then(()=>Ue),void 0,import.meta.url),"../modules/imam/index.js":()=>p(()=>Promise.resolve().then(()=>Xe),void 0,import.meta.url),"../modules/khutbah/index.js":()=>p(()=>Promise.resolve().then(()=>nt),void 0,import.meta.url),"../modules/prayer/index.js":()=>p(()=>Promise.resolve().then(()=>it),void 0,import.meta.url),"../modules/quran/index.js":()=>p(()=>Promise.resolve().then(()=>ct),void 0,import.meta.url),"../modules/ramadan/index.js":()=>p(()=>Promise.resolve().then(()=>mt),void 0,import.meta.url)});async function y(e){const t=Ee[`../modules/${e}.js`];if(!t)throw new Error(`Module introuvable: ${e}`);return t()}async function Se(){const{renderHome:e}=await y("home/index");await e()}async function Z(e){const{renderPrayer:t}=await y("prayer/index");await t(e)}async function C(e){const{renderQuran:t}=await y("quran/index");await t(e)}async function ee(e){const{renderKhutbah:t}=await y("khutbah/index");await t(e)}async function ke(e){const{renderAnnouncements:t}=await y("announcements/index");await t(e)}async function Te(e){const{renderEvents:t}=await y("events/index");await t(e)}async function qe(e){const{renderRamadan:t}=await y("ramadan/index");await t(e)}async function te(e){const{renderAdmin:t}=await y("admin/index");await t(e)}async function ne(e){const{renderImam:t}=await y("imam/index");await t(e)}async function ae(e){const{renderAuth:t}=await y("auth/index");await t(e)}async function ie(e){const{renderDisplay:t}=await y("display/index");await t(e)}async function je(){u(`
    <div class="card">
      <h2 class="card-header">⚙️ ${a("settings","Paramètres")}</h2>

      <div class="form-group">
        <label>${a("language","Langue")}</label>
        <select id="settings-lang">
          ${he().map(e=>{var t;return`<option value="${e}" ${e===ge()?"selected":""}>${((t=ve(e))==null?void 0:t.label)||e}</option>`}).join("")}
        </select>
      </div>

      <div class="form-group">
        <label>${a("theme","Thème")}</label>
        <select id="settings-theme">
          <option value="auto" ${localStorage.getItem("theme")?"":"selected"}>${a("auto","Automatique")}</option>
          <option value="dark" ${localStorage.getItem("theme")==="dark"?"selected":""}>${a("dark","Sombre")}</option>
          <option value="light" ${localStorage.getItem("theme")==="light"?"selected":""}>${a("light","Clair")}</option>
        </select>
      </div>

      <div class="form-group">
        <label>${a("accessibility","Accessibilité")}</label>
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <input type="checkbox" id="senior-mode" ${localStorage.getItem("senior-mode")==="true"?"checked":""} />
          ${a("senior_mode","Mode senior (gros texte)")}
        </label>
        <label style="display:flex;align-items:center;gap:8px;">
          <input type="checkbox" id="high-contrast" ${localStorage.getItem("contrast")==="high"?"checked":""} />
          ${a("high_contrast","Contraste élevé")}
        </label>
      </div>

      <button class="btn btn-secondary" id="settings-clear" style="margin-top:16px;">${a("clear_cache","Vider le cache")}</button>
    </div>
  `),document.getElementById("settings-lang").onchange=e=>pe(e.target.value),document.getElementById("settings-theme").onchange=e=>fe(e.target.value),document.getElementById("senior-mode").onchange=e=>xe(e.target.checked),document.getElementById("high-contrast").onchange=e=>be(e.target.checked),document.getElementById("settings-clear").onclick=()=>{caches&&caches.keys().then(e=>e.forEach(t=>caches.delete(t))),w(a("cache_cleared","Cache vidé"),"success")}}m("/",Se);m("/prayer",Z);m("/prayer/:mosqueId",Z);m("/quran",C);m("/quran/surah/:number",C);m("/quran/verse/:ref",C);m("/khutbah",ee);m("/khutbah/:code",ee);m("/announcements",ke);m("/events",Te);m("/ramadan",qe);m("/admin",te);m("/admin/:mosqueId",te);m("/imam",ne);m("/imam/:code",ne);m("/auth",ae);m("/auth/:action",ae);m("/display",ie);m("/display/:mosqueId",ie);m("/settings",je);function A(){const e=[{href:"#/",icon:"🏠",label:a("home","Accueil")},{href:"#/prayer",icon:"🕌",label:a("prayers","Prières")},{href:"#/quran",icon:"📖",label:a("quran","Coran")},{href:"#/khutbah",icon:"🎙️",label:a("khutbah_live","Khutbah Live")},{href:"#/announcements",icon:"📢",label:a("announcements","Annonces")},{href:"#/events",icon:"📅",label:a("events","Événements")},{href:"#/settings",icon:"⚙️",label:a("settings","Paramètres")}],t=document.getElementById("main-nav"),n=document.getElementById("mobile-nav");t.innerHTML=e.filter((i,o)=>o<5).map(i=>`<a href="${i.href}">${i.icon} ${i.label}</a>`).join(""),n.innerHTML=e.map(i=>`<a href="${i.href}"><span class="icon">${i.icon}</span>${i.label}</a>`).join("")}async function Ae(){$e(),await ye(),A(),Q(()=>A()),window.addEventListener("language-changed",()=>{A(),window.dispatchEvent(new HashChangeEvent("hashchange"))}),ue()}Ae().catch(e=>{console.error("App init failed:",e),u(`<div style="text-align:center;padding:60px;"><h2>⚠️ Initialization Error</h2><p>${e.message}</p></div>`)});"serviceWorker"in navigator&&navigator.serviceWorker.register("./sw.js").catch(()=>{});async function Pe(e){if(!q()){u(`
      <div class="card" style="max-width:420px; margin:40px auto; text-align:center;">
        <h2>🧑‍💼 ${a("admin","Administration")}</h2>
        <p style="color:var(--muted); margin:12px 0;">${a("login_required","Connexion requise")}</p>
        <a href="#/auth/login" class="btn btn-primary">${a("login","Se connecter")}</a>
      </div>
    `);return}e==null||e.mosqueId,u(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/" class="btn btn-sm btn-secondary">←</a>
      <h2>🧑‍💼 ${a("admin_dashboard","Tableau de bord")}</h2>
    </div>

    <div class="card-grid">
      <a href="#/admin/mosques" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">🕌</span>
        <div><div style="font-weight:600;">${a("mosques","Mosquées")}</div><div style="font-size:0.85em; color:var(--muted);">${a("manage_mosques","Gérer les mosquées")}</div></div>
      </a>

      <a href="#/admin/users" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">👥</span>
        <div><div style="font-weight:600;">${a("users","Utilisateurs")}</div><div style="font-size:0.85em; color:var(--muted);">${a("manage_users","Gérer les rôles")}</div></div>
      </a>

      <a href="#/admin/sessions" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">🎙️</span>
        <div><div style="font-weight:600;">${a("sessions","Sessions")}</div><div style="font-size:0.85em; color:var(--muted);">${a("session_history","Historique des khutbahs")}</div></div>
      </a>

      <a href="#/admin/analytics" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">📊</span>
        <div><div style="font-weight:600;">${a("analytics","Statistiques")}</div><div style="font-size:0.85em; color:var(--muted);">${a("view_stats","Voir les statistiques")}</div></div>
      </a>

      <a href="#/admin/settings" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">⚙️</span>
        <div><div style="font-weight:600;">${a("settings","Paramètres")}</div><div style="font-size:0.85em; color:var(--muted);">${a("mosque_config","Configuration de la mosquée")}</div></div>
      </a>

      <a href="#/admin/announcements" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">📢</span>
        <div><div style="font-weight:600;">${a("announcements","Annonces")}</div><div style="font-size:0.85em; color:var(--muted);">${a("create_announcement","Créer une annonce")}</div></div>
      </a>
    </div>
  `)}const Le=Object.freeze(Object.defineProperty({__proto__:null,renderAdmin:Pe},Symbol.toStringTag,{value:"Module"}));async function Be(e){const t=e==null?void 0:e.mosqueId;if(u(`
    <div class="card">
      <h2 class="card-header">📢 ${a("announcements","Annonces")}</h2>
      <div id="announcements-list" class="loading-center"><div class="spinner"></div></div>
    </div>
  `),t)try{const n=await f(`/api/announcements/${t}`,{auth:!1});ze(n)}catch{document.getElementById("announcements-list").innerHTML=`<p style="color:var(--muted); text-align:center; padding:20px;">${a("no_announcements","Aucune annonce pour le moment")}</p>`}else document.getElementById("announcements-list").innerHTML=`
      <p style="color:var(--muted); text-align:center; padding:20px;">
        ${a("select_mosque","Sélectionnez une mosquée pour voir les annonces")}
      </p>
    `}function ze(e){const t=document.getElementById("announcements-list");if(t){if(!(e!=null&&e.length)){t.innerHTML=`<p style="color:var(--muted); text-align:center;">${a("no_announcements","Aucune annonce")}</p>`;return}t.innerHTML=e.map(n=>`
    <div class="announcement-item ${n.priority==="urgent"?"urgent":""}">
      <div class="title">
        ${n.priority==="urgent"?"🔴 ":n.pinned?"📌 ":""}${n.title}
      </div>
      <div class="body">${n.body}</div>
      <div class="meta">
        ${n.publishedAt?new Date(n.publishedAt).toLocaleDateString():""}
        ${n.category?` · ${n.category}`:""}
      </div>
    </div>
  `).join("")}}const Ce=Object.freeze(Object.defineProperty({__proto__:null,renderAnnouncements:Be},Symbol.toStringTag,{value:"Module"}));async function Me(e){const t=(e==null?void 0:e.action)||"login";u(`
    <div class="card" style="max-width:420px; margin:40px auto;">
      <h2 class="card-header" style="justify-content:center;">
        🕌 ${t==="register"?a("register","Créer un compte"):a("login","Connexion")}
      </h2>

      <form id="auth-form">
        ${t==="register"?`
          <div class="form-group">
            <label>${a("name","Nom")}</label>
            <input type="text" name="name" required placeholder="${a("your_name","Votre nom")}" />
          </div>
        `:""}

        <div class="form-group">
          <label>${a("email","Email")}</label>
          <input type="email" name="email" required placeholder="email@mosquee.org" />
        </div>

        <div class="form-group">
          <label>${a("password","Mot de passe")}</label>
          <input type="password" name="password" required minlength="8" placeholder="••••••••" />
        </div>

        <button type="submit" class="btn btn-primary btn-block" id="auth-submit">
          ${t==="register"?a("create_account","Créer le compte"):a("login_btn","Se connecter")}
        </button>
      </form>

      <div style="text-align:center; margin-top:16px;">
        ${t==="register"?`<a href="#/auth/login">${a("have_account","Déjà un compte ? Se connecter")}</a>`:`<a href="#/auth/register">${a("no_account","Pas de compte ? Créer un compte")}</a>`}
      </div>
    </div>
  `),document.getElementById("auth-form").onsubmit=async n=>{n.preventDefault();const i=new FormData(n.target),o=document.getElementById("auth-submit");o.disabled=!0,o.textContent="⏳ ...";try{const r=Object.fromEntries(i),l=await f(t==="register"?"/api/auth/register":"/api/auth/login",{method:"POST",body:r,auth:!1});Y(l.accessToken,l.refreshToken),localStorage.setItem("userName",l.user.name),w(a("welcome","Bienvenue")+", "+l.user.name+" !","success"),ce("/")}catch(r){w(r.message,"error"),o.disabled=!1,o.textContent=t==="register"?a("create_account","Créer le compte"):a("login_btn","Se connecter")}}}const Oe=Object.freeze(Object.defineProperty({__proto__:null,renderAuth:Me},Symbol.toStringTag,{value:"Module"}));async function De(e){e==null||e.mosqueId,u(`
    <div style="min-height:80vh; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:20px;">
      <div style="font-size:4em; margin-bottom:12px;">🕌</div>
      <h1 style="font-size:2em; margin-bottom:24px;">Mosqué Digital</h1>

      <div id="display-prayer" style="margin-bottom:30px;">
        <div style="font-size:1.2em; color:var(--muted);" id="display-prayer-name">${a("loading","...")}</div>
        <div style="font-size:4em; font-weight:700; color:var(--accent);" id="display-prayer-time">--:--</div>
        <div style="font-size:1.2em; color:var(--muted);" id="display-countdown"></div>
      </div>

      <div style="width:100%; max-width:600px; border-top:1px solid var(--line); padding-top:20px;">
        <div style="color:var(--muted);" id="display-next-activity">${a("loading","...")}</div>
      </div>

      <div style="position:fixed; bottom:16px; right:16px; color:var(--muted); font-size:0.8em;" id="display-clock"></div>
    </div>
  `);function t(){const o=new Date,r=document.getElementById("display-clock");r&&(r.textContent=o.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}))}t(),setInterval(t,1e4);const n=[{name:"Fajr",time:"05:30"},{name:"Dhuhr",time:"13:00"},{name:"Asr",time:"16:30"},{name:"Maghrib",time:"19:45"},{name:"Isha",time:"21:15"}];function i(){const o=new Date,r=o.getHours()*60+o.getMinutes();let s=n[0];for(const $ of n){const[v,h]=$.time.split(":").map(Number);if(v*60+h>r){s=$;break}}const[l,d]=s.time.split(":").map(Number),c=Math.max(0,l*60+d-r),g=Math.floor(c/60),x=c%60;document.getElementById("display-prayer-name").textContent=s.name,document.getElementById("display-prayer-time").textContent=s.time,document.getElementById("display-countdown").textContent=c>0?`IQAMA DANS ${g>0?g+"H":""}${x.toString().padStart(2,"0")}`:"MAINTENANT"}i(),setInterval(i,3e4)}const He=Object.freeze(Object.defineProperty({__proto__:null,renderDisplay:De},Symbol.toStringTag,{value:"Module"})),Ne={prayer:"🕌",quran:"📖",course:"🎓",ramadan:"🌙",conference:"🎤",family:"👨‍👩‍👧",children:"🧒",community:"🤝"};async function Re(e){const t=e==null?void 0:e.mosqueId;if(u(`
    <div class="card">
      <h2 class="card-header">📅 ${a("events","Événements")}</h2>
      <div id="events-list" class="loading-center"><div class="spinner"></div></div>
    </div>
  `),t)try{const n=await f(`/api/events/${t}`,{auth:!1});Ve(n)}catch{B()}else B()}function B(){document.getElementById("events-list").innerHTML=`
    <p style="color:var(--muted); text-align:center; padding:20px;">
      ${a("no_events","Aucun événement à venir")}
    </p>`}function Ve(e){const t=document.getElementById("events-list");if(t){if(!(e!=null&&e.length)){B();return}t.innerHTML=e.map(n=>`
    <div class="card" style="padding:16px; display:flex; gap:16px; align-items:start;">
      <div style="font-size:2em; flex-shrink:0;">${Ne[n.category]||"📅"}</div>
      <div style="flex:1;">
        <div style="font-weight:600;">${n.title}</div>
        ${n.description?`<div style="color:var(--muted); margin-top:4px;">${n.description}</div>`:""}
        <div style="font-size:0.85em; color:var(--accent); margin-top:8px;">
          📅 ${new Date(n.startTime).toLocaleDateString()} ${new Date(n.startTime).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}
          ${n.location?` · 📍 ${n.location}`:""}
          ${n.speaker?` · 🎤 ${n.speaker}`:""}
        </div>
      </div>
    </div>
  `).join("")}}const Fe=Object.freeze(Object.defineProperty({__proto__:null,renderEvents:Re},Symbol.toStringTag,{value:"Module"}));let S=null;async function Ge(){S&&(clearInterval(S),S=null);const e=localStorage.getItem("userName")||"";u(`
    <div style="text-align:center; padding:20px 0 10px;">
      <div style="font-size:2.5em;">🕌</div>
      <h1 style="font-size:1.5em; margin:8px 0;">${a("app_name","Mosque Digital OS")}</h1>
      ${e?`<p style="color:var(--muted);">Assalamu alaykum, <strong>${e}</strong></p>`:""}
    </div>

    <div id="prayer-countdown" class="countdown card" style="margin-bottom:24px;">
      <div class="spinner"></div>
    </div>

    <div class="card-grid">
      <a href="#/khutbah" class="card" style="cursor:pointer; display:flex; align-items:center; gap:16px; text-decoration:none; color:var(--fg);">
        <span style="font-size:2em;">🎙️</span>
        <div>
          <div style="font-weight:600;">${a("khutbah_live","Khutbah Live")}</div>
          <div style="font-size:0.85em; color:var(--muted);">${a("join_or_start","Rejoindre ou démarrer")}</div>
        </div>
      </a>

      <a href="#/quran" class="card" style="cursor:pointer; display:flex; align-items:center; gap:16px; text-decoration:none; color:var(--fg);">
        <span style="font-size:2em;">📖</span>
        <div>
          <div style="font-weight:600;">${a("quran","Coran")}</div>
          <div style="font-size:0.85em; color:var(--muted);">${a("read_listen","Lire et écouter")}</div>
        </div>
      </a>

      <a href="#/prayer" class="card" style="cursor:pointer; display:flex; align-items:center; gap:16px; text-decoration:none; color:var(--fg);">
        <span style="font-size:2em;">🕌</span>
        <div>
          <div style="font-weight:600;">${a("prayers","Horaires de prière")}</div>
          <div style="font-size:0.85em; color:var(--muted);">${a("adhan_iqama","Adhan & Iqama")}</div>
        </div>
      </a>

      <a href="#/announcements" class="card" style="cursor:pointer; display:flex; align-items:center; gap:16px; text-decoration:none; color:var(--fg);">
        <span style="font-size:2em;">📢</span>
        <div>
          <div style="font-weight:600;">${a("announcements","Annonces")}</div>
          <div style="font-size:0.85em; color:var(--muted);">${a("latest_news","Dernières nouvelles")}</div>
        </div>
      </a>

      <a href="#/events" class="card" style="cursor:pointer; display:flex; align-items:center; gap:16px; text-decoration:none; color:var(--fg);">
        <span style="font-size:2em;">📅</span>
        <div>
          <div style="font-weight:600;">${a("events","Événements")}</div>
          <div style="font-size:0.85em; color:var(--muted);">${a("upcoming","À venir")}</div>
        </div>
      </a>

      <a href="#/ramadan" class="card" style="cursor:pointer; display:flex; align-items:center; gap:16px; text-decoration:none; color:var(--fg);">
        <span style="font-size:2em;">🌙</span>
        <div>
          <div style="font-weight:600;">${a("ramadan","Ramadan")}</div>
          <div style="font-size:0.85em; color:var(--muted);">${a("program","Programme")}</div>
        </div>
      </a>
    </div>

    ${q()?`
      <div style="text-align:center; margin-top:24px;">
        <a href="#/admin" class="btn btn-secondary">${a("admin","Administration")}</a>
        <a href="#/imam" class="btn btn-secondary" style="margin-left:8px;">${a("imam_mode","Mode Imam")}</a>
      </div>
    `:`
      <div style="text-align:center; margin-top:24px;">
        <a href="#/auth/login" class="btn btn-primary">${a("login","Connexion")}</a>
        <a href="#/admin" class="btn btn-secondary" style="margin-left:8px;">${a("admin","Administration")}</a>
      </div>
    `}
  `),Ke()}function Ke(){D(),S=setInterval(D,6e4)}function D(){const e=document.getElementById("prayer-countdown");if(!e){clearInterval(S);return}const t=new Date,n=t.getHours(),i=t.getMinutes(),o=`${n.toString().padStart(2,"0")}:${i.toString().padStart(2,"0")}`,r=[{name:"Fajr",time:"05:30"},{name:"Sunrise",time:"07:15"},{name:"Dhuhr",time:"13:00"},{name:"Asr",time:"16:30"},{name:"Maghrib",time:"19:45"},{name:"Isha",time:"21:15"}];let s=null;for(const v of r){const[h,I]=v.time.split(":").map(Number);if(h>n||h===n&&I>i){s=v;break}}s||(s=r[0]);const[l,d]=s.time.split(":").map(Number);let c=l*60+d-(n*60+i);c<0&&(c+=24*60);const g=Math.floor(c/60),x=c%60,$=g>0?`${g}h${x.toString().padStart(2,"0")}`:`${x}min`;e.innerHTML=`
    <div class="label">${a("next_prayer","Prochaine prière")}</div>
    <div class="next-prayer">${s.name}</div>
    <div class="timer">${$}</div>
    <div class="label">${a("at","à")} ${s.time} · ${o}</div>
  `}const Ue=Object.freeze(Object.defineProperty({__proto__:null,renderHome:Ge},Symbol.toStringTag,{value:"Module"})),P={};function oe(e="/khutbah"){if(P[e])return P[e];const n=re(`${J}${e}`,{transports:["websocket","polling"],reconnection:!0,reconnectionDelay:1e3,reconnectionDelayMax:12e3,reconnectionAttempts:1/0,timeout:1e4});return P[e]=n,n}async function We(e){if(!q()){u(`
      <div class="card" style="max-width:420px; margin:40px auto; text-align:center;">
        <h2>👳 ${a("imam_mode","Mode Imam")}</h2>
        <p style="color:var(--muted); margin:12px 0;">${a("login_required","Connexion requise")}</p>
        <a href="#/auth/login" class="btn btn-primary">${a("login","Se connecter")}</a>
      </div>
    `);return}const t=e==null?void 0:e.code;t?await Qe(t):await Je()}async function Je(){u(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/" class="btn btn-sm btn-secondary">←</a>
      <h2>👳 ${a("imam_dashboard","Tableau de bord Imam")}</h2>
    </div>

    <div class="card">
      <h3 class="card-header">🎙️ ${a("khutbah_control","Contrôle Khutbah")}</h3>
      <div class="form-group">
        <label>${a("topic","Sujet")}</label>
        <input type="text" id="imam-topic" placeholder="${a("khutbah_topic","Sujet de la khutbah")}" />
      </div>
      <button class="btn btn-primary btn-block" id="start-khutbah">${a("start_session","Démarrer une session")}</button>
    </div>

    <div class="card">
      <h3 class="card-header">🤖 ${a("ai_assistant","Assistant IA")}</h3>
      <div class="form-group">
        <label>${a("ask_assistant","Demander à l'assistant")}</label>
        <textarea id="ai-question" rows="3" placeholder="${a("ai_placeholder","Préparer un plan de khutbah sur la patience...")}" style="width:100%; padding:10px; border:1px solid var(--line); border-radius:10px; background:var(--bg2); color:var(--fg);"></textarea>
      </div>
      <button class="btn btn-primary" id="ai-generate">${a("generate","Générer")}</button>
      <div id="ai-result" style="margin-top:16px;"></div>
    </div>
  `),document.getElementById("start-khutbah").onclick=async()=>{const e=document.getElementById("imam-topic").value.trim();try{const t=await f("/api/sessions",{method:"POST",body:{topic:e,languages:["fr","en"]}});w(`${a("session_created","Session créée")}: ${t.code}`,"success"),location.hash=`#/imam/${t.code}`}catch(t){w(t.message,"error")}},document.getElementById("ai-generate").onclick=async()=>{var n,i,o;const e=document.getElementById("ai-question").value.trim();if(!e)return;const t=document.getElementById("ai-result");t.innerHTML='<div class="loading-center"><div class="spinner"></div></div>';try{const r=await f("/api/ai/assistant/plan",{method:"POST",body:{topic:e}});t.innerHTML=`
        <div class="card" style="background:var(--bg2);">
          <h4>📋 ${r.topic||e}</h4>
          <div style="margin-top:8px;"><strong>${a("introduction","Introduction")}:</strong><p>${r.introduction}</p></div>
          ${(n=r.mainPoints)!=null&&n.length?`<div style="margin-top:8px;"><strong>${a("main_points","Points principaux")}:</strong><ul>${r.mainPoints.map(s=>`<li>${s}</li>`).join("")}</ul></div>`:""}
          ${(i=r.references)!=null&&i.length?`<div style="margin-top:8px;"><strong>${a("references","Références")}:</strong><ul>${r.references.map(s=>`<li>📖 ${s}</li>`).join("")}</ul></div>`:""}
          ${r.conclusion?`<div style="margin-top:8px;"><strong>${a("conclusion","Conclusion")}:</strong><p>${r.conclusion}</p></div>`:""}
          ${(o=r.warnings)!=null&&o.length?`<div style="margin-top:8px; color:var(--warn);"><strong>⚠️ ${a("verify","À vérifier")}:</strong><ul>${r.warnings.map(s=>`<li>${s}</li>`).join("")}</ul></div>`:""}
        </div>
      `}catch(r){t.innerHTML=`<p style="color:var(--danger);">${r.message}</p>`}}}async function Qe(e){u(`
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
      <a href="#/imam" class="btn btn-sm btn-secondary">←</a>
      <span style="font-weight:600;">👳 ${a("imam_control","Contrôle Imam")}</span>
      <span style="margin-left:auto; font-size:0.85em; color:var(--muted);" id="imam-status">⏳</span>
    </div>

    <div class="card">
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;">
        <button class="btn btn-primary" id="btn-pause">⏸ ${a("pause","Pause")}</button>
        <button class="btn btn-secondary" id="btn-resume">▶ ${a("resume","Reprendre")}</button>
        <button class="btn btn-danger" id="btn-stop">⏹ ${a("stop","Terminer")}</button>
      </div>

      <div class="form-group">
        <label>${a("type_arabic","Saisir du texte arabe")}</label>
        <textarea id="manual-text" rows="3" placeholder="${a("arabic_placeholder","Texte arabe...")}" style="direction:rtl; text-align:right; font-family:'Noto Naskh Arabic',serif; font-size:1.2em;"></textarea>
      </div>
      <button class="btn btn-primary btn-block" id="send-text">${a("send","Envoyer")}</button>
    </div>

    <div class="card">
      <h4 class="card-header">📊 ${a("live_stats","Statistiques en direct")}</h4>
      <div id="imam-stats" style="color:var(--muted);">${a("listeners","Auditeurs")}: <span id="listener-count">0</span></div>
      <div id="imam-quran" style="margin-top:8px;"></div>
    </div>

    <div class="card">
      <h4 class="card-header">📝 ${a("segments","Segments")}</h4>
      <div id="imam-segments" style="max-height:40vh; overflow-y:auto;"></div>
    </div>
  `);const t=oe("/khutbah");t.on("connect",()=>{document.getElementById("imam-status").textContent="🟢 "+a("connected","Connecté"),t.emit("join-broadcast",{code:e})}),t.on("hello",n=>{document.getElementById("imam-status").textContent=n.status==="live"?"🔴 LIVE":`⏸ ${n.status}`,document.getElementById("listener-count").textContent=n.listeners}),t.on("monitor",n=>{document.getElementById("listener-count").textContent=n.listeners,n.is_quran&&n.quran_ref&&(document.getElementById("imam-quran").innerHTML=`<div class="card" style="padding:12px; border-left:3px solid var(--accent);">📖 ${n.quran_ref}</div>`),Ye(n)}),t.on("status",n=>{document.getElementById("imam-status").textContent=n.status==="live"?"🔴 LIVE":`⏸ ${n.status}`}),document.getElementById("btn-pause").onclick=()=>t.emit("control",{code:e,action:"pause"}),document.getElementById("btn-resume").onclick=()=>t.emit("control",{code:e,action:"resume"}),document.getElementById("btn-stop").onclick=()=>t.emit("control",{code:e,action:"stop"}),document.getElementById("send-text").onclick=()=>{const n=document.getElementById("manual-text").value.trim();n&&(t.emit("transcript",{code:e,text:n,is_final:!0}),document.getElementById("manual-text").value="")}}function Ye(e){const t=document.getElementById("imam-segments");if(!t)return;const n=document.createElement("div");n.className=`khutbah-segment ${e.is_quran?"quran":""}`,n.innerHTML=`
    <div class="arabic">${e.arabic||""}</div>
    <div style="font-size:0.8em; color:var(--muted);">seq #${e.seq} ${e.provider?`· ${e.provider}`:""}</div>
  `,t.prepend(n)}const Xe=Object.freeze(Object.defineProperty({__proto__:null,renderImam:We},Symbol.toStringTag,{value:"Module"}));async function Ze(e){const t=e==null?void 0:e.code;t?await tt(t):await et()}async function et(){u(`
    <div class="card" style="max-width:500px; margin:20px auto; text-align:center;">
      <h2 class="card-header" style="justify-content:center;">🎙️ ${a("khutbah_live","Khutbah Live")}</h2>

      <p style="color:var(--muted); margin-bottom:20px;">${a("join_session","Rejoindre une session en cours")}</p>

      <div class="form-group">
        <input type="text" id="session-code" placeholder="${a("session_code","Code de session")}"
               maxlength="6" style="text-align:center; font-size:1.3em; letter-spacing:0.15em; text-transform:uppercase;" />
      </div>

      <button class="btn btn-primary btn-block" id="join-btn">${a("join","Rejoindre")}</button>

      <div style="margin:20px 0; color:var(--muted);">— ${a("or","ou")} —</div>

      <button class="btn btn-secondary btn-block" id="scan-btn">📷 ${a("scan_qr","Scanner le QR Code")}</button>
    </div>

    ${q()?`
      <div class="card" style="max-width:500px; margin:0 auto;">
        <h3 class="card-header">👑 ${a("imam_tools","Outils Imam")}</h3>
        <button class="btn btn-primary btn-block" id="start-session">${a("start_session","Démarrer une Khutbah")}</button>
      </div>
    `:""}
  `),document.getElementById("join-btn").onclick=()=>{const e=document.getElementById("session-code").value.trim().toUpperCase();e.length>=4&&(location.hash=`#/khutbah/${e}`)},document.getElementById("session-code").onkeydown=e=>{e.key==="Enter"&&document.getElementById("join-btn").click()},document.getElementById("start-session")&&(document.getElementById("start-session").onclick=async()=>{try{const{api:e}=await p(async()=>{const{api:n}=await Promise.resolve().then(()=>Ie);return{api:n}},void 0,import.meta.url),t=await e("/api/sessions",{method:"POST",body:{languages:["fr","en"]}});w(`${a("session_created","Session créée")}: ${t.code}`,"success"),location.hash=`#/imam/${t.code}`}catch(e){w(e.message,"error")}})}async function tt(e){u(`
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
      <a href="#/khutbah" class="btn btn-sm btn-secondary">←</a>
      <span style="font-weight:600;">🎙️ Khutbah Live</span>
      <span style="margin-left:auto; font-size:0.85em; color:var(--muted);" id="listener-count">0 👤</span>
    </div>

    <div class="form-group" style="margin-bottom:12px;">
      <select id="lang-select" style="width:auto;">
        <option value="fr">Français</option>
        <option value="en">English</option>
        <option value="nl">Nederlands</option>
        <option value="de">Deutsch</option>
        <option value="es">Español</option>
        <option value="tr">Türkçe</option>
        <option value="ar">العربية</option>
      </select>
    </div>

    <div id="khutbah-status" style="text-align:center; padding:8px; color:var(--muted);">
      ${a("connecting","Connexion...")} <div class="spinner" style="width:16px;height:16px;"></div>
    </div>

    <div id="segments" style="max-height:60vh; overflow-y:auto; padding:4px 0;"></div>
  `);const t=oe("/khutbah");t.on("connect",()=>{document.getElementById("khutbah-status").textContent=a("connected","Connecté"),t.emit("join-listen",{code:e,lang:document.getElementById("lang-select").value})}),t.on("hello",n=>{var i;if(document.getElementById("khutbah-status").textContent=n.status==="live"?"🔴 LIVE":`⏸ ${n.status}`,document.getElementById("listener-count").textContent=`${n.listeners||0} 👤`,n.seq,(i=n.history)!=null&&i.length)for(const o of n.history)H(o)}),t.on("phrase",n=>{H(n),n.seq}),t.on("corrected",n=>{const i=document.querySelector(`[data-seq="${n.seq}"] .arabic`);i&&(i.textContent=n.arabic)}),t.on("session",n=>{document.getElementById("khutbah-status").textContent=n.status==="live"?"🔴 LIVE":`⏸ ${n.status}`}),t.on("disconnect",()=>{document.getElementById("khutbah-status").textContent=`⚠️ ${a("disconnected","Déconnecté")} — ${a("reconnecting","Reconnexion...")}`}),document.getElementById("lang-select").onchange=n=>{t.emit("set-lang",{code:e,lang:n.target.value})}}function H(e){const t=document.getElementById("segments");if(!t)return;const n=document.createElement("div");n.className=`khutbah-segment ${e.is_quran?"quran":""} ${e.degraded?"degraded":""}`,n.setAttribute("data-seq",e.seq),n.innerHTML=`
    ${e.arabic?`<div class="arabic">${e.arabic}</div>`:""}
    <div class="translation">${e.text||""}</div>
    ${e.is_quran&&e.quran_ref?`<div style="font-size:0.8em; color:var(--accent); margin-top:4px;">📖 ${e.quran_ref}</div>`:""}
    ${e.degraded?`<div style="font-size:0.75em; color:var(--warn);">⚠️ ${a("degraded","Mode dégradé")}</div>`:""}
  `,t.appendChild(n),t.scrollTop=t.scrollHeight}const nt=Object.freeze(Object.defineProperty({__proto__:null,renderKhutbah:Ze},Symbol.toStringTag,{value:"Module"}));async function at(e){const t=e==null?void 0:e.mosqueId;u(`
    <div class="card">
      <h2 class="card-header">🕌 ${a("prayer_times","Horaires de prière")}</h2>
      <div id="prayer-content" class="loading-center"><div class="spinner"></div></div>
    </div>
  `);try{const n=new Date().toISOString().split("T")[0];let i;t?i=await f(`/api/prayer-times/${t}?date=${n}`):i=N(),R(i)}catch{R(N())}}function N(){return{date:new Date().toISOString().split("T")[0],fajr:{name:"Fajr",time:"05:30",type:"adhan"},sunrise:{name:"Sunrise",time:"07:15",type:"adhan"},dhuhr:{name:"Dhuhr",time:"13:00",type:"adhan"},asr:{name:"Asr",time:"16:30",type:"adhan"},maghrib:{name:"Maghrib",time:"19:45",type:"adhan"},isha:{name:"Isha",time:"21:15",type:"adhan"}}}function R(e){var r;const t=document.getElementById("prayer-content");if(!t)return;const n=new Date,i=n.getHours()*60+n.getMinutes(),o=[{key:"fajr",name:"Fajr",icon:"🌅"},{key:"sunrise",name:"Sunrise",icon:"☀️"},{key:"dhuhr",name:"Dhuhr",icon:"🌤️"},{key:"asr",name:"Asr",icon:"🌇"},{key:"maghrib",name:"Maghrib",icon:"🌙"},{key:"isha",name:"Isha",icon:"🌑"}];t.innerHTML=`
    <div style="text-align:center; margin-bottom:16px; color:var(--muted);">${e.date||new Date().toISOString().split("T")[0]}</div>
    <div class="prayer-times-grid">
      ${o.map(s=>{var h;const l=e[s.key],d=(l==null?void 0:l.time)||l||"--:--",[c,g]=(typeof d=="string"?d:"--:--").split(":").map(Number),x=c*60+g,$=Math.abs(i-x)<30,v=((h=e[`${s.key}Iqama`])==null?void 0:h.time)||e[`${s.key}_iqama`]||null;return`
          <div class="prayer-card ${$?"active":""}">
            <div class="name">${s.icon} ${s.name}</div>
            <div class="time">${d}</div>
            ${v?`<div class="type">Iqama: ${v}</div>`:""}
          </div>
        `}).join("")}
    </div>

    ${e.jummahTime?`
      <div class="prayer-card active" style="margin-top:16px; text-align:center;">
        <div class="name">🕌 Jumu'ah</div>
        <div class="time">${((r=e.jummahTime)==null?void 0:r.time)||e.jummahTime}</div>
      </div>
    `:""}
  `}const it=Object.freeze(Object.defineProperty({__proto__:null,renderPrayer:at},Symbol.toStringTag,{value:"Module"}));let L=[];async function ot(e){const t=e==null?void 0:e.number,n=e==null?void 0:e.ref;if(n){await lt(n);return}if(t){await st(parseInt(t));return}await rt()}async function rt(){u(`
    <div class="card">
      <h2 class="card-header">📖 ${a("quran","Coran")}</h2>
      <div class="form-group">
        <input type="search" id="quran-search" placeholder="${a("search_surah","Rechercher une sourate...")}" />
      </div>
      <div id="surah-list" class="loading-center"><div class="spinner"></div></div>
    </div>
  `);try{L=await f("/api/quran/surahs",{auth:!1}),V(L)}catch(e){document.getElementById("surah-list").innerHTML=`<p style="color:var(--danger);">${e.message}</p>`}document.getElementById("quran-search").oninput=e=>{const t=e.target.value.toLowerCase(),n=L.filter(i=>i.nameEnglish.toLowerCase().includes(t)||i.nameTransliteration.toLowerCase().includes(t)||i.nameArabic.includes(t)||String(i.number).includes(t));V(n)}}function V(e){const t=document.getElementById("surah-list");t&&(t.innerHTML=`
    <div class="card-grid" style="gap:8px;">
      ${e.map(n=>`
        <a href="#/quran/surah/${n.number}" class="card" style="display:flex; align-items:center; gap:12px; padding:12px; text-decoration:none; color:var(--fg); margin:0;">
          <div style="width:36px; height:36px; border-radius:50%; background:var(--accent); color:#fff; display:flex; align-items:center; justify-content:center; font-size:0.85em; font-weight:700; flex-shrink:0;">${n.number}</div>
          <div style="flex:1; min-width:0;">
            <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${n.nameTransliteration}</div>
            <div style="font-size:0.8em; color:var(--muted);">${n.nameEnglish} · ${n.totalAyahs} ayahs</div>
          </div>
          <div style="font-size:1.3em; color:var(--accent2); direction:rtl;">${n.nameArabic}</div>
        </a>
      `).join("")}
    </div>
  `)}async function st(e){u(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/quran" class="btn btn-sm btn-secondary">←</a>
      <h2 style="flex:1;" id="surah-title"><div class="spinner"></div></h2>
    </div>
    <div id="surah-content" class="loading-center"><div class="spinner"></div></div>
  `);try{const t=await f(`/api/quran/surahs/${e}`,{auth:!1});document.getElementById("surah-title").textContent=`${t.nameTransliteration} — ${t.nameEnglish}`;const n=document.getElementById("surah-content");n.innerHTML=`
      <div style="text-align:center; font-size:1.8em; color:var(--accent2); direction:rtl; font-family:'Noto Naskh Arabic',serif; margin-bottom:24px; line-height:1.8;">
        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
      </div>
      ${(t.ayahs||[]).map(i=>`
        <div class="ayah">
          <div class="arabic">${i.textArabic} <span class="ref">(${i.ayahNumber})</span></div>
          ${i.translation?`<div class="translation">${i.translation}</div>`:""}
        </div>
      `).join("")}
    `}catch(t){document.getElementById("surah-content").innerHTML=`<p style="color:var(--danger);">${t.message}</p>`}}async function lt(e){var t,n,i;u(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/quran" class="btn btn-sm btn-secondary">←</a>
      <h2 style="flex:1;">📖 Sourate ${e}</h2>
    </div>
    <div id="verse-content" class="loading-center"><div class="spinner"></div></div>
  `);try{const o=await f(`/api/quran/verse/${e}`,{auth:!1}),r=document.getElementById("verse-content");r.innerHTML=`
      <div class="card">
        <div style="text-align:center; margin-bottom:8px; color:var(--muted);">${((t=o.surah)==null?void 0:t.nameTransliteration)||""} — Ayah ${((n=o.ayah)==null?void 0:n.ayahNumber)||""}</div>
        <div class="ayah">
          <div class="arabic" style="font-size:1.6em; line-height:2;">${((i=o.ayah)==null?void 0:i.textArabic)||""}</div>
        </div>
      </div>
    `}catch(o){document.getElementById("verse-content").innerHTML=`<p style="color:var(--danger);">${o.message}</p>`}}const ct=Object.freeze(Object.defineProperty({__proto__:null,renderQuran:ot},Symbol.toStringTag,{value:"Module"}));async function dt(e){const n=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});u(`
    <div class="card" style="text-align:center; padding:30px;">
      <div style="font-size:3em;">🌙</div>
      <h2 style="margin:12px 0;">${a("ramadan","Ramadan")}</h2>
      <p style="color:var(--muted);">${n}</p>
    </div>

    <div class="card-grid">
      <div class="card">
        <h3 class="card-header">🌅 ${a("imsak","Imsak")}</h3>
        <div style="font-size:2em; font-weight:700; text-align:center;">--:--</div>
        <div style="text-align:center; color:var(--muted); font-size:0.9em;">${a("pre_dawn","Avant l'aube")}</div>
      </div>

      <div class="card">
        <h3 class="card-header">🌅 ${a("fajr","Fajr")}</h3>
        <div style="font-size:2em; font-weight:700; text-align:center;">--:--</div>
        <div style="text-align:center; color:var(--muted); font-size:0.9em;">${a("dawn_prayer","Prière de l'aube")}</div>
      </div>

      <div class="card">
        <h3 class="card-header">🌇 ${a("maghrib","Maghrib")}</h3>
        <div style="font-size:2em; font-weight:700; text-align:center;">--:--</div>
        <div style="text-align:center; color:var(--muted); font-size:0.9em;">${a("iftar","Iftar")}</div>
      </div>

      <div class="card">
        <h3 class="card-header">🌙 ${a("tarawih","Tarawih")}</h3>
        <div style="font-size:2em; font-weight:700; text-align:center;">--:--</div>
        <div style="text-align:center; color:var(--muted); font-size:0.9em;">${a("night_prayer","Prière de la nuit")}</div>
      </div>
    </div>

    <div class="card">
      <h3 class="card-header">📖 ${a("juz_of_day","Juz du jour")}</h3>
      <p style="color:var(--muted);">${a("juz_info","Consultez le programme de la mosquée pour le calendrier de récitation")}</p>
    </div>
  `)}const mt=Object.freeze(Object.defineProperty({__proto__:null,renderRamadan:dt},Symbol.toStringTag,{value:"Module"}));
