(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function a(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(o){if(o.ep)return;o.ep=!0;const s=a(o);fetch(o.href,s)}})();const et="modulepreload",tt=function(e,n){return new URL(e,n).href},ye={},_=function(n,a,i){let o=Promise.resolve();if(a&&a.length>0){const r=document.getElementsByTagName("link"),l=document.querySelector("meta[property=csp-nonce]"),c=(l==null?void 0:l.nonce)||(l==null?void 0:l.getAttribute("nonce"));o=Promise.allSettled(a.map(d=>{if(d=tt(d,i),d in ye)return;ye[d]=!0;const p=d.endsWith(".css"),y=p?'[rel="stylesheet"]':"";if(!!i)for(let g=r.length-1;g>=0;g--){const f=r[g];if(f.href===d&&(!p||f.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${d}"]${y}`))return;const b=document.createElement("link");if(b.rel=p?"stylesheet":et,p||(b.as="script"),b.crossOrigin="",b.href=d,c&&b.setAttribute("nonce",c),document.head.appendChild(b),p)return new Promise((g,f)=>{b.addEventListener("load",g),b.addEventListener("error",()=>f(new Error(`Unable to preload CSS for ${d}`)))})}))}function s(r){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=r,window.dispatchEvent(l),!l.defaultPrevented)throw r}return o.then(r=>{for(const l of r||[])l.status==="rejected"&&s(l.reason);return n().catch(s)})},qe=[];function v(e,n,a={}){const i=[],o=e.replace(/:([^/]+)/g,(s,r)=>(i.push(r),"([^/]+)"));qe.push({pattern:e,regex:new RegExp(`^${o}$`),paramNames:i,handler:n,meta:a})}function nt(e){location.hash=`#${e}`}function at(e){const n=e.replace(/^#/,"")||"/";for(const a of qe){const i=n.match(a.regex);if(i){const o={};return a.paramNames.forEach((s,r)=>{o[s]=i[r+1]}),{route:a,params:o,path:n}}}return null}async function ve(){const e=location.hash||"#/",n=at(e);if(!n){document.getElementById("main").innerHTML=`
      <div style="text-align:center; padding:60px 20px;">
        <div style="font-size:3em; margin-bottom:16px;">🕌</div>
        <h2>404 — Page not found</h2>
        <p style="color:var(--muted); margin:12px 0;">This page doesn't exist.</p>
        <a href="#/" class="btn btn-primary">← Home</a>
      </div>`;return}await n.route.handler(n.params),it(n.path)}function it(e){document.querySelectorAll("#main-nav a, #mobile-nav a").forEach(n=>{var i;const a=((i=n.getAttribute("href"))==null?void 0:i.replace("#",""))||"";n.classList.toggle("active",e.startsWith(a)&&a!=="/")})}function ot(){window.addEventListener("hashchange",ve),ve()}const A={ar:{dir:"rtl",label:"العربية",tag:"ar-SA"},fr:{dir:"ltr",label:"Français",tag:"fr-FR"},en:{dir:"ltr",label:"English",tag:"en-US"},nl:{dir:"ltr",label:"Nederlands",tag:"nl-NL"},de:{dir:"ltr",label:"Deutsch",tag:"de-DE"},es:{dir:"ltr",label:"Español",tag:"es-ES"},tr:{dir:"ltr",label:"Türkçe",tag:"tr-TR"},ur:{dir:"rtl",label:"اردو",tag:"ur-PK"},bn:{dir:"ltr",label:"বাংলা",tag:"bn-BD"},ha:{dir:"ltr",label:"Hausa",tag:"ha-NG"},wo:{dir:"ltr",label:"Wolof",tag:"fr-FR"},it:{dir:"ltr",label:"Italiano",tag:"it-IT"},pt:{dir:"ltr",label:"Português",tag:"pt-PT"},id:{dir:"ltr",label:"Bahasa Indonesia",tag:"id-ID"}};let k=localStorage.getItem("uiLang")||"fr",Ae={},Q={};function F(){return k}function Be(e){return A[e]}function Le(){return Object.keys(A)}function S(e=k){var n;return((n=A[e])==null?void 0:n.tag)||"fr-FR"}async function je(e){A[e]&&(k=e,localStorage.setItem("uiLang",e),Q[e]||await Me(e),Pe(),document.documentElement.lang=e,document.documentElement.dir=A[e].dir,window.dispatchEvent(new CustomEvent("language-changed",{detail:{lang:e}})))}async function Me(e){try{const n=await fetch(`../lang/${e}.json`);n.ok&&(Ae[e]=await n.json(),Q[e]=!0)}catch{}Q[e]=Q[e]||!0}function t(e,n){var i;return((i=Ae[k])==null?void 0:i[e])||n||e}function Pe(){document.querySelectorAll("[data-i18n]").forEach(e=>{const n=e.getAttribute("data-i18n"),a=t(n);a!==n&&(e.textContent=a)}),document.querySelectorAll("[data-i18n-placeholder]").forEach(e=>{const n=e.getAttribute("data-i18n-placeholder"),a=t(n);a!==n&&(e.placeholder=a)})}async function st(){await Me(k),Pe(),document.documentElement.lang=k,A[k]&&(document.documentElement.dir=A[k].dir)}function Ce(e){e==="auto"?(localStorage.removeItem("theme"),document.documentElement.removeAttribute("data-theme")):(localStorage.setItem("theme",e),document.documentElement.setAttribute("data-theme",e))}function rt(){Ce(Ne()?"light":"dark")}function Ne(){const e=document.documentElement.getAttribute("data-theme");return e==="dark"||!e&&matchMedia("(prefers-color-scheme: dark)").matches}function lt(e){e?(localStorage.setItem("contrast","high"),document.documentElement.setAttribute("data-contrast","high")):(localStorage.removeItem("contrast"),document.documentElement.removeAttribute("data-contrast"))}function ct(e){e?(localStorage.setItem("senior-mode","true"),document.documentElement.setAttribute("data-senior","true")):(localStorage.removeItem("senior-mode"),document.documentElement.removeAttribute("data-senior"))}function dt(){const e=localStorage.getItem("theme");e&&document.documentElement.setAttribute("data-theme",e),localStorage.getItem("contrast")==="high"&&document.documentElement.setAttribute("data-contrast","high"),localStorage.getItem("senior-mode")==="true"&&document.documentElement.setAttribute("data-senior","true")}var Te;const ze=((Te=window.__CONFIG__)==null?void 0:Te.BACKEND_URL)||void 0||(location.hostname==="localhost"?"http://localhost:8000":location.origin),X=ze;let T=localStorage.getItem("accessToken")||"",O=localStorage.getItem("refreshToken")||"",R=null;function ut(e){R=e}function Z(){return!!T}function mt(e,n){T=e,O=n,localStorage.setItem("accessToken",e),localStorage.setItem("refreshToken",n),R&&R(!0)}function pt(){T="",O="",localStorage.removeItem("accessToken"),localStorage.removeItem("refreshToken"),R&&R(!1)}async function gt(){if(!O)return!1;try{const e=await fetch(`${X}/api/auth/refresh`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refreshToken:O})});return e.ok?(T=(await e.json()).accessToken,localStorage.setItem("accessToken",T),!0):(pt(),!1)}catch{return!1}}async function u(e,n={}){const{method:a="GET",body:i,headers:o={},auth:s=!0}=n,r=e.startsWith("http")?e:`${X}${e}`,l={...o};s&&T&&(l.Authorization=`Bearer ${T}`),i&&!(i instanceof FormData)&&(l["Content-Type"]="application/json");let c=await fetch(r,{method:a,headers:l,body:i instanceof FormData?i:i?JSON.stringify(i):void 0});if(c.status===401&&s&&O&&await gt()&&(l.Authorization=`Bearer ${T}`,c=await fetch(r,{method:a,headers:l,body:i instanceof FormData?i:i?JSON.stringify(i):void 0})),!c.ok){const p=await c.json().catch(()=>({error:c.statusText}));throw new Error(p.error||`HTTP ${c.status}`)}const d=c.headers.get("content-type")||"";return d.includes("application/json")?c.json():d.includes("image/")?c.blob():c.text()}function m(e,n="info",a=4e3){const i=document.getElementById("toast-container"),o=document.createElement("div");o.className=`toast toast-${n}`,o.textContent=e,i.appendChild(o),setTimeout(()=>{o.style.opacity="0",setTimeout(()=>o.remove(),300)},a)}function h(e){const n=document.getElementById("main");typeof e=="string"?n.innerHTML=e:e instanceof HTMLElement&&(n.innerHTML="",n.appendChild(e)),n.classList.remove("page-enter"),n.offsetWidth,n.classList.add("page-enter")}function B(e="۞"){return`<div class="ornament" aria-hidden="true">${e}</div>`}let q=null,Y=!1;function ue(){var e;return((e=window.matchMedia)==null?void 0:e.call(window,"(display-mode: standalone)").matches)||window.navigator.standalone===!0}function De(){return/iphone|ipad|ipod/i.test(navigator.userAgent)&&!window.MSStream}function He(){return!!q&&!Y&&!ue()}function ht(){return De()&&!Y&&!ue()}function yt(){return He()||ht()}async function vt(){if(!q)return"unavailable";q.prompt();const{outcome:e}=await q.userChoice;return q=null,window.dispatchEvent(new CustomEvent("pwa-installable-changed")),e}function ft(){ue()&&(Y=!0),window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),q=e,window.dispatchEvent(new CustomEvent("pwa-installable-changed"))}),window.addEventListener("appinstalled",()=>{Y=!0,q=null,window.dispatchEvent(new CustomEvent("pwa-installable-changed"))})}ft();const bt=Object.assign({"../modules/admin/index.js":()=>_(()=>Promise.resolve().then(()=>Pt),void 0,import.meta.url),"../modules/announcements/index.js":()=>_(()=>Promise.resolve().then(()=>zt),void 0,import.meta.url),"../modules/auth/index.js":()=>_(()=>Promise.resolve().then(()=>Ht),void 0,import.meta.url),"../modules/display/index.js":()=>_(()=>Promise.resolve().then(()=>Rt),void 0,import.meta.url),"../modules/events/index.js":()=>_(()=>Promise.resolve().then(()=>Gt),void 0,import.meta.url),"../modules/home/index.js":()=>_(()=>Promise.resolve().then(()=>Zt),void 0,import.meta.url),"../modules/imam/index.js":()=>_(()=>Promise.resolve().then(()=>rn),void 0,import.meta.url),"../modules/khutbah/index.js":()=>_(()=>Promise.resolve().then(()=>gn),void 0,import.meta.url),"../modules/prayer/index.js":()=>_(()=>Promise.resolve().then(()=>xn),void 0,import.meta.url),"../modules/quran/index.js":()=>_(()=>Promise.resolve().then(()=>Tn),void 0,import.meta.url),"../modules/ramadan/index.js":()=>_(()=>Promise.resolve().then(()=>An),void 0,import.meta.url),"../modules/support/index.js":()=>_(()=>Promise.resolve().then(()=>Ln),void 0,import.meta.url)});async function w(e){const n=bt[`../modules/${e}.js`];if(!n)throw new Error(`Module introuvable: ${e}`);return n()}async function xt(){const{renderHome:e}=await w("home/index");await e()}async function Oe(e){const{renderPrayer:n}=await w("prayer/index");await n(e)}async function me(e){const{renderQuran:n}=await w("quran/index");await n(e)}async function Re(e){const{renderKhutbah:n}=await w("khutbah/index");await n(e)}async function $t(e){const{renderAnnouncements:n}=await w("announcements/index");await n(e)}async function _t(e){const{renderEvents:n}=await w("events/index");await n(e)}async function wt(e){const{renderRamadan:n}=await w("ramadan/index");await n(e)}async function It(){const{renderSupport:e}=await w("support/index");await e()}async function Fe(e){const{renderAdmin:n}=await w("admin/index");await n(e)}async function Ke(e){const{renderImam:n}=await w("imam/index");await n(e)}async function Ue(e){const{renderAuth:n}=await w("auth/index");await n(e)}async function Ve(e){const{renderDisplay:n}=await w("display/index");await n(e)}async function Et(){h(`
    <div class="card">
      <h2 class="card-header">⚙️ ${t("settings","Paramètres")}</h2>

      <div class="form-group">
        <label>${t("language","Langue")}</label>
        <select id="settings-lang">
          ${Le().map(e=>{var n;return`<option value="${e}" ${e===F()?"selected":""}>${((n=Be(e))==null?void 0:n.label)||e}</option>`}).join("")}
        </select>
      </div>

      <div class="form-group">
        <label>${t("theme","Thème")}</label>
        <select id="settings-theme">
          <option value="auto" ${localStorage.getItem("theme")?"":"selected"}>${t("auto","Automatique")}</option>
          <option value="dark" ${localStorage.getItem("theme")==="dark"?"selected":""}>${t("dark","Sombre")}</option>
          <option value="light" ${localStorage.getItem("theme")==="light"?"selected":""}>${t("light","Clair")}</option>
        </select>
      </div>

      <div class="form-group">
        <label>${t("accessibility","Accessibilité")}</label>
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <input type="checkbox" id="senior-mode" ${localStorage.getItem("senior-mode")==="true"?"checked":""} />
          ${t("senior_mode","Mode senior (gros texte)")}
        </label>
        <label style="display:flex;align-items:center;gap:8px;">
          <input type="checkbox" id="high-contrast" ${localStorage.getItem("contrast")==="high"?"checked":""} />
          ${t("high_contrast","Contraste élevé")}
        </label>
      </div>

      <button class="btn btn-secondary" id="settings-clear" style="margin-top:16px;">${t("clear_cache","Vider le cache")}</button>
    </div>
  `),document.getElementById("settings-lang").onchange=e=>je(e.target.value),document.getElementById("settings-theme").onchange=e=>Ce(e.target.value),document.getElementById("senior-mode").onchange=e=>ct(e.target.checked),document.getElementById("high-contrast").onchange=e=>lt(e.target.checked),document.getElementById("settings-clear").onclick=()=>{caches&&caches.keys().then(e=>e.forEach(n=>caches.delete(n))),m(t("cache_cleared","Cache vidé"),"success")}}v("/",xt);v("/prayer",Oe);v("/prayer/:mosqueId",Oe);v("/quran",me);v("/quran/surah/:number",me);v("/quran/verse/:ref",me);v("/khutbah",Re);v("/khutbah/:code",Re);v("/announcements",$t);v("/events",_t);v("/ramadan",wt);v("/support",It);v("/admin",Fe);v("/admin/:mosqueId",Fe);v("/imam",Ke);v("/imam/:code",Ke);v("/auth",Ue);v("/auth/:action",Ue);v("/display",Ve);v("/display/:mosqueId",Ve);v("/settings",Et);function ee(){const e=[{href:"#/",icon:"🏠",label:t("home","Accueil")},{href:"#/prayer",icon:"🕌",label:t("prayers","Prières")},{href:"#/quran",icon:"📖",label:t("quran","Coran")},{href:"#/khutbah",icon:"🎙️",label:t("khutbah_live","Khutbah Live")},{href:"#/announcements",icon:"📢",label:t("announcements","Annonces")},{href:"#/events",icon:"📅",label:t("events","Événements")},{href:"#/settings",icon:"⚙️",label:t("settings","Paramètres")}],n=document.getElementById("main-nav"),a=document.getElementById("mobile-nav");n.innerHTML=e.filter((i,o)=>o<5).map(i=>`<a href="${i.href}">${i.icon} ${i.label}</a>`).join(""),a.innerHTML=e.map(i=>`<a href="${i.href}"><span class="icon">${i.icon}</span>${i.label}</a>`).join("")}let V=null;function fe(){const e=new Date,n=String(e.getHours()).padStart(2,"0"),a=String(e.getMinutes()).padStart(2,"0"),i=String(e.getSeconds()).padStart(2,"0"),o=document.querySelector(".hc-h"),s=document.querySelector(".hc-m"),r=document.querySelector(".hc-s"),l=document.querySelector(".hc-date");if(o&&(o.textContent=n,s.textContent=a,r.textContent=i,l))try{l.textContent=new Intl.DateTimeFormat(S(),{weekday:"long",day:"numeric",month:"long"}).format(e)}catch{l.textContent=e.toLocaleDateString()}}function be(){V&&clearTimeout(V),fe();const e=1e3-Date.now()%1e3;V=setTimeout(function n(){fe(),V=setTimeout(n,1e3-Date.now()%1e3)},e)}function kt(){be(),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&be()})}function xe(){const e=document.getElementById("theme-toggle");e&&(e.textContent=Ne()?"☀️":"🌙")}function $e(){const e=document.getElementById("theme-toggle");e&&(e.onclick=()=>{rt(),xe()}),xe();const n=document.getElementById("lang-quick");n&&(n.innerHTML=Le().map(a=>{var i;return`<option value="${a}" ${a===F()?"selected":""}>${((i=Be(a))==null?void 0:i.label)||a}</option>`}).join(""),n.onchange=a=>je(a.target.value))}async function St(){dt(),await st(),ee(),$e(),kt(),ut(()=>ee()),window.addEventListener("language-changed",()=>{ee(),$e(),window.dispatchEvent(new HashChangeEvent("hashchange"))}),ot()}St().catch(e=>{console.error("App init failed:",e),h(`<div style="text-align:center;padding:60px;"><h2>⚠️ Initialization Error</h2><p>${e.message}</p></div>`)});"serviceWorker"in navigator&&navigator.serviceWorker.register("./sw.js").catch(()=>{});async function Tt(e){if(!Z()){h(`
      <div class="card" style="max-width:420px; margin:40px auto; text-align:center;">
        <h2>🧑‍💼 ${t("admin","Administration")}</h2>
        <p style="color:var(--muted); margin:12px 0;">${t("login_required","Connexion requise")}</p>
        <a href="#/auth/login" class="btn btn-primary">${t("login","Se connecter")}</a>
      </div>
    `);return}switch((e==null?void 0:e.view)||(e==null?void 0:e.mosqueId)){case"mosques":return qt();case"users":return At();case"sessions":return Bt();case"analytics":return Lt();case"settings":return jt();case"announcements":return Mt()}h(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/" class="btn btn-sm btn-secondary">←</a>
      <h2>🧑‍💼 ${t("admin_dashboard","Tableau de bord")}</h2>
    </div>

    <div class="card-grid">
      <a href="#/admin/mosques" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">🕌</span>
        <div><div style="font-weight:600;">${t("mosques","Mosquées")}</div><div style="font-size:0.85em; color:var(--muted);">${t("manage_mosques","Gérer les mosquées")}</div></div>
      </a>

      <a href="#/admin/users" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">👥</span>
        <div><div style="font-weight:600;">${t("users","Utilisateurs")}</div><div style="font-size:0.85em; color:var(--muted);">${t("manage_users","Gérer les rôles")}</div></div>
      </a>

      <a href="#/admin/sessions" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">🎙️</span>
        <div><div style="font-weight:600;">${t("sessions","Sessions")}</div><div style="font-size:0.85em; color:var(--muted);">${t("session_history","Historique des khutbahs")}</div></div>
      </a>

      <a href="#/admin/analytics" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">📊</span>
        <div><div style="font-weight:600;">${t("analytics","Statistiques")}</div><div style="font-size:0.85em; color:var(--muted);">${t("view_stats","Voir les statistiques")}</div></div>
      </a>

      <a href="#/admin/settings" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">⚙️</span>
        <div><div style="font-weight:600;">${t("settings","Paramètres")}</div><div style="font-size:0.85em; color:var(--muted);">${t("mosque_config","Configuration de la mosquée")}</div></div>
      </a>

      <a href="#/admin/announcements" class="card" style="cursor:pointer; text-decoration:none; color:var(--fg); display:flex; gap:12px; align-items:center;">
        <span style="font-size:2em;">📢</span>
        <div><div style="font-weight:600;">${t("announcements","Annonces")}</div><div style="font-size:0.85em; color:var(--muted);">${t("create_announcement","Créer une annonce")}</div></div>
      </a>
    </div>
  `)}async function qt(){h(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/admin" class="btn btn-sm btn-secondary">← ${t("back_to_dashboard","Retour au tableau de bord")}</a>
      <h2>🕌 ${t("mosques","Mosquées")}</h2>
    </div>
    <div id="mosques-list"><div class="loading-center"><div class="spinner"></div></div></div>

    <div class="card" style="max-width:500px; margin-top:16px;">
      <h3 class="card-header">➕ ${t("create_mosque","Nouvelle mosquée")}</h3>
      <div class="form-group">
        <label>${t("name","Nom")}</label>
        <input type="text" id="mosque-name" placeholder="${t("mosque_name","Nom de la mosquée")}" />
      </div>
      <div class="form-group">
        <label>${t("city","Ville")}</label>
        <input type="text" id="mosque-city" placeholder="${t("city_name","Ville")}" />
      </div>
      <div class="form-group">
        <label>${t("latitude","Latitude")}</label>
        <input type="number" step="any" id="mosque-lat" placeholder="48.8566" />
      </div>
      <div class="form-group">
        <label>${t("longitude","Longitude")}</label>
        <input type="number" step="any" id="mosque-lng" placeholder="2.3522" />
      </div>
      <button class="btn btn-primary btn-block" id="create-mosque">${t("create","Créer")}</button>
    </div>
  `);async function e(){const n=document.getElementById("mosques-list");try{const a=await u("/api/mosques");if(!a.length){n.innerHTML=`<div class="card" style="text-align:center; color:var(--muted); padding:24px;">${t("no_mosques","Aucune mosquée")}</div>`;return}n.innerHTML=`<div class="card-grid">${a.map(i=>`
        <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:600;">🕌 ${i.name}</div>
            <div style="font-size:0.85em; color:var(--muted);">📍 ${i.city||"—"}</div>
          </div>
          <button class="btn btn-danger btn-sm delete-mosque" data-id="${i.id}">🗑️</button>
        </div>
      `).join("")}</div>`,n.querySelectorAll(".delete-mosque").forEach(i=>{i.onclick=async()=>{if(confirm(t("confirm_delete","Supprimer cette mosquée ?")))try{await u(`/api/mosques/${i.dataset.id}`,{method:"DELETE"}),m(t("deleted","Supprimé"),"success"),e()}catch(o){m(o.message,"error")}}})}catch(a){n.innerHTML=`<div class="card" style="color:var(--danger);">${a.message}</div>`}}e(),document.getElementById("create-mosque").onclick=async()=>{const n=document.getElementById("mosque-name").value.trim(),a=document.getElementById("mosque-city").value.trim(),i=parseFloat(document.getElementById("mosque-lat").value)||null,o=parseFloat(document.getElementById("mosque-lng").value)||null;if(!n){m(t("name_required","Nom requis"),"error");return}try{await u("/api/mosques",{method:"POST",body:{name:n,city:a,latitude:i,longitude:o}}),m(t("mosque_created","Mosquée créée"),"success"),document.getElementById("mosque-name").value="",document.getElementById("mosque-city").value="",document.getElementById("mosque-lat").value="",document.getElementById("mosque-lng").value="",e()}catch(s){m(s.message,"error")}}}async function At(){h(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/admin" class="btn btn-sm btn-secondary">← ${t("back_to_dashboard","Retour au tableau de bord")}</a>
      <h2>👥 ${t("users","Utilisateurs")}</h2>
    </div>
    <div id="users-list"><div class="loading-center"><div class="spinner"></div></div></div>
  `);const e=document.getElementById("users-list");try{const n=await u("/api/admin/users");if(!n.length){e.innerHTML=`<div class="card" style="text-align:center; color:var(--muted); padding:24px;">${t("no_users","Aucun utilisateur")}</div>`;return}e.innerHTML=`
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="text-align:left; border-bottom:2px solid var(--line);">
              <th style="padding:10px 12px;">${t("name","Nom")}</th>
              <th style="padding:10px 12px;">${t("email","Email")}</th>
              <th style="padding:10px 12px;">${t("role","Rôle")}</th>
              <th style="padding:10px 12px;">${t("created","Créé le")}</th>
            </tr>
          </thead>
          <tbody>
            ${n.map(a=>`
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
    `}catch(n){e.innerHTML=`<div class="card" style="color:var(--danger);">${n.message}</div>`}}async function Bt(){h(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/admin" class="btn btn-sm btn-secondary">← ${t("back_to_dashboard","Retour au tableau de bord")}</a>
      <h2>🎙️ ${t("sessions","Sessions")}</h2>
    </div>
    <div id="sessions-list"><div class="loading-center"><div class="spinner"></div></div></div>
  `);const e=document.getElementById("sessions-list");try{const[n,a]=await Promise.all([u("/api/healthz").catch(()=>null),u("/api/admin/stats").catch(()=>({}))]);let i="";n!=null&&n.sessions&&(i+=`
        <div class="card" style="margin-bottom:16px;">
          <h3 class="card-header">🟢 ${t("active_sessions","Sessions actives")}</h3>
          ${n.sessions.length?n.sessions.map(o=>`
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--line);">
              <div>
                <span style="font-weight:600;">${o.code||"—"}</span>
                <span style="font-size:0.85em; color:var(--muted); margin-left:8px;">${o.status||""}</span>
              </div>
              <a href="#/imam/${o.code}" class="btn btn-sm btn-secondary">${t("manage","Gérer")}</a>
            </div>
          `).join(""):`<div style="color:var(--muted); padding:16px 0;">${t("no_active_sessions","Aucune session active")}</div>`}
        </div>
      `),(a==null?void 0:a.sessions_count)!==void 0&&(i+=`
        <div class="card">
          <h3 class="card-header">📊 ${t("session_summary","Résumé des sessions")}</h3>
          <div style="padding:16px 0; font-size:1.1em;">
            <div style="display:flex; justify-content:space-between; padding:6px 0;">
              <span style="color:var(--muted);">${t("total_sessions","Sessions totales")}</span>
              <span style="font-weight:600;">${a.sessions_count}</span>
            </div>
          </div>
        </div>
      `),e.innerHTML=i||`<div class="card" style="text-align:center; color:var(--muted); padding:24px;">${t("no_data","Aucune donnée disponible")}</div>`}catch(n){e.innerHTML=`<div class="card" style="color:var(--danger);">${n.message}</div>`}}async function Lt(){h(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/admin" class="btn btn-sm btn-secondary">← ${t("back_to_dashboard","Retour au tableau de bord")}</a>
      <h2>📊 ${t("analytics","Statistiques")}</h2>
    </div>
    <div id="analytics-content"><div class="loading-center"><div class="spinner"></div></div></div>
  `);const e=document.getElementById("analytics-content");try{const n=await u("/api/admin/stats");e.innerHTML=`
      <div class="card-grid">
        <div class="card" style="text-align:center; padding:24px;">
          <div style="font-size:2.5em; font-weight:700; color:var(--accent);">${n.users_count??0}</div>
          <div style="color:var(--muted); margin-top:4px;">👥 ${t("users","Utilisateurs")}</div>
        </div>
        <div class="card" style="text-align:center; padding:24px;">
          <div style="font-size:2.5em; font-weight:700; color:var(--accent);">${n.announcements_count??n.announcements??0}</div>
          <div style="color:var(--muted); margin-top:4px;">📢 ${t("announcements","Annonces")}</div>
        </div>
        <div class="card" style="text-align:center; padding:24px;">
          <div style="font-size:2.5em; font-weight:700; color:var(--accent);">${n.events_count??n.events??0}</div>
          <div style="color:var(--muted); margin-top:4px;">📅 ${t("events","Événements")}</div>
        </div>
        <div class="card" style="text-align:center; padding:24px;">
          <div style="font-size:2.5em; font-weight:700; color:var(--accent);">${n.sessions_count??n.sessions??0}</div>
          <div style="color:var(--muted); margin-top:4px;">🎙️ ${t("sessions","Sessions")}</div>
        </div>
        <div class="card" style="text-align:center; padding:24px;">
          <div style="font-size:2.5em; font-weight:700; color:var(--accent);">${n.attendance_count??0}</div>
          <div style="color:var(--muted); margin-top:4px;">📝 ${t("attendance_sessions","Séances comptées")}</div>
        </div>
        <div class="card" style="text-align:center; padding:24px;">
          <div style="font-size:2.5em; font-weight:700; color:var(--accent);">${n.attendance_total??0}</div>
          <div style="color:var(--muted); margin-top:4px;">👥 ${t("attendance_total","Fidèles comptés")}</div>
        </div>
      </div>

      <div class="card" style="margin-top:20px;">
        <h3 class="card-header">➕ ${t("log_attendance","Saisir la fréquentation")}</h3>
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <div class="form-group" style="flex:1; min-width:140px;">
            <label>${t("prayer","Prière")}</label>
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
            <label>${t("date","Date")}</label>
            <input type="date" id="att-date" value="${new Date().toISOString().split("T")[0]}" />
          </div>
          <div class="form-group" style="flex:1; min-width:140px;">
            <label>${t("count","Nombre")}</label>
            <input type="number" id="att-count" min="0" value="30" />
          </div>
          <div style="display:flex; align-items:flex-end;">
            <button class="btn btn-primary" id="add-attendance">${t("add","Ajouter")}</button>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="card-header">📋 ${t("attendance_history","Historique")}</h3>
        <div id="attendance-list"><div class="loading-center"><div class="spinner"></div></div></div>
      </div>
    `,ie(),document.getElementById("add-attendance").onclick=async()=>{const a=document.getElementById("att-prayer").value,i=document.getElementById("att-date").value,o=parseInt(document.getElementById("att-count").value||"0",10);if(!i){m(t("date_required","Date requise"),"error");return}try{await u("/api/attendance",{method:"POST",body:{prayer:a,date:i,count:o}}),m(t("attendance_added","Fréquentation ajoutée"),"success"),ie(),location.hash="#/admin/analytics"}catch(s){m(s.message,"error")}}}catch(n){e.innerHTML=`<div class="card" style="color:var(--danger);">${n.message}</div>`}}async function ie(){const e=document.getElementById("attendance-list");if(e)try{const n=await u("/api/attendance");if(!n.length){e.innerHTML=`<div style="color:var(--muted); text-align:center; padding:16px;">${t("no_attendance","Aucune saisie")}</div>`;return}e.innerHTML=`<div style="overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse;">
        <thead><tr style="text-align:left; border-bottom:2px solid var(--line);">
          <th style="padding:8px;">${t("date","Date")}</th>
          <th style="padding:8px;">${t("prayer","Prière")}</th>
          <th style="padding:8px;">${t("count","Nombre")}</th>
          <th></th>
        </tr></thead>
        <tbody>${n.map(a=>`
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
    </div>`,e.querySelectorAll(".del-att").forEach(a=>{a.onclick=async()=>{if(confirm(t("confirm_delete","Supprimer ?")))try{await u(`/api/attendance/${a.dataset.id}`,{method:"DELETE"}),ie()}catch(i){m(i.message,"error")}}})}catch(n){e.innerHTML=`<div style="color:var(--danger);">${n.message}</div>`}}async function jt(){h(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/admin" class="btn btn-sm btn-secondary">← ${t("back_to_dashboard","Retour au tableau de bord")}</a>
      <h2>⚙️ ${t("settings","Paramètres")}</h2>
    </div>
    <div class="card" style="max-width:500px;">
      <div class="form-group">
        <label>${t("mosque_name","Nom de la mosquée")}</label>
        <input type="text" id="cfg-name" placeholder="${t("mosque_name_placeholder","Al-Fath")}" />
      </div>
      <div class="form-group">
        <label>${t("city","Ville")}</label>
        <input type="text" id="cfg-city" placeholder="${t("city_name","Ville")}" />
      </div>
      <div class="form-group">
        <label>${t("prayer_method","Méthode de prière")}</label>
        <select id="cfg-method">
          <option value="1">${t("method_mwl","MWL (Muslim World League)")}</option>
          <option value="2">${t("method_islamic_society","Islamic Society of North America)")}</option>
          <option value="3">${t("method_egypt","Egyptian General Authority)")}</option>
          <option value="5">${t("method_turkey","Diyanet (Turquie)")}</option>
          <option value="7">${t("method_jakim","JAKIM (Malaisie)")}</option>
          <option value="12">${t("method_umm_al_qura","Umm Al-Qura (Arabie Saoudite)")}</option>
        </select>
      </div>
      <div class="form-group">
        <label>${t("default_language","Langue par défaut")}</label>
        <select id="cfg-lang">
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="nl">Nederlands</option>
          <option value="ar">العربية</option>
        </select>
      </div>
      <h3 class="card-header" style="margin-top:18px;">🤲 ${t("donation","Donation")}</h3>
      <div class="form-group">
        <label>${t("donation_title","Titre (ex: Jum'ah du 15)")}</label>
        <input type="text" id="cfg-don-title" placeholder="${t("donation_title","Titre")}" />
      </div>
      <div class="form-group">
        <label>${t("donation_paypal","Lien PayPal (optionnel)")}</label>
        <input type="url" id="cfg-don-paypal" placeholder="https://www.paypal.com/donate?hosted_button_id=…" />
      </div>
      <div class="form-group">
        <label>${t("bank_name","Banque")}</label>
        <input type="text" id="cfg-don-bank" placeholder="${t("bank_name","Banque")}" />
      </div>
      <div class="form-group">
        <label>${t("donation_iban","IBAN")}</label>
        <input type="text" id="cfg-don-iban" placeholder="FR76 1234 5678 …" />
      </div>
      <div class="form-group">
        <label>${t("donation_text","Texte / montants (optionnel)")}</label>
        <textarea id="cfg-don-text" rows="2" placeholder="${t("donation_text","Texte")}"></textarea>
      </div>
      <button class="btn btn-primary btn-block" id="save-settings">${t("save","Enregistrer")}</button>
    </div>
  `);try{const e=await u("/api/admin/config");e&&(e.name&&(document.getElementById("cfg-name").value=e.name),e.city&&(document.getElementById("cfg-city").value=e.city),e.prayer_method&&(document.getElementById("cfg-method").value=e.prayer_method),e.default_language&&(document.getElementById("cfg-lang").value=e.default_language),e.donation&&(e.donation.title&&(document.getElementById("cfg-don-title").value=e.donation.title),e.donation.paypal&&(document.getElementById("cfg-don-paypal").value=e.donation.paypal),e.donation.bankName&&(document.getElementById("cfg-don-bank").value=e.donation.bankName),e.donation.iban&&(document.getElementById("cfg-don-iban").value=e.donation.iban),e.donation.text&&(document.getElementById("cfg-don-text").value=e.donation.text)))}catch{}document.getElementById("save-settings").onclick=async()=>{const e={name:document.getElementById("cfg-name").value.trim(),city:document.getElementById("cfg-city").value.trim(),prayer_method:document.getElementById("cfg-method").value,default_language:document.getElementById("cfg-lang").value,donation:{title:document.getElementById("cfg-don-title").value.trim(),paypal:document.getElementById("cfg-don-paypal").value.trim(),bankName:document.getElementById("cfg-don-bank").value.trim(),iban:document.getElementById("cfg-don-iban").value.trim(),text:document.getElementById("cfg-don-text").value.trim()}};try{await u("/api/admin/config",{method:"PUT",body:e}),m(t("settings_saved","Paramètres enregistrés"),"success")}catch(n){m(n.message,"error")}}}async function Mt(){h(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/admin" class="btn btn-sm btn-secondary">← ${t("back_to_dashboard","Retour au tableau de bord")}</a>
      <h2>📢 ${t("announcements","Annonces")}</h2>
    </div>

    <div class="card" style="max-width:500px; margin-bottom:16px;">
      <h3 class="card-header">➕ ${t("new_announcement","Nouvelle annonce")}</h3>
      <div class="form-group">
        <label>${t("title","Titre")}</label>
        <input type="text" id="ann-title" placeholder="${t("announcement_title","Titre de l'annonce")}" />
      </div>
      <div class="form-group">
        <label>${t("body","Contenu")}</label>
        <textarea id="ann-body" rows="4" placeholder="${t("announcement_body","Texte de l'annonce...")}" style="width:100%; padding:10px; border:1px solid var(--line); border-radius:10px; background:var(--bg2); color:var(--fg);"></textarea>
      </div>
      <div style="display:flex; gap:12px;">
        <div class="form-group" style="flex:1;">
          <label>${t("category","Catégorie")}</label>
          <select id="ann-category">
            <option value="general">${t("general","Général")}</option>
            <option value="prayer">${t("prayer","Prière")}</option>
            <option value="event">${t("event","Événement")}</option>
            <option value="urgent">${t("urgent","Urgent")}</option>
          </select>
        </div>
        <div class="form-group" style="flex:1;">
          <label>${t("priority","Priorité")}</label>
          <select id="ann-priority">
            <option value="low">${t("low","Basse")}</option>
            <option value="normal" selected>${t("normal","Normale")}</option>
            <option value="high">${t("high","Haute")}</option>
          </select>
        </div>
      </div>
      <button class="btn btn-primary btn-block" id="create-ann">${t("publish","Publier")}</button>
    </div>

    <div id="ann-list"><div class="loading-center"><div class="spinner"></div></div></div>
  `);let e=null;async function n(){var i;const a=document.getElementById("ann-list");try{const o=await u("/api/mosques");if(e=(i=o==null?void 0:o[0])==null?void 0:i.id,!e){a.innerHTML=`<div class="card" style="text-align:center; color:var(--muted); padding:24px;">${t("no_mosques","Aucune mosquée configurée")}</div>`;return}const s=await u(`/api/announcements/${e}`);if(!s.length){a.innerHTML=`<div class="card" style="text-align:center; color:var(--muted); padding:24px;">${t("no_announcements","Aucune annonce")}</div>`;return}a.innerHTML=`<div class="card-grid">${s.map(r=>`
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
      `).join("")}</div>`,a.querySelectorAll(".delete-ann").forEach(r=>{r.onclick=async()=>{if(confirm(t("confirm_delete_announcement","Supprimer cette annonce ?")))try{await u(`/api/announcements/${e}/${r.dataset.id}`,{method:"DELETE"}),m(t("deleted","Supprimé"),"success"),n()}catch(l){m(l.message,"error")}}})}catch(o){a.innerHTML=`<div class="card" style="color:var(--danger);">${o.message}</div>`}}n(),document.getElementById("create-ann").onclick=async()=>{if(!e){m(t("no_mosques","Aucune mosquée configurée"),"error");return}const a=document.getElementById("ann-title").value.trim(),i=document.getElementById("ann-body").value.trim(),o=document.getElementById("ann-category").value,s=document.getElementById("ann-priority").value;if(!a){m(t("title_required","Titre requis"),"error");return}try{await u(`/api/announcements/${e}`,{method:"POST",body:{title:a,body:i,category:o,priority:s}}),m(t("announcement_created","Annonce publiée"),"success"),document.getElementById("ann-title").value="",document.getElementById("ann-body").value="",n()}catch(r){m(r.message,"error")}}}const Pt=Object.freeze(Object.defineProperty({__proto__:null,renderAdmin:Tt},Symbol.toStringTag,{value:"Module"}));async function Ct(e){var i;const n=e==null?void 0:e.mosqueId;h(`
    <div class="card">
      <h2 class="card-header">📢 ${t("announcements","Annonces")}</h2>
      ${B("۞")}
      <div id="announcements-list" class="loading-center"><div class="spinner"></div></div>
    </div>
  `);let a=n||null;if(!a)try{const o=await u("/api/mosques",{auth:!1});a=((i=o==null?void 0:o[0])==null?void 0:i.id)||null}catch{a=null}if(a)try{const o=await u(`/api/announcements/${a}`,{auth:!1});Nt(o)}catch{const s=document.getElementById("announcements-list");s.className="",s.innerHTML=`<p style="color:var(--muted); text-align:center; padding:20px;">${t("no_announcements","Aucune annonce pour le moment")}</p>`}else{const o=document.getElementById("announcements-list");o.className="",o.innerHTML=`
      <p style="color:var(--muted); text-align:center; padding:20px;">
        ${t("select_mosque","Sélectionnez une mosquée pour voir les annonces")}
      </p>
    `}}function Nt(e){const n=document.getElementById("announcements-list");if(!n)return;if(n.className="",!(e!=null&&e.length)){n.innerHTML=`<p style="color:var(--muted); text-align:center;">${t("no_announcements","Aucune annonce")}</p>`;return}const a=o=>(o.priority==="urgent"?2:0)+(o.pinned?1:0),i=[...e].sort((o,s)=>{const r=a(s)-a(o);return r!==0?r:new Date(s.publishedAt||0)-new Date(o.publishedAt||0)});n.innerHTML=i.map(o=>`
    <div class="announcement-item ${o.priority==="urgent"?"urgent":""}">
      <div class="title">
        ${o.priority==="urgent"?"🔴 ":o.pinned?"📌 ":""}${o.title}
      </div>
      <div class="body">${o.body}</div>
      <div class="meta">
        ${o.publishedAt?new Date(o.publishedAt).toLocaleDateString(S()):""}
        ${o.category?` · ${o.category}`:""}
      </div>
    </div>
  `).join("")}const zt=Object.freeze(Object.defineProperty({__proto__:null,renderAnnouncements:Ct},Symbol.toStringTag,{value:"Module"}));async function Dt(e){const n=(e==null?void 0:e.action)||"login";h(`
    <div class="card" style="max-width:420px; margin:40px auto;">
      <h2 class="card-header" style="justify-content:center;">
        🕌 ${n==="register"?t("register","Créer un compte"):t("login","Connexion")}
      </h2>

      <form id="auth-form">
        ${n==="register"?`
          <div class="form-group">
            <label>${t("name","Nom")}</label>
            <input type="text" name="name" required placeholder="${t("your_name","Votre nom")}" />
          </div>
        `:""}

        <div class="form-group">
          <label>${t("email","Email")}</label>
          <input type="email" name="email" required placeholder="email@mosquee.org" />
        </div>

        <div class="form-group">
          <label>${t("password","Mot de passe")}</label>
          <div style="position:relative;">
            <input type="password" name="password" id="auth-password" required minlength="8" placeholder="••••••••" style="padding-right:44px;" />
            <button type="button" id="toggle-password" class="icon-btn" style="position:absolute; right:2px; top:50%; transform:translateY(-50%); width:34px; height:34px;" title="${t("show_password","Afficher le mot de passe")}" aria-label="${t("show_password","Afficher le mot de passe")}">👁</button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-block" id="auth-submit">
          ${n==="register"?t("create_account","Créer le compte"):t("login_btn","Se connecter")}
        </button>
      </form>

      <div style="text-align:center; margin-top:16px;">
        ${n==="register"?`<a href="#/auth/login">${t("have_account","Déjà un compte ? Se connecter")}</a>`:`<a href="#/auth/register">${t("no_account","Pas de compte ? Créer un compte")}</a>`}
      </div>
    </div>
  `),document.getElementById("toggle-password").onclick=()=>{const a=document.getElementById("auth-password"),i=document.getElementById("toggle-password"),o=a.type==="password";a.type=o?"text":"password",i.textContent=o?"🙈":"👁"},document.getElementById("auth-form").onsubmit=async a=>{a.preventDefault();const i=new FormData(a.target),o=document.getElementById("auth-submit");o.disabled=!0,o.textContent="⏳ ...";try{const s=Object.fromEntries(i),l=await u(n==="register"?"/api/auth/register":"/api/auth/login",{method:"POST",body:s,auth:!1});mt(l.accessToken,l.refreshToken),localStorage.setItem("userName",l.user.name),m(t("welcome","Bienvenue")+", "+l.user.name+" !","success"),nt("/")}catch(s){m(s.message,"error"),o.disabled=!1,o.textContent=n==="register"?t("create_account","Créer le compte"):t("login_btn","Se connecter")}}}const Ht=Object.freeze(Object.defineProperty({__proto__:null,renderAuth:Dt},Symbol.toStringTag,{value:"Module"}));async function Ot(e){var l,c,d,p,y,$,b;const n=e==null?void 0:e.mosqueId;h(`
    <div style="min-height:80vh; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:20px;">
      <div style="font-size:4em; margin-bottom:12px;">🕌</div>
      <h1 style="font-size:2em; margin-bottom:24px;">Mosqué Digital</h1>

      <div style="font-size:1.3em; color:var(--accent2); margin-bottom:24px;" id="display-hijri">…</div>

      <div id="display-prayer" style="margin-bottom:30px;">
        <div style="font-size:1.2em; color:var(--muted);" id="display-prayer-name">${t("loading","...")}</div>
        <div style="font-size:4em; font-weight:700; color:var(--accent);" id="display-prayer-time">--:--</div>
        <div style="font-size:1.2em; color:var(--muted);" id="display-countdown"></div>
      </div>

      <div style="width:100%; max-width:600px; border-top:1px solid var(--line); padding-top:20px;">
        <div style="color:var(--muted);" id="display-next-activity">${t("loading","...")}</div>
      </div>

      <div style="position:fixed; bottom:16px; right:16px; color:var(--muted); font-size:0.8em;" id="display-clock"></div>
    </div>
  `);let a=n||null;if(!a)try{const g=await u("/api/mosques",{auth:!1});a=((l=g==null?void 0:g[0])==null?void 0:l.id)||null}catch{a=null}u("/api/hijri",{auth:!1}).then(g=>{const f=document.getElementById("display-hijri");f&&(g!=null&&g.hijri)&&(f.textContent=`${g.hijri.day} ${g.hijri.monthNameFr} ${g.hijri.year} AH`)}).catch(()=>{});let i=null;if(a)try{const g=new Date().toISOString().split("T")[0];i=await u(`/api/prayer-times/${a}?date=${g}`,{auth:!1})}catch{i=null}const o=i?[{name:t("fajr","Fajr"),time:((c=i.fajr)==null?void 0:c.time)||"--:--"},{name:t("sunrise","Sunrise"),time:((d=i.sunrise)==null?void 0:d.time)||"--:--"},{name:t("dhuhr","Dhuhr"),time:((p=i.dhuhr)==null?void 0:p.time)||"--:--"},{name:t("asr","Asr"),time:((y=i.asr)==null?void 0:y.time)||"--:--"},{name:t("maghrib","Maghrib"),time:(($=i.maghrib)==null?void 0:$.time)||"--:--"},{name:t("isha","Isha"),time:((b=i.isha)==null?void 0:b.time)||"--:--"}]:[{name:"Fajr",time:"05:30"},{name:"Dhuhr",time:"13:00"},{name:"Asr",time:"16:30"},{name:"Maghrib",time:"19:45"},{name:"Isha",time:"21:15"}];a&&u(`/api/events/upcoming/${a}?limit=1`,{auth:!1}).then(g=>{const f=document.getElementById("display-next-activity");if(!f)return;const x=g==null?void 0:g[0];if(!x){f.textContent="";return}let I="";x.date&&(I=new Date(x.date+(x.time?"T"+x.time:"")).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"}),x.time&&(I+=" à "+x.time)),f.innerHTML=`<div style="font-size:0.9em; color:var(--muted);">${t("next_activity","Prochain temps fort")}</div>
                        <div style="font-size:1.6em; font-weight:700; margin-top:4px;">${x.title}</div>
                        ${I?`<div style="color:var(--accent); margin-top:4px;">${I}</div>`:""}`}).catch(()=>{});function s(){const g=new Date,f=document.getElementById("display-clock");f&&(f.textContent=g.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}))}s(),setInterval(s,1e4);function r(){const g=new Date,f=g.getHours()*60+g.getMinutes();let x=o[0];for(const C of o){const[U,Ze]=C.time.split(":").map(Number);if(!isNaN(U)&&U*60+Ze>f){x=C;break}}const[I,j]=x.time.split(":").map(Number),M=Math.max(0,(isNaN(I)?0:I*60+(isNaN(j)?0:j))-f),P=Math.floor(M/60),K=M%60;document.getElementById("display-prayer-name").textContent=x.name,document.getElementById("display-prayer-time").textContent=x.time,document.getElementById("display-countdown").textContent=x.time!=="--:--"?`IQAMA DANS ${P>0?P+"H":""}${K.toString().padStart(2,"0")}`:""}r(),setInterval(r,3e4)}const Rt=Object.freeze(Object.defineProperty({__proto__:null,renderDisplay:Ot},Symbol.toStringTag,{value:"Module"})),Ft={prayer:"🕌",quran:"📖",course:"🎓",ramadan:"🌙",conference:"🎤",family:"👨‍👩‍👧",children:"🧒",community:"🤝"};function te(e){return e.startTime?new Date(e.startTime):e.date?new Date(e.date+(e.time?"T"+e.time:"")):null}function Kt(e){if(!e||isNaN(e))return"";const n=i=>new Date(i.getFullYear(),i.getMonth(),i.getDate()),a=Math.round((n(e)-n(new Date))/864e5);return a===0?t("today","Aujourd'hui"):a===1?t("tomorrow","Demain"):""}async function Ut(e){var i;const n=e==null?void 0:e.mosqueId;h(`
    <div class="card">
      <h2 class="card-header">📅 ${t("events","Événements")}</h2>
      ${B("۞")}
      <div id="events-list" class="loading-center"><div class="spinner"></div></div>
    </div>
  `);let a=n||null;if(!a)try{const o=await u("/api/mosques",{auth:!1});a=((i=o==null?void 0:o[0])==null?void 0:i.id)||null}catch{a=null}if(a)try{const o=await u(`/api/events/${a}`,{auth:!1});Vt(o)}catch{oe()}else oe()}function oe(){const e=document.getElementById("events-list");e.className="",e.innerHTML=`
    <p style="color:var(--muted); text-align:center; padding:20px;">
      ${t("no_events","Aucun événement à venir")}
    </p>`}function Vt(e){const n=document.getElementById("events-list");if(!n)return;if(n.className="",!(e!=null&&e.length)){oe();return}const a=[...e].sort((i,o)=>(te(i)||0)-(te(o)||0));n.innerHTML=a.map(i=>{const o=te(i),s=Kt(o);let r="";return i.startTime?r=o.toLocaleDateString(S())+" "+o.toLocaleTimeString(S(),{hour:"2-digit",minute:"2-digit"}):i.date?r=o.toLocaleDateString(S())+(i.time?" "+t("at","à")+" "+i.time:""):i.time&&(r="à "+i.time),`
    <div class="card card-accent" style="padding:16px; display:flex; gap:16px; align-items:start;">
      ${i.image?`<img src="${i.image}" style="width:80px; height:80px; object-fit:cover; border-radius:12px; flex-shrink:0;" onerror="this.style.display='none'" />`:`<span class="icon-badge" style="font-size:1.6em;">${Ft[i.category]||"📅"}</span>`}
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
  `}).join("")}const Gt=Object.freeze(Object.defineProperty({__proto__:null,renderEvents:Ut},Symbol.toStringTag,{value:"Module"}));let z=null,G=null;const _e=[{ar:"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",fr:"Gloire et pureté à Allah, et louange à Lui.",en:"Glory and praise be to Allah."},{ar:"لَا إِلَٰهَ إِلَّا اللَّهُ",fr:"Il n'y a de divinité digne d'adoration qu'Allah.",en:"There is no deity worthy of worship but Allah."},{ar:"الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",fr:"Louange à Allah, Seigneur des mondes.",en:"Praise be to Allah, Lord of the worlds."},{ar:"اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",fr:"Ô Allah, prie sur Muhammad ﷺ.",en:"O Allah, send blessings upon Muhammad ﷺ."},{ar:"رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً",fr:"Seigneur, accorde-nous belle part ici-bas et belle part dans l'au-delà.",en:"Our Lord, grant us good in this world and good in the Hereafter."},{ar:"حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",fr:"Allah nous suffit, Il est le meilleur garant.",en:"Allah is sufficient for us, and He is the best disposer of affairs."},{ar:"أَسْتَغْفِرُ اللَّهَ",fr:"Je demande pardon à Allah.",en:"I seek forgiveness from Allah."},{ar:"وَقُل رَّبِّ زِدْنِي عِلْمًا",fr:"Et dis : « Seigneur, accrois mes connaissances. »",en:'And say: "My Lord, increase me in knowledge."'}];function Jt(){const e=Math.floor(Date.now()/864e5),n=_e[e%_e.length],a=F(),i=a==="ar"?null:n[a]||n.en||n.fr;return{ar:n.ar,translation:i}}function Qt(e){return e<5?["greeting_night","Que cette nuit vous soit bénie"]:e<12?["greeting_morning","Que votre matinée soit bénie"]:e<18?["greeting_afternoon","Que votre journée soit bénie"]:["greeting_evening","Que votre soirée soit bénie"]}async function Wt(){z&&(clearInterval(z),z=null),pe=!1;const e=localStorage.getItem("userName")||"",[n,a]=Qt(new Date().getHours()),i=Jt(),o=[{href:"#/khutbah",icon:"🎙️",titleKey:"khutbah_live",title:"Khutbah Live",subKey:"join_or_start",sub:"Rejoindre ou démarrer"},{href:"#/quran",icon:"📖",titleKey:"quran",title:"Coran",subKey:"read_listen",sub:"Lire et écouter"},{href:"#/prayer",icon:"🕌",titleKey:"prayers",title:"Horaires de prière",subKey:"adhan_iqama",sub:"Adhan & Iqama"},{href:"#/announcements",icon:"📢",titleKey:"announcements",title:"Annonces",subKey:"latest_news",sub:"Dernières nouvelles"},{href:"#/events",icon:"📅",titleKey:"events",title:"Événements",subKey:"upcoming",sub:"À venir"},{href:"#/support",icon:"🤲",titleKey:"donate",title:"Faire un don",subKey:"support_mosque",sub:"Soutenir la mosquée"},{href:"#/ramadan",icon:"🌙",titleKey:"ramadan",title:"Ramadan",subKey:"program",sub:"Programme"}];h(`
    <div class="hero-mosque">
      <div class="bismillah">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>
      <h1 style="font-size:1.6em; margin:10px 0 4px;">${t("app_name","Mosqué Digital")}</h1>
      <p style="color:var(--muted);">
        ${e?`${t("assalamu_alaykum","As-salâmu ʿalaykum")}, <strong style="color:var(--fg)">${e}</strong> — ${t(n,a)}`:`${t("assalamu_alaykum","As-salâmu ʿalaykum")} — ${t(n,a)}`}
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

    ${B("✦ ✦ ✦")}

    <div class="card-grid">
      ${o.map(r=>`
        <a href="${r.href}" class="card card-link" style="display:flex; align-items:center; gap:16px; text-decoration:none; color:var(--fg);">
          <span class="icon-badge">${r.icon}</span>
          <div>
            <div style="font-weight:600;">${t(r.titleKey,r.title)}</div>
            <div style="font-size:0.85em; color:var(--muted);">${t(r.subKey,r.sub)}</div>
          </div>
        </a>
      `).join("")}
    </div>

    ${Z()?`
      <div style="text-align:center; margin-top:24px;">
        <a href="#/admin" class="btn btn-secondary">${t("admin","Administration")}</a>
        <a href="#/imam" class="btn btn-secondary" style="margin-left:8px;">${t("imam_mode","Mode Imam")}</a>
      </div>
    `:`
      <div style="text-align:center; margin-top:24px;">
        <a href="#/auth/login" class="btn btn-primary">${t("login","Connexion")}</a>
        <a href="#/admin" class="btn btn-secondary" style="margin-left:8px;">${t("admin","Administration")}</a>
      </div>
    `}
  `),we(),G&&window.removeEventListener("pwa-installable-changed",G),G=we,window.addEventListener("pwa-installable-changed",G);const s=new Date().toISOString().split("T")[0];u(`/api/hijri?date=${s}`,{auth:!1}).then(r=>{const l=document.getElementById("home-hijri");if(l&&(r!=null&&r.hijri)){const c=F()==="ar",d=c?r.hijri.monthNameAr:r.hijri.monthNameFr;l.textContent=c?`${r.hijri.day} ${d} ${r.hijri.year} هـ`:`${r.hijri.day} ${d} ${r.hijri.year} AH (${r.hijri.monthNameAr})`}}).catch(()=>{}),Yt()}function we(){const e=document.getElementById("install-banner");if(!e)return;if(localStorage.getItem("pwa-banner-dismissed")==="1"||!yt()){e.innerHTML="";return}e.innerHTML=`
    <div class="card card-accent" style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
      <span class="icon-badge">📲</span>
      <div style="flex:1; min-width:180px;">
        <div style="font-weight:600;">${t("install_app","Installer l'application")}</div>
        <div style="font-size:.85em; color:var(--muted);">
          ${De()?t("install_ios_hint","Partager (⬆️) puis « Sur l'écran d'accueil »"):t("install_hint","Accès rapide, plein écran, fonctionne hors-ligne")}
        </div>
      </div>
      ${He()?`<button class="btn btn-sm btn-primary" id="btn-install">${t("install","Installer")}</button>`:""}
      <button class="icon-btn" id="btn-dismiss-install" title="${t("dismiss","Ignorer")}" aria-label="${t("dismiss","Ignorer")}">✕</button>
    </div>
  `;const n=document.getElementById("btn-install");n&&(n.onclick=async()=>{await vt()==="accepted"&&(e.innerHTML="")}),document.getElementById("btn-dismiss-install").onclick=()=>{localStorage.setItem("pwa-banner-dismissed","1"),e.innerHTML=""}}let E=null,W=null,pe=!1;async function Yt(){var e;try{const n=await u("/api/mosques",{auth:!1});if(W=((e=n==null?void 0:n[0])==null?void 0:e.id)||null,W){const a=new Date().toISOString().split("T")[0];E=await u(`/api/prayer-times/${W}?date=${a}`,{auth:!1})}}catch{E=null}se(),z=setInterval(se,6e4)}function Xt(){const e=document.getElementById("btn-home-my-position");if(!navigator.geolocation){m(t("geolocation_unavailable","Géolocalisation non disponible"),"error");return}if(!e)return;e.disabled=!0;const n=e.textContent;e.textContent="📡 "+t("locating","Localisation..."),navigator.geolocation.getCurrentPosition(async a=>{const{latitude:i,longitude:o}=a.coords;try{const s=new Date().toISOString().split("T")[0];E=await u(`/api/prayer-times/${W||"geo"}?date=${s}&lat=${i}&lng=${o}`,{auth:!1}),pe=!0,se(),m(t("position_used","Position exacte utilisée"),"success")}catch{m(t("geolocation_unavailable","Géolocalisation non disponible"),"error"),e.disabled=!1,e.textContent=n}},()=>{m(t("geolocation_unavailable","Géolocalisation non disponible"),"error"),e.disabled=!1,e.textContent=n},{timeout:1e4,enableHighAccuracy:!0})}function se(){var f,x,I,j,M,P;const e=document.getElementById("prayer-countdown");if(!e){clearInterval(z);return}const n=new Date,a=n.getHours(),i=n.getMinutes(),o=`${a.toString().padStart(2,"0")}:${i.toString().padStart(2,"0")}`,s=E?[{name:t("fajr","Fajr"),time:((f=E.fajr)==null?void 0:f.time)||"--:--"},{name:t("sunrise","Sunrise"),time:((x=E.sunrise)==null?void 0:x.time)||"--:--"},{name:t("dhuhr","Dhuhr"),time:((I=E.dhuhr)==null?void 0:I.time)||"--:--"},{name:t("asr","Asr"),time:((j=E.asr)==null?void 0:j.time)||"--:--"},{name:t("maghrib","Maghrib"),time:((M=E.maghrib)==null?void 0:M.time)||"--:--"},{name:t("isha","Isha"),time:((P=E.isha)==null?void 0:P.time)||"--:--"}]:[{name:"Fajr",time:"05:30"},{name:"Sunrise",time:"07:15"},{name:"Dhuhr",time:"13:00"},{name:"Asr",time:"16:30"},{name:"Maghrib",time:"19:45"},{name:"Isha",time:"21:15"}];let r=null;for(const K of s){const[C,U]=K.time.split(":").map(Number);if(C>a||C===a&&U>i){r=K;break}}r||(r=s[0]);const[l,c]=r.time.split(":").map(Number);let d=l*60+c-(a*60+i);d<0&&(d+=24*60);const p=Math.floor(d/60),y=d%60,$=p>0?`${p}h${y.toString().padStart(2,"0")}`:`${y}min`,b=Math.max(4,Math.min(100,Math.round(d/(6*60)*100)));e.className="card",e.innerHTML=`
    <div style="display:flex; align-items:center; justify-content:center; gap:24px; flex-wrap:wrap; padding:8px 0;">
      <div class="gauge" style="--gauge-pct:${b};">
        <div class="gauge-inner">
          <div class="timer">${$}</div>
          <div class="label">${t("remaining","restant")}</div>
        </div>
      </div>
      <div>
        <div class="label">${t("next_prayer","Prochaine prière")}</div>
        <div class="next-prayer">${r.name}</div>
        <div class="label">${t("at","à")} ${r.time} · ${o}</div>
      </div>
    </div>
    <div style="text-align:center; margin-top:6px;">
      ${pe?`<span style="font-size:.8em; color:var(--accent);">📍 ${t("times_for_your_position","Horaires calculés pour votre position exacte")}</span>`:`<button class="btn btn-sm btn-secondary" id="btn-home-my-position">📍 ${t("use_my_position","Utiliser ma position exacte")}</button>`}
    </div>
  `;const g=document.getElementById("btn-home-my-position");g&&(g.onclick=Xt)}const Zt=Object.freeze(Object.defineProperty({__proto__:null,renderHome:Wt},Symbol.toStringTag,{value:"Module"})),ne={};function en(){return ze.replace(/^http/,"ws")}function Ge(e="/khutbah"){if(ne[e])return ne[e];const n={_handlers:{},_ws:null,_reconnectTimer:null,_mode:null,_code:null,_lang:null,_token:null,on(a,i){return(this._handlers[a]=this._handlers[a]||[]).push(i),this},_dispatch(a,i){(this._handlers[a]||[]).forEach(o=>{try{o(i)}catch(s){console.error("[ws]",s)}})},_connect(){if(this._ws){try{this._ws.close()}catch{}this._ws=null}const a=this._mode==="broadcast"?`/ws/broadcast/${encodeURIComponent(this._code)}?token=${encodeURIComponent(this._token||"")}`:`/ws/listen/${encodeURIComponent(this._code)}?lang=${encodeURIComponent(this._lang||"fr")}`,i=new WebSocket(en()+a);this._ws=i,i.onopen=()=>{this._dispatch("connect",{})},i.onmessage=o=>{let s;try{s=JSON.parse(o.data)}catch{return}this._dispatch(s.type,s)},i.onclose=()=>{this._ws=null,this._dispatch("disconnect",{}),this._mode&&this._scheduleReconnect()},i.onerror=()=>{}},_scheduleReconnect(){this._reconnectTimer||(this._reconnectTimer=setTimeout(()=>{this._reconnectTimer=null,this._mode&&this._connect()},2e3))},emit(a,i={}){return a==="join-listen"?(this._mode="listen",this._code=i.code,this._lang=i.lang||"fr",this._connect(),this):a==="join-broadcast"?(this._mode="broadcast",this._code=i.code,this._token=i.token||"",this._connect(),this):(this._ws&&this._ws.readyState===WebSocket.OPEN&&this._ws.send(JSON.stringify({type:a,...i})),this)},disconnect(){if(this._mode=null,this._reconnectTimer&&(clearTimeout(this._reconnectTimer),this._reconnectTimer=null),this._ws){try{this._ws.close()}catch{}this._ws=null}this._handlers={}}};return ne[e]=n,n}function tn(e){try{return localStorage.getItem(`imam_token_${e}`)||""}catch{return""}}function Je(e,n){try{localStorage.setItem(`imam_token_${e}`,n)}catch{}}const Ie=["بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ","الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ","اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ","يَا أَيُّهَا الَّذِينَ آمَنُوا","أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ","قَالَ اللَّهُ تَعَالَى","قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ","أَقُولُ قَوْلِي هَذَا وَأَسْتَغْفِرُ اللَّهَ لِي وَلَكُمْ","اللَّهُمَّ اغْفِرْ لِلْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ","رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ","أَقِيمُوا الصَّلَاةَ","وَالسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ"];function ae(){try{const e=JSON.parse(localStorage.getItem("khutbah-phrases")||"null");return Array.isArray(e)&&e.length?e:Ie}catch{return Ie}}function Ee(e){localStorage.setItem("khutbah-phrases",JSON.stringify(e))}async function nn(e){if(!Z()){h(`
      <div class="card" style="max-width:420px; margin:40px auto; text-align:center;">
        <h2>👳 ${t("imam_mode","Mode Imam")}</h2>
        <p style="color:var(--muted); margin:12px 0;">${t("login_required","Connexion requise")}</p>
        <a href="#/auth/login" class="btn btn-primary">${t("login","Se connecter")}</a>
      </div>
    `);return}const n=e==null?void 0:e.code;n?await on(n):await an()}async function an(){h(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/" class="btn btn-sm btn-secondary">←</a>
      <h2>👳 ${t("imam_dashboard","Tableau de bord Imam")}</h2>
    </div>

    <div class="card">
      <h3 class="card-header">🎙️ ${t("khutbah_control","Contrôle Khutbah")}</h3>
      <div class="form-group">
        <label>${t("topic","Sujet")}</label>
        <input type="text" id="imam-topic" placeholder="${t("khutbah_topic","Sujet de la khutbah")}" />
      </div>
      <button class="btn btn-primary btn-block" id="start-khutbah">${t("start_session","Démarrer une session")}</button>
    </div>

    <div class="card">
      <h3 class="card-header">🤖 ${t("ai_assistant","Assistant IA")}</h3>
      <div class="form-group">
        <label>${t("ask_assistant","Demander à l'assistant")}</label>
        <textarea id="ai-question" rows="3" placeholder="${t("ai_placeholder","Préparer un plan de khutbah sur la patience...")}" style="width:100%; padding:10px; border:1px solid var(--line); border-radius:10px; background:var(--bg2); color:var(--fg);"></textarea>
      </div>
      <button class="btn btn-primary" id="ai-generate">${t("generate","Générer")}</button>
      <div id="ai-result" style="margin-top:16px;"></div>
    </div>
  `),document.getElementById("start-khutbah").onclick=async()=>{const e=document.getElementById("imam-topic").value.trim();try{const n=await u("/api/session",{method:"POST",body:{mosque_name:e,target_langs:["fr","en"]}});n.broadcaster_token&&Je(n.code,n.broadcaster_token),m(`${t("session_created","Session créée")}: ${n.code}`,"success"),location.hash=`#/imam/${n.code}`}catch(n){m(n.message,"error")}},document.getElementById("ai-generate").onclick=async()=>{var a,i,o;const e=document.getElementById("ai-question").value.trim();if(!e)return;const n=document.getElementById("ai-result");n.innerHTML='<div class="loading-center"><div class="spinner"></div></div>';try{const s=await u("/api/ai/assistant/plan",{method:"POST",body:{topic:e}});n.innerHTML=`
        <div class="card" style="background:var(--bg2);">
          <h4>📋 ${s.topic||e}</h4>
          <div style="margin-top:8px;"><strong>${t("introduction","Introduction")}:</strong><p>${s.introduction}</p></div>
          ${(a=s.mainPoints)!=null&&a.length?`<div style="margin-top:8px;"><strong>${t("main_points","Points principaux")}:</strong><ul>${s.mainPoints.map(r=>`<li>${r}</li>`).join("")}</ul></div>`:""}
          ${(i=s.references)!=null&&i.length?`<div style="margin-top:8px;"><strong>${t("references","Références")}:</strong><ul>${s.references.map(r=>`<li>📖 ${r}</li>`).join("")}</ul></div>`:""}
          ${s.conclusion?`<div style="margin-top:8px;"><strong>${t("conclusion","Conclusion")}:</strong><p>${s.conclusion}</p></div>`:""}
          ${(o=s.warnings)!=null&&o.length?`<div style="margin-top:8px; color:var(--warn);"><strong>⚠️ ${t("verify","À vérifier")}:</strong><ul>${s.warnings.map(r=>`<li>${r}</li>`).join("")}</ul></div>`:""}
        </div>
      `}catch(s){n.innerHTML=`<p style="color:var(--danger);">${s.message}</p>`}}}async function on(e){h(`
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
      <a href="#/imam" class="btn btn-sm btn-secondary">←</a>
      <span style="font-weight:600; font-family:var(--font-heading);">👳 ${t("imam_control","Contrôle Imam")}</span>
      <span id="imam-status" class="badge-live" style="margin-left:auto;">⏳</span>
    </div>

    <div class="card" style="text-align:center;">
      <h3 class="card-header" style="justify-content:center;">📱 ${t("qr_session","QR Code de la session")}</h3>
      <img src="${X}/api/session/${e}/qr.png" style="width:200px; margin:16px auto; border-radius:12px; background:#fff; padding:8px;" id="imam-qr-img" />
      <div style="font-size:0.85em; color:var(--muted); word-break:break-all;" id="join-url"></div>
      <button class="btn btn-sm btn-secondary" id="copy-join-url" style="margin-top:10px;">📋 ${t("copy_link","Copier le lien")}</button>
    </div>

    <div class="card">
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;">
        <button class="btn btn-primary" id="btn-pause">⏸ ${t("pause","Pause")}</button>
        <button class="btn btn-secondary" id="btn-resume">▶ ${t("resume","Reprendre")}</button>
        <button class="btn btn-danger" id="btn-stop">⏹ ${t("stop","Terminer")}</button>
      </div>

      <div class="form-group">
        <label>📚 ${t("phrase_library","Bibliothèque de phrases")}</label>
        <div id="phrase-chips" dir="rtl" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;"></div>
        <div style="display:flex; gap:6px;">
          <input type="text" id="new-phrase" dir="rtl" placeholder="${t("add_phrase","Ajouter une phrase...")}" style="flex:1; direction:rtl; text-align:right; font-family:var(--font-arabic);" />
          <button class="btn btn-sm btn-secondary" id="add-phrase" title="${t("add","Ajouter")}">+</button>
        </div>
        <button class="btn btn-sm btn-secondary" id="reset-phrases" style="margin-top:6px; font-size:.78em;">${t("reset_defaults","Rétablir la liste par défaut")}</button>
      </div>

      <div class="form-group">
        <label>${t("type_arabic","Saisir du texte arabe")}</label>
        <textarea id="manual-text" rows="3" placeholder="${t("arabic_placeholder","Texte arabe...")}" style="direction:rtl; text-align:right; font-family:var(--font-arabic); font-size:1.2em;"></textarea>
      </div>
      <button class="btn btn-primary btn-block" id="send-text">${t("send","Envoyer")}</button>
    </div>

    <div class="card">
      <h4 class="card-header">📊 ${t("live_stats","Statistiques en direct")}</h4>
      <div id="imam-stats" style="color:var(--muted);">${t("listeners","Auditeurs")}: <span id="listener-count">0</span></div>
      <div id="imam-quran" style="margin-top:8px;"></div>
    </div>

    ${B("۞")}

    <div class="card">
      <h4 class="card-header">📝 ${t("segments","Segments")}</h4>
      <div id="imam-segments" style="max-height:40vh; overflow-y:auto;"></div>
    </div>
  `);const n=Ge("/khutbah"),a=tn(e);let i=`${window.location.origin}/#/khutbah/${e}`;try{i=(await u(`/api/session/${e}`)).join_url||i;const c=document.getElementById("join-url");c&&(c.textContent=i)}catch{const l=document.getElementById("join-url");l&&(l.textContent=i)}document.getElementById("copy-join-url").onclick=()=>{var l;(l=navigator.clipboard)==null||l.writeText(i).then(()=>m(t("copied","Copié"),"success"))};function o(l,c){const d=document.getElementById("imam-status");d&&(d.textContent=c,d.classList.toggle("live",!!l))}n.on("connect",()=>o(!1,"🟢 "+t("connected","Connecté"))),n.on("hello",l=>{o(l.status==="live",l.status==="live"?`🔴 ${t("live","LIVE")}`:`⏸ ${l.status}`),document.getElementById("listener-count").textContent=l.listeners??0}),n.on("stats",l=>{l.listeners!==void 0&&(document.getElementById("listener-count").textContent=l.listeners)}),n.on("session",l=>{o(l.status==="live",l.status==="live"?`🔴 ${t("live","LIVE")}`:`⏸ ${l.status}`)}),n.on("monitor",l=>{document.getElementById("listener-count").textContent=l.listeners??document.getElementById("listener-count").textContent,l.is_quran&&l.quran_ref&&(document.getElementById("imam-quran").innerHTML=`<div class="card" style="padding:12px; border-left:3px solid var(--accent);">📖 ${l.quran_ref}</div>`),sn(l)}),n.on("disconnect",()=>o(!1,`⚠️ ${t("disconnected","Déconnecté")}`)),document.getElementById("btn-pause").onclick=()=>n.emit("control",{action:"pause"}),document.getElementById("btn-resume").onclick=()=>n.emit("control",{action:"resume"}),document.getElementById("btn-stop").onclick=()=>n.emit("control",{action:"stop"});function s(l){l&&n.emit("transcript",{text:l,is_final:!0,manual:!0})}document.getElementById("send-text").onclick=()=>{const l=document.getElementById("manual-text").value.trim();s(l),document.getElementById("manual-text").value=""};function r(){const l=document.getElementById("phrase-chips");if(!l)return;const c=ae();l.innerHTML=c.map((d,p)=>`
      <span class="btn btn-sm btn-secondary phrase-chip" data-i="${p}" style="cursor:pointer; font-family:var(--font-arabic); gap:6px;">
        ${d}
        <button class="phrase-del" data-i="${p}" title="${t("delete","Supprimer")}" aria-label="${t("delete","Supprimer")}" style="background:none; border:none; color:inherit; opacity:.6; padding:0; font:inherit; cursor:pointer;">✕</button>
      </span>
    `).join(""),l.querySelectorAll(".phrase-chip").forEach(d=>{d.onclick=p=>{p.target.classList.contains("phrase-del")||s(c[Number(d.dataset.i)])}}),l.querySelectorAll(".phrase-del").forEach(d=>{d.onclick=p=>{p.stopPropagation();const y=ae();y.splice(Number(d.dataset.i),1),Ee(y),r()}})}r(),document.getElementById("add-phrase").onclick=()=>{const l=document.getElementById("new-phrase"),c=l.value.trim();if(!c)return;const d=ae();d.push(c),Ee(d),l.value="",r()},document.getElementById("new-phrase").onkeydown=l=>{l.key==="Enter"&&(l.preventDefault(),document.getElementById("add-phrase").click())},document.getElementById("reset-phrases").onclick=()=>{localStorage.removeItem("khutbah-phrases"),r(),m(t("defaults_restored","Liste par défaut rétablie"),"success")},n.emit("join-broadcast",{code:e,token:a})}function sn(e){const n=document.getElementById("imam-segments");if(!n)return;const a=document.createElement("div");a.className=`khutbah-segment ${e.is_quran?"quran":""}`,a.innerHTML=`
    <div class="arabic">${e.arabic||""}</div>
    <div style="font-size:0.8em; color:var(--muted);">seq #${e.seq} ${e.provider?`· ${e.provider}`:""}</div>
  `,n.prepend(a)}const rn=Object.freeze(Object.defineProperty({__proto__:null,renderImam:nn},Symbol.toStringTag,{value:"Module"}));async function ln(e){const n=e==null?void 0:e.code;n?await un(n):await cn()}async function cn(){h(`
    <div class="card" style="max-width:500px; margin:20px auto; text-align:center;">
      <h2 class="card-header" style="justify-content:center;">🎙️ ${t("khutbah_live","Khutbah Live")}</h2>

      <div style="background:var(--bg2); border-radius:12px; padding:20px; margin-bottom:16px;">
        <div style="font-size:1.5em; margin-bottom:8px;">📱</div>
        <h3 style="margin:0 0 8px;">${t("scan_qr_title","Scannez le QR Code")}</h3>
        <p style="color:var(--muted); margin:0; line-height:1.5;">
          ${t("scan_qr_instructions","Affichez le QR Code projeté à l'écran de la mosquée. Ouvrez l'appareil photo de votre téléphone et scannez-le pour rejoindre la session automatiquement.")}
        </p>
      </div>

      <div style="margin:20px 0; color:var(--muted);">— ${t("or","ou")} —</div>

      <div class="form-group">
        <input type="text" id="session-code" placeholder="${t("session_code","Code de session")}"
               maxlength="6" style="text-align:center; font-size:1.3em; letter-spacing:0.15em; text-transform:uppercase;" />
      </div>

      <button class="btn btn-primary btn-block" id="join-btn">${t("join","Rejoindre")}</button>
    </div>

    ${Z()?`
      <div class="card" style="max-width:500px; margin:0 auto;">
        <h3 class="card-header">👑 ${t("imam_tools","Outils Imam")}</h3>
        <button class="btn btn-primary btn-block" id="start-session">${t("start_session","Démarrer une Khutbah")}</button>
      </div>
    `:""}
  `),document.getElementById("join-btn").onclick=()=>{const e=document.getElementById("session-code").value.trim().toUpperCase();e.length>=4&&(location.hash=`#/khutbah/${e}`)},document.getElementById("session-code").onkeydown=e=>{e.key==="Enter"&&document.getElementById("join-btn").click()},document.getElementById("start-session")&&(document.getElementById("start-session").onclick=async()=>{try{const e=await u("/api/session",{method:"POST",body:{target_langs:["fr","en"]}});e.broadcaster_token&&Je(e.code,e.broadcaster_token),m(`${t("session_created","Session créée")}: ${e.code}`,"success"),location.hash=`#/imam/${e.code}`}catch(e){m(e.message,"error")}})}const ge=[.85,1,1.15,1.35,1.6];let L=Qe(parseInt(localStorage.getItem("khutbah-fs-idx"),10)),D=localStorage.getItem("khutbah-tts")==="1",re="fr";const H=[],dn=3;function Qe(e){return Number.isFinite(e)&&e>=0&&e<ge.length?e:1}async function un(e){h(`
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
      <a href="#/khutbah" class="btn btn-sm btn-secondary">←</a>
      <span style="font-weight:600; font-family:var(--font-heading);">🎙️ Khutbah Live</span>
      <span id="khutbah-status" class="badge-live" style="margin-left:4px;">${t("connecting","Connexion...")}</span>
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
      <button class="icon-btn" id="fs-minus" type="button" title="${t("text_smaller","Texte plus petit")}" aria-label="${t("text_smaller","Texte plus petit")}">A−</button>
      <button class="icon-btn" id="fs-plus" type="button" title="${t("text_larger","Texte plus grand")}" aria-label="${t("text_larger","Texte plus grand")}">A+</button>
      <button class="icon-btn" id="tts-toggle" type="button" title="${t("voice_playback","Lecture vocale")}" aria-label="${t("voice_playback","Lecture vocale")}" aria-pressed="${D}">${D?"🔊":"🔇"}</button>
    </div>

    <div id="interim-line" style="direction:rtl; text-align:right; font-family:var(--font-arabic); font-size:1.5em; color:var(--accent2); min-height:1.4em; margin-bottom:8px;"></div>

    ${B("۞")}

    <div id="segments" style="--khutbah-fs:${ge[L]}; max-height:60vh; overflow-y:auto; padding:4px 0 12px;"></div>
  `);const n=Ge("/khutbah"),a=()=>document.getElementById("khutbah-status");function i(s,r){const l=a();l&&(l.textContent=r,l.classList.toggle("live",!!s))}n.on("connect",()=>i(!1,t("connected","Connecté"))),n.on("hello",s=>{var r;if(i(s.status==="live",s.status==="live"?`🔴 ${t("live","LIVE")}`:`⏸ ${s.status}`),s.seq,(r=s.history)!=null&&r.length)for(const l of s.history)Se(l,{speak:!1})}),n.on("interim",s=>{const r=document.getElementById("interim-line");r&&(r.textContent=s.arabic||"")}),n.on("phrase",s=>{if(s.corrected){const r=document.querySelector(`[data-seq="${s.seq}"] .arabic`);r&&(r.textContent=s.arabic||r.textContent)}else Se(s,{speak:!0}),s.seq}),n.on("session",s=>{i(s.status==="live",s.status==="live"?`🔴 ${t("live","LIVE")}`:`⏸ ${s.status}`)}),n.on("disconnect",()=>i(!1,`⚠️ ${t("disconnected","Déconnecté")} — ${t("reconnecting","Reconnexion...")}`));const o=document.getElementById("lang-select");re=o.value,o.onchange=s=>{re=s.target.value,le(),n.emit("set-lang",{lang:s.target.value})},document.getElementById("fs-minus").onclick=()=>ke(L-1),document.getElementById("fs-plus").onclick=()=>ke(L+1),document.getElementById("tts-toggle").onclick=()=>mn(!D),n.emit("join-listen",{code:e,lang:o.value}),window.addEventListener("hashchange",le,{once:!0})}function ke(e){L=Qe(e),localStorage.setItem("khutbah-fs-idx",String(L));const n=document.getElementById("segments");n&&n.style.setProperty("--khutbah-fs",ge[L])}function mn(e){D=e,localStorage.setItem("khutbah-tts",e?"1":"0");const n=document.getElementById("tts-toggle");n&&(n.textContent=e?"🔊":"🔇",n.setAttribute("aria-pressed",String(e))),e||le()}function le(){H.length=0,window.speechSynthesis&&window.speechSynthesis.cancel()}function pn(e){!D||!e||!window.speechSynthesis||(H.length>=dn&&H.shift(),H.push(e),window.speechSynthesis.speaking||ce())}function ce(){const e=H.shift();if(e===void 0)return;const n=new SpeechSynthesisUtterance(e);n.lang=S(re),n.onend=ce,n.onerror=ce,window.speechSynthesis.speak(n)}function Se(e,{speak:n=!1}={}){const a=document.getElementById("segments");if(!a)return;const i=document.createElement("div");i.className=`khutbah-segment ${e.is_quran?"quran":""} ${e.degraded?"degraded":""}`,i.setAttribute("data-seq",e.seq),i.innerHTML=`
    ${e.arabic?`<div class="arabic">${e.arabic}</div>`:""}
    <div class="translation" style="font-size:var(--khutbah-fs, 1em);">${e.text||""}</div>
    ${e.is_quran&&e.quran_ref?`<div style="font-size:0.8em; color:var(--accent); margin-top:4px;">📖 ${e.quran_ref}</div>`:""}
    ${e.degraded?`<div style="font-size:0.75em; color:var(--warn);">⚠️ ${t("degraded","Mode dégradé")}</div>`:""}
  `,a.appendChild(i),a.scrollTop=a.scrollHeight,n&&pn(e.text)}const gn=Object.freeze(Object.defineProperty({__proto__:null,renderKhutbah:ln},Symbol.toStringTag,{value:"Module"}));async function hn(e){var r;const n=e==null?void 0:e.mosqueId;h(`
    <div class="card">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; margin-bottom:4px;">
        <h2 class="card-header" style="margin-bottom:0;">🕌 ${t("prayer_times","Horaires de prière")}</h2>
        <button class="btn btn-sm btn-gold" id="btn-use-my-position">📍 ${t("use_my_position","Utiliser ma position exacte")}</button>
      </div>
      <div id="prayer-source-note" style="font-size:.82em; color:var(--muted); margin-bottom:10px;"></div>
      <div id="prayer-mosque-wrap" class="form-group" style="display:none;">
        <label>${t("mosque","Mosquée")}</label>
        <select id="prayer-mosque"></select>
      </div>
      <div id="prayer-content" class="loading-center"><div class="spinner"></div></div>
    </div>

    <div id="mosque-location"></div>
  `);const a=new Date().toISOString().split("T")[0];let i=[],o=n,s=null;try{if(i=await u("/api/mosques",{auth:!1}),o||(o=((r=i==null?void 0:i[0])==null?void 0:r.id)||null),s=(i==null?void 0:i.find(l=>l.id===o))||(i==null?void 0:i[0])||null,i&&i.length>1){const l=document.getElementById("prayer-mosque-wrap"),c=document.getElementById("prayer-mosque");l.style.display="block",i.forEach(d=>{const p=document.createElement("option");p.value=d.id,p.textContent=d.name,p.selected=d.id===o,c.appendChild(p)}),c.onchange=()=>{location.hash=`#/prayer/${c.value}`}}await yn(o,a),bn(s)}catch{he(de())}document.getElementById("btn-use-my-position").onclick=()=>vn(o,a)}async function yn(e,n){let a;try{a=e?await u(`/api/prayer-times/${e}?date=${n}`,{auth:!1}):de()}catch{a=de()}he(a),We(null)}function We(e){const n=document.getElementById("prayer-source-note");n&&(n.textContent=e||"")}function vn(e,n){const a=document.getElementById("btn-use-my-position");if(!navigator.geolocation){m(t("geolocation_unavailable","Géolocalisation non disponible"),"error");return}a.disabled=!0;const i=a.textContent;a.textContent="📡 "+t("locating","Localisation..."),navigator.geolocation.getCurrentPosition(async o=>{const{latitude:s,longitude:r}=o.coords;try{const l=await u(`/api/prayer-times/${e||"geo"}?date=${n}&lat=${s}&lng=${r}`,{auth:!1});he(l),We("📍 "+t("times_for_your_position","Horaires calculés pour votre position exacte")+` (${s.toFixed(3)}, ${r.toFixed(3)})`),m(t("position_used","Position exacte utilisée"),"success")}catch{m(t("geolocation_unavailable","Géolocalisation non disponible"),"error")}finally{a.disabled=!1,a.textContent=i}},()=>{m(t("geolocation_unavailable","Géolocalisation non disponible"),"error"),a.disabled=!1,a.textContent=i},{timeout:1e4,enableHighAccuracy:!0})}function fn(e,n,a,i){const s=(a-e)*Math.PI/180,r=(i-n)*Math.PI/180,l=Math.sin(s/2)**2+Math.cos(e*Math.PI/180)*Math.cos(a*Math.PI/180)*Math.sin(r/2)**2;return 6371*2*Math.atan2(Math.sqrt(l),Math.sqrt(1-l))}function bn(e){const n=document.getElementById("mosque-location");if(!n||!e||e.lat==null&&!e.address){n&&(n.innerHTML="");return}const a=e.lat!=null&&e.lng!=null?`https://www.google.com/maps/search/?api=1&query=${e.lat},${e.lng}`:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.address||e.name||"")}`;n.innerHTML=`
    <div class="card" style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
      <span class="icon-badge">📍</span>
      <div style="flex:1; min-width:180px;">
        <div style="font-weight:600;">${e.name||t("mosque_location","Localisation de la mosquée")}</div>
        ${e.address?`<div style="font-size:.85em; color:var(--muted);">${e.address}</div>`:""}
        <div id="mosque-distance" style="font-size:.85em; color:var(--accent); margin-top:2px;"></div>
      </div>
      <a class="btn btn-sm btn-secondary" href="${a}" target="_blank" rel="noopener">🗺️ ${t("get_directions","Itinéraire")}</a>
      ${e.lat!=null?`<button class="btn btn-sm btn-secondary" id="btn-locate-me">📡 ${t("locate_me","Me localiser")}</button>`:""}
    </div>
  `;const i=document.getElementById("btn-locate-me");i&&(i.onclick=()=>{if(!navigator.geolocation){m(t("geolocation_unavailable","Géolocalisation non disponible"),"error");return}i.disabled=!0,navigator.geolocation.getCurrentPosition(o=>{const s=fn(o.coords.latitude,o.coords.longitude,e.lat,e.lng),r=document.getElementById("mosque-distance");r&&(r.textContent="📏 "+t("distance_away","à {km} km de vous").replace("{km}",s<1?s.toFixed(2):s.toFixed(1))),i.disabled=!1},()=>{m(t("geolocation_unavailable","Géolocalisation non disponible"),"error"),i.disabled=!1},{timeout:1e4})})}function de(){return{date:new Date().toISOString().split("T")[0],fajr:{name:"Fajr",time:"05:30",type:"adhan"},sunrise:{name:"Sunrise",time:"07:15",type:"adhan"},dhuhr:{name:"Dhuhr",time:"13:00",type:"adhan"},asr:{name:"Asr",time:"16:30",type:"adhan"},maghrib:{name:"Maghrib",time:"19:45",type:"adhan"},isha:{name:"Isha",time:"21:15",type:"adhan"}}}function he(e){var l;const n=document.getElementById("prayer-content");if(!n)return;n.className="";const a=new Date,i=a.getHours()*60+a.getMinutes(),s=[{key:"fajr",name:t("fajr","Fajr"),icon:"🌅"},{key:"sunrise",name:t("sunrise","Sunrise"),icon:"☀️"},{key:"dhuhr",name:t("dhuhr","Dhuhr"),icon:"🌤️"},{key:"asr",name:t("asr","Asr"),icon:"🌇"},{key:"maghrib",name:t("maghrib","Maghrib"),icon:"🌙"},{key:"isha",name:t("isha","Isha"),icon:"🌑"}].map(c=>{const d=e[c.key],p=(d==null?void 0:d.time)||d||"--:--",[y,$]=(typeof p=="string"?p:"--:--").split(":").map(Number);return{...c,time:p,min:Number.isFinite(y)&&Number.isFinite($)?y*60+$:null}});let r=null;for(const c of s)if(c.min!==null&&c.min>i){r=c.key;break}!r&&s.some(c=>c.min!==null)&&(r=s.find(c=>c.min!==null).key),n.innerHTML=`
    <div style="text-align:center; margin-bottom:16px; color:var(--muted);">${e.date||new Date().toISOString().split("T")[0]}</div>
    <div class="prayer-times-grid">
      ${s.map(c=>{var y;const d=c.key===r,p=((y=e[`${c.key}Iqama`])==null?void 0:y.time)||e[`${c.key}_iqama`]||null;return`
          <div class="prayer-card ${d?"active":""}">
            ${d?`<div style="font-size:.68em; color:var(--accent2); font-weight:700; letter-spacing:.05em; margin-bottom:2px;">${t("next_prayer","Prochaine prière").toUpperCase()}</div>`:""}
            <div class="name">${c.icon} ${c.name}</div>
            <div class="time">${c.time}</div>
            ${p?`<div class="type">${t("iqama","Iqama")}: ${p}</div>`:""}
          </div>
        `}).join("")}
    </div>

    ${e.jummahTime?`
      ${B("۞")}
      <div class="card card-accent" style="text-align:center;">
        <div class="name" style="font-weight:600;">🕌 Jumu'ah</div>
        <div class="time" style="font-size:1.4em; font-weight:700;">${((l=e.jummahTime)==null?void 0:l.time)||e.jummahTime}</div>
      </div>
    `:""}
  `}const xn=Object.freeze(Object.defineProperty({__proto__:null,renderPrayer:hn},Symbol.toStringTag,{value:"Module"}));let N=[];function Ye(){try{return JSON.parse(localStorage.getItem("quran-favorites")||"[]")}catch{return[]}}function $n(e){const n=Ye(),a=n.indexOf(e);return a>=0?n.splice(a,1):n.push(e),localStorage.setItem("quran-favorites",JSON.stringify(n)),n.includes(e)}function _n(){try{return JSON.parse(localStorage.getItem("quran-last-read")||"null")}catch{return null}}function wn(e,n){localStorage.setItem("quran-last-read",JSON.stringify({number:e,name:n,at:Date.now()}))}async function In(e){const n=e==null?void 0:e.number,a=e==null?void 0:e.ref;if(a){await Sn(a);return}if(n){await kn(parseInt(n));return}await En()}async function En(){const e=_n();h(`
    <div class="card">
      <h2 class="card-header">📖 ${t("quran","Coran")}</h2>

      ${e?`
        <a href="#/quran/surah/${e.number}" class="card card-link card-accent" style="display:flex; align-items:center; gap:12px; margin:0 0 16px; text-decoration:none; color:var(--fg);">
          <span class="icon-badge">📖</span>
          <div>
            <div style="font-size:.78em; color:var(--muted); text-transform:uppercase; letter-spacing:.05em;">${t("resume_reading","Reprendre la lecture")}</div>
            <div style="font-weight:600;">${e.name}</div>
          </div>
        </a>
      `:""}

      <div class="form-group">
        <input type="search" id="quran-search" placeholder="${t("search_surah","Rechercher une sourate...")}" />
      </div>
      <div id="surah-list" class="loading-center"><div class="spinner"></div></div>
    </div>
  `);try{N=await u("/api/quran/surahs",{auth:!1}),J(N)}catch(n){const a=document.getElementById("surah-list");a.className="",a.innerHTML=`<p style="color:var(--danger);">${n.message}</p>`}document.getElementById("quran-search").oninput=async n=>{const a=n.target.value.trim();if(a.length<2){J(N);return}const i=a.toLowerCase(),o=N.filter(r=>r.nameEnglish.toLowerCase().includes(i)||r.nameTransliteration.toLowerCase().includes(i)||r.nameArabic.includes(i)||String(r.number).includes(i));if(o.length){J(o);return}const s=document.getElementById("surah-list");s.innerHTML='<div class="loading-center"><div class="spinner"></div></div>';try{const r=await u(`/api/quran/search?q=${encodeURIComponent(a)}`,{auth:!1}),l=(r==null?void 0:r.results)||[];if(s.className="",!l.length){s.innerHTML=`<p style="color:var(--muted); text-align:center; padding:20px;">${t("no_results","Aucun résultat")}</p>`;return}s.innerHTML=l.map(c=>c.type==="verse"?`<a href="#/quran/verse/${c.ref}" class="card card-link" style="display:block; padding:12px; text-decoration:none; color:var(--fg); margin:0;">
             <div style="direction:rtl; text-align:right; font-family:var(--font-arabic); font-size:1.1em;">${c.text}</div>
             <div style="font-size:0.8em; color:var(--accent); margin-top:4px;">📖 ${c.ref}</div>
           </a>`:`<a href="#/quran/surah/${c.ref}" class="card card-link" style="display:block; padding:12px; text-decoration:none; color:var(--fg); margin:0;">
             <div style="font-weight:600;">📖 ${c.text}</div>
           </a>`).join("")}catch{J(N)}}}function J(e){const n=document.getElementById("surah-list");if(!n)return;n.className="";const a=Ye(),i=a.length?[...e].sort((o,s)=>(a.includes(s.number)?1:0)-(a.includes(o.number)?1:0)):e;n.innerHTML=`
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
          <button class="icon-btn btn-fav" data-number="${o.number}" title="${t("favorite","Favori")}" aria-label="${t("favorite","Favori")}" aria-pressed="${a.includes(o.number)}">${a.includes(o.number)?"⭐":"☆"}</button>
        </div>
      `).join("")}
    </div>
  `,n.querySelectorAll(".btn-fav").forEach(o=>{o.onclick=s=>{s.preventDefault();const r=Number(o.dataset.number),l=$n(r);o.textContent=l?"⭐":"☆",o.setAttribute("aria-pressed",String(l))}})}async function kn(e){h(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/quran" class="btn btn-sm btn-secondary">←</a>
      <h2 style="flex:1;" id="surah-title"><div class="spinner"></div></h2>
      <button class="btn btn-sm btn-secondary" id="btn-play-all">▶ ${t("play_all","Tout écouter")}</button>
    </div>
    <div id="surah-content" class="loading-center"><div class="spinner"></div></div>
    <audio id="ayah-audio" style="width:100%; margin-top:12px; display:none;" controls></audio>
  `);try{const n=await u(`/api/quran/surahs/${e}`,{auth:!1});document.getElementById("surah-title").textContent=`${n.nameTransliteration} — ${n.nameEnglish}`,wn(e,`${n.nameTransliteration} — ${n.nameEnglish}`);const a=document.getElementById("surah-content");a.className="",a.innerHTML=`
      <div style="text-align:center; font-size:1.8em; color:var(--accent2); direction:rtl; font-family:var(--font-arabic); margin-bottom:24px; line-height:1.8;">
        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
      </div>
      ${(n.ayahs||[]).map(o=>`
        <div class="ayah" id="ayah-${o.ayahNumber}">
          <div class="arabic">${o.textArabic} <span class="ref">(${o.ayahNumber})</span></div>
          ${o.translation?`<div class="translation">${o.translation}</div>`:""}
          <div style="display:flex; gap:8px; margin-top:6px;">
            <button class="btn btn-sm btn-secondary btn-play-ayah" data-ayah="${o.ayahNumber}">▶ ${t("listen","Écouter")}</button>
            <button class="btn btn-sm btn-secondary btn-tts-ayah" data-ayah="${o.ayahNumber}" data-ref="${e}:${o.ayahNumber}">🔊 ${t("read_aloud","Lire")}</button>
          </div>
        </div>
      `).join("")}
    `;const i=document.getElementById("ayah-audio");a.querySelectorAll(".btn-play-ayah").forEach(o=>{o.onclick=()=>{const s=r=>String(r).padStart(3,"0");i.src=`https://everyayah.com/data/Alafasy_128kbps/${s(e)}${s(Number(o.dataset.ayah))}.mp3`,i.style.display="block",i.play()}}),a.querySelectorAll(".btn-tts-ayah").forEach(o=>{o.onclick=()=>Xe(o.dataset.ref)}),document.getElementById("btn-play-all").onclick=()=>{const o=s=>String(s).padStart(3,"0");i.src=`https://everyayah.com/data/Alafasy_128kbps/${o(e)}001.mp3`,i.style.display="block",i.play()}}catch(n){const a=document.getElementById("surah-content");a.className="",a.innerHTML=`<p style="color:var(--danger);">${n.message}</p>`}}async function Sn(e){var n,a,i,o;h(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/quran" class="btn btn-sm btn-secondary">←</a>
      <h2 style="flex:1;">📖 Sourate ${e}</h2>
    </div>
    <div id="verse-content" class="loading-center"><div class="spinner"></div></div>
    <audio id="verse-audio" style="width:100%; margin-top:12px; display:none;" controls></audio>
  `);try{const s=await u(`/api/quran/verse/${e}`,{auth:!1}),r=document.getElementById("verse-content");r.className="";const l=e.split(/[:.]/)[0],c=e.split(/[:.]/)[1];r.innerHTML=`
      <div class="card">
        <div style="text-align:center; margin-bottom:8px; color:var(--muted);">${((n=s.surah)==null?void 0:n.nameTransliteration)||""} — Ayah ${((a=s.ayah)==null?void 0:a.ayahNumber)||""}</div>
        <div class="ayah">
          <div class="arabic" style="font-size:1.6em; line-height:2;">${((i=s.ayah)==null?void 0:i.textArabic)||""}</div>
          ${(o=s.ayah)!=null&&o.translation?`<div class="translation" style="font-size:1.1em;">${s.ayah.translation}</div>`:""}
        </div>
        <div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap;">
          <button class="btn btn-primary" id="btn-play">▶ ${t("listen","Écouter")}</button>
          <button class="btn btn-secondary" id="btn-tts">🔊 ${t("read_aloud","Lire")}</button>
        </div>
      </div>
    `;const d=document.getElementById("verse-audio");document.getElementById("btn-play").onclick=()=>{const p=y=>String(y).padStart(3,"0");d.src=`https://everyayah.com/data/Alafasy_128kbps/${p(Number(l))}${p(Number(c))}.mp3`,d.style.display="block",d.play()},document.getElementById("btn-tts").onclick=()=>Xe(e)}catch(s){const r=document.getElementById("verse-content");r.className="",r.innerHTML=`<p style="color:var(--danger);">${s.message}</p>`}}function Xe(e){if(!("speechSynthesis"in window)){m(t("tts_unsupported","Lecture vocale non supportée"),"error");return}u(`/api/quran/verse/${e}`,{auth:!1}).then(n=>{var o,s,r;const a=((o=n==null?void 0:n.ayah)==null?void 0:o.translation)||((s=n==null?void 0:n.ayah)==null?void 0:s.textArabic)||"";if(!a)return;window.speechSynthesis.cancel();const i=new SpeechSynthesisUtterance(a);i.lang=(r=n==null?void 0:n.ayah)!=null&&r.translation?S():"ar-SA",i.rate=.95,window.speechSynthesis.speak(i)}).catch(()=>m(t("tts_failed","Impossible de lire ce verset"),"error"))}const Tn=Object.freeze(Object.defineProperty({__proto__:null,renderQuran:In},Symbol.toStringTag,{value:"Module"}));async function qn(e){var d,p,y;const n=new Date,a=new Intl.DateTimeFormat(S(),{day:"numeric",month:"long",year:"numeric"}).format(n);let i="",o=null;const s=await u("/api/hijri",{auth:!1}).catch(()=>null);if(s!=null&&s.hijri){const $=F()==="ar",b=$?s.hijri.monthNameAr:s.hijri.monthNameFr;i=$?`${s.hijri.day} ${b} ${s.hijri.year} هـ`:`${s.hijri.day} ${b} ${s.hijri.year} AH`,s.hijri.month===9&&(i+=` · ${t("ramadan","Ramadan")}`,o=s.hijri.day)}let r=null;try{const $=await u("/api/mosques",{auth:!1}),b=(d=$==null?void 0:$[0])==null?void 0:d.id;if(b){const g=new Date().toISOString().split("T")[0];r=await u(`/api/prayer-times/${b}?date=${g}`,{auth:!1})}}catch{r=null}const l=((p=r==null?void 0:r.fajr)==null?void 0:p.time)||"--:--",c=((y=r==null?void 0:r.maghrib)==null?void 0:y.time)||"--:--";h(`
    <div class="hero-mosque" style="padding-top:24px;">
      <div style="font-size:3em;">🌙</div>
      ${o?`<div class="badge-live live" style="display:inline-block; margin:8px 0 2px;">${t("ramadan_day","Jour")} ${o}</div>`:""}
      <h2 style="margin:8px 0 4px;">${t("ramadan","Ramadan")}</h2>
      <p style="color:var(--muted);">${a}</p>
      ${i?`<p style="color:var(--accent2); font-weight:600;">${i}</p>`:""}
    </div>

    ${B("✦ ✦ ✦")}

    <div class="card-grid">
      <div class="card card-accent">
        <h3 class="card-header">🌅 ${t("fajr","Fajr")}</h3>
        <div style="font-size:2em; font-weight:700; text-align:center;">${l}</div>
        <div style="text-align:center; color:var(--muted); font-size:0.9em;">${t("dawn_prayer","Prière de l'aube")}</div>
      </div>

      <div class="card card-accent">
        <h3 class="card-header">🌇 ${t("maghrib","Maghrib")}</h3>
        <div style="font-size:2em; font-weight:700; text-align:center;">${c}</div>
        <div style="text-align:center; color:var(--muted); font-size:0.9em;">${t("iftar","Iftar")}</div>
      </div>

      <div class="card">
        <h3 class="card-header">🌙 ${t("tarawih","Tarawih")}</h3>
        <div style="font-size:2em; font-weight:700; text-align:center;">21:30</div>
        <div style="text-align:center; color:var(--muted); font-size:0.9em;">${t("night_prayer","Prière de la nuit")} · <em>${t("indicative","indicatif")}</em></div>
      </div>

      <div class="card">
        <h3 class="card-header">📖 ${t("juz_of_day","Juz du jour")}</h3>
        <div style="font-size:1.1em; text-align:center; color:var(--accent);">${t("juz_info","Consultez le programme de la mosquée")}</div>
      </div>
    </div>
  `)}const An=Object.freeze(Object.defineProperty({__proto__:null,renderRamadan:qn},Symbol.toStringTag,{value:"Module"}));async function Bn(){h(`
    <div class="card" style="text-align:center; padding:30px;">
      <div style="font-size:3em;">🤲</div>
      <h2 style="margin:12px 0;">${t("donate","Faire un don")}</h2>
      <p style="color:var(--muted); margin-bottom:20px;">${t("donate_subtitle","Votre soutien est essentiel pour la vie de la mosquée. Qu'Allah vous récompense.")}</p>
      <div id="donation-content" class="loading-center"><div class="spinner"></div></div>
    </div>
  `);let e="";try{const n=await u("/api/settings/public",{auth:!1});e=(n==null?void 0:n.name)||"";const a=(n==null?void 0:n.donation)||{},i=a.paypal||a.iban||a.text,o=document.getElementById("donation-content");o.className="",o.innerHTML=`
      ${a.title?`<h3 style="color:var(--accent); margin-bottom:12px;">${a.title}</h3>`:""}

      ${a.iban?`
        <div class="card" style="background:var(--bg2); text-align:left;">
          <div style="font-weight:600; margin-bottom:6px;">🏦 ${t("bank_transfer","Virement bancaire")}</div>
          <div style="font-family:monospace; font-size:1.05em; word-break:break-all;">${a.iban}</div>
          ${a.bankName?`<div style="color:var(--muted); font-size:0.85em; margin-top:4px;">${a.bankName}</div>`:""}
          <button class="btn btn-sm btn-secondary" id="copy-iban" style="margin-top:12px;">📋 ${t("copy","Copier")}</button>
        </div>
      `:""}

      ${a.paypal?`
        <a class="btn btn-primary btn-block" style="margin:8px 0;" href="${a.paypal}" target="_blank" rel="noopener">
          💳 PayPal ${t("donate","— Faire un don")}
        </a>
      `:""}

      ${a.text?`
        <div class="card" style="text-align:center;">
          <div style="font-size:0.9em; color:var(--muted); margin-bottom:8px;">${a.text}</div>
          <button class="btn btn-sm btn-secondary" id="copy-text" style="cursor:pointer;">📋 ${t("copy","Copier")}</button>
        </div>
      `:""}

      ${i?`
        <div style="margin-top:16px;">
          ${a.paypal||a.iban?`
            <img src="${X}/api/qr.png?text=${encodeURIComponent(a.paypal||a.iban)}&size=9"
                 style="width:180px; background:#fff; padding:8px; border-radius:12px;"
                 alt="QR don" />
            <div style="color:var(--muted); font-size:0.85em; margin-top:6px;">${t("donate_qr_hint","Scannez avec l'appareil photo de votre téléphone")}</div>
          `:""}
        </div>
      `:`
        <p style="color:var(--muted); font-size:0.9em; margin-top:8px;">
          ${t("donate_contact","Contactez la mosquée pour connaître les moyens de soutien.")}
        </p>
      `}
    `;const s=document.getElementById("copy-iban");s&&(s.onclick=()=>{var l;(l=navigator.clipboard)==null||l.writeText(a.iban).then(()=>m(t("copied","Copié"),"success"))});const r=document.getElementById("copy-text");r&&(r.onclick=()=>{var l;(l=navigator.clipboard)==null||l.writeText(a.text||"").then(()=>m(t("copied","Copié"),"success"))})}catch{const n=document.getElementById("donation-content");n.className="",n.innerHTML=`<p style="color:var(--muted);">${t("donate_contact","Contactez la mosquée pour connaître les moyens de soutien.")}</p>`}if(e){const n=document.querySelector("#main h2");n&&(n.textContent+=` — ${e}`)}}const Ln=Object.freeze(Object.defineProperty({__proto__:null,renderSupport:Bn},Symbol.toStringTag,{value:"Module"}));
