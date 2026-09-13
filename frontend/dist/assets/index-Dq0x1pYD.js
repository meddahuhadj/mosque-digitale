(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function a(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(o){if(o.ep)return;o.ep=!0;const s=a(o);fetch(o.href,s)}})();const st="modulepreload",rt=function(e,t){return new URL(e,t).href},$e={},_=function(t,a,i){let o=Promise.resolve();if(a&&a.length>0){const r=document.getElementsByTagName("link"),l=document.querySelector("meta[property=csp-nonce]"),d=(l==null?void 0:l.nonce)||(l==null?void 0:l.getAttribute("nonce"));o=Promise.allSettled(a.map(c=>{if(c=rt(c,i),c in $e)return;$e[c]=!0;const p=c.endsWith(".css"),v=p?'[rel="stylesheet"]':"";if(!!i)for(let h=r.length-1;h>=0;h--){const f=r[h];if(f.href===c&&(!p||f.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${c}"]${v}`))return;const b=document.createElement("link");if(b.rel=p?"stylesheet":st,p||(b.as="script"),b.crossOrigin="",b.href=c,d&&b.setAttribute("nonce",d),document.head.appendChild(b),p)return new Promise((h,f)=>{b.addEventListener("load",h),b.addEventListener("error",()=>f(new Error(`Unable to preload CSS for ${c}`)))})}))}function s(r){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=r,window.dispatchEvent(l),!l.defaultPrevented)throw r}return o.then(r=>{for(const l of r||[])l.status==="rejected"&&s(l.reason);return t().catch(s)})},Pe=[];function y(e,t,a={}){const i=[],o=e.replace(/:([^/]+)/g,(s,r)=>(i.push(r),"([^/]+)"));Pe.push({pattern:e,regex:new RegExp(`^${o}$`),paramNames:i,handler:t,meta:a})}function lt(e){location.hash=`#${e}`}function dt(e){const t=e.replace(/^#/,"")||"/";for(const a of Pe){const i=t.match(a.regex);if(i){const o={};return a.paramNames.forEach((s,r)=>{o[s]=i[r+1]}),{route:a,params:o,path:t}}}return null}async function _e(){const e=location.hash||"#/",t=dt(e);if(!t){document.getElementById("main").innerHTML=`
      <div style="text-align:center; padding:60px 20px;">
        <div style="font-size:3em; margin-bottom:16px;">🕌</div>
        <h2>404 — Page not found</h2>
        <p style="color:var(--muted); margin:12px 0;">This page doesn't exist.</p>
        <a href="#/" class="btn btn-primary">← Home</a>
      </div>`;return}await t.route.handler(t.params),ct(t.path)}function ct(e){document.querySelectorAll("#main-nav a, #mobile-nav a").forEach(t=>{var i;const a=((i=t.getAttribute("href"))==null?void 0:i.replace("#",""))||"";t.classList.toggle("active",e.startsWith(a)&&a!=="/")})}function ut(){window.addEventListener("hashchange",_e),_e()}const B={ar:{dir:"rtl",label:"العربية",tag:"ar-SA"},fr:{dir:"ltr",label:"Français",tag:"fr-FR"},en:{dir:"ltr",label:"English",tag:"en-US"},nl:{dir:"ltr",label:"Nederlands",tag:"nl-NL"},de:{dir:"ltr",label:"Deutsch",tag:"de-DE"},es:{dir:"ltr",label:"Español",tag:"es-ES"},tr:{dir:"ltr",label:"Türkçe",tag:"tr-TR"},ur:{dir:"rtl",label:"اردو",tag:"ur-PK"},bn:{dir:"ltr",label:"বাংলা",tag:"bn-BD"},ha:{dir:"ltr",label:"Hausa",tag:"ha-NG"},wo:{dir:"ltr",label:"Wolof",tag:"fr-FR"},it:{dir:"ltr",label:"Italiano",tag:"it-IT"},pt:{dir:"ltr",label:"Português",tag:"pt-PT"},id:{dir:"ltr",label:"Bahasa Indonesia",tag:"id-ID"}};let S=localStorage.getItem("uiLang")||"fr",Ce={},Z={};function M(){return S}function Ne(e){return B[e]}function ze(){return Object.keys(B)}function k(e=S){var t;return((t=B[e])==null?void 0:t.tag)||"fr-FR"}async function He(e){B[e]&&(S=e,localStorage.setItem("uiLang",e),Z[e]||await De(e),Oe(),document.documentElement.lang=e,document.documentElement.dir=B[e].dir,window.dispatchEvent(new CustomEvent("language-changed",{detail:{lang:e}})))}async function De(e){try{const t=await fetch(`../lang/${e}.json`);t.ok&&(Ce[e]=await t.json(),Z[e]=!0)}catch{}Z[e]=Z[e]||!0}function n(e,t){var i;return((i=Ce[S])==null?void 0:i[e])||t||e}function Oe(){document.querySelectorAll("[data-i18n]").forEach(e=>{const t=e.getAttribute("data-i18n"),a=n(t);a!==t&&(e.textContent=a)}),document.querySelectorAll("[data-i18n-placeholder]").forEach(e=>{const t=e.getAttribute("data-i18n-placeholder"),a=n(t);a!==t&&(e.placeholder=a)})}async function mt(){await De(S),Oe(),document.documentElement.lang=S,B[S]&&(document.documentElement.dir=B[S].dir)}function Re(e){e==="auto"?(localStorage.removeItem("theme"),document.documentElement.removeAttribute("data-theme")):(localStorage.setItem("theme",e),document.documentElement.setAttribute("data-theme",e))}function pt(){Re(Fe()?"light":"dark")}function Fe(){const e=document.documentElement.getAttribute("data-theme");return e==="dark"||!e&&matchMedia("(prefers-color-scheme: dark)").matches}function ht(e){e?(localStorage.setItem("contrast","high"),document.documentElement.setAttribute("data-contrast","high")):(localStorage.removeItem("contrast"),document.documentElement.removeAttribute("data-contrast"))}function gt(e){e?(localStorage.setItem("senior-mode","true"),document.documentElement.setAttribute("data-senior","true")):(localStorage.removeItem("senior-mode"),document.documentElement.removeAttribute("data-senior"))}function yt(){const e=localStorage.getItem("theme");e&&document.documentElement.setAttribute("data-theme",e),localStorage.getItem("contrast")==="high"&&document.documentElement.setAttribute("data-contrast","high"),localStorage.getItem("senior-mode")==="true"&&document.documentElement.setAttribute("data-senior","true")}var Me;const Ke=((Me=window.__CONFIG__)==null?void 0:Me.BACKEND_URL)||void 0||(location.hostname==="localhost"?"http://localhost:8000":location.origin),ne=Ke;let T=localStorage.getItem("accessToken")||"",U=localStorage.getItem("refreshToken")||"",G=null;function vt(e){G=e}function ae(){return!!T}function ft(e,t){T=e,U=t,localStorage.setItem("accessToken",e),localStorage.setItem("refreshToken",t),G&&G(!0)}function bt(){T="",U="",localStorage.removeItem("accessToken"),localStorage.removeItem("refreshToken"),G&&G(!1)}async function xt(){if(!U)return!1;try{const e=await fetch(`${ne}/api/auth/refresh`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refreshToken:U})});return e.ok?(T=(await e.json()).accessToken,localStorage.setItem("accessToken",T),!0):(bt(),!1)}catch{return!1}}async function u(e,t={}){const{method:a="GET",body:i,headers:o={},auth:s=!0}=t,r=e.startsWith("http")?e:`${ne}${e}`,l={...o};s&&T&&(l.Authorization=`Bearer ${T}`),i&&!(i instanceof FormData)&&(l["Content-Type"]="application/json");let d=await fetch(r,{method:a,headers:l,body:i instanceof FormData?i:i?JSON.stringify(i):void 0});if(d.status===401&&s&&U&&await xt()&&(l.Authorization=`Bearer ${T}`,d=await fetch(r,{method:a,headers:l,body:i instanceof FormData?i:i?JSON.stringify(i):void 0})),!d.ok){const p=await d.json().catch(()=>({error:d.statusText}));throw new Error(p.error||`HTTP ${d.status}`)}const c=d.headers.get("content-type")||"";return c.includes("application/json")?d.json():c.includes("image/")?d.blob():d.text()}function m(e,t="info",a=4e3){const i=document.getElementById("toast-container"),o=document.createElement("div");o.className=`toast toast-${t}`,o.textContent=e,i.appendChild(o),setTimeout(()=>{o.style.opacity="0",setTimeout(()=>o.remove(),300)},a)}function g(e){const t=document.getElementById("main");typeof e=="string"?t.innerHTML=e:e instanceof HTMLElement&&(t.innerHTML="",t.appendChild(e)),t.classList.remove("page-enter"),t.offsetWidth,t.classList.add("page-enter")}function A(e="۞"){return`<div class="ornament" aria-hidden="true">${e}</div>`}let q=null,te=!1;function ye(){var e;return((e=window.matchMedia)==null?void 0:e.call(window,"(display-mode: standalone)").matches)||window.navigator.standalone===!0}function Ue(){return/iphone|ipad|ipod/i.test(navigator.userAgent)&&!window.MSStream}function Ge(){return!!q&&!te&&!ye()}function $t(){return Ue()&&!te&&!ye()}function _t(){return Ge()||$t()}async function wt(){if(!q)return"unavailable";q.prompt();const{outcome:e}=await q.userChoice;return q=null,window.dispatchEvent(new CustomEvent("pwa-installable-changed")),e}function It(){ye()&&(te=!0),window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),q=e,window.dispatchEvent(new CustomEvent("pwa-installable-changed"))}),window.addEventListener("appinstalled",()=>{te=!0,q=null,window.dispatchEvent(new CustomEvent("pwa-installable-changed"))})}It();const Et=Object.assign({"../modules/admin/index.js":()=>_(()=>Promise.resolve().then(()=>Ot),void 0,import.meta.url),"../modules/announcements/index.js":()=>_(()=>Promise.resolve().then(()=>Kt),void 0,import.meta.url),"../modules/auth/index.js":()=>_(()=>Promise.resolve().then(()=>Gt),void 0,import.meta.url),"../modules/display/index.js":()=>_(()=>Promise.resolve().then(()=>Jt),void 0,import.meta.url),"../modules/events/index.js":()=>_(()=>Promise.resolve().then(()=>Zt),void 0,import.meta.url),"../modules/hadith/index.js":()=>_(()=>Promise.resolve().then(()=>rn),void 0,import.meta.url),"../modules/home/index.js":()=>_(()=>Promise.resolve().then(()=>pn),void 0,import.meta.url),"../modules/imam/index.js":()=>_(()=>Promise.resolve().then(()=>xn),void 0,import.meta.url),"../modules/khutbah/index.js":()=>_(()=>Promise.resolve().then(()=>Sn),void 0,import.meta.url),"../modules/prayer/index.js":()=>_(()=>Promise.resolve().then(()=>jn),void 0,import.meta.url),"../modules/quran/index.js":()=>_(()=>Promise.resolve().then(()=>On),void 0,import.meta.url),"../modules/ramadan/index.js":()=>_(()=>Promise.resolve().then(()=>Fn),void 0,import.meta.url),"../modules/support/index.js":()=>_(()=>Promise.resolve().then(()=>Un),void 0,import.meta.url)});async function w(e){const t=Et[`../modules/${e}.js`];if(!t)throw new Error(`Module introuvable: ${e}`);return t()}async function kt(){const{renderHome:e}=await w("home/index");await e()}async function Ve(e){const{renderPrayer:t}=await w("prayer/index");await t(e)}async function ve(e){const{renderQuran:t}=await w("quran/index");await t(e)}async function fe(e){const{renderHadith:t}=await w("hadith/index");await t(e)}async function Je(e){const{renderKhutbah:t}=await w("khutbah/index");await t(e)}async function St(e){const{renderAnnouncements:t}=await w("announcements/index");await t(e)}async function Tt(e){const{renderEvents:t}=await w("events/index");await t(e)}async function qt(e){const{renderRamadan:t}=await w("ramadan/index");await t(e)}async function Bt(){const{renderSupport:e}=await w("support/index");await e()}async function Qe(e){const{renderAdmin:t}=await w("admin/index");await t(e)}async function We(e){const{renderImam:t}=await w("imam/index");await t(e)}async function Ye(e){const{renderAuth:t}=await w("auth/index");await t(e)}async function Xe(e){const{renderDisplay:t}=await w("display/index");await t(e)}async function Lt(){g(`
    <div class="card">
      <h2 class="card-header">⚙️ ${n("settings","Paramètres")}</h2>

      <div class="form-group">
        <label>${n("language","Langue")}</label>
        <select id="settings-lang">
          ${ze().map(e=>{var t;return`<option value="${e}" ${e===M()?"selected":""}>${((t=Ne(e))==null?void 0:t.label)||e}</option>`}).join("")}
        </select>
      </div>

      <div class="form-group">
        <label>${n("theme","Thème")}</label>
        <select id="settings-theme">
          <option value="auto" ${localStorage.getItem("theme")?"":"selected"}>${n("auto","Automatique")}</option>
          <option value="dark" ${localStorage.getItem("theme")==="dark"?"selected":""}>${n("dark","Sombre")}</option>
          <option value="light" ${localStorage.getItem("theme")==="light"?"selected":""}>${n("light","Clair")}</option>
        </select>
      </div>

      <div class="form-group">
        <label>${n("accessibility","Accessibilité")}</label>
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <input type="checkbox" id="senior-mode" ${localStorage.getItem("senior-mode")==="true"?"checked":""} />
          ${n("senior_mode","Mode senior (gros texte)")}
        </label>
        <label style="display:flex;align-items:center;gap:8px;">
          <input type="checkbox" id="high-contrast" ${localStorage.getItem("contrast")==="high"?"checked":""} />
          ${n("high_contrast","Contraste élevé")}
        </label>
      </div>

      <button class="btn btn-secondary" id="settings-clear" style="margin-top:16px;">${n("clear_cache","Vider le cache")}</button>
    </div>
  `),document.getElementById("settings-lang").onchange=e=>He(e.target.value),document.getElementById("settings-theme").onchange=e=>Re(e.target.value),document.getElementById("senior-mode").onchange=e=>gt(e.target.checked),document.getElementById("high-contrast").onchange=e=>ht(e.target.checked),document.getElementById("settings-clear").onclick=()=>{caches&&caches.keys().then(e=>e.forEach(t=>caches.delete(t))),m(n("cache_cleared","Cache vidé"),"success")}}y("/",kt);y("/prayer",Ve);y("/prayer/:mosqueId",Ve);y("/quran",ve);y("/quran/surah/:number",ve);y("/quran/verse/:ref",ve);y("/hadith",fe);y("/hadith/book/:book",fe);y("/hadith/read/:number",fe);y("/khutbah",Je);y("/khutbah/:code",Je);y("/announcements",St);y("/events",Tt);y("/ramadan",qt);y("/support",Bt);y("/admin",Qe);y("/admin/:mosqueId",Qe);y("/imam",We);y("/imam/:code",We);y("/auth",Ye);y("/auth/:action",Ye);y("/display",Xe);y("/display/:mosqueId",Xe);y("/settings",Lt);function oe(){const e=[{href:"#/",icon:"🏠",label:n("home","Accueil")},{href:"#/prayer",icon:"🕌",label:n("prayers","Prières")},{href:"#/quran",icon:"📖",label:n("quran","Coran")},{href:"#/khutbah",icon:"🎙️",label:n("khutbah_live","Khutbah Live")},{href:"#/announcements",icon:"📢",label:n("announcements","Annonces")},{href:"#/events",icon:"📅",label:n("events","Événements")},{href:"#/settings",icon:"⚙️",label:n("settings","Paramètres")}],t=document.getElementById("main-nav"),a=document.getElementById("mobile-nav");t.innerHTML=e.filter((i,o)=>o<5).map(i=>`<a href="${i.href}">${i.icon} ${i.label}</a>`).join(""),a.innerHTML=e.map(i=>`<a href="${i.href}"><span class="icon">${i.icon}</span>${i.label}</a>`).join("")}let Q=null;function we(){const e=new Date,t=String(e.getHours()).padStart(2,"0"),a=String(e.getMinutes()).padStart(2,"0"),i=String(e.getSeconds()).padStart(2,"0"),o=document.querySelector(".hc-h"),s=document.querySelector(".hc-m"),r=document.querySelector(".hc-s"),l=document.querySelector(".hc-date");if(o&&(o.textContent=t,s.textContent=a,r.textContent=i,l))try{l.textContent=new Intl.DateTimeFormat(k(),{weekday:"long",day:"numeric",month:"long"}).format(e)}catch{l.textContent=e.toLocaleDateString()}}function Ie(){Q&&clearTimeout(Q),we();const e=1e3-Date.now()%1e3;Q=setTimeout(function t(){we(),Q=setTimeout(t,1e3-Date.now()%1e3)},e)}function At(){Ie(),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&Ie()})}function Ee(){const e=document.getElementById("theme-toggle");e&&(e.textContent=Fe()?"☀️":"🌙")}function ke(){const e=document.getElementById("theme-toggle");e&&(e.onclick=()=>{pt(),Ee()}),Ee();const t=document.getElementById("lang-quick");t&&(t.innerHTML=ze().map(a=>{var i;return`<option value="${a}" ${a===M()?"selected":""}>${((i=Ne(a))==null?void 0:i.label)||a}</option>`}).join(""),t.onchange=a=>He(a.target.value))}async function jt(){yt(),await mt(),oe(),ke(),At(),vt(()=>oe()),window.addEventListener("language-changed",()=>{oe(),ke(),window.dispatchEvent(new HashChangeEvent("hashchange"))}),ut()}jt().catch(e=>{console.error("App init failed:",e),g(`<div style="text-align:center;padding:60px;"><h2>⚠️ Initialization Error</h2><p>${e.message}</p></div>`)});"serviceWorker"in navigator&&navigator.serviceWorker.register("./sw.js").catch(()=>{});async function Mt(e){if(!ae()){g(`
      <div class="card" style="max-width:420px; margin:40px auto; text-align:center;">
        <h2>🧑‍💼 ${n("admin","Administration")}</h2>
        <p style="color:var(--muted); margin:12px 0;">${n("login_required","Connexion requise")}</p>
        <a href="#/auth/login" class="btn btn-primary">${n("login","Se connecter")}</a>
      </div>
    `);return}switch((e==null?void 0:e.view)||(e==null?void 0:e.mosqueId)){case"mosques":return Pt();case"users":return Ct();case"sessions":return Nt();case"analytics":return zt();case"settings":return Ht();case"announcements":return Dt()}g(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/" class="btn btn-sm btn-secondary">←</a>
      <h2>🧑‍💼 ${n("admin_dashboard","Tableau de bord")}</h2>
    </div>

    <div class="card-grid">
      <a href="#/admin/mosques" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">🕌</span>
        <div><div style="font-weight:600;">${n("mosques","Mosquées")}</div><div style="font-size:0.85em; color:var(--muted);">${n("manage_mosques","Gérer les mosquées")}</div></div>
      </a>

      <a href="#/admin/users" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">👥</span>
        <div><div style="font-weight:600;">${n("users","Utilisateurs")}</div><div style="font-size:0.85em; color:var(--muted);">${n("manage_users","Gérer les rôles")}</div></div>
      </a>

      <a href="#/admin/sessions" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">🎙️</span>
        <div><div style="font-weight:600;">${n("sessions","Sessions")}</div><div style="font-size:0.85em; color:var(--muted);">${n("session_history","Historique des khutbahs")}</div></div>
      </a>

      <a href="#/admin/analytics" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">📊</span>
        <div><div style="font-weight:600;">${n("analytics","Statistiques")}</div><div style="font-size:0.85em; color:var(--muted);">${n("view_stats","Voir les statistiques")}</div></div>
      </a>

      <a href="#/admin/settings" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">⚙️</span>
        <div><div style="font-weight:600;">${n("settings","Paramètres")}</div><div style="font-size:0.85em; color:var(--muted);">${n("mosque_config","Configuration de la mosquée")}</div></div>
      </a>

      <a href="#/admin/announcements" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">📢</span>
        <div><div style="font-weight:600;">${n("announcements","Annonces")}</div><div style="font-size:0.85em; color:var(--muted);">${n("create_announcement","Créer une annonce")}</div></div>
      </a>
    </div>
  `)}async function Pt(){g(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/admin" class="btn btn-sm btn-secondary">← ${n("back_to_dashboard","Retour au tableau de bord")}</a>
      <h2>🕌 ${n("mosques","Mosquées")}</h2>
    </div>
    <div id="mosques-list"><div class="loading-center"><div class="spinner"></div></div></div>

    <div class="card" style="max-width:500px; margin-top:16px;">
      <h3 class="card-header">➕ ${n("create_mosque","Nouvelle mosquée")}</h3>
      <div class="form-group">
        <label>${n("name","Nom")}</label>
        <input type="text" id="mosque-name" placeholder="${n("mosque_name","Nom de la mosquée")}" />
      </div>
      <div class="form-group">
        <label>${n("city","Ville")}</label>
        <input type="text" id="mosque-city" placeholder="${n("city_name","Ville")}" />
      </div>
      <div class="form-group">
        <label>${n("latitude","Latitude")}</label>
        <input type="number" step="any" id="mosque-lat" placeholder="48.8566" />
      </div>
      <div class="form-group">
        <label>${n("longitude","Longitude")}</label>
        <input type="number" step="any" id="mosque-lng" placeholder="2.3522" />
      </div>
      <button class="btn btn-primary btn-block" id="create-mosque">${n("create","Créer")}</button>
    </div>
  `);async function e(){const t=document.getElementById("mosques-list");try{const a=await u("/api/mosques");if(!a.length){t.innerHTML=`<div class="card" style="text-align:center; color:var(--muted); padding:24px;">${n("no_mosques","Aucune mosquée")}</div>`;return}t.innerHTML=`<div class="card-grid">${a.map(i=>`
        <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:600;">🕌 ${i.name}</div>
            <div style="font-size:0.85em; color:var(--muted);">📍 ${i.city||"—"}</div>
          </div>
          <button class="btn btn-danger btn-sm delete-mosque" data-id="${i.id}">🗑️</button>
        </div>
      `).join("")}</div>`,t.querySelectorAll(".delete-mosque").forEach(i=>{i.onclick=async()=>{if(confirm(n("confirm_delete","Supprimer cette mosquée ?")))try{await u(`/api/mosques/${i.dataset.id}`,{method:"DELETE"}),m(n("deleted","Supprimé"),"success"),e()}catch(o){m(o.message,"error")}}})}catch(a){t.innerHTML=`<div class="card" style="color:var(--danger);">${a.message}</div>`}}e(),document.getElementById("create-mosque").onclick=async()=>{const t=document.getElementById("mosque-name").value.trim(),a=document.getElementById("mosque-city").value.trim(),i=parseFloat(document.getElementById("mosque-lat").value)||null,o=parseFloat(document.getElementById("mosque-lng").value)||null;if(!t){m(n("name_required","Nom requis"),"error");return}try{await u("/api/mosques",{method:"POST",body:{name:t,city:a,latitude:i,longitude:o}}),m(n("mosque_created","Mosquée créée"),"success"),document.getElementById("mosque-name").value="",document.getElementById("mosque-city").value="",document.getElementById("mosque-lat").value="",document.getElementById("mosque-lng").value="",e()}catch(s){m(s.message,"error")}}}async function Ct(){g(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/admin" class="btn btn-sm btn-secondary">← ${n("back_to_dashboard","Retour au tableau de bord")}</a>
      <h2>👥 ${n("users","Utilisateurs")}</h2>
    </div>
    <div id="users-list"><div class="loading-center"><div class="spinner"></div></div></div>
  `);const e=document.getElementById("users-list");try{const t=await u("/api/admin/users");if(!t.length){e.innerHTML=`<div class="card" style="text-align:center; color:var(--muted); padding:24px;">${n("no_users","Aucun utilisateur")}</div>`;return}e.innerHTML=`
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="text-align:left; border-bottom:2px solid var(--line);">
              <th style="padding:10px 12px;">${n("name","Nom")}</th>
              <th style="padding:10px 12px;">${n("email","Email")}</th>
              <th style="padding:10px 12px;">${n("role","Rôle")}</th>
              <th style="padding:10px 12px;">${n("created","Créé le")}</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(a=>`
              <tr style="border-bottom:1px solid var(--line);">
                <td style="padding:10px 12px; font-weight:600;">${a.name||"—"}</td>
                <td style="padding:10px 12px; color:var(--muted);">${a.email||"—"}</td>
                <td style="padding:10px 12px;"><span style="background:var(--bg2); padding:2px 8px; border-radius:6px; font-size:0.85em;">${a.role||"user"}</span></td>
                <td style="padding:10px 12px; color:var(--muted); font-size:0.85em;">${a.created_at?new Date(a.created_at).toLocaleDateString("fr-FR"):"—"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `}catch(t){e.innerHTML=`<div class="card" style="color:var(--danger);">${t.message}</div>`}}async function Nt(){g(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/admin" class="btn btn-sm btn-secondary">← ${n("back_to_dashboard","Retour au tableau de bord")}</a>
      <h2>🎙️ ${n("sessions","Sessions")}</h2>
    </div>
    <div id="sessions-list"><div class="loading-center"><div class="spinner"></div></div></div>
  `);const e=document.getElementById("sessions-list");try{const[t,a]=await Promise.all([u("/api/healthz").catch(()=>null),u("/api/admin/stats").catch(()=>({}))]);let i="";t!=null&&t.sessions&&(i+=`
        <div class="card" style="margin-bottom:16px;">
          <h3 class="card-header">🟢 ${n("active_sessions","Sessions actives")}</h3>
          ${t.sessions.length?t.sessions.map(o=>`
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--line);">
              <div>
                <span style="font-weight:600;">${o.code||"—"}</span>
                <span style="font-size:0.85em; color:var(--muted); margin-left:8px;">${o.status||""}</span>
              </div>
              <a href="#/imam/${o.code}" class="btn btn-sm btn-secondary">${n("manage","Gérer")}</a>
            </div>
          `).join(""):`<div style="color:var(--muted); padding:16px 0;">${n("no_active_sessions","Aucune session active")}</div>`}
        </div>
      `),(a==null?void 0:a.sessions_count)!==void 0&&(i+=`
        <div class="card">
          <h3 class="card-header">📊 ${n("session_summary","Résumé des sessions")}</h3>
          <div style="padding:16px 0; font-size:1.1em;">
            <div style="display:flex; justify-content:space-between; padding:6px 0;">
              <span style="color:var(--muted);">${n("total_sessions","Sessions totales")}</span>
              <span style="font-weight:600;">${a.sessions_count}</span>
            </div>
          </div>
        </div>
      `),e.innerHTML=i||`<div class="card" style="text-align:center; color:var(--muted); padding:24px;">${n("no_data","Aucune donnée disponible")}</div>`}catch(t){e.innerHTML=`<div class="card" style="color:var(--danger);">${t.message}</div>`}}async function zt(){g(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/admin" class="btn btn-sm btn-secondary">← ${n("back_to_dashboard","Retour au tableau de bord")}</a>
      <h2>📊 ${n("analytics","Statistiques")}</h2>
    </div>
    <div id="analytics-content"><div class="loading-center"><div class="spinner"></div></div></div>
  `);const e=document.getElementById("analytics-content");try{const t=await u("/api/admin/stats");e.innerHTML=`
      <div class="card-grid">
        <div class="card" style="text-align:center; padding:24px;">
          <div style="font-size:2.5em; font-weight:700; color:var(--accent);">${t.users_count??0}</div>
          <div style="color:var(--muted); margin-top:4px;">👥 ${n("users","Utilisateurs")}</div>
        </div>
        <div class="card" style="text-align:center; padding:24px;">
          <div style="font-size:2.5em; font-weight:700; color:var(--accent);">${t.announcements_count??t.announcements??0}</div>
          <div style="color:var(--muted); margin-top:4px;">📢 ${n("announcements","Annonces")}</div>
        </div>
        <div class="card" style="text-align:center; padding:24px;">
          <div style="font-size:2.5em; font-weight:700; color:var(--accent);">${t.events_count??t.events??0}</div>
          <div style="color:var(--muted); margin-top:4px;">📅 ${n("events","Événements")}</div>
        </div>
        <div class="card" style="text-align:center; padding:24px;">
          <div style="font-size:2.5em; font-weight:700; color:var(--accent);">${t.sessions_count??t.sessions??0}</div>
          <div style="color:var(--muted); margin-top:4px;">🎙️ ${n("sessions","Sessions")}</div>
        </div>
        <div class="card" style="text-align:center; padding:24px;">
          <div style="font-size:2.5em; font-weight:700; color:var(--accent);">${t.attendance_count??0}</div>
          <div style="color:var(--muted); margin-top:4px;">📝 ${n("attendance_sessions","Séances comptées")}</div>
        </div>
        <div class="card" style="text-align:center; padding:24px;">
          <div style="font-size:2.5em; font-weight:700; color:var(--accent);">${t.attendance_total??0}</div>
          <div style="color:var(--muted); margin-top:4px;">👥 ${n("attendance_total","Fidèles comptés")}</div>
        </div>
      </div>

      <div class="card" style="margin-top:20px;">
        <h3 class="card-header">➕ ${n("log_attendance","Saisir la fréquentation")}</h3>
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <div class="form-group" style="flex:1; min-width:140px;">
            <label>${n("prayer","Prière")}</label>
            <select id="att-prayer">
              <option value="Fajr">Fajr</option>
              <option value="Dhuhr">Dhuhr</option>
              <option value="Asr">Asr</option>
              <option value="Maghrib">Maghrib</option>
              <option value="Isha" selected>Isha</option>
              <option value="Jumu'ah">Jumu'ah</option>
              <option value="Tarawih">Tarawih</option>
            </select>
          </div>
          <div class="form-group" style="flex:1; min-width:140px;">
            <label>${n("date","Date")}</label>
            <input type="date" id="att-date" value="${new Date().toISOString().split("T")[0]}" />
          </div>
          <div class="form-group" style="flex:1; min-width:140px;">
            <label>${n("count","Nombre")}</label>
            <input type="number" id="att-count" min="0" value="30" />
          </div>
          <div style="display:flex; align-items:flex-end;">
            <button class="btn btn-primary" id="add-attendance">${n("add","Ajouter")}</button>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="card-header">📋 ${n("attendance_history","Historique")}</h3>
        <div id="attendance-list"><div class="loading-center"><div class="spinner"></div></div></div>
      </div>
    `,de(),document.getElementById("add-attendance").onclick=async()=>{const a=document.getElementById("att-prayer").value,i=document.getElementById("att-date").value,o=parseInt(document.getElementById("att-count").value||"0",10);if(!i){m(n("date_required","Date requise"),"error");return}try{await u("/api/attendance",{method:"POST",body:{prayer:a,date:i,count:o}}),m(n("attendance_added","Fréquentation ajoutée"),"success"),de(),location.hash="#/admin/analytics"}catch(s){m(s.message,"error")}}}catch(t){e.innerHTML=`<div class="card" style="color:var(--danger);">${t.message}</div>`}}async function de(){const e=document.getElementById("attendance-list");if(e)try{const t=await u("/api/attendance");if(!t.length){e.innerHTML=`<div style="color:var(--muted); text-align:center; padding:16px;">${n("no_attendance","Aucune saisie")}</div>`;return}e.innerHTML=`<div style="overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse;">
        <thead><tr style="text-align:left; border-bottom:2px solid var(--line);">
          <th style="padding:8px;">${n("date","Date")}</th>
          <th style="padding:8px;">${n("prayer","Prière")}</th>
          <th style="padding:8px;">${n("count","Nombre")}</th>
          <th></th>
        </tr></thead>
        <tbody>${t.map(a=>`
          <tr style="border-bottom:1px solid var(--line);">
            <td style="padding:8px;">${a.date}</td>
            <td style="padding:8px;">${a.prayer}</td>
            <td style="padding:8px; font-weight:600;">${a.count}</td>
            <td style="padding:8px; text-align:right;">
              <button class="btn btn-danger btn-sm del-att" data-id="${a.id}">🗑️</button>
            </td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>`,e.querySelectorAll(".del-att").forEach(a=>{a.onclick=async()=>{if(confirm(n("confirm_delete","Supprimer ?")))try{await u(`/api/attendance/${a.dataset.id}`,{method:"DELETE"}),de()}catch(i){m(i.message,"error")}}})}catch(t){e.innerHTML=`<div style="color:var(--danger);">${t.message}</div>`}}async function Ht(){g(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/admin" class="btn btn-sm btn-secondary">← ${n("back_to_dashboard","Retour au tableau de bord")}</a>
      <h2>⚙️ ${n("settings","Paramètres")}</h2>
    </div>
    <div class="card" style="max-width:500px;">
      <div class="form-group">
        <label>${n("mosque_name","Nom de la mosquée")}</label>
        <input type="text" id="cfg-name" placeholder="${n("mosque_name_placeholder","Al-Fath")}" />
      </div>
      <div class="form-group">
        <label>${n("city","Ville")}</label>
        <input type="text" id="cfg-city" placeholder="${n("city_name","Ville")}" />
      </div>
      <div class="form-group">
        <label>${n("prayer_method","Méthode de prière")}</label>
        <select id="cfg-method">
          <option value="1">${n("method_mwl","MWL (Muslim World League)")}</option>
          <option value="2">${n("method_islamic_society","Islamic Society of North America)")}</option>
          <option value="3">${n("method_egypt","Egyptian General Authority)")}</option>
          <option value="5">${n("method_turkey","Diyanet (Turquie)")}</option>
          <option value="7">${n("method_jakim","JAKIM (Malaisie)")}</option>
          <option value="12">${n("method_umm_al_qura","Umm Al-Qura (Arabie Saoudite)")}</option>
        </select>
      </div>
      <div class="form-group">
        <label>${n("default_language","Langue par défaut")}</label>
        <select id="cfg-lang">
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="nl">Nederlands</option>
          <option value="ar">العربية</option>
        </select>
      </div>
      <h3 class="card-header" style="margin-top:18px;">🤲 ${n("donation","Donation")}</h3>
      <div class="form-group">
        <label>${n("donation_title","Titre (ex: Jum'ah du 15)")}</label>
        <input type="text" id="cfg-don-title" placeholder="${n("donation_title","Titre")}" />
      </div>
      <div class="form-group">
        <label>${n("donation_paypal","Lien PayPal (optionnel)")}</label>
        <input type="url" id="cfg-don-paypal" placeholder="https://www.paypal.com/donate?hosted_button_id=…" />
      </div>
      <div class="form-group">
        <label>${n("bank_name","Banque")}</label>
        <input type="text" id="cfg-don-bank" placeholder="${n("bank_name","Banque")}" />
      </div>
      <div class="form-group">
        <label>${n("donation_iban","IBAN")}</label>
        <input type="text" id="cfg-don-iban" placeholder="FR76 1234 5678 …" />
      </div>
      <div class="form-group">
        <label>${n("donation_text","Texte / montants (optionnel)")}</label>
        <textarea id="cfg-don-text" rows="2" placeholder="${n("donation_text","Texte")}"></textarea>
      </div>
      <button class="btn btn-primary btn-block" id="save-settings">${n("save","Enregistrer")}</button>
    </div>
  `);try{const e=await u("/api/admin/config");e&&(e.name&&(document.getElementById("cfg-name").value=e.name),e.city&&(document.getElementById("cfg-city").value=e.city),e.prayer_method&&(document.getElementById("cfg-method").value=e.prayer_method),e.default_language&&(document.getElementById("cfg-lang").value=e.default_language),e.donation&&(e.donation.title&&(document.getElementById("cfg-don-title").value=e.donation.title),e.donation.paypal&&(document.getElementById("cfg-don-paypal").value=e.donation.paypal),e.donation.bankName&&(document.getElementById("cfg-don-bank").value=e.donation.bankName),e.donation.iban&&(document.getElementById("cfg-don-iban").value=e.donation.iban),e.donation.text&&(document.getElementById("cfg-don-text").value=e.donation.text)))}catch{}document.getElementById("save-settings").onclick=async()=>{const e={name:document.getElementById("cfg-name").value.trim(),city:document.getElementById("cfg-city").value.trim(),prayer_method:document.getElementById("cfg-method").value,default_language:document.getElementById("cfg-lang").value,donation:{title:document.getElementById("cfg-don-title").value.trim(),paypal:document.getElementById("cfg-don-paypal").value.trim(),bankName:document.getElementById("cfg-don-bank").value.trim(),iban:document.getElementById("cfg-don-iban").value.trim(),text:document.getElementById("cfg-don-text").value.trim()}};try{await u("/api/admin/config",{method:"PUT",body:e}),m(n("settings_saved","Paramètres enregistrés"),"success")}catch(t){m(t.message,"error")}}}async function Dt(){g(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/admin" class="btn btn-sm btn-secondary">← ${n("back_to_dashboard","Retour au tableau de bord")}</a>
      <h2>📢 ${n("announcements","Annonces")}</h2>
    </div>

    <div class="card" style="max-width:500px; margin-bottom:16px;">
      <h3 class="card-header">➕ ${n("new_announcement","Nouvelle annonce")}</h3>
      <div class="form-group">
        <label>${n("title","Titre")}</label>
        <input type="text" id="ann-title" placeholder="${n("announcement_title","Titre de l'annonce")}" />
      </div>
      <div class="form-group">
        <label>${n("body","Contenu")}</label>
        <textarea id="ann-body" rows="4" placeholder="${n("announcement_body","Texte de l'annonce...")}" style="width:100%; padding:10px; border:1px solid var(--line); border-radius:10px; background:var(--bg2); color:var(--fg);"></textarea>
      </div>
      <div style="display:flex; gap:12px;">
        <div class="form-group" style="flex:1;">
          <label>${n("category","Catégorie")}</label>
          <select id="ann-category">
            <option value="general">${n("general","Général")}</option>
            <option value="prayer">${n("prayer","Prière")}</option>
            <option value="event">${n("event","Événement")}</option>
            <option value="urgent">${n("urgent","Urgent")}</option>
          </select>
        </div>
        <div class="form-group" style="flex:1;">
          <label>${n("priority","Priorité")}</label>
          <select id="ann-priority">
            <option value="low">${n("low","Basse")}</option>
            <option value="normal" selected>${n("normal","Normale")}</option>
            <option value="high">${n("high","Haute")}</option>
          </select>
        </div>
      </div>
      <button class="btn btn-primary btn-block" id="create-ann">${n("publish","Publier")}</button>
    </div>

    <div id="ann-list"><div class="loading-center"><div class="spinner"></div></div></div>
  `);let e=null;async function t(){var i;const a=document.getElementById("ann-list");try{const o=await u("/api/mosques");if(e=(i=o==null?void 0:o[0])==null?void 0:i.id,!e){a.innerHTML=`<div class="card" style="text-align:center; color:var(--muted); padding:24px;">${n("no_mosques","Aucune mosquée configurée")}</div>`;return}const s=await u(`/api/announcements/${e}`);if(!s.length){a.innerHTML=`<div class="card" style="text-align:center; color:var(--muted); padding:24px;">${n("no_announcements","Aucune annonce")}</div>`;return}a.innerHTML=`<div class="card-grid">${s.map(r=>`
        <div class="card" style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
          <div style="flex:1;">
            <div style="font-weight:600;">${r.title}</div>
            <div style="font-size:0.85em; color:var(--muted); margin-top:4px; white-space:pre-line;">${r.body||""}</div>
            <div style="margin-top:8px; display:flex; gap:8px; font-size:0.8em;">
              <span style="background:var(--bg2); padding:2px 8px; border-radius:6px;">${r.category||"general"}</span>
              <span style="background:var(--bg2); padding:2px 8px; border-radius:6px;">${r.priority||"normal"}</span>
              ${r.created_at?`<span style="color:var(--muted);">${new Date(r.created_at).toLocaleDateString("fr-FR")}</span>`:""}
            </div>
          </div>
          <button class="btn btn-danger btn-sm delete-ann" data-id="${r.id}">🗑️</button>
        </div>
      `).join("")}</div>`,a.querySelectorAll(".delete-ann").forEach(r=>{r.onclick=async()=>{if(confirm(n("confirm_delete_announcement","Supprimer cette annonce ?")))try{await u(`/api/announcements/${e}/${r.dataset.id}`,{method:"DELETE"}),m(n("deleted","Supprimé"),"success"),t()}catch(l){m(l.message,"error")}}})}catch(o){a.innerHTML=`<div class="card" style="color:var(--danger);">${o.message}</div>`}}t(),document.getElementById("create-ann").onclick=async()=>{if(!e){m(n("no_mosques","Aucune mosquée configurée"),"error");return}const a=document.getElementById("ann-title").value.trim(),i=document.getElementById("ann-body").value.trim(),o=document.getElementById("ann-category").value,s=document.getElementById("ann-priority").value;if(!a){m(n("title_required","Titre requis"),"error");return}try{await u(`/api/announcements/${e}`,{method:"POST",body:{title:a,body:i,category:o,priority:s}}),m(n("announcement_created","Annonce publiée"),"success"),document.getElementById("ann-title").value="",document.getElementById("ann-body").value="",t()}catch(r){m(r.message,"error")}}}const Ot=Object.freeze(Object.defineProperty({__proto__:null,renderAdmin:Mt},Symbol.toStringTag,{value:"Module"}));async function Rt(e){var i;const t=e==null?void 0:e.mosqueId;g(`
    <div class="card">
      <h2 class="card-header">📢 ${n("announcements","Annonces")}</h2>
      ${A("۞")}
      <div id="announcements-list" class="loading-center"><div class="spinner"></div></div>
    </div>
  `);let a=t||null;if(!a)try{const o=await u("/api/mosques",{auth:!1});a=((i=o==null?void 0:o[0])==null?void 0:i.id)||null}catch{a=null}if(a)try{const o=await u(`/api/announcements/${a}`,{auth:!1});Ft(o)}catch{const s=document.getElementById("announcements-list");s.className="",s.innerHTML=`<p style="color:var(--muted); text-align:center; padding:20px;">${n("no_announcements","Aucune annonce pour le moment")}</p>`}else{const o=document.getElementById("announcements-list");o.className="",o.innerHTML=`
      <p style="color:var(--muted); text-align:center; padding:20px;">
        ${n("select_mosque","Sélectionnez une mosquée pour voir les annonces")}
      </p>
    `}}function Ft(e){const t=document.getElementById("announcements-list");if(!t)return;if(t.className="",!(e!=null&&e.length)){t.innerHTML=`<p style="color:var(--muted); text-align:center;">${n("no_announcements","Aucune annonce")}</p>`;return}const a=o=>(o.priority==="urgent"?2:0)+(o.pinned?1:0),i=[...e].sort((o,s)=>{const r=a(s)-a(o);return r!==0?r:new Date(s.publishedAt||0)-new Date(o.publishedAt||0)});t.innerHTML=i.map(o=>`
    <div class="announcement-item ${o.priority==="urgent"?"urgent":""}">
      <div class="title">
        ${o.priority==="urgent"?"🔴 ":o.pinned?"📌 ":""}${o.title}
      </div>
      <div class="body">${o.body}</div>
      <div class="meta">
        ${o.publishedAt?new Date(o.publishedAt).toLocaleDateString(k()):""}
        ${o.category?` · ${o.category}`:""}
      </div>
    </div>
  `).join("")}const Kt=Object.freeze(Object.defineProperty({__proto__:null,renderAnnouncements:Rt},Symbol.toStringTag,{value:"Module"}));async function Ut(e){const t=(e==null?void 0:e.action)||"login";g(`
    <div class="card" style="max-width:420px; margin:40px auto;">
      <h2 class="card-header" style="justify-content:center;">
        🕌 ${t==="register"?n("register","Créer un compte"):n("login","Connexion")}
      </h2>

      <form id="auth-form">
        ${t==="register"?`
          <div class="form-group">
            <label>${n("name","Nom")}</label>
            <input type="text" name="name" required placeholder="${n("your_name","Votre nom")}" />
          </div>
        `:""}

        <div class="form-group">
          <label>${n("email","Email")}</label>
          <input type="email" name="email" required placeholder="email@mosquee.org" />
        </div>

        <div class="form-group">
          <label>${n("password","Mot de passe")}</label>
          <div style="position:relative;">
            <input type="password" name="password" id="auth-password" required minlength="8" placeholder="••••••••" style="padding-right:44px;" />
            <button type="button" id="toggle-password" class="icon-btn" style="position:absolute; right:2px; top:50%; transform:translateY(-50%); width:34px; height:34px;" title="${n("show_password","Afficher le mot de passe")}" aria-label="${n("show_password","Afficher le mot de passe")}">👁</button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-block" id="auth-submit">
          ${t==="register"?n("create_account","Créer le compte"):n("login_btn","Se connecter")}
        </button>
      </form>

      <div style="text-align:center; margin-top:16px;">
        ${t==="register"?`<a href="#/auth/login">${n("have_account","Déjà un compte ? Se connecter")}</a>`:`<a href="#/auth/register">${n("no_account","Pas de compte ? Créer un compte")}</a>`}
      </div>
    </div>
  `),document.getElementById("toggle-password").onclick=()=>{const a=document.getElementById("auth-password"),i=document.getElementById("toggle-password"),o=a.type==="password";a.type=o?"text":"password",i.textContent=o?"🙈":"👁"},document.getElementById("auth-form").onsubmit=async a=>{a.preventDefault();const i=new FormData(a.target),o=document.getElementById("auth-submit");o.disabled=!0,o.textContent="⏳ ...";try{const s=Object.fromEntries(i),l=await u(t==="register"?"/api/auth/register":"/api/auth/login",{method:"POST",body:s,auth:!1});ft(l.accessToken,l.refreshToken),localStorage.setItem("userName",l.user.name),m(n("welcome","Bienvenue")+", "+l.user.name+" !","success"),lt("/")}catch(s){m(s.message,"error"),o.disabled=!1,o.textContent=t==="register"?n("create_account","Créer le compte"):n("login_btn","Se connecter")}}}const Gt=Object.freeze(Object.defineProperty({__proto__:null,renderAuth:Ut},Symbol.toStringTag,{value:"Module"}));async function Vt(e){var l,d,c,p,v,$,b;const t=e==null?void 0:e.mosqueId;g(`
    <div style="min-height:80vh; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:20px;">
      <div style="font-size:4em; margin-bottom:12px;">🕌</div>
      <h1 style="font-size:2em; margin-bottom:24px;">Mosqué Digital</h1>

      <div style="font-size:1.3em; color:var(--accent2); margin-bottom:24px;" id="display-hijri">…</div>

      <div id="display-prayer" style="margin-bottom:30px;">
        <div style="font-size:1.2em; color:var(--muted);" id="display-prayer-name">${n("loading","...")}</div>
        <div style="font-size:4em; font-weight:700; color:var(--accent);" id="display-prayer-time">--:--</div>
        <div style="font-size:1.2em; color:var(--muted);" id="display-countdown"></div>
      </div>

      <div style="width:100%; max-width:600px; border-top:1px solid var(--line); padding-top:20px;">
        <div style="color:var(--muted);" id="display-next-activity">${n("loading","...")}</div>
      </div>

      <div style="position:fixed; bottom:16px; right:16px; color:var(--muted); font-size:0.8em;" id="display-clock"></div>
    </div>
  `);let a=t||null;if(!a)try{const h=await u("/api/mosques",{auth:!1});a=((l=h==null?void 0:h[0])==null?void 0:l.id)||null}catch{a=null}u("/api/hijri",{auth:!1}).then(h=>{const f=document.getElementById("display-hijri");f&&(h!=null&&h.hijri)&&(f.textContent=`${h.hijri.day} ${h.hijri.monthNameFr} ${h.hijri.year} AH`)}).catch(()=>{});let i=null;if(a)try{const h=new Date().toISOString().split("T")[0];i=await u(`/api/prayer-times/${a}?date=${h}`,{auth:!1})}catch{i=null}const o=i?[{name:n("fajr","Fajr"),time:((d=i.fajr)==null?void 0:d.time)||"--:--"},{name:n("sunrise","Sunrise"),time:((c=i.sunrise)==null?void 0:c.time)||"--:--"},{name:n("dhuhr","Dhuhr"),time:((p=i.dhuhr)==null?void 0:p.time)||"--:--"},{name:n("asr","Asr"),time:((v=i.asr)==null?void 0:v.time)||"--:--"},{name:n("maghrib","Maghrib"),time:(($=i.maghrib)==null?void 0:$.time)||"--:--"},{name:n("isha","Isha"),time:((b=i.isha)==null?void 0:b.time)||"--:--"}]:[{name:"Fajr",time:"05:30"},{name:"Dhuhr",time:"13:00"},{name:"Asr",time:"16:30"},{name:"Maghrib",time:"19:45"},{name:"Isha",time:"21:15"}];a&&u(`/api/events/upcoming/${a}?limit=1`,{auth:!1}).then(h=>{const f=document.getElementById("display-next-activity");if(!f)return;const x=h==null?void 0:h[0];if(!x){f.textContent="";return}let E="";x.date&&(E=new Date(x.date+(x.time?"T"+x.time:"")).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"}),x.time&&(E+=" à "+x.time)),f.innerHTML=`<div style="font-size:0.9em; color:var(--muted);">${n("next_activity","Prochain temps fort")}</div>
                        <div style="font-size:1.6em; font-weight:700; margin-top:4px;">${x.title}</div>
                        ${E?`<div style="color:var(--accent); margin-top:4px;">${E}</div>`:""}`}).catch(()=>{});function s(){const h=new Date,f=document.getElementById("display-clock");f&&(f.textContent=h.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}))}s(),setInterval(s,1e4);function r(){const h=new Date,f=h.getHours()*60+h.getMinutes();let x=o[0];for(const z of o){const[J,ot]=z.time.split(":").map(Number);if(!isNaN(J)&&J*60+ot>f){x=z;break}}const[E,P]=x.time.split(":").map(Number),C=Math.max(0,(isNaN(E)?0:E*60+(isNaN(P)?0:P))-f),N=Math.floor(C/60),V=C%60;document.getElementById("display-prayer-name").textContent=x.name,document.getElementById("display-prayer-time").textContent=x.time,document.getElementById("display-countdown").textContent=x.time!=="--:--"?`IQAMA DANS ${N>0?N+"H":""}${V.toString().padStart(2,"0")}`:""}r(),setInterval(r,3e4)}const Jt=Object.freeze(Object.defineProperty({__proto__:null,renderDisplay:Vt},Symbol.toStringTag,{value:"Module"})),Qt={prayer:"🕌",quran:"📖",course:"🎓",ramadan:"🌙",conference:"🎤",family:"👨‍👩‍👧",children:"🧒",community:"🤝"};function se(e){return e.startTime?new Date(e.startTime):e.date?new Date(e.date+(e.time?"T"+e.time:"")):null}function Wt(e){if(!e||isNaN(e))return"";const t=i=>new Date(i.getFullYear(),i.getMonth(),i.getDate()),a=Math.round((t(e)-t(new Date))/864e5);return a===0?n("today","Aujourd'hui"):a===1?n("tomorrow","Demain"):""}async function Yt(e){var i;const t=e==null?void 0:e.mosqueId;g(`
    <div class="card">
      <h2 class="card-header">📅 ${n("events","Événements")}</h2>
      ${A("۞")}
      <div id="events-list" class="loading-center"><div class="spinner"></div></div>
    </div>
  `);let a=t||null;if(!a)try{const o=await u("/api/mosques",{auth:!1});a=((i=o==null?void 0:o[0])==null?void 0:i.id)||null}catch{a=null}if(a)try{const o=await u(`/api/events/${a}`,{auth:!1});Xt(o)}catch{ce()}else ce()}function ce(){const e=document.getElementById("events-list");e.className="",e.innerHTML=`
    <p style="color:var(--muted); text-align:center; padding:20px;">
      ${n("no_events","Aucun événement à venir")}
    </p>`}function Xt(e){const t=document.getElementById("events-list");if(!t)return;if(t.className="",!(e!=null&&e.length)){ce();return}const a=[...e].sort((i,o)=>(se(i)||0)-(se(o)||0));t.innerHTML=a.map(i=>{const o=se(i),s=Wt(o);let r="";return i.startTime?r=o.toLocaleDateString(k())+" "+o.toLocaleTimeString(k(),{hour:"2-digit",minute:"2-digit"}):i.date?r=o.toLocaleDateString(k())+(i.time?" "+n("at","à")+" "+i.time:""):i.time&&(r="à "+i.time),`
    <div class="card card-accent" style="padding:16px; display:flex; gap:16px; align-items:start;">
      ${i.image?`<img src="${i.image}" style="width:80px; height:80px; object-fit:cover; border-radius:12px; flex-shrink:0;" onerror="this.style.display='none'" />`:`<span class="icon-badge" style="font-size:1.6em;">${Qt[i.category]||"📅"}</span>`}
      <div style="flex:1;">
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <div style="font-weight:600;">${i.title}</div>
          ${s?`<span class="badge-live live">${s}</span>`:""}
        </div>
        ${i.description?`<div style="color:var(--muted); margin-top:4px;">${i.description}</div>`:""}
        <div style="font-size:0.85em; color:var(--accent); margin-top:8px;">
          📅 ${r}
          ${i.location?` · 📍 ${i.location}`:""}
          ${i.speaker?` · 🎤 ${i.speaker}`:""}
        </div>
      </div>
    </div>
  `}).join("")}const Zt=Object.freeze(Object.defineProperty({__proto__:null,renderEvents:Yt},Symbol.toStringTag,{value:"Module"}));let H=[];function L(){const e=M();return e==="ar"||e==="en"?e:"fr"}function en(){try{return JSON.parse(localStorage.getItem("hadith-last-read")||"null")}catch{return null}}function tn(e,t){localStorage.setItem("hadith-last-read",JSON.stringify({number:e,name:t,at:Date.now()}))}async function nn(e){const t=e==null?void 0:e.book,a=e==null?void 0:e.number;if(a){await sn(parseInt(a));return}if(t){await on(parseInt(t));return}await an()}async function an(){const e=en();g(`
    <div class="card">
      <h2 class="card-header">📜 ${n("hadith","Hadith")} — ${n("sahih_bukhari","Sahih al-Bukhari")}</h2>

      ${e?`
        <a href="#/hadith/book/${e.number}" class="card card-link card-accent" style="display:flex; align-items:center; gap:12px; margin:0 0 16px; text-decoration:none; color:var(--fg);">
          <span class="icon-badge">📜</span>
          <div>
            <div style="font-size:.78em; color:var(--muted); text-transform:uppercase; letter-spacing:.05em;">${n("resume_reading","Reprendre la lecture")}</div>
            <div style="font-weight:600;">${e.name}</div>
          </div>
        </a>
      `:""}

      <div class="form-group">
        <input type="search" id="hadith-search" placeholder="${n("search_hadith","Rechercher un hadith...")}" />
      </div>
      <div id="hadith-book-list" class="loading-center"><div class="spinner"></div></div>
    </div>
  `);try{H=await u(`/api/hadith/books?lang=${L()}`,{auth:!1}),W(H)}catch(t){const a=document.getElementById("hadith-book-list");a.className="",a.innerHTML=`<p style="color:var(--danger);">${t.message}</p>`}document.getElementById("hadith-search").oninput=async t=>{const a=t.target.value.trim();if(a.length<2){W(H);return}const i=a.toLowerCase(),o=H.filter(r=>r.name.toLowerCase().includes(i)||String(r.number).includes(i));if(o.length){W(o);return}const s=document.getElementById("hadith-book-list");s.innerHTML='<div class="loading-center"><div class="spinner"></div></div>';try{const r=await u(`/api/hadith/search?q=${encodeURIComponent(a)}&lang=${L()}`,{auth:!1}),l=(r==null?void 0:r.results)||[];if(s.className="",!l.length){s.innerHTML=`<p style="color:var(--muted); text-align:center; padding:20px;">${n("no_results","Aucun résultat")}</p>`;return}s.innerHTML=l.map(d=>`
        <a href="#/hadith/read/${d.hadithNumber}" class="card card-link" style="display:block; padding:12px; text-decoration:none; color:var(--fg); margin:0;">
          <div style="font-size:.8em; color:var(--accent); margin-bottom:2px;">📜 ${n("hadith_no","Hadith n°")}${d.hadithNumber}</div>
          <div>${d.text}…</div>
        </a>
      `).join("")}catch{W(H)}}}function W(e){const t=document.getElementById("hadith-book-list");if(t){if(t.className="",!e.length){t.innerHTML=`<p style="color:var(--muted); text-align:center; padding:20px;">${n("no_results","Aucun résultat")}</p>`;return}t.innerHTML=`
    <div class="card-grid" style="gap:8px;">
      ${e.map(a=>`
        <a href="#/hadith/book/${a.number}" class="card card-link" style="display:flex; align-items:center; gap:12px; padding:12px; margin:0; text-decoration:none; color:var(--fg);">
          <div style="width:36px; height:36px; border-radius:50%; background:var(--accent-grad); color:#fff; display:flex; align-items:center; justify-content:center; font-size:0.85em; font-weight:700; flex-shrink:0;">${a.number}</div>
          <div style="flex:1; min-width:0;">
            <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${a.name}</div>
            <div style="font-size:0.8em; color:var(--muted);">${a.count} ${n("hadiths_count","hadiths")}</div>
          </div>
        </a>
      `).join("")}
    </div>
  `}}async function on(e){g(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/hadith" class="btn btn-sm btn-secondary">←</a>
      <h2 style="flex:1;" id="hadith-book-title"><div class="spinner"></div></h2>
    </div>
    <div id="hadith-book-content" class="loading-center"><div class="spinner"></div></div>
  `);try{const t=await u(`/api/hadith/books/${e}?lang=${L()}`,{auth:!1});document.getElementById("hadith-book-title").textContent=`📜 ${t.name}`,tn(e,t.name);const a=document.getElementById("hadith-book-content");a.className="",a.innerHTML=(t.hadiths||[]).map(i=>`
      <div class="ayah" id="hadith-${i.hadithNumber}">
        <div style="font-size:.78em; color:var(--accent); margin-bottom:4px;">${n("hadith_no","Hadith n°")}${i.hadithNumber}</div>
        <div class="arabic" dir="rtl">${i.textArabic}</div>
        ${i.translation&&L()!=="ar"?`<div class="translation">${i.translation}</div>`:""}
        <div style="display:flex; gap:8px; margin-top:6px;">
          <button class="btn btn-sm btn-secondary btn-tts-hadith" data-hadith="${i.hadithNumber}">🔊 ${n("read_aloud","Lire")}</button>
        </div>
      </div>
    `).join(""),a.querySelectorAll(".btn-tts-hadith").forEach(i=>{i.onclick=()=>Ze(Number(i.dataset.hadith))})}catch(t){const a=document.getElementById("hadith-book-content");a.className="",a.innerHTML=`<p style="color:var(--danger);">${t.message}</p>`}}async function sn(e){var t;g(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/hadith" class="btn btn-sm btn-secondary">←</a>
      <h2 style="flex:1;">📜 ${n("hadith","Hadith")} n°${e}</h2>
    </div>
    <div id="hadith-single-content" class="loading-center"><div class="spinner"></div></div>
  `);try{const a=await u(`/api/hadith/${e}?lang=${L()}`,{auth:!1}),i=document.getElementById("hadith-single-content");i.className="",i.innerHTML=`
      <div class="card">
        ${(t=a.book)!=null&&t.name?`<a href="#/hadith/book/${a.book.number}" style="font-size:.85em; color:var(--accent);">📜 ${a.book.name}</a>`:""}
        <div class="ayah" style="margin-top:8px;">
          <div class="arabic" dir="rtl" style="font-size:1.3em; line-height:2;">${a.textArabic}</div>
          ${a.translation&&L()!=="ar"?`<div class="translation" style="font-size:1.05em;">${a.translation}</div>`:""}
        </div>
        <div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap;">
          <button class="btn btn-secondary" id="btn-tts-single">🔊 ${n("read_aloud","Lire")}</button>
        </div>
      </div>
    `,document.getElementById("btn-tts-single").onclick=()=>Ze(e)}catch(a){const i=document.getElementById("hadith-single-content");i.className="",i.innerHTML=`<p style="color:var(--danger);">${a.message}</p>`}}function Ze(e){if(!("speechSynthesis"in window)){m(n("tts_unsupported","Lecture vocale non supportée"),"error");return}u(`/api/hadith/${e}?lang=${L()}`,{auth:!1}).then(t=>{const a=(t==null?void 0:t.translation)||(t==null?void 0:t.textArabic)||"";if(!a)return;window.speechSynthesis.cancel();const i=new SpeechSynthesisUtterance(a);i.lang=t!=null&&t.translation?k():"ar-SA",i.rate=.95,window.speechSynthesis.speak(i)}).catch(()=>m(n("tts_failed_hadith","Impossible de lire ce hadith"),"error"))}const rn=Object.freeze(Object.defineProperty({__proto__:null,renderHadith:nn},Symbol.toStringTag,{value:"Module"}));let R=null,Y=null;const Se=[{ar:"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",fr:"Gloire et pureté à Allah, et louange à Lui.",en:"Glory and praise be to Allah."},{ar:"لَا إِلَٰهَ إِلَّا اللَّهُ",fr:"Il n'y a de divinité digne d'adoration qu'Allah.",en:"There is no deity worthy of worship but Allah."},{ar:"الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",fr:"Louange à Allah, Seigneur des mondes.",en:"Praise be to Allah, Lord of the worlds."},{ar:"اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",fr:"Ô Allah, prie sur Muhammad ﷺ.",en:"O Allah, send blessings upon Muhammad ﷺ."},{ar:"رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً",fr:"Seigneur, accorde-nous belle part ici-bas et belle part dans l'au-delà.",en:"Our Lord, grant us good in this world and good in the Hereafter."},{ar:"حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",fr:"Allah nous suffit, Il est le meilleur garant.",en:"Allah is sufficient for us, and He is the best disposer of affairs."},{ar:"أَسْتَغْفِرُ اللَّهَ",fr:"Je demande pardon à Allah.",en:"I seek forgiveness from Allah."},{ar:"وَقُل رَّبِّ زِدْنِي عِلْمًا",fr:"Et dis : « Seigneur, accrois mes connaissances. »",en:'And say: "My Lord, increase me in knowledge."'}];function ln(){const e=Math.floor(Date.now()/864e5),t=Se[e%Se.length],a=M(),i=a==="ar"?null:t[a]||t.en||t.fr;return{ar:t.ar,translation:i}}function dn(e){return e<5?["greeting_night","Que cette nuit vous soit bénie"]:e<12?["greeting_morning","Que votre matinée soit bénie"]:e<18?["greeting_afternoon","Que votre journée soit bénie"]:["greeting_evening","Que votre soirée soit bénie"]}async function cn(){R&&(clearInterval(R),R=null),ie=!1;const e=localStorage.getItem("userName")||"",[t,a]=dn(new Date().getHours()),i=ln(),o=[{href:"#/khutbah",icon:"🎙️",titleKey:"khutbah_live",title:"Khutbah Live",subKey:"join_or_start",sub:"Rejoindre ou démarrer"},{href:"#/quran",icon:"📖",titleKey:"quran",title:"Coran",subKey:"read_listen",sub:"Lire et écouter"},{href:"#/hadith",icon:"📜",titleKey:"hadith",title:"Hadith",subKey:"sahih_bukhari",sub:"Sahih al-Bukhari"},{href:"#/prayer",icon:"🕌",titleKey:"prayers",title:"Horaires de prière",subKey:"adhan_iqama",sub:"Adhan & Iqama"},{href:"#/announcements",icon:"📢",titleKey:"announcements",title:"Annonces",subKey:"latest_news",sub:"Dernières nouvelles"},{href:"#/events",icon:"📅",titleKey:"events",title:"Événements",subKey:"upcoming",sub:"À venir"},{href:"#/support",icon:"🤲",titleKey:"donate",title:"Faire un don",subKey:"support_mosque",sub:"Soutenir la mosquée"},{href:"#/ramadan",icon:"🌙",titleKey:"ramadan",title:"Ramadan",subKey:"program",sub:"Programme"}];g(`
    <div class="hero-mosque">
      <div class="bismillah">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>
      <h1 style="font-size:1.6em; margin:10px 0 4px;">${n("app_name","Mosqué Digital")}</h1>
      <p style="color:var(--muted);">
        ${e?`${n("assalamu_alaykum","As-salâmu ʿalaykum")}, <strong style="color:var(--fg)">${e}</strong> — ${n(t,a)}`:`${n("assalamu_alaykum","As-salâmu ʿalaykum")} — ${n(t,a)}`}
      </p>
      <p style="color:var(--accent2); font-size:1.05em; margin-top:2px;" id="home-hijri"></p>
    </div>

    <div id="install-banner"></div>

    <div id="prayer-countdown" class="card" style="margin-bottom:8px;">
      <div class="loading-center"><div class="spinner"></div></div>
    </div>

    <div class="card card-accent" style="text-align:center;">
      <div class="bismillah" style="font-size:1.15em;" dir="rtl">${i.ar}</div>
      ${i.translation?`<div style="color:var(--muted); font-size:.92em; margin-top:6px;">${i.translation}</div>`:""}
    </div>

    ${A("✦ ✦ ✦")}

    <div class="card-grid">
      ${o.map(r=>`
        <a href="${r.href}" class="card card-link" style="display:flex; align-items:center; gap:16px; text-decoration:none; color:var(--fg);">
          <span class="icon-badge">${r.icon}</span>
          <div>
            <div style="font-weight:600;">${n(r.titleKey,r.title)}</div>
            <div style="font-size:0.85em; color:var(--muted);">${n(r.subKey,r.sub)}</div>
          </div>
        </a>
      `).join("")}
    </div>

    ${ae()?`
      <div style="text-align:center; margin-top:24px;">
        <a href="#/admin" class="btn btn-secondary">${n("admin","Administration")}</a>
        <a href="#/imam" class="btn btn-secondary" style="margin-left:8px;">${n("imam_mode","Mode Imam")}</a>
      </div>
    `:`
      <div style="text-align:center; margin-top:24px;">
        <a href="#/auth/login" class="btn btn-primary">${n("login","Connexion")}</a>
        <a href="#/admin" class="btn btn-secondary" style="margin-left:8px;">${n("admin","Administration")}</a>
      </div>
    `}
  `),Te(),Y&&window.removeEventListener("pwa-installable-changed",Y),Y=Te,window.addEventListener("pwa-installable-changed",Y);const s=new Date().toISOString().split("T")[0];u(`/api/hijri?date=${s}`,{auth:!1}).then(r=>{const l=document.getElementById("home-hijri");if(l&&(r!=null&&r.hijri)){const d=M()==="ar",c=d?r.hijri.monthNameAr:r.hijri.monthNameFr;l.textContent=d?`${r.hijri.day} ${c} ${r.hijri.year} هـ`:`${r.hijri.day} ${c} ${r.hijri.year} AH (${r.hijri.monthNameAr})`}}).catch(()=>{}),un()}function Te(){const e=document.getElementById("install-banner");if(!e)return;if(localStorage.getItem("pwa-banner-dismissed")==="1"||!_t()){e.innerHTML="";return}e.innerHTML=`
    <div class="card card-accent" style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
      <span class="icon-badge">📲</span>
      <div style="flex:1; min-width:180px;">
        <div style="font-weight:600;">${n("install_app","Installer l'application")}</div>
        <div style="font-size:.85em; color:var(--muted);">
          ${Ue()?n("install_ios_hint","Partager (⬆️) puis « Sur l'écran d'accueil »"):n("install_hint","Accès rapide, plein écran, fonctionne hors-ligne")}
        </div>
      </div>
      ${Ge()?`<button class="btn btn-sm btn-primary" id="btn-install">${n("install","Installer")}</button>`:""}
      <button class="icon-btn" id="btn-dismiss-install" title="${n("dismiss","Ignorer")}" aria-label="${n("dismiss","Ignorer")}">✕</button>
    </div>
  `;const t=document.getElementById("btn-install");t&&(t.onclick=async()=>{await wt()==="accepted"&&(e.innerHTML="")}),document.getElementById("btn-dismiss-install").onclick=()=>{localStorage.setItem("pwa-banner-dismissed","1"),e.innerHTML=""}}let I=null,O=null,ie=!1;async function un(){var e;try{const t=new Date().toISOString().split("T")[0];let a=null;try{const o=localStorage.getItem("userGeo")||localStorage.getItem("prayerSet");o&&(a=JSON.parse(o))}catch{}const i=await u("/api/mosques",{auth:!1});O=((e=i==null?void 0:i[0])==null?void 0:e.id)||null,a&&a.lat&&a.lng?(I=await u(`/api/prayer-times/${O||"geo"}?date=${t}&lat=${a.lat}&lng=${a.lng}`,{auth:!1}),ie=!0):O&&(I=await u(`/api/prayer-times/${O}?date=${t}`,{auth:!1}))}catch{I=null}ue(),R=setInterval(ue,6e4)}function mn(){const e=document.getElementById("btn-home-my-position");if(!e)return;e.disabled=!0;const t=e.textContent;e.textContent="📡 "+n("locating","Localisation...");const a=async(o,s)=>{try{const r=new Date().toISOString().split("T")[0];localStorage.setItem("userGeo",JSON.stringify({lat:o,lng:s})),I=await u(`/api/prayer-times/${O||"geo"}?date=${r}&lat=${o}&lng=${s}`,{auth:!1}),ie=!0,ue(),m(n("position_used","Position exacte utilisée"),"success")}catch{m(n("geolocation_unavailable","Géolocalisation non disponible"),"error"),e.disabled=!1,e.textContent=t}},i=()=>{fetch("https://ipapi.co/json/").then(o=>o.ok?o.json():Promise.reject()).then(o=>{isFinite(+o.latitude)&&isFinite(+o.longitude)?a(+o.latitude,+o.longitude):(m(n("geolocation_unavailable","Géolocalisation non disponible"),"error"),e.disabled=!1,e.textContent=t)}).catch(()=>{m(n("geolocation_unavailable","Géolocalisation non disponible"),"error"),e.disabled=!1,e.textContent=t})};if(!navigator.geolocation){i();return}navigator.geolocation.getCurrentPosition(o=>{a(o.coords.latitude,o.coords.longitude)},()=>{i()},{timeout:1e4,enableHighAccuracy:!0})}function ue(){var f,x,E,P,C,N;const e=document.getElementById("prayer-countdown");if(!e){clearInterval(R);return}const t=new Date,a=t.getHours(),i=t.getMinutes(),o=`${a.toString().padStart(2,"0")}:${i.toString().padStart(2,"0")}`,s=I?[{name:n("fajr","Fajr"),time:((f=I.fajr)==null?void 0:f.time)||"--:--"},{name:n("sunrise","Sunrise"),time:((x=I.sunrise)==null?void 0:x.time)||"--:--"},{name:n("dhuhr","Dhuhr"),time:((E=I.dhuhr)==null?void 0:E.time)||"--:--"},{name:n("asr","Asr"),time:((P=I.asr)==null?void 0:P.time)||"--:--"},{name:n("maghrib","Maghrib"),time:((C=I.maghrib)==null?void 0:C.time)||"--:--"},{name:n("isha","Isha"),time:((N=I.isha)==null?void 0:N.time)||"--:--"}]:[{name:"Fajr",time:"05:30"},{name:"Sunrise",time:"07:15"},{name:"Dhuhr",time:"13:00"},{name:"Asr",time:"16:30"},{name:"Maghrib",time:"19:45"},{name:"Isha",time:"21:15"}];let r=null;for(const V of s){const[z,J]=V.time.split(":").map(Number);if(z>a||z===a&&J>i){r=V;break}}r||(r=s[0]);const[l,d]=r.time.split(":").map(Number);let c=l*60+d-(a*60+i);c<0&&(c+=24*60);const p=Math.floor(c/60),v=c%60,$=p>0?`${p}h${v.toString().padStart(2,"0")}`:`${v}min`,b=Math.max(4,Math.min(100,Math.round(c/(6*60)*100)));e.className="card",e.innerHTML=`
    <div style="display:flex; align-items:center; justify-content:center; gap:24px; flex-wrap:wrap; padding:8px 0;">
      <div class="gauge" style="--gauge-pct:${b};">
        <div class="gauge-inner">
          <div class="timer">${$}</div>
          <div class="label">${n("remaining","restant")}</div>
        </div>
      </div>
      <div>
        <div class="label">${n("next_prayer","Prochaine prière")}</div>
        <div class="next-prayer">${r.name}</div>
        <div class="label">${n("at","à")} ${r.time} · ${o}</div>
      </div>
    </div>
    <div style="text-align:center; margin-top:6px;">
      ${ie?`<span style="font-size:.8em; color:var(--accent);">📍 ${n("times_for_your_position","Horaires calculés pour votre position exacte")}</span>`:`<button class="btn btn-sm btn-secondary" id="btn-home-my-position">📍 ${n("use_my_position","Utiliser ma position exacte")}</button>`}
    </div>
  `;const h=document.getElementById("btn-home-my-position");h&&(h.onclick=mn)}const pn=Object.freeze(Object.defineProperty({__proto__:null,renderHome:cn},Symbol.toStringTag,{value:"Module"})),re={};function hn(){return Ke.replace(/^http/,"ws")}function et(e="/khutbah"){if(re[e])return re[e];const t={_handlers:{},_ws:null,_reconnectTimer:null,_mode:null,_code:null,_lang:null,_token:null,on(a,i){return(this._handlers[a]=this._handlers[a]||[]).push(i),this},_dispatch(a,i){(this._handlers[a]||[]).forEach(o=>{try{o(i)}catch(s){console.error("[ws]",s)}})},_connect(){if(this._ws){try{this._ws.close()}catch{}this._ws=null}const a=this._mode==="broadcast"?`/ws/broadcast/${encodeURIComponent(this._code)}?token=${encodeURIComponent(this._token||"")}`:`/ws/listen/${encodeURIComponent(this._code)}?lang=${encodeURIComponent(this._lang||"fr")}`,i=new WebSocket(hn()+a);this._ws=i,i.onopen=()=>{this._dispatch("connect",{})},i.onmessage=o=>{let s;try{s=JSON.parse(o.data)}catch{return}this._dispatch(s.type,s)},i.onclose=()=>{this._ws=null,this._dispatch("disconnect",{}),this._mode&&this._scheduleReconnect()},i.onerror=()=>{}},_scheduleReconnect(){this._reconnectTimer||(this._reconnectTimer=setTimeout(()=>{this._reconnectTimer=null,this._mode&&this._connect()},2e3))},emit(a,i={}){return a==="join-listen"?(this._mode="listen",this._code=i.code,this._lang=i.lang||"fr",this._connect(),this):a==="join-broadcast"?(this._mode="broadcast",this._code=i.code,this._token=i.token||"",this._connect(),this):(this._ws&&this._ws.readyState===WebSocket.OPEN&&this._ws.send(JSON.stringify({type:a,...i})),this)},disconnect(){if(this._mode=null,this._reconnectTimer&&(clearTimeout(this._reconnectTimer),this._reconnectTimer=null),this._ws){try{this._ws.close()}catch{}this._ws=null}this._handlers={}}};return re[e]=t,t}function gn(e){try{return localStorage.getItem(`imam_token_${e}`)||""}catch{return""}}function tt(e,t){try{localStorage.setItem(`imam_token_${e}`,t)}catch{}}const qe=["بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ","الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ","اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ","يَا أَيُّهَا الَّذِينَ آمَنُوا","أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ","قَالَ اللَّهُ تَعَالَى","قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ","أَقُولُ قَوْلِي هَذَا وَأَسْتَغْفِرُ اللَّهَ لِي وَلَكُمْ","اللَّهُمَّ اغْفِرْ لِلْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ","رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ","أَقِيمُوا الصَّلَاةَ","وَالسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ"];function le(){try{const e=JSON.parse(localStorage.getItem("khutbah-phrases")||"null");return Array.isArray(e)&&e.length?e:qe}catch{return qe}}function Be(e){localStorage.setItem("khutbah-phrases",JSON.stringify(e))}async function yn(e){if(!ae()){g(`
      <div class="card" style="max-width:420px; margin:40px auto; text-align:center;">
        <h2>👳 ${n("imam_mode","Mode Imam")}</h2>
        <p style="color:var(--muted); margin:12px 0;">${n("login_required","Connexion requise")}</p>
        <a href="#/auth/login" class="btn btn-primary">${n("login","Se connecter")}</a>
      </div>
    `);return}const t=e==null?void 0:e.code;t?await fn(t):await vn()}async function vn(){g(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/" class="btn btn-sm btn-secondary">←</a>
      <h2>👳 ${n("imam_dashboard","Tableau de bord Imam")}</h2>
    </div>

    <div class="card">
      <h3 class="card-header">🎙️ ${n("khutbah_control","Contrôle Khutbah")}</h3>
      <div class="form-group">
        <label>${n("topic","Sujet")}</label>
        <input type="text" id="imam-topic" placeholder="${n("khutbah_topic","Sujet de la khutbah")}" />
      </div>
      <button class="btn btn-primary btn-block" id="start-khutbah">${n("start_session","Démarrer une session")}</button>
    </div>

    <div class="card">
      <h3 class="card-header">🤖 ${n("ai_assistant","Assistant IA")}</h3>
      <div class="form-group">
        <label>${n("ask_assistant","Demander à l'assistant")}</label>
        <textarea id="ai-question" rows="3" placeholder="${n("ai_placeholder","Préparer un plan de khutbah sur la patience...")}" style="width:100%; padding:10px; border:1px solid var(--line); border-radius:10px; background:var(--bg2); color:var(--fg);"></textarea>
      </div>
      <button class="btn btn-primary" id="ai-generate">${n("generate","Générer")}</button>
      <div id="ai-result" style="margin-top:16px;"></div>
    </div>
  `),document.getElementById("start-khutbah").onclick=async()=>{const e=document.getElementById("imam-topic").value.trim();try{const t=await u("/api/session",{method:"POST",body:{mosque_name:e,target_langs:["fr","en"]}});t.broadcaster_token&&tt(t.code,t.broadcaster_token),m(`${n("session_created","Session créée")}: ${t.code}`,"success"),location.hash=`#/imam/${t.code}`}catch(t){m(t.message,"error")}},document.getElementById("ai-generate").onclick=async()=>{var a,i,o;const e=document.getElementById("ai-question").value.trim();if(!e)return;const t=document.getElementById("ai-result");t.innerHTML='<div class="loading-center"><div class="spinner"></div></div>';try{const s=await u("/api/ai/assistant/plan",{method:"POST",body:{topic:e}});t.innerHTML=`
        <div class="card" style="background:var(--bg2);">
          <h4>📋 ${s.topic||e}</h4>
          <div style="margin-top:8px;"><strong>${n("introduction","Introduction")}:</strong><p>${s.introduction}</p></div>
          ${(a=s.mainPoints)!=null&&a.length?`<div style="margin-top:8px;"><strong>${n("main_points","Points principaux")}:</strong><ul>${s.mainPoints.map(r=>`<li>${r}</li>`).join("")}</ul></div>`:""}
          ${(i=s.references)!=null&&i.length?`<div style="margin-top:8px;"><strong>${n("references","Références")}:</strong><ul>${s.references.map(r=>`<li>📖 ${r}</li>`).join("")}</ul></div>`:""}
          ${s.conclusion?`<div style="margin-top:8px;"><strong>${n("conclusion","Conclusion")}:</strong><p>${s.conclusion}</p></div>`:""}
          ${(o=s.warnings)!=null&&o.length?`<div style="margin-top:8px; color:var(--warn);"><strong>⚠️ ${n("verify","À vérifier")}:</strong><ul>${s.warnings.map(r=>`<li>${r}</li>`).join("")}</ul></div>`:""}
        </div>
      `}catch(s){t.innerHTML=`<p style="color:var(--danger);">${s.message}</p>`}}}async function fn(e){g(`
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
      <a href="#/imam" class="btn btn-sm btn-secondary">←</a>
      <span style="font-weight:600; font-family:var(--font-heading);">👳 ${n("imam_control","Contrôle Imam")}</span>
      <span id="imam-status" class="badge-live" style="margin-left:auto;">⏳</span>
    </div>

    <div class="card" style="text-align:center;">
      <h3 class="card-header" style="justify-content:center;">📱 ${n("qr_session","QR Code de la session")}</h3>
      <img src="${ne}/api/session/${e}/qr.png" style="width:200px; margin:16px auto; border-radius:12px; background:#fff; padding:8px;" id="imam-qr-img" />
      <div style="font-size:0.85em; color:var(--muted); word-break:break-all;" id="join-url"></div>
      <button class="btn btn-sm btn-secondary" id="copy-join-url" style="margin-top:10px;">📋 ${n("copy_link","Copier le lien")}</button>
    </div>

    <div class="card">
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;">
        <button class="btn btn-primary" id="btn-pause">⏸ ${n("pause","Pause")}</button>
        <button class="btn btn-secondary" id="btn-resume">▶ ${n("resume","Reprendre")}</button>
        <button class="btn btn-danger" id="btn-stop">⏹ ${n("stop","Terminer")}</button>
      </div>

      <div class="form-group">
        <label>📚 ${n("phrase_library","Bibliothèque de phrases")}</label>
        <div id="phrase-chips" dir="rtl" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;"></div>
        <div style="display:flex; gap:6px;">
          <input type="text" id="new-phrase" dir="rtl" placeholder="${n("add_phrase","Ajouter une phrase...")}" style="flex:1; direction:rtl; text-align:right; font-family:var(--font-arabic);" />
          <button class="btn btn-sm btn-secondary" id="add-phrase" title="${n("add","Ajouter")}">+</button>
        </div>
        <button class="btn btn-sm btn-secondary" id="reset-phrases" style="margin-top:6px; font-size:.78em;">${n("reset_defaults","Rétablir la liste par défaut")}</button>
      </div>

      <div class="form-group">
        <label>${n("type_arabic","Saisir du texte arabe")}</label>
        <textarea id="manual-text" rows="3" placeholder="${n("arabic_placeholder","Texte arabe...")}" style="direction:rtl; text-align:right; font-family:var(--font-arabic); font-size:1.2em;"></textarea>
      </div>
      <button class="btn btn-primary btn-block" id="send-text">${n("send","Envoyer")}</button>
    </div>

    <div class="card">
      <h4 class="card-header">📊 ${n("live_stats","Statistiques en direct")}</h4>
      <div id="imam-stats" style="color:var(--muted);">${n("listeners","Auditeurs")}: <span id="listener-count">0</span></div>
      <div id="imam-quran" style="margin-top:8px;"></div>
    </div>

    ${A("۞")}

    <div class="card">
      <h4 class="card-header">📝 ${n("segments","Segments")}</h4>
      <div id="imam-segments" style="max-height:40vh; overflow-y:auto;"></div>
    </div>
  `);const t=et("/khutbah"),a=gn(e);let i=`${window.location.origin}/#/khutbah/${e}`;try{i=(await u(`/api/session/${e}`)).join_url||i;const d=document.getElementById("join-url");d&&(d.textContent=i)}catch{const l=document.getElementById("join-url");l&&(l.textContent=i)}document.getElementById("copy-join-url").onclick=()=>{var l;(l=navigator.clipboard)==null||l.writeText(i).then(()=>m(n("copied","Copié"),"success"))};function o(l,d){const c=document.getElementById("imam-status");c&&(c.textContent=d,c.classList.toggle("live",!!l))}t.on("connect",()=>o(!1,"🟢 "+n("connected","Connecté"))),t.on("hello",l=>{o(l.status==="live",l.status==="live"?`🔴 ${n("live","LIVE")}`:`⏸ ${l.status}`),document.getElementById("listener-count").textContent=l.listeners??0}),t.on("stats",l=>{l.listeners!==void 0&&(document.getElementById("listener-count").textContent=l.listeners)}),t.on("session",l=>{o(l.status==="live",l.status==="live"?`🔴 ${n("live","LIVE")}`:`⏸ ${l.status}`)}),t.on("monitor",l=>{document.getElementById("listener-count").textContent=l.listeners??document.getElementById("listener-count").textContent,l.is_quran&&l.quran_ref&&(document.getElementById("imam-quran").innerHTML=`<div class="card" style="padding:12px; border-left:3px solid var(--accent);">📖 ${l.quran_ref}</div>`),bn(l)}),t.on("disconnect",()=>o(!1,`⚠️ ${n("disconnected","Déconnecté")}`)),document.getElementById("btn-pause").onclick=()=>t.emit("control",{action:"pause"}),document.getElementById("btn-resume").onclick=()=>t.emit("control",{action:"resume"}),document.getElementById("btn-stop").onclick=()=>t.emit("control",{action:"stop"});function s(l){l&&t.emit("transcript",{text:l,is_final:!0,manual:!0})}document.getElementById("send-text").onclick=()=>{const l=document.getElementById("manual-text").value.trim();s(l),document.getElementById("manual-text").value=""};function r(){const l=document.getElementById("phrase-chips");if(!l)return;const d=le();l.innerHTML=d.map((c,p)=>`
      <span class="btn btn-sm btn-secondary phrase-chip" data-i="${p}" style="cursor:pointer; font-family:var(--font-arabic); gap:6px;">
        ${c}
        <button class="phrase-del" data-i="${p}" title="${n("delete","Supprimer")}" aria-label="${n("delete","Supprimer")}" style="background:none; border:none; color:inherit; opacity:.6; padding:0; font:inherit; cursor:pointer;">✕</button>
      </span>
    `).join(""),l.querySelectorAll(".phrase-chip").forEach(c=>{c.onclick=p=>{p.target.classList.contains("phrase-del")||s(d[Number(c.dataset.i)])}}),l.querySelectorAll(".phrase-del").forEach(c=>{c.onclick=p=>{p.stopPropagation();const v=le();v.splice(Number(c.dataset.i),1),Be(v),r()}})}r(),document.getElementById("add-phrase").onclick=()=>{const l=document.getElementById("new-phrase"),d=l.value.trim();if(!d)return;const c=le();c.push(d),Be(c),l.value="",r()},document.getElementById("new-phrase").onkeydown=l=>{l.key==="Enter"&&(l.preventDefault(),document.getElementById("add-phrase").click())},document.getElementById("reset-phrases").onclick=()=>{localStorage.removeItem("khutbah-phrases"),r(),m(n("defaults_restored","Liste par défaut rétablie"),"success")},t.emit("join-broadcast",{code:e,token:a})}function bn(e){const t=document.getElementById("imam-segments");if(!t)return;const a=document.createElement("div");a.className=`khutbah-segment ${e.is_quran?"quran":""}`,a.innerHTML=`
    <div class="arabic">${e.arabic||""}</div>
    <div style="font-size:0.8em; color:var(--muted);">seq #${e.seq} ${e.provider?`· ${e.provider}`:""}</div>
  `,t.prepend(a)}const xn=Object.freeze(Object.defineProperty({__proto__:null,renderImam:yn},Symbol.toStringTag,{value:"Module"}));async function $n(e){const t=e==null?void 0:e.code;t?await In(t):await _n()}async function _n(){g(`
    <div class="card" style="max-width:500px; margin:20px auto; text-align:center;">
      <h2 class="card-header" style="justify-content:center;">🎙️ ${n("khutbah_live","Khutbah Live")}</h2>

      <div style="background:var(--bg2); border-radius:12px; padding:20px; margin-bottom:16px;">
        <div style="font-size:1.5em; margin-bottom:8px;">📱</div>
        <h3 style="margin:0 0 8px;">${n("scan_qr_title","Scannez le QR Code")}</h3>
        <p style="color:var(--muted); margin:0; line-height:1.5;">
          ${n("scan_qr_instructions","Affichez le QR Code projeté à l'écran de la mosquée. Ouvrez l'appareil photo de votre téléphone et scannez-le pour rejoindre la session automatiquement.")}
        </p>
      </div>

      <div style="margin:20px 0; color:var(--muted);">— ${n("or","ou")} —</div>

      <div class="form-group">
        <input type="text" id="session-code" placeholder="${n("session_code","Code de session")}"
               maxlength="6" style="text-align:center; font-size:1.3em; letter-spacing:0.15em; text-transform:uppercase;" />
      </div>

      <button class="btn btn-primary btn-block" id="join-btn">${n("join","Rejoindre")}</button>
    </div>

    ${ae()?`
      <div class="card" style="max-width:500px; margin:0 auto;">
        <h3 class="card-header">👑 ${n("imam_tools","Outils Imam")}</h3>
        <button class="btn btn-primary btn-block" id="start-session">${n("start_session","Démarrer une Khutbah")}</button>
      </div>
    `:""}
  `),document.getElementById("join-btn").onclick=()=>{const e=document.getElementById("session-code").value.trim().toUpperCase();e.length>=4&&(location.hash=`#/khutbah/${e}`)},document.getElementById("session-code").onkeydown=e=>{e.key==="Enter"&&document.getElementById("join-btn").click()},document.getElementById("start-session")&&(document.getElementById("start-session").onclick=async()=>{try{const e=await u("/api/session",{method:"POST",body:{target_langs:["fr","en"]}});e.broadcaster_token&&tt(e.code,e.broadcaster_token),m(`${n("session_created","Session créée")}: ${e.code}`,"success"),location.hash=`#/imam/${e.code}`}catch(e){m(e.message,"error")}})}const be=[.85,1,1.15,1.35,1.6];let j=nt(parseInt(localStorage.getItem("khutbah-fs-idx"),10)),F=localStorage.getItem("khutbah-tts")==="1",me="fr";const K=[],wn=3;function nt(e){return Number.isFinite(e)&&e>=0&&e<be.length?e:1}async function In(e){g(`
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
      <a href="#/khutbah" class="btn btn-sm btn-secondary">←</a>
      <span style="font-weight:600; font-family:var(--font-heading);">🎙️ Khutbah Live</span>
      <span id="khutbah-status" class="badge-live" style="margin-left:4px;">${n("connecting","Connexion...")}</span>
      <span style="margin-left:auto; font-size:0.85em; color:var(--muted);" id="listener-count">0 👤</span>
    </div>

    <div class="card" style="padding:12px 16px; margin-bottom:12px; display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
      <select id="lang-select" style="width:auto; flex:1; min-width:140px;">
        <option value="fr">Français</option>
        <option value="en">English</option>
        <option value="nl">Nederlands</option>
        <option value="de">Deutsch</option>
        <option value="es">Español</option>
        <option value="tr">Türkçe</option>
        <option value="ar">العربية</option>
      </select>
      <button class="icon-btn" id="fs-minus" type="button" title="${n("text_smaller","Texte plus petit")}" aria-label="${n("text_smaller","Texte plus petit")}">A−</button>
      <button class="icon-btn" id="fs-plus" type="button" title="${n("text_larger","Texte plus grand")}" aria-label="${n("text_larger","Texte plus grand")}">A+</button>
      <button class="icon-btn" id="tts-toggle" type="button" title="${n("voice_playback","Lecture vocale")}" aria-label="${n("voice_playback","Lecture vocale")}" aria-pressed="${F}">${F?"🔊":"🔇"}</button>
    </div>

    <div id="interim-line" style="direction:rtl; text-align:right; font-family:var(--font-arabic); font-size:1.5em; color:var(--accent2); min-height:1.4em; margin-bottom:8px;"></div>

    ${A("۞")}

    <div id="segments" style="--khutbah-fs:${be[j]}; max-height:60vh; overflow-y:auto; padding:4px 0 12px;"></div>
  `);const t=et("/khutbah"),a=()=>document.getElementById("khutbah-status");function i(s,r){const l=a();l&&(l.textContent=r,l.classList.toggle("live",!!s))}t.on("connect",()=>i(!1,n("connected","Connecté"))),t.on("hello",s=>{var r;if(i(s.status==="live",s.status==="live"?`🔴 ${n("live","LIVE")}`:`⏸ ${s.status}`),s.seq,(r=s.history)!=null&&r.length)for(const l of s.history)Ae(l,{speak:!1})}),t.on("interim",s=>{const r=document.getElementById("interim-line");r&&(r.textContent=s.arabic||"")}),t.on("phrase",s=>{if(s.corrected){const r=document.querySelector(`[data-seq="${s.seq}"] .arabic`);r&&(r.textContent=s.arabic||r.textContent)}else Ae(s,{speak:!0}),s.seq}),t.on("session",s=>{i(s.status==="live",s.status==="live"?`🔴 ${n("live","LIVE")}`:`⏸ ${s.status}`)}),t.on("disconnect",()=>i(!1,`⚠️ ${n("disconnected","Déconnecté")} — ${n("reconnecting","Reconnexion...")}`));const o=document.getElementById("lang-select");me=o.value,o.onchange=s=>{me=s.target.value,pe(),t.emit("set-lang",{lang:s.target.value})},document.getElementById("fs-minus").onclick=()=>Le(j-1),document.getElementById("fs-plus").onclick=()=>Le(j+1),document.getElementById("tts-toggle").onclick=()=>En(!F),t.emit("join-listen",{code:e,lang:o.value}),window.addEventListener("hashchange",pe,{once:!0})}function Le(e){j=nt(e),localStorage.setItem("khutbah-fs-idx",String(j));const t=document.getElementById("segments");t&&t.style.setProperty("--khutbah-fs",be[j])}function En(e){F=e,localStorage.setItem("khutbah-tts",e?"1":"0");const t=document.getElementById("tts-toggle");t&&(t.textContent=e?"🔊":"🔇",t.setAttribute("aria-pressed",String(e))),e||pe()}function pe(){K.length=0,window.speechSynthesis&&window.speechSynthesis.cancel()}function kn(e){!F||!e||!window.speechSynthesis||(K.length>=wn&&K.shift(),K.push(e),window.speechSynthesis.speaking||he())}function he(){const e=K.shift();if(e===void 0)return;const t=new SpeechSynthesisUtterance(e);t.lang=k(me),t.onend=he,t.onerror=he,window.speechSynthesis.speak(t)}function Ae(e,{speak:t=!1}={}){const a=document.getElementById("segments");if(!a)return;const i=document.createElement("div");i.className=`khutbah-segment ${e.is_quran?"quran":""} ${e.degraded?"degraded":""}`,i.setAttribute("data-seq",e.seq),i.innerHTML=`
    ${e.arabic?`<div class="arabic">${e.arabic}</div>`:""}
    <div class="translation" style="font-size:var(--khutbah-fs, 1em);">${e.text||""}</div>
    ${e.is_quran&&e.quran_ref?`<div style="font-size:0.8em; color:var(--accent); margin-top:4px;">📖 ${e.quran_ref}</div>`:""}
    ${e.degraded?`<div style="font-size:0.75em; color:var(--warn);">⚠️ ${n("degraded","Mode dégradé")}</div>`:""}
  `,a.appendChild(i),a.scrollTop=a.scrollHeight,t&&kn(e.text)}const Sn=Object.freeze(Object.defineProperty({__proto__:null,renderKhutbah:$n},Symbol.toStringTag,{value:"Module"}));async function Tn(e){var r;const t=e==null?void 0:e.mosqueId;g(`
    <div class="card">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; margin-bottom:4px;">
        <h2 class="card-header" style="margin-bottom:0;">🕌 ${n("prayer_times","Horaires de prière")}</h2>
        <button class="btn btn-sm btn-gold" id="btn-use-my-position">📍 ${n("use_my_position","Utiliser ma position exacte")}</button>
      </div>
      <div id="prayer-source-note" style="font-size:.82em; color:var(--muted); margin-bottom:10px;"></div>
      <div id="prayer-mosque-wrap" class="form-group" style="display:none;">
        <label>${n("mosque","Mosquée")}</label>
        <select id="prayer-mosque"></select>
      </div>
      <div id="prayer-content" class="loading-center"><div class="spinner"></div></div>
    </div>

    <div id="mosque-location"></div>
  `);const a=new Date().toISOString().split("T")[0];let i=[],o=t,s=null;try{if(i=await u("/api/mosques",{auth:!1}),o||(o=((r=i==null?void 0:i[0])==null?void 0:r.id)||null),s=(i==null?void 0:i.find(l=>l.id===o))||(i==null?void 0:i[0])||null,i&&i.length>1){const l=document.getElementById("prayer-mosque-wrap"),d=document.getElementById("prayer-mosque");l.style.display="block",i.forEach(c=>{const p=document.createElement("option");p.value=c.id,p.textContent=c.name,p.selected=c.id===o,d.appendChild(p)}),d.onchange=()=>{location.hash=`#/prayer/${d.value}`}}await qn(o,a),An(s)}catch{xe(ge())}document.getElementById("btn-use-my-position").onclick=()=>Bn(o,a)}async function qn(e,t){let a,i=null;try{const o=localStorage.getItem("userGeo")||localStorage.getItem("prayerSet");o&&(i=JSON.parse(o))}catch{}try{i&&i.lat&&i.lng?(a=await u(`/api/prayer-times/${e||"geo"}?date=${t}&lat=${i.lat}&lng=${i.lng}`,{auth:!1}),ee("📍 "+n("times_for_your_position","Horaires calculés pour votre position exacte")+` (${(+i.lat).toFixed(3)}, ${(+i.lng).toFixed(3)})`)):(a=e?await u(`/api/prayer-times/${e}?date=${t}`,{auth:!1}):ge(),ee(null))}catch{a=ge(),ee(null)}xe(a)}function ee(e){const t=document.getElementById("prayer-source-note");t&&(t.textContent=e||"")}function Bn(e,t){const a=document.getElementById("btn-use-my-position");a.disabled=!0;const i=a.textContent;a.textContent="📡 "+n("locating","Localisation...");const o=async(s,r,l="")=>{try{localStorage.setItem("userGeo",JSON.stringify({lat:s,lng:r}));const d=await u(`/api/prayer-times/${e||"geo"}?date=${t}&lat=${s}&lng=${r}`,{auth:!1});xe(d),ee("📍 "+n("times_for_your_position","Horaires calculés pour votre position exacte")+(l?` ${l}`:"")+` (${s.toFixed(3)}, ${r.toFixed(3)})`),m(n("position_used","Position exacte utilisée"),"success")}catch{m(n("geolocation_unavailable","Géolocalisation non disponible"),"error")}finally{a.disabled=!1,a.textContent=i}};if(!navigator.geolocation){je(o,()=>{m(n("geolocation_unavailable","Géolocalisation non disponible"),"error"),a.disabled=!1,a.textContent=i});return}navigator.geolocation.getCurrentPosition(s=>{o(s.coords.latitude,s.coords.longitude)},()=>{je(o,()=>{m(n("geolocation_unavailable","Géolocalisation non disponible"),"error"),a.disabled=!1,a.textContent=i})},{timeout:1e4,enableHighAccuracy:!0})}function je(e,t){fetch("https://ipapi.co/json/").then(a=>a.ok?a.json():Promise.reject()).then(a=>{if(isFinite(+a.latitude)&&isFinite(+a.longitude)){const i=a.city?`(${a.city})`:"";e(+a.latitude,+a.longitude,`[IP ${i}]`)}else t()}).catch(t)}function Ln(e,t,a,i){const s=(a-e)*Math.PI/180,r=(i-t)*Math.PI/180,l=Math.sin(s/2)**2+Math.cos(e*Math.PI/180)*Math.cos(a*Math.PI/180)*Math.sin(r/2)**2;return 6371*2*Math.atan2(Math.sqrt(l),Math.sqrt(1-l))}function An(e){const t=document.getElementById("mosque-location");if(!t||!e||e.lat==null&&!e.address){t&&(t.innerHTML="");return}const a=e.lat!=null&&e.lng!=null?`https://www.google.com/maps/search/?api=1&query=${e.lat},${e.lng}`:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.address||e.name||"")}`;t.innerHTML=`
    <div class="card" style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
      <span class="icon-badge">📍</span>
      <div style="flex:1; min-width:180px;">
        <div style="font-weight:600;">${e.name||n("mosque_location","Localisation de la mosquée")}</div>
        ${e.address?`<div style="font-size:.85em; color:var(--muted);">${e.address}</div>`:""}
        <div id="mosque-distance" style="font-size:.85em; color:var(--accent); margin-top:2px;"></div>
      </div>
      <a class="btn btn-sm btn-secondary" href="${a}" target="_blank" rel="noopener">🗺️ ${n("get_directions","Itinéraire")}</a>
      ${e.lat!=null?`<button class="btn btn-sm btn-secondary" id="btn-locate-me">📡 ${n("locate_me","Me localiser")}</button>`:""}
    </div>
  `;const i=document.getElementById("btn-locate-me");i&&(i.onclick=()=>{if(!navigator.geolocation){m(n("geolocation_unavailable","Géolocalisation non disponible"),"error");return}i.disabled=!0,navigator.geolocation.getCurrentPosition(o=>{const s=Ln(o.coords.latitude,o.coords.longitude,e.lat,e.lng),r=document.getElementById("mosque-distance");r&&(r.textContent="📏 "+n("distance_away","à {km} km de vous").replace("{km}",s<1?s.toFixed(2):s.toFixed(1))),i.disabled=!1},()=>{m(n("geolocation_unavailable","Géolocalisation non disponible"),"error"),i.disabled=!1},{timeout:1e4})})}function ge(){return{date:new Date().toISOString().split("T")[0],fajr:{name:"Fajr",time:"05:30",type:"adhan"},sunrise:{name:"Sunrise",time:"07:15",type:"adhan"},dhuhr:{name:"Dhuhr",time:"13:00",type:"adhan"},asr:{name:"Asr",time:"16:30",type:"adhan"},maghrib:{name:"Maghrib",time:"19:45",type:"adhan"},isha:{name:"Isha",time:"21:15",type:"adhan"}}}function xe(e){var l;const t=document.getElementById("prayer-content");if(!t)return;t.className="";const a=new Date,i=a.getHours()*60+a.getMinutes(),s=[{key:"fajr",name:n("fajr","Fajr"),icon:"🌅"},{key:"sunrise",name:n("sunrise","Sunrise"),icon:"☀️"},{key:"dhuhr",name:n("dhuhr","Dhuhr"),icon:"🌤️"},{key:"asr",name:n("asr","Asr"),icon:"🌇"},{key:"maghrib",name:n("maghrib","Maghrib"),icon:"🌙"},{key:"isha",name:n("isha","Isha"),icon:"🌑"}].map(d=>{const c=e[d.key],p=(c==null?void 0:c.time)||c||"--:--",[v,$]=(typeof p=="string"?p:"--:--").split(":").map(Number);return{...d,time:p,min:Number.isFinite(v)&&Number.isFinite($)?v*60+$:null}});let r=null;for(const d of s)if(d.min!==null&&d.min>i){r=d.key;break}!r&&s.some(d=>d.min!==null)&&(r=s.find(d=>d.min!==null).key),t.innerHTML=`
    <div style="text-align:center; margin-bottom:16px; color:var(--muted);">${e.date||new Date().toISOString().split("T")[0]}</div>
    <div class="prayer-times-grid">
      ${s.map(d=>{var v;const c=d.key===r,p=((v=e[`${d.key}Iqama`])==null?void 0:v.time)||e[`${d.key}_iqama`]||null;return`
          <div class="prayer-card ${c?"active":""}">
            ${c?`<div style="font-size:.68em; color:var(--accent2); font-weight:700; letter-spacing:.05em; margin-bottom:2px;">${n("next_prayer","Prochaine prière").toUpperCase()}</div>`:""}
            <div class="name">${d.icon} ${d.name}</div>
            <div class="time">${d.time}</div>
            ${p?`<div class="type">${n("iqama","Iqama")}: ${p}</div>`:""}
          </div>
        `}).join("")}
    </div>

    ${e.jummahTime?`
      ${A("۞")}
      <div class="card card-accent" style="text-align:center;">
        <div class="name" style="font-weight:600;">🕌 Jumu'ah</div>
        <div class="time" style="font-size:1.4em; font-weight:700;">${((l=e.jummahTime)==null?void 0:l.time)||e.jummahTime}</div>
      </div>
    `:""}
  `}const jn=Object.freeze(Object.defineProperty({__proto__:null,renderPrayer:Tn},Symbol.toStringTag,{value:"Module"}));let D=[];function at(){try{return JSON.parse(localStorage.getItem("quran-favorites")||"[]")}catch{return[]}}function Mn(e){const t=at(),a=t.indexOf(e);return a>=0?t.splice(a,1):t.push(e),localStorage.setItem("quran-favorites",JSON.stringify(t)),t.includes(e)}function Pn(){try{return JSON.parse(localStorage.getItem("quran-last-read")||"null")}catch{return null}}function Cn(e,t){localStorage.setItem("quran-last-read",JSON.stringify({number:e,name:t,at:Date.now()}))}async function Nn(e){const t=e==null?void 0:e.number,a=e==null?void 0:e.ref;if(a){await Dn(a);return}if(t){await Hn(parseInt(t));return}await zn()}async function zn(){const e=Pn();g(`
    <div class="card">
      <h2 class="card-header">📖 ${n("quran","Coran")}</h2>

      ${e?`
        <a href="#/quran/surah/${e.number}" class="card card-link card-accent" style="display:flex; align-items:center; gap:12px; margin:0 0 16px; text-decoration:none; color:var(--fg);">
          <span class="icon-badge">📖</span>
          <div>
            <div style="font-size:.78em; color:var(--muted); text-transform:uppercase; letter-spacing:.05em;">${n("resume_reading","Reprendre la lecture")}</div>
            <div style="font-weight:600;">${e.name}</div>
          </div>
        </a>
      `:""}

      <div class="form-group">
        <input type="search" id="quran-search" placeholder="${n("search_surah","Rechercher une sourate...")}" />
      </div>
      <div id="surah-list" class="loading-center"><div class="spinner"></div></div>
    </div>
  `);try{D=await u("/api/quran/surahs",{auth:!1}),X(D)}catch(t){const a=document.getElementById("surah-list");a.className="",a.innerHTML=`<p style="color:var(--danger);">${t.message}</p>`}document.getElementById("quran-search").oninput=async t=>{const a=t.target.value.trim();if(a.length<2){X(D);return}const i=a.toLowerCase(),o=D.filter(r=>r.nameEnglish.toLowerCase().includes(i)||r.nameTransliteration.toLowerCase().includes(i)||r.nameArabic.includes(i)||String(r.number).includes(i));if(o.length){X(o);return}const s=document.getElementById("surah-list");s.innerHTML='<div class="loading-center"><div class="spinner"></div></div>';try{const r=await u(`/api/quran/search?q=${encodeURIComponent(a)}`,{auth:!1}),l=(r==null?void 0:r.results)||[];if(s.className="",!l.length){s.innerHTML=`<p style="color:var(--muted); text-align:center; padding:20px;">${n("no_results","Aucun résultat")}</p>`;return}s.innerHTML=l.map(d=>d.type==="verse"?`<a href="#/quran/verse/${d.ref}" class="card card-link" style="display:block; padding:12px; text-decoration:none; color:var(--fg); margin:0;">
             <div style="direction:rtl; text-align:right; font-family:var(--font-arabic); font-size:1.1em;">${d.text}</div>
             <div style="font-size:0.8em; color:var(--accent); margin-top:4px;">📖 ${d.ref}</div>
           </a>`:`<a href="#/quran/surah/${d.ref}" class="card card-link" style="display:block; padding:12px; text-decoration:none; color:var(--fg); margin:0;">
             <div style="font-weight:600;">📖 ${d.text}</div>
           </a>`).join("")}catch{X(D)}}}function X(e){const t=document.getElementById("surah-list");if(!t)return;t.className="";const a=at(),i=a.length?[...e].sort((o,s)=>(a.includes(s.number)?1:0)-(a.includes(o.number)?1:0)):e;t.innerHTML=`
    <div class="card-grid" style="gap:8px;">
      ${i.map(o=>`
        <div class="card card-link" style="display:flex; align-items:center; gap:8px; padding:12px; margin:0;">
          <a href="#/quran/surah/${o.number}" style="display:flex; align-items:center; gap:12px; flex:1; min-width:0; text-decoration:none; color:var(--fg);">
            <div style="width:36px; height:36px; border-radius:50%; background:var(--accent-grad); color:#fff; display:flex; align-items:center; justify-content:center; font-size:0.85em; font-weight:700; flex-shrink:0;">${o.number}</div>
            <div style="flex:1; min-width:0;">
              <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${o.nameTransliteration}</div>
              <div style="font-size:0.8em; color:var(--muted);">${o.nameEnglish} · ${o.totalAyahs} ayahs</div>
            </div>
            <div style="font-size:1.3em; color:var(--accent2); direction:rtl;">${o.nameArabic}</div>
          </a>
          <button class="icon-btn btn-fav" data-number="${o.number}" title="${n("favorite","Favori")}" aria-label="${n("favorite","Favori")}" aria-pressed="${a.includes(o.number)}">${a.includes(o.number)?"⭐":"☆"}</button>
        </div>
      `).join("")}
    </div>
  `,t.querySelectorAll(".btn-fav").forEach(o=>{o.onclick=s=>{s.preventDefault();const r=Number(o.dataset.number),l=Mn(r);o.textContent=l?"⭐":"☆",o.setAttribute("aria-pressed",String(l))}})}async function Hn(e){g(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/quran" class="btn btn-sm btn-secondary">←</a>
      <h2 style="flex:1;" id="surah-title"><div class="spinner"></div></h2>
      <button class="btn btn-sm btn-secondary" id="btn-play-all">▶ ${n("play_all","Tout écouter")}</button>
    </div>
    <div id="surah-content" class="loading-center"><div class="spinner"></div></div>
    <audio id="ayah-audio" style="width:100%; margin-top:12px; display:none;" controls></audio>
  `);try{const t=await u(`/api/quran/surahs/${e}`,{auth:!1});document.getElementById("surah-title").textContent=`${t.nameTransliteration} — ${t.nameEnglish}`,Cn(e,`${t.nameTransliteration} — ${t.nameEnglish}`);const a=document.getElementById("surah-content");a.className="",a.innerHTML=`
      <div style="text-align:center; font-size:1.8em; color:var(--accent2); direction:rtl; font-family:var(--font-arabic); margin-bottom:24px; line-height:1.8;">
        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
      </div>
      ${(t.ayahs||[]).map(o=>`
        <div class="ayah" id="ayah-${o.ayahNumber}">
          <div class="arabic">${o.textArabic} <span class="ref">(${o.ayahNumber})</span></div>
          ${o.translation?`<div class="translation">${o.translation}</div>`:""}
          <div style="display:flex; gap:8px; margin-top:6px;">
            <button class="btn btn-sm btn-secondary btn-play-ayah" data-ayah="${o.ayahNumber}">▶ ${n("listen","Écouter")}</button>
            <button class="btn btn-sm btn-secondary btn-tts-ayah" data-ayah="${o.ayahNumber}" data-ref="${e}:${o.ayahNumber}">🔊 ${n("read_aloud","Lire")}</button>
          </div>
        </div>
      `).join("")}
    `;const i=document.getElementById("ayah-audio");a.querySelectorAll(".btn-play-ayah").forEach(o=>{o.onclick=()=>{const s=r=>String(r).padStart(3,"0");i.src=`https://everyayah.com/data/Alafasy_128kbps/${s(e)}${s(Number(o.dataset.ayah))}.mp3`,i.style.display="block",i.play()}}),a.querySelectorAll(".btn-tts-ayah").forEach(o=>{o.onclick=()=>it(o.dataset.ref)}),document.getElementById("btn-play-all").onclick=()=>{const o=s=>String(s).padStart(3,"0");i.src=`https://everyayah.com/data/Alafasy_128kbps/${o(e)}001.mp3`,i.style.display="block",i.play()}}catch(t){const a=document.getElementById("surah-content");a.className="",a.innerHTML=`<p style="color:var(--danger);">${t.message}</p>`}}async function Dn(e){var t,a,i,o;g(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/quran" class="btn btn-sm btn-secondary">←</a>
      <h2 style="flex:1;">📖 Sourate ${e}</h2>
    </div>
    <div id="verse-content" class="loading-center"><div class="spinner"></div></div>
    <audio id="verse-audio" style="width:100%; margin-top:12px; display:none;" controls></audio>
  `);try{const s=await u(`/api/quran/verse/${e}`,{auth:!1}),r=document.getElementById("verse-content");r.className="";const l=e.split(/[:.]/)[0],d=e.split(/[:.]/)[1];r.innerHTML=`
      <div class="card">
        <div style="text-align:center; margin-bottom:8px; color:var(--muted);">${((t=s.surah)==null?void 0:t.nameTransliteration)||""} — Ayah ${((a=s.ayah)==null?void 0:a.ayahNumber)||""}</div>
        <div class="ayah">
          <div class="arabic" style="font-size:1.6em; line-height:2;">${((i=s.ayah)==null?void 0:i.textArabic)||""}</div>
          ${(o=s.ayah)!=null&&o.translation?`<div class="translation" style="font-size:1.1em;">${s.ayah.translation}</div>`:""}
        </div>
        <div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap;">
          <button class="btn btn-primary" id="btn-play">▶ ${n("listen","Écouter")}</button>
          <button class="btn btn-secondary" id="btn-tts">🔊 ${n("read_aloud","Lire")}</button>
        </div>
      </div>
    `;const c=document.getElementById("verse-audio");document.getElementById("btn-play").onclick=()=>{const p=v=>String(v).padStart(3,"0");c.src=`https://everyayah.com/data/Alafasy_128kbps/${p(Number(l))}${p(Number(d))}.mp3`,c.style.display="block",c.play()},document.getElementById("btn-tts").onclick=()=>it(e)}catch(s){const r=document.getElementById("verse-content");r.className="",r.innerHTML=`<p style="color:var(--danger);">${s.message}</p>`}}function it(e){if(!("speechSynthesis"in window)){m(n("tts_unsupported","Lecture vocale non supportée"),"error");return}u(`/api/quran/verse/${e}`,{auth:!1}).then(t=>{var o,s,r;const a=((o=t==null?void 0:t.ayah)==null?void 0:o.translation)||((s=t==null?void 0:t.ayah)==null?void 0:s.textArabic)||"";if(!a)return;window.speechSynthesis.cancel();const i=new SpeechSynthesisUtterance(a);i.lang=(r=t==null?void 0:t.ayah)!=null&&r.translation?k():"ar-SA",i.rate=.95,window.speechSynthesis.speak(i)}).catch(()=>m(n("tts_failed","Impossible de lire ce verset"),"error"))}const On=Object.freeze(Object.defineProperty({__proto__:null,renderQuran:Nn},Symbol.toStringTag,{value:"Module"}));async function Rn(e){var c,p,v;const t=new Date,a=new Intl.DateTimeFormat(k(),{day:"numeric",month:"long",year:"numeric"}).format(t);let i="",o=null;const s=await u("/api/hijri",{auth:!1}).catch(()=>null);if(s!=null&&s.hijri){const $=M()==="ar",b=$?s.hijri.monthNameAr:s.hijri.monthNameFr;i=$?`${s.hijri.day} ${b} ${s.hijri.year} هـ`:`${s.hijri.day} ${b} ${s.hijri.year} AH`,s.hijri.month===9&&(i+=` · ${n("ramadan","Ramadan")}`,o=s.hijri.day)}let r=null;try{const $=await u("/api/mosques",{auth:!1}),b=(c=$==null?void 0:$[0])==null?void 0:c.id;if(b){const h=new Date().toISOString().split("T")[0];r=await u(`/api/prayer-times/${b}?date=${h}`,{auth:!1})}}catch{r=null}const l=((p=r==null?void 0:r.fajr)==null?void 0:p.time)||"--:--",d=((v=r==null?void 0:r.maghrib)==null?void 0:v.time)||"--:--";g(`
    <div class="hero-mosque" style="padding-top:24px;">
      <div style="font-size:3em;">🌙</div>
      ${o?`<div class="badge-live live" style="display:inline-block; margin:8px 0 2px;">${n("ramadan_day","Jour")} ${o}</div>`:""}
      <h2 style="margin:8px 0 4px;">${n("ramadan","Ramadan")}</h2>
      <p style="color:var(--muted);">${a}</p>
      ${i?`<p style="color:var(--accent2); font-weight:600;">${i}</p>`:""}
    </div>

    ${A("✦ ✦ ✦")}

    <div class="card-grid">
      <div class="card card-accent">
        <h3 class="card-header">🌅 ${n("fajr","Fajr")}</h3>
        <div style="font-size:2em; font-weight:700; text-align:center;">${l}</div>
        <div style="text-align:center; color:var(--muted); font-size:0.9em;">${n("dawn_prayer","Prière de l'aube")}</div>
      </div>

      <div class="card card-accent">
        <h3 class="card-header">🌇 ${n("maghrib","Maghrib")}</h3>
        <div style="font-size:2em; font-weight:700; text-align:center;">${d}</div>
        <div style="text-align:center; color:var(--muted); font-size:0.9em;">${n("iftar","Iftar")}</div>
      </div>

      <div class="card">
        <h3 class="card-header">🌙 ${n("tarawih","Tarawih")}</h3>
        <div style="font-size:2em; font-weight:700; text-align:center;">21:30</div>
        <div style="text-align:center; color:var(--muted); font-size:0.9em;">${n("night_prayer","Prière de la nuit")} · <em>${n("indicative","indicatif")}</em></div>
      </div>

      <div class="card">
        <h3 class="card-header">📖 ${n("juz_of_day","Juz du jour")}</h3>
        <div style="font-size:1.1em; text-align:center; color:var(--accent);">${n("juz_info","Consultez le programme de la mosquée")}</div>
      </div>
    </div>
  `)}const Fn=Object.freeze(Object.defineProperty({__proto__:null,renderRamadan:Rn},Symbol.toStringTag,{value:"Module"}));async function Kn(){g(`
    <div class="card" style="text-align:center; padding:30px;">
      <div style="font-size:3em;">🤲</div>
      <h2 style="margin:12px 0;">${n("donate","Faire un don")}</h2>
      <p style="color:var(--muted); margin-bottom:20px;">${n("donate_subtitle","Votre soutien est essentiel pour la vie de la mosquée. Qu'Allah vous récompense.")}</p>
      <div id="donation-content" class="loading-center"><div class="spinner"></div></div>
    </div>
  `);let e="";try{const t=await u("/api/settings/public",{auth:!1});e=(t==null?void 0:t.name)||"";const a=(t==null?void 0:t.donation)||{},i=a.paypal||a.iban||a.text,o=document.getElementById("donation-content");o.className="",o.innerHTML=`
      ${a.title?`<h3 style="color:var(--accent); margin-bottom:12px;">${a.title}</h3>`:""}

      ${a.iban?`
        <div class="card" style="background:var(--bg2); text-align:left;">
          <div style="font-weight:600; margin-bottom:6px;">🏦 ${n("bank_transfer","Virement bancaire")}</div>
          <div style="font-family:monospace; font-size:1.05em; word-break:break-all;">${a.iban}</div>
          ${a.bankName?`<div style="color:var(--muted); font-size:0.85em; margin-top:4px;">${a.bankName}</div>`:""}
          <button class="btn btn-sm btn-secondary" id="copy-iban" style="margin-top:12px;">📋 ${n("copy","Copier")}</button>
        </div>
      `:""}

      ${a.paypal?`
        <a class="btn btn-primary btn-block" style="margin:8px 0;" href="${a.paypal}" target="_blank" rel="noopener">
          💳 PayPal ${n("donate","— Faire un don")}
        </a>
      `:""}

      ${a.text?`
        <div class="card" style="text-align:center;">
          <div style="font-size:0.9em; color:var(--muted); margin-bottom:8px;">${a.text}</div>
          <button class="btn btn-sm btn-secondary" id="copy-text" style="cursor:pointer;">📋 ${n("copy","Copier")}</button>
        </div>
      `:""}

      ${i?`
        <div style="margin-top:16px;">
          ${a.paypal||a.iban?`
            <img src="${ne}/api/qr.png?text=${encodeURIComponent(a.paypal||a.iban)}&size=9"
                 style="width:180px; background:#fff; padding:8px; border-radius:12px;"
                 alt="QR don" />
            <div style="color:var(--muted); font-size:0.85em; margin-top:6px;">${n("donate_qr_hint","Scannez avec l'appareil photo de votre téléphone")}</div>
          `:""}
        </div>
      `:`
        <p style="color:var(--muted); font-size:0.9em; margin-top:8px;">
          ${n("donate_contact","Contactez la mosquée pour connaître les moyens de soutien.")}
        </p>
      `}
    `;const s=document.getElementById("copy-iban");s&&(s.onclick=()=>{var l;(l=navigator.clipboard)==null||l.writeText(a.iban).then(()=>m(n("copied","Copié"),"success"))});const r=document.getElementById("copy-text");r&&(r.onclick=()=>{var l;(l=navigator.clipboard)==null||l.writeText(a.text||"").then(()=>m(n("copied","Copié"),"success"))})}catch{const t=document.getElementById("donation-content");t.className="",t.innerHTML=`<p style="color:var(--muted);">${n("donate_contact","Contactez la mosquée pour connaître les moyens de soutien.")}</p>`}if(e){const t=document.querySelector("#main h2");t&&(t.textContent+=` — ${e}`)}}const Un=Object.freeze(Object.defineProperty({__proto__:null,renderSupport:Kn},Symbol.toStringTag,{value:"Module"}));
