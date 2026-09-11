import{io as ae}from"https://cdn.socket.io/4.7.5/socket.io.esm.min.js";(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function a(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(o){if(o.ep)return;o.ep=!0;const s=a(o);fetch(o.href,s)}})();const ie="modulepreload",oe=function(e,n){return new URL(e,n).href},C={},f=function(n,a,i){let o=Promise.resolve();if(a&&a.length>0){const r=document.getElementsByTagName("link"),l=document.querySelector("meta[property=csp-nonce]"),u=(l==null?void 0:l.nonce)||(l==null?void 0:l.getAttribute("nonce"));o=Promise.allSettled(a.map(m=>{if(m=oe(m,i),m in C)return;C[m]=!0;const g=m.endsWith(".css"),x=g?'[rel="stylesheet"]':"";if(!!i)for(let h=r.length-1;h>=0;h--){const E=r[h];if(E.href===m&&(!g||E.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${m}"]${x}`))return;const y=document.createElement("link");if(y.rel=g?"stylesheet":ie,g||(y.as="script"),y.crossOrigin="",y.href=m,u&&y.setAttribute("nonce",u),document.head.appendChild(y),g)return new Promise((h,E)=>{y.addEventListener("load",h),y.addEventListener("error",()=>E(new Error(`Unable to preload CSS for ${m}`)))})}))}function s(r){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=r,window.dispatchEvent(l),!l.defaultPrevented)throw r}return o.then(r=>{for(const l of r||[])l.status==="rejected"&&s(l.reason);return n().catch(s)})},G=[];function v(e,n,a={}){const i=[],o=e.replace(/:([^/]+)/g,(s,r)=>(i.push(r),"([^/]+)"));G.push({pattern:e,regex:new RegExp(`^${o}$`),paramNames:i,handler:n,meta:a})}function se(e){location.hash=`#${e}`}function re(e){const n=e.replace(/^#/,"")||"/";for(const a of G){const i=n.match(a.regex);if(i){const o={};return a.paramNames.forEach((s,r)=>{o[s]=i[r+1]}),{route:a,params:o,path:n}}}return null}async function O(){const e=location.hash||"#/",n=re(e);if(!n){document.getElementById("main").innerHTML=`
      <div style="text-align:center; padding:60px 20px;">
        <div style="font-size:3em; margin-bottom:16px;">🕌</div>
        <h2>404 — Page not found</h2>
        <p style="color:var(--muted); margin:12px 0;">This page doesn't exist.</p>
        <a href="#/" class="btn btn-primary">← Home</a>
      </div>`;return}await n.route.handler(n.params),le(n.path)}function le(e){document.querySelectorAll("#main-nav a, #mobile-nav a").forEach(n=>{var i;const a=((i=n.getAttribute("href"))==null?void 0:i.replace("#",""))||"";n.classList.toggle("active",e.startsWith(a)&&a!=="/")})}function de(){window.addEventListener("hashchange",O),O()}const I={ar:{dir:"rtl",label:"العربية"},fr:{dir:"ltr",label:"Français"},en:{dir:"ltr",label:"English"},nl:{dir:"ltr",label:"Nederlands"},de:{dir:"ltr",label:"Deutsch"},es:{dir:"ltr",label:"Español"},tr:{dir:"ltr",label:"Türkçe"},ur:{dir:"rtl",label:"اردو"},bn:{dir:"ltr",label:"বাংলা"},ha:{dir:"ltr",label:"Hausa"},wo:{dir:"ltr",label:"Wolof"},it:{dir:"ltr",label:"Italiano"},pt:{dir:"ltr",label:"Português"},id:{dir:"ltr",label:"Bahasa Indonesia"}};let w=localStorage.getItem("uiLang")||"fr",U={},T={};function ce(){return w}function me(e){return I[e]}function ue(){return Object.keys(I)}async function pe(e){I[e]&&(w=e,localStorage.setItem("uiLang",e),T[e]||await K(e),W(),document.documentElement.lang=e,document.documentElement.dir=I[e].dir)}async function K(e){try{const n=await fetch(`../lang/${e}.json`);n.ok&&(U[e]=await n.json(),T[e]=!0)}catch{}T[e]=T[e]||!0}function t(e,n){var i;return((i=U[w])==null?void 0:i[e])||n||e}function W(){document.querySelectorAll("[data-i18n]").forEach(e=>{const n=e.getAttribute("data-i18n"),a=t(n);a!==n&&(e.textContent=a)}),document.querySelectorAll("[data-i18n-placeholder]").forEach(e=>{const n=e.getAttribute("data-i18n-placeholder"),a=t(n);a!==n&&(e.placeholder=a)})}async function ve(){await K(w),W(),document.documentElement.lang=w,I[w]&&(document.documentElement.dir=I[w].dir)}function ge(e){e==="auto"?(localStorage.removeItem("theme"),document.documentElement.removeAttribute("data-theme")):(localStorage.setItem("theme",e),document.documentElement.setAttribute("data-theme",e))}function ye(e){e?(localStorage.setItem("contrast","high"),document.documentElement.setAttribute("data-contrast","high")):(localStorage.removeItem("contrast"),document.documentElement.removeAttribute("data-contrast"))}function he(e){e?(localStorage.setItem("senior-mode","true"),document.documentElement.setAttribute("data-senior","true")):(localStorage.removeItem("senior-mode"),document.documentElement.removeAttribute("data-senior"))}function fe(){const e=localStorage.getItem("theme");e&&document.documentElement.setAttribute("data-theme",e),localStorage.getItem("contrast")==="high"&&document.documentElement.setAttribute("data-contrast","high"),localStorage.getItem("senior-mode")==="true"&&document.documentElement.setAttribute("data-senior","true")}var F;const Q=((F=window.__CONFIG__)==null?void 0:F.BACKEND_URL)||(location.hostname==="localhost"?"http://localhost:8000":location.origin),z=Q;let $=localStorage.getItem("accessToken")||"",k=localStorage.getItem("refreshToken")||"",S=null;function be(e){S=e}function A(){return!!$}function xe(e,n){$=e,k=n,localStorage.setItem("accessToken",e),localStorage.setItem("refreshToken",n),S&&S(!0)}function $e(){$="",k="",localStorage.removeItem("accessToken"),localStorage.removeItem("refreshToken"),S&&S(!1)}async function _e(){if(!k)return!1;try{const e=await fetch(`${z}/api/auth/refresh`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refreshToken:k})});return e.ok?($=(await e.json()).accessToken,localStorage.setItem("accessToken",$),!0):($e(),!1)}catch{return!1}}async function d(e,n={}){const{method:a="GET",body:i,headers:o={},auth:s=!0}=n,r=e.startsWith("http")?e:`${z}${e}`,l={...o};s&&$&&(l.Authorization=`Bearer ${$}`),i&&!(i instanceof FormData)&&(l["Content-Type"]="application/json");let u=await fetch(r,{method:a,headers:l,body:i instanceof FormData?i:i?JSON.stringify(i):void 0});if(u.status===401&&s&&k&&await _e()&&(l.Authorization=`Bearer ${$}`,u=await fetch(r,{method:a,headers:l,body:i instanceof FormData?i:i?JSON.stringify(i):void 0})),!u.ok){const g=await u.json().catch(()=>({error:u.statusText}));throw new Error(g.error||`HTTP ${u.status}`)}const m=u.headers.get("content-type")||"";return m.includes("application/json")?u.json():m.includes("image/")?u.blob():u.text()}function p(e,n="info",a=4e3){const i=document.getElementById("toast-container"),o=document.createElement("div");o.className=`toast toast-${n}`,o.textContent=e,i.appendChild(o),setTimeout(()=>{o.style.opacity="0",setTimeout(()=>o.remove(),300)},a)}function c(e){const n=document.getElementById("main");typeof e=="string"?n.innerHTML=e:e instanceof HTMLElement&&(n.innerHTML="",n.appendChild(e))}const we=Object.assign({"../modules/admin/index.js":()=>f(()=>Promise.resolve().then(()=>Ce),void 0,import.meta.url),"../modules/announcements/index.js":()=>f(()=>Promise.resolve().then(()=>He),void 0,import.meta.url),"../modules/auth/index.js":()=>f(()=>Promise.resolve().then(()=>Re),void 0,import.meta.url),"../modules/display/index.js":()=>f(()=>Promise.resolve().then(()=>Fe),void 0,import.meta.url),"../modules/events/index.js":()=>f(()=>Promise.resolve().then(()=>We),void 0,import.meta.url),"../modules/home/index.js":()=>f(()=>Promise.resolve().then(()=>Ye),void 0,import.meta.url),"../modules/imam/index.js":()=>f(()=>Promise.resolve().then(()=>nt),void 0,import.meta.url),"../modules/khutbah/index.js":()=>f(()=>Promise.resolve().then(()=>st),void 0,import.meta.url),"../modules/prayer/index.js":()=>f(()=>Promise.resolve().then(()=>lt),void 0,import.meta.url),"../modules/quran/index.js":()=>f(()=>Promise.resolve().then(()=>pt),void 0,import.meta.url),"../modules/ramadan/index.js":()=>f(()=>Promise.resolve().then(()=>gt),void 0,import.meta.url)});async function b(e){const n=we[`../modules/${e}.js`];if(!n)throw new Error(`Module introuvable: ${e}`);return n()}async function Ee(){const{renderHome:e}=await b("home/index");await e()}async function J(e){const{renderPrayer:n}=await b("prayer/index");await n(e)}async function M(e){const{renderQuran:n}=await b("quran/index");await n(e)}async function Y(e){const{renderKhutbah:n}=await b("khutbah/index");await n(e)}async function Ie(e){const{renderAnnouncements:n}=await b("announcements/index");await n(e)}async function qe(e){const{renderEvents:n}=await b("events/index");await n(e)}async function ke(e){const{renderRamadan:n}=await b("ramadan/index");await n(e)}async function X(e){const{renderAdmin:n}=await b("admin/index");await n(e)}async function Z(e){const{renderImam:n}=await b("imam/index");await n(e)}async function ee(e){const{renderAuth:n}=await b("auth/index");await n(e)}async function te(e){const{renderDisplay:n}=await b("display/index");await n(e)}async function Se(){c(`
    <div class="card">
      <h2 class="card-header">⚙️ ${t("settings","Paramètres")}</h2>

      <div class="form-group">
        <label>${t("language","Langue")}</label>
        <select id="settings-lang">
          ${ue().map(e=>{var n;return`<option value="${e}" ${e===ce()?"selected":""}>${((n=me(e))==null?void 0:n.label)||e}</option>`}).join("")}
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
  `),document.getElementById("settings-lang").onchange=e=>pe(e.target.value),document.getElementById("settings-theme").onchange=e=>ge(e.target.value),document.getElementById("senior-mode").onchange=e=>he(e.target.checked),document.getElementById("high-contrast").onchange=e=>ye(e.target.checked),document.getElementById("settings-clear").onclick=()=>{caches&&caches.keys().then(e=>e.forEach(n=>caches.delete(n))),p(t("cache_cleared","Cache vidé"),"success")}}v("/",Ee);v("/prayer",J);v("/prayer/:mosqueId",J);v("/quran",M);v("/quran/surah/:number",M);v("/quran/verse/:ref",M);v("/khutbah",Y);v("/khutbah/:code",Y);v("/announcements",Ie);v("/events",qe);v("/ramadan",ke);v("/admin",X);v("/admin/:mosqueId",X);v("/imam",Z);v("/imam/:code",Z);v("/auth",ee);v("/auth/:action",ee);v("/display",te);v("/display/:mosqueId",te);v("/settings",Se);function B(){const e=[{href:"#/",icon:"🏠",label:t("home","Accueil")},{href:"#/prayer",icon:"🕌",label:t("prayers","Prières")},{href:"#/quran",icon:"📖",label:t("quran","Coran")},{href:"#/khutbah",icon:"🎙️",label:t("khutbah_live","Khutbah Live")},{href:"#/announcements",icon:"📢",label:t("announcements","Annonces")},{href:"#/events",icon:"📅",label:t("events","Événements")},{href:"#/settings",icon:"⚙️",label:t("settings","Paramètres")}],n=document.getElementById("main-nav"),a=document.getElementById("mobile-nav");n.innerHTML=e.filter((i,o)=>o<5).map(i=>`<a href="${i.href}">${i.icon} ${i.label}</a>`).join(""),a.innerHTML=e.map(i=>`<a href="${i.href}"><span class="icon">${i.icon}</span>${i.label}</a>`).join("")}async function Te(){fe(),await ve(),B(),be(()=>B()),window.addEventListener("language-changed",()=>{B(),window.dispatchEvent(new HashChangeEvent("hashchange"))}),de()}Te().catch(e=>{console.error("App init failed:",e),c(`<div style="text-align:center;padding:60px;"><h2>⚠️ Initialization Error</h2><p>${e.message}</p></div>`)});"serviceWorker"in navigator&&navigator.serviceWorker.register("./sw.js").catch(()=>{});async function Ae(e){if(!A()){c(`
      <div class="card" style="max-width:420px; margin:40px auto; text-align:center;">
        <h2>🧑‍💼 ${t("admin","Administration")}</h2>
        <p style="color:var(--muted); margin:12px 0;">${t("login_required","Connexion requise")}</p>
        <a href="#/auth/login" class="btn btn-primary">${t("login","Se connecter")}</a>
      </div>
    `);return}switch((e==null?void 0:e.view)||(e==null?void 0:e.mosqueId)){case"mosques":return Be();case"users":return Le();case"sessions":return je();case"analytics":return Pe();case"settings":return ze();case"announcements":return Me()}c(`
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
  `)}async function Be(){c(`
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
  `);async function e(){const n=document.getElementById("mosques-list");try{const a=await d("/api/mosques");if(!a.length){n.innerHTML=`<div class="card" style="text-align:center; color:var(--muted); padding:24px;">${t("no_mosques","Aucune mosquée")}</div>`;return}n.innerHTML=`<div class="card-grid">${a.map(i=>`
        <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:600;">🕌 ${i.name}</div>
            <div style="font-size:0.85em; color:var(--muted);">📍 ${i.city||"—"}</div>
          </div>
          <button class="btn btn-danger btn-sm delete-mosque" data-id="${i.id}">🗑️</button>
        </div>
      `).join("")}</div>`,n.querySelectorAll(".delete-mosque").forEach(i=>{i.onclick=async()=>{if(confirm(t("confirm_delete","Supprimer cette mosquée ?")))try{await d(`/api/mosques/${i.dataset.id}`,{method:"DELETE"}),p(t("deleted","Supprimé"),"success"),e()}catch(o){p(o.message,"error")}}})}catch(a){n.innerHTML=`<div class="card" style="color:var(--danger);">${a.message}</div>`}}e(),document.getElementById("create-mosque").onclick=async()=>{const n=document.getElementById("mosque-name").value.trim(),a=document.getElementById("mosque-city").value.trim(),i=parseFloat(document.getElementById("mosque-lat").value)||null,o=parseFloat(document.getElementById("mosque-lng").value)||null;if(!n){p(t("name_required","Nom requis"),"error");return}try{await d("/api/mosques",{method:"POST",body:{name:n,city:a,latitude:i,longitude:o}}),p(t("mosque_created","Mosquée créée"),"success"),document.getElementById("mosque-name").value="",document.getElementById("mosque-city").value="",document.getElementById("mosque-lat").value="",document.getElementById("mosque-lng").value="",e()}catch(s){p(s.message,"error")}}}async function Le(){c(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/admin" class="btn btn-sm btn-secondary">← ${t("back_to_dashboard","Retour au tableau de bord")}</a>
      <h2>👥 ${t("users","Utilisateurs")}</h2>
    </div>
    <div id="users-list"><div class="loading-center"><div class="spinner"></div></div></div>
  `);const e=document.getElementById("users-list");try{const n=await d("/api/admin/users");if(!n.length){e.innerHTML=`<div class="card" style="text-align:center; color:var(--muted); padding:24px;">${t("no_users","Aucun utilisateur")}</div>`;return}e.innerHTML=`
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
    `}catch(n){e.innerHTML=`<div class="card" style="color:var(--danger);">${n.message}</div>`}}async function je(){c(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/admin" class="btn btn-sm btn-secondary">← ${t("back_to_dashboard","Retour au tableau de bord")}</a>
      <h2>🎙️ ${t("sessions","Sessions")}</h2>
    </div>
    <div id="sessions-list"><div class="loading-center"><div class="spinner"></div></div></div>
  `);const e=document.getElementById("sessions-list");try{const[n,a]=await Promise.all([d("/api/healthz").catch(()=>null),d("/api/admin/stats").catch(()=>({}))]);let i="";n!=null&&n.sessions&&(i+=`
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
      `),e.innerHTML=i||`<div class="card" style="text-align:center; color:var(--muted); padding:24px;">${t("no_data","Aucune donnée disponible")}</div>`}catch(n){e.innerHTML=`<div class="card" style="color:var(--danger);">${n.message}</div>`}}async function Pe(){c(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/admin" class="btn btn-sm btn-secondary">← ${t("back_to_dashboard","Retour au tableau de bord")}</a>
      <h2>📊 ${t("analytics","Statistiques")}</h2>
    </div>
    <div id="analytics-content"><div class="loading-center"><div class="spinner"></div></div></div>
  `);const e=document.getElementById("analytics-content");try{const n=await d("/api/admin/stats");e.innerHTML=`
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
      </div>
    `}catch(n){e.innerHTML=`<div class="card" style="color:var(--danger);">${n.message}</div>`}}async function ze(){c(`
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
      <button class="btn btn-primary btn-block" id="save-settings">${t("save","Enregistrer")}</button>
    </div>
  `);try{const e=await d("/api/admin/config");e&&(e.name&&(document.getElementById("cfg-name").value=e.name),e.city&&(document.getElementById("cfg-city").value=e.city),e.prayer_method&&(document.getElementById("cfg-method").value=e.prayer_method),e.default_language&&(document.getElementById("cfg-lang").value=e.default_language))}catch{}document.getElementById("save-settings").onclick=async()=>{const e={name:document.getElementById("cfg-name").value.trim(),city:document.getElementById("cfg-city").value.trim(),prayer_method:document.getElementById("cfg-method").value,default_language:document.getElementById("cfg-lang").value};try{await d("/api/admin/config",{method:"PUT",body:e}),p(t("settings_saved","Paramètres enregistrés"),"success")}catch(n){p(n.message,"error")}}}async function Me(){c(`
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
  `);let e=null;async function n(){var i;const a=document.getElementById("ann-list");try{const o=await d("/api/mosques");if(e=(i=o==null?void 0:o[0])==null?void 0:i.id,!e){a.innerHTML=`<div class="card" style="text-align:center; color:var(--muted); padding:24px;">${t("no_mosques","Aucune mosquée configurée")}</div>`;return}const s=await d(`/api/announcements/${e}`);if(!s.length){a.innerHTML=`<div class="card" style="text-align:center; color:var(--muted); padding:24px;">${t("no_announcements","Aucune annonce")}</div>`;return}a.innerHTML=`<div class="card-grid">${s.map(r=>`
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
      `).join("")}</div>`,a.querySelectorAll(".delete-ann").forEach(r=>{r.onclick=async()=>{if(confirm(t("confirm_delete_announcement","Supprimer cette annonce ?")))try{await d(`/api/announcements/${e}/${r.dataset.id}`,{method:"DELETE"}),p(t("deleted","Supprimé"),"success"),n()}catch(l){p(l.message,"error")}}})}catch(o){a.innerHTML=`<div class="card" style="color:var(--danger);">${o.message}</div>`}}n(),document.getElementById("create-ann").onclick=async()=>{if(!e){p(t("no_mosques","Aucune mosquée configurée"),"error");return}const a=document.getElementById("ann-title").value.trim(),i=document.getElementById("ann-body").value.trim(),o=document.getElementById("ann-category").value,s=document.getElementById("ann-priority").value;if(!a){p(t("title_required","Titre requis"),"error");return}try{await d(`/api/announcements/${e}`,{method:"POST",body:{title:a,body:i,category:o,priority:s}}),p(t("announcement_created","Annonce publiée"),"success"),document.getElementById("ann-title").value="",document.getElementById("ann-body").value="",n()}catch(r){p(r.message,"error")}}}const Ce=Object.freeze(Object.defineProperty({__proto__:null,renderAdmin:Ae},Symbol.toStringTag,{value:"Module"}));async function Oe(e){var i;const n=e==null?void 0:e.mosqueId;c(`
    <div class="card">
      <h2 class="card-header">📢 ${t("announcements","Annonces")}</h2>
      <div id="announcements-list" class="loading-center"><div class="spinner"></div></div>
    </div>
  `);let a=n||null;if(!a)try{const o=await d("/api/mosques",{auth:!1});a=((i=o==null?void 0:o[0])==null?void 0:i.id)||null}catch{a=null}if(a)try{const o=await d(`/api/announcements/${a}`,{auth:!1});De(o)}catch{document.getElementById("announcements-list").innerHTML=`<p style="color:var(--muted); text-align:center; padding:20px;">${t("no_announcements","Aucune annonce pour le moment")}</p>`}else document.getElementById("announcements-list").innerHTML=`
      <p style="color:var(--muted); text-align:center; padding:20px;">
        ${t("select_mosque","Sélectionnez une mosquée pour voir les annonces")}
      </p>
    `}function De(e){const n=document.getElementById("announcements-list");if(n){if(!(e!=null&&e.length)){n.innerHTML=`<p style="color:var(--muted); text-align:center;">${t("no_announcements","Aucune annonce")}</p>`;return}n.innerHTML=e.map(a=>`
    <div class="announcement-item ${a.priority==="urgent"?"urgent":""}">
      <div class="title">
        ${a.priority==="urgent"?"🔴 ":a.pinned?"📌 ":""}${a.title}
      </div>
      <div class="body">${a.body}</div>
      <div class="meta">
        ${a.publishedAt?new Date(a.publishedAt).toLocaleDateString():""}
        ${a.category?` · ${a.category}`:""}
      </div>
    </div>
  `).join("")}}const He=Object.freeze(Object.defineProperty({__proto__:null,renderAnnouncements:Oe},Symbol.toStringTag,{value:"Module"}));async function Ne(e){const n=(e==null?void 0:e.action)||"login";c(`
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
          <input type="password" name="password" required minlength="8" placeholder="••••••••" />
        </div>

        <button type="submit" class="btn btn-primary btn-block" id="auth-submit">
          ${n==="register"?t("create_account","Créer le compte"):t("login_btn","Se connecter")}
        </button>
      </form>

      <div style="text-align:center; margin-top:16px;">
        ${n==="register"?`<a href="#/auth/login">${t("have_account","Déjà un compte ? Se connecter")}</a>`:`<a href="#/auth/register">${t("no_account","Pas de compte ? Créer un compte")}</a>`}
      </div>
    </div>
  `),document.getElementById("auth-form").onsubmit=async a=>{a.preventDefault();const i=new FormData(a.target),o=document.getElementById("auth-submit");o.disabled=!0,o.textContent="⏳ ...";try{const s=Object.fromEntries(i),l=await d(n==="register"?"/api/auth/register":"/api/auth/login",{method:"POST",body:s,auth:!1});xe(l.accessToken,l.refreshToken),localStorage.setItem("userName",l.user.name),p(t("welcome","Bienvenue")+", "+l.user.name+" !","success"),se("/")}catch(s){p(s.message,"error"),o.disabled=!1,o.textContent=n==="register"?t("create_account","Créer le compte"):t("login_btn","Se connecter")}}}const Re=Object.freeze(Object.defineProperty({__proto__:null,renderAuth:Ne},Symbol.toStringTag,{value:"Module"}));async function Ve(e){e==null||e.mosqueId,c(`
    <div style="min-height:80vh; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:20px;">
      <div style="font-size:4em; margin-bottom:12px;">🕌</div>
      <h1 style="font-size:2em; margin-bottom:24px;">Mosqué Digital</h1>

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
  `);function n(){const o=new Date,s=document.getElementById("display-clock");s&&(s.textContent=o.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}))}n(),setInterval(n,1e4);const a=[{name:"Fajr",time:"05:30"},{name:"Dhuhr",time:"13:00"},{name:"Asr",time:"16:30"},{name:"Maghrib",time:"19:45"},{name:"Isha",time:"21:15"}];function i(){const o=new Date,s=o.getHours()*60+o.getMinutes();let r=a[0];for(const _ of a){const[y,h]=_.time.split(":").map(Number);if(y*60+h>s){r=_;break}}const[l,u]=r.time.split(":").map(Number),m=Math.max(0,l*60+u-s),g=Math.floor(m/60),x=m%60;document.getElementById("display-prayer-name").textContent=r.name,document.getElementById("display-prayer-time").textContent=r.time,document.getElementById("display-countdown").textContent=m>0?`IQAMA DANS ${g>0?g+"H":""}${x.toString().padStart(2,"0")}`:"MAINTENANT"}i(),setInterval(i,3e4)}const Fe=Object.freeze(Object.defineProperty({__proto__:null,renderDisplay:Ve},Symbol.toStringTag,{value:"Module"})),Ge={prayer:"🕌",quran:"📖",course:"🎓",ramadan:"🌙",conference:"🎤",family:"👨‍👩‍👧",children:"🧒",community:"🤝"};async function Ue(e){var i;const n=e==null?void 0:e.mosqueId;c(`
    <div class="card">
      <h2 class="card-header">📅 ${t("events","Événements")}</h2>
      <div id="events-list" class="loading-center"><div class="spinner"></div></div>
    </div>
  `);let a=n||null;if(!a)try{const o=await d("/api/mosques",{auth:!1});a=((i=o==null?void 0:o[0])==null?void 0:i.id)||null}catch{a=null}if(a)try{const o=await d(`/api/events/${a}`,{auth:!1});Ke(o)}catch{P()}else P()}function P(){document.getElementById("events-list").innerHTML=`
    <p style="color:var(--muted); text-align:center; padding:20px;">
      ${t("no_events","Aucun événement à venir")}
    </p>`}function Ke(e){const n=document.getElementById("events-list");if(n){if(!(e!=null&&e.length)){P();return}n.innerHTML=e.map(a=>{let i="";return a.startTime?i=new Date(a.startTime).toLocaleDateString()+" "+new Date(a.startTime).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}):a.date?i=new Date(a.date+(a.time?"T"+a.time:"")).toLocaleDateString()+(a.time?" à "+a.time:""):a.time&&(i="à "+a.time),`
    <div class="card" style="padding:16px; display:flex; gap:16px; align-items:start;">
      <div style="font-size:2em; flex-shrink:0;">${Ge[a.category]||"📅"}</div>
      <div style="flex:1;">
        <div style="font-weight:600;">${a.title}</div>
        ${a.description?`<div style="color:var(--muted); margin-top:4px;">${a.description}</div>`:""}
        <div style="font-size:0.85em; color:var(--accent); margin-top:8px;">
          📅 ${i}
          ${a.location?` · 📍 ${a.location}`:""}
          ${a.speaker?` · 🎤 ${a.speaker}`:""}
        </div>
      </div>
    </div>
  `}).join("")}}const We=Object.freeze(Object.defineProperty({__proto__:null,renderEvents:Ue},Symbol.toStringTag,{value:"Module"}));let q=null;async function Qe(){q&&(clearInterval(q),q=null);const e=localStorage.getItem("userName")||"";c(`
    <div style="text-align:center; padding:20px 0 10px;">
      <div style="font-size:2.5em;">🕌</div>
      <h1 style="font-size:1.5em; margin:8px 0;">${t("app_name","Mosque Digital OS")}</h1>
      ${e?`<p style="color:var(--muted);">Assalamu alaykum, <strong>${e}</strong></p>`:""}
    </div>

    <div id="prayer-countdown" class="countdown card" style="margin-bottom:24px;">
      <div class="spinner"></div>
    </div>

    <div class="card-grid">
      <a href="#/khutbah" class="card" style="cursor:pointer; display:flex; align-items:center; gap:16px; text-decoration:none; color:var(--fg);">
        <span style="font-size:2em;">🎙️</span>
        <div>
          <div style="font-weight:600;">${t("khutbah_live","Khutbah Live")}</div>
          <div style="font-size:0.85em; color:var(--muted);">${t("join_or_start","Rejoindre ou démarrer")}</div>
        </div>
      </a>

      <a href="#/quran" class="card" style="cursor:pointer; display:flex; align-items:center; gap:16px; text-decoration:none; color:var(--fg);">
        <span style="font-size:2em;">📖</span>
        <div>
          <div style="font-weight:600;">${t("quran","Coran")}</div>
          <div style="font-size:0.85em; color:var(--muted);">${t("read_listen","Lire et écouter")}</div>
        </div>
      </a>

      <a href="#/prayer" class="card" style="cursor:pointer; display:flex; align-items:center; gap:16px; text-decoration:none; color:var(--fg);">
        <span style="font-size:2em;">🕌</span>
        <div>
          <div style="font-weight:600;">${t("prayers","Horaires de prière")}</div>
          <div style="font-size:0.85em; color:var(--muted);">${t("adhan_iqama","Adhan & Iqama")}</div>
        </div>
      </a>

      <a href="#/announcements" class="card" style="cursor:pointer; display:flex; align-items:center; gap:16px; text-decoration:none; color:var(--fg);">
        <span style="font-size:2em;">📢</span>
        <div>
          <div style="font-weight:600;">${t("announcements","Annonces")}</div>
          <div style="font-size:0.85em; color:var(--muted);">${t("latest_news","Dernières nouvelles")}</div>
        </div>
      </a>

      <a href="#/events" class="card" style="cursor:pointer; display:flex; align-items:center; gap:16px; text-decoration:none; color:var(--fg);">
        <span style="font-size:2em;">📅</span>
        <div>
          <div style="font-weight:600;">${t("events","Événements")}</div>
          <div style="font-size:0.85em; color:var(--muted);">${t("upcoming","À venir")}</div>
        </div>
      </a>

      <a href="#/ramadan" class="card" style="cursor:pointer; display:flex; align-items:center; gap:16px; text-decoration:none; color:var(--fg);">
        <span style="font-size:2em;">🌙</span>
        <div>
          <div style="font-weight:600;">${t("ramadan","Ramadan")}</div>
          <div style="font-size:0.85em; color:var(--muted);">${t("program","Programme")}</div>
        </div>
      </a>
    </div>

    ${A()?`
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
  `),Je()}function Je(){D(),q=setInterval(D,6e4)}function D(){const e=document.getElementById("prayer-countdown");if(!e){clearInterval(q);return}const n=new Date,a=n.getHours(),i=n.getMinutes(),o=`${a.toString().padStart(2,"0")}:${i.toString().padStart(2,"0")}`,s=[{name:"Fajr",time:"05:30"},{name:"Sunrise",time:"07:15"},{name:"Dhuhr",time:"13:00"},{name:"Asr",time:"16:30"},{name:"Maghrib",time:"19:45"},{name:"Isha",time:"21:15"}];let r=null;for(const y of s){const[h,E]=y.time.split(":").map(Number);if(h>a||h===a&&E>i){r=y;break}}r||(r=s[0]);const[l,u]=r.time.split(":").map(Number);let m=l*60+u-(a*60+i);m<0&&(m+=24*60);const g=Math.floor(m/60),x=m%60,_=g>0?`${g}h${x.toString().padStart(2,"0")}`:`${x}min`;e.innerHTML=`
    <div class="label">${t("next_prayer","Prochaine prière")}</div>
    <div class="next-prayer">${r.name}</div>
    <div class="timer">${_}</div>
    <div class="label">${t("at","à")} ${r.time} · ${o}</div>
  `}const Ye=Object.freeze(Object.defineProperty({__proto__:null,renderHome:Qe},Symbol.toStringTag,{value:"Module"})),L={};function ne(e="/khutbah"){if(L[e])return L[e];const a=ae(`${Q}${e}`,{transports:["websocket","polling"],reconnection:!0,reconnectionDelay:1e3,reconnectionDelayMax:12e3,reconnectionAttempts:1/0,timeout:1e4});return L[e]=a,a}async function Xe(e){if(!A()){c(`
      <div class="card" style="max-width:420px; margin:40px auto; text-align:center;">
        <h2>👳 ${t("imam_mode","Mode Imam")}</h2>
        <p style="color:var(--muted); margin:12px 0;">${t("login_required","Connexion requise")}</p>
        <a href="#/auth/login" class="btn btn-primary">${t("login","Se connecter")}</a>
      </div>
    `);return}const n=e==null?void 0:e.code;n?await et(n):await Ze()}async function Ze(){c(`
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
  `),document.getElementById("start-khutbah").onclick=async()=>{const e=document.getElementById("imam-topic").value.trim();try{const n=await d("/api/session",{method:"POST",body:{mosque_name:e,target_langs:["fr","en"]}});p(`${t("session_created","Session créée")}: ${n.code}`,"success"),location.hash=`#/imam/${n.code}`}catch(n){p(n.message,"error")}},document.getElementById("ai-generate").onclick=async()=>{var a,i,o;const e=document.getElementById("ai-question").value.trim();if(!e)return;const n=document.getElementById("ai-result");n.innerHTML='<div class="loading-center"><div class="spinner"></div></div>';try{const s=await d("/api/ai/assistant/plan",{method:"POST",body:{topic:e}});n.innerHTML=`
        <div class="card" style="background:var(--bg2);">
          <h4>📋 ${s.topic||e}</h4>
          <div style="margin-top:8px;"><strong>${t("introduction","Introduction")}:</strong><p>${s.introduction}</p></div>
          ${(a=s.mainPoints)!=null&&a.length?`<div style="margin-top:8px;"><strong>${t("main_points","Points principaux")}:</strong><ul>${s.mainPoints.map(r=>`<li>${r}</li>`).join("")}</ul></div>`:""}
          ${(i=s.references)!=null&&i.length?`<div style="margin-top:8px;"><strong>${t("references","Références")}:</strong><ul>${s.references.map(r=>`<li>📖 ${r}</li>`).join("")}</ul></div>`:""}
          ${s.conclusion?`<div style="margin-top:8px;"><strong>${t("conclusion","Conclusion")}:</strong><p>${s.conclusion}</p></div>`:""}
          ${(o=s.warnings)!=null&&o.length?`<div style="margin-top:8px; color:var(--warn);"><strong>⚠️ ${t("verify","À vérifier")}:</strong><ul>${s.warnings.map(r=>`<li>${r}</li>`).join("")}</ul></div>`:""}
        </div>
      `}catch(s){n.innerHTML=`<p style="color:var(--danger);">${s.message}</p>`}}}async function et(e){c(`
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
      <a href="#/imam" class="btn btn-sm btn-secondary">←</a>
      <span style="font-weight:600;">👳 ${t("imam_control","Contrôle Imam")}</span>
      <span style="margin-left:auto; font-size:0.85em; color:var(--muted);" id="imam-status">⏳</span>
    </div>

    <div class="card" style="text-align:center;">
      <h3 class="card-header" style="justify-content:center;">📱 ${t("qr_session","QR Code de la session")}</h3>
      <img src="${z}/api/session/${e}/qr.png" style="width:200px; margin:16px auto; border-radius:12px; background:#fff; padding:8px;" id="imam-qr-img" />
      <div style="font-size:0.85em; color:var(--muted); word-break:break-all;" id="join-url"></div>
    </div>

    <div class="card">
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;">
        <button class="btn btn-primary" id="btn-pause">⏸ ${t("pause","Pause")}</button>
        <button class="btn btn-secondary" id="btn-resume">▶ ${t("resume","Reprendre")}</button>
        <button class="btn btn-danger" id="btn-stop">⏹ ${t("stop","Terminer")}</button>
      </div>

      <div class="form-group">
        <label>${t("type_arabic","Saisir du texte arabe")}</label>
        <textarea id="manual-text" rows="3" placeholder="${t("arabic_placeholder","Texte arabe...")}" style="direction:rtl; text-align:right; font-family:'Noto Naskh Arabic',serif; font-size:1.2em;"></textarea>
      </div>
      <button class="btn btn-primary btn-block" id="send-text">${t("send","Envoyer")}</button>
    </div>

    <div class="card">
      <h4 class="card-header">📊 ${t("live_stats","Statistiques en direct")}</h4>
      <div id="imam-stats" style="color:var(--muted);">${t("listeners","Auditeurs")}: <span id="listener-count">0</span></div>
      <div id="imam-quran" style="margin-top:8px;"></div>
    </div>

    <div class="card">
      <h4 class="card-header">📝 ${t("segments","Segments")}</h4>
      <div id="imam-segments" style="max-height:40vh; overflow-y:auto;"></div>
    </div>
  `);const n=ne("/khutbah");try{const a=await d(`/api/session/${e}`),i=document.getElementById("join-url");i&&(i.textContent=a.join_url||`${window.location.origin}/#/khutbah/${e}`)}catch{const a=document.getElementById("join-url");a&&(a.textContent=`${window.location.origin}/#/khutbah/${e}`)}n.on("connect",()=>{document.getElementById("imam-status").textContent="🟢 "+t("connected","Connecté"),n.emit("join-broadcast",{code:e})}),n.on("hello",a=>{document.getElementById("imam-status").textContent=a.status==="live"?"🔴 LIVE":`⏸ ${a.status}`,document.getElementById("listener-count").textContent=a.listeners}),n.on("monitor",a=>{document.getElementById("listener-count").textContent=a.listeners,a.is_quran&&a.quran_ref&&(document.getElementById("imam-quran").innerHTML=`<div class="card" style="padding:12px; border-left:3px solid var(--accent);">📖 ${a.quran_ref}</div>`),tt(a)}),n.on("status",a=>{document.getElementById("imam-status").textContent=a.status==="live"?"🔴 LIVE":`⏸ ${a.status}`}),document.getElementById("btn-pause").onclick=()=>n.emit("control",{code:e,action:"pause"}),document.getElementById("btn-resume").onclick=()=>n.emit("control",{code:e,action:"resume"}),document.getElementById("btn-stop").onclick=()=>n.emit("control",{code:e,action:"stop"}),document.getElementById("send-text").onclick=()=>{const a=document.getElementById("manual-text").value.trim();a&&(n.emit("transcript",{code:e,text:a,is_final:!0}),document.getElementById("manual-text").value="")}}function tt(e){const n=document.getElementById("imam-segments");if(!n)return;const a=document.createElement("div");a.className=`khutbah-segment ${e.is_quran?"quran":""}`,a.innerHTML=`
    <div class="arabic">${e.arabic||""}</div>
    <div style="font-size:0.8em; color:var(--muted);">seq #${e.seq} ${e.provider?`· ${e.provider}`:""}</div>
  `,n.prepend(a)}const nt=Object.freeze(Object.defineProperty({__proto__:null,renderImam:Xe},Symbol.toStringTag,{value:"Module"}));async function at(e){const n=e==null?void 0:e.code;n?await ot(n):await it()}async function it(){c(`
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

    ${A()?`
      <div class="card" style="max-width:500px; margin:0 auto;">
        <h3 class="card-header">👑 ${t("imam_tools","Outils Imam")}</h3>
        <button class="btn btn-primary btn-block" id="start-session">${t("start_session","Démarrer une Khutbah")}</button>
      </div>
    `:""}
  `),document.getElementById("join-btn").onclick=()=>{const e=document.getElementById("session-code").value.trim().toUpperCase();e.length>=4&&(location.hash=`#/khutbah/${e}`)},document.getElementById("session-code").onkeydown=e=>{e.key==="Enter"&&document.getElementById("join-btn").click()},document.getElementById("start-session")&&(document.getElementById("start-session").onclick=async()=>{try{const e=await d("/api/session",{method:"POST",body:{target_langs:["fr","en"]}});p(`${t("session_created","Session créée")}: ${e.code}`,"success"),location.hash=`#/imam/${e.code}`}catch(e){p(e.message,"error")}})}async function ot(e){c(`
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
      ${t("connecting","Connexion...")} <div class="spinner" style="width:16px;height:16px;"></div>
    </div>

    <div id="segments" style="max-height:60vh; overflow-y:auto; padding:4px 0;"></div>
  `);const n=ne("/khutbah");n.on("connect",()=>{document.getElementById("khutbah-status").textContent=t("connected","Connecté"),n.emit("join-listen",{code:e,lang:document.getElementById("lang-select").value})}),n.on("hello",a=>{var i;if(document.getElementById("khutbah-status").textContent=a.status==="live"?"🔴 LIVE":`⏸ ${a.status}`,document.getElementById("listener-count").textContent=`${a.listeners||0} 👤`,a.seq,(i=a.history)!=null&&i.length)for(const o of a.history)H(o)}),n.on("phrase",a=>{H(a),a.seq}),n.on("corrected",a=>{const i=document.querySelector(`[data-seq="${a.seq}"] .arabic`);i&&(i.textContent=a.arabic)}),n.on("session",a=>{document.getElementById("khutbah-status").textContent=a.status==="live"?"🔴 LIVE":`⏸ ${a.status}`}),n.on("disconnect",()=>{document.getElementById("khutbah-status").textContent=`⚠️ ${t("disconnected","Déconnecté")} — ${t("reconnecting","Reconnexion...")}`}),document.getElementById("lang-select").onchange=a=>{n.emit("set-lang",{code:e,lang:a.target.value})}}function H(e){const n=document.getElementById("segments");if(!n)return;const a=document.createElement("div");a.className=`khutbah-segment ${e.is_quran?"quran":""} ${e.degraded?"degraded":""}`,a.setAttribute("data-seq",e.seq),a.innerHTML=`
    ${e.arabic?`<div class="arabic">${e.arabic}</div>`:""}
    <div class="translation">${e.text||""}</div>
    ${e.is_quran&&e.quran_ref?`<div style="font-size:0.8em; color:var(--accent); margin-top:4px;">📖 ${e.quran_ref}</div>`:""}
    ${e.degraded?`<div style="font-size:0.75em; color:var(--warn);">⚠️ ${t("degraded","Mode dégradé")}</div>`:""}
  `,n.appendChild(a),n.scrollTop=n.scrollHeight}const st=Object.freeze(Object.defineProperty({__proto__:null,renderKhutbah:at},Symbol.toStringTag,{value:"Module"}));async function rt(e){var a;const n=e==null?void 0:e.mosqueId;c(`
    <div class="card">
      <h2 class="card-header">🕌 ${t("prayer_times","Horaires de prière")}</h2>
      <div id="prayer-content" class="loading-center"><div class="spinner"></div></div>
    </div>
  `);try{const i=new Date().toISOString().split("T")[0];let o,s=n;if(!s)try{const r=await d("/api/mosques",{auth:!1});s=(a=r==null?void 0:r[0])==null?void 0:a.id}catch{s=null}s?o=await d(`/api/prayer-times/${s}?date=${i}`,{auth:!1}):o=N(),R(o)}catch{R(N())}}function N(){return{date:new Date().toISOString().split("T")[0],fajr:{name:"Fajr",time:"05:30",type:"adhan"},sunrise:{name:"Sunrise",time:"07:15",type:"adhan"},dhuhr:{name:"Dhuhr",time:"13:00",type:"adhan"},asr:{name:"Asr",time:"16:30",type:"adhan"},maghrib:{name:"Maghrib",time:"19:45",type:"adhan"},isha:{name:"Isha",time:"21:15",type:"adhan"}}}function R(e){var s;const n=document.getElementById("prayer-content");if(!n)return;const a=new Date,i=a.getHours()*60+a.getMinutes(),o=[{key:"fajr",name:"Fajr",icon:"🌅"},{key:"sunrise",name:"Sunrise",icon:"☀️"},{key:"dhuhr",name:"Dhuhr",icon:"🌤️"},{key:"asr",name:"Asr",icon:"🌇"},{key:"maghrib",name:"Maghrib",icon:"🌙"},{key:"isha",name:"Isha",icon:"🌑"}];n.innerHTML=`
    <div style="text-align:center; margin-bottom:16px; color:var(--muted);">${e.date||new Date().toISOString().split("T")[0]}</div>
    <div class="prayer-times-grid">
      ${o.map(r=>{var h;const l=e[r.key],u=(l==null?void 0:l.time)||l||"--:--",[m,g]=(typeof u=="string"?u:"--:--").split(":").map(Number),x=m*60+g,_=Math.abs(i-x)<30,y=((h=e[`${r.key}Iqama`])==null?void 0:h.time)||e[`${r.key}_iqama`]||null;return`
          <div class="prayer-card ${_?"active":""}">
            <div class="name">${r.icon} ${r.name}</div>
            <div class="time">${u}</div>
            ${y?`<div class="type">Iqama: ${y}</div>`:""}
          </div>
        `}).join("")}
    </div>

    ${e.jummahTime?`
      <div class="prayer-card active" style="margin-top:16px; text-align:center;">
        <div class="name">🕌 Jumu'ah</div>
        <div class="time">${((s=e.jummahTime)==null?void 0:s.time)||e.jummahTime}</div>
      </div>
    `:""}
  `}const lt=Object.freeze(Object.defineProperty({__proto__:null,renderPrayer:rt},Symbol.toStringTag,{value:"Module"}));let j=[];async function dt(e){const n=e==null?void 0:e.number,a=e==null?void 0:e.ref;if(a){await ut(a);return}if(n){await mt(parseInt(n));return}await ct()}async function ct(){c(`
    <div class="card">
      <h2 class="card-header">📖 ${t("quran","Coran")}</h2>
      <div class="form-group">
        <input type="search" id="quran-search" placeholder="${t("search_surah","Rechercher une sourate...")}" />
      </div>
      <div id="surah-list" class="loading-center"><div class="spinner"></div></div>
    </div>
  `);try{j=await d("/api/quran/surahs",{auth:!1}),V(j)}catch(e){document.getElementById("surah-list").innerHTML=`<p style="color:var(--danger);">${e.message}</p>`}document.getElementById("quran-search").oninput=e=>{const n=e.target.value.toLowerCase(),a=j.filter(i=>i.nameEnglish.toLowerCase().includes(n)||i.nameTransliteration.toLowerCase().includes(n)||i.nameArabic.includes(n)||String(i.number).includes(n));V(a)}}function V(e){const n=document.getElementById("surah-list");n&&(n.innerHTML=`
    <div class="card-grid" style="gap:8px;">
      ${e.map(a=>`
        <a href="#/quran/surah/${a.number}" class="card" style="display:flex; align-items:center; gap:12px; padding:12px; text-decoration:none; color:var(--fg); margin:0;">
          <div style="width:36px; height:36px; border-radius:50%; background:var(--accent); color:#fff; display:flex; align-items:center; justify-content:center; font-size:0.85em; font-weight:700; flex-shrink:0;">${a.number}</div>
          <div style="flex:1; min-width:0;">
            <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${a.nameTransliteration}</div>
            <div style="font-size:0.8em; color:var(--muted);">${a.nameEnglish} · ${a.totalAyahs} ayahs</div>
          </div>
          <div style="font-size:1.3em; color:var(--accent2); direction:rtl;">${a.nameArabic}</div>
        </a>
      `).join("")}
    </div>
  `)}async function mt(e){c(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/quran" class="btn btn-sm btn-secondary">←</a>
      <h2 style="flex:1;" id="surah-title"><div class="spinner"></div></h2>
    </div>
    <div id="surah-content" class="loading-center"><div class="spinner"></div></div>
  `);try{const n=await d(`/api/quran/surahs/${e}`,{auth:!1});document.getElementById("surah-title").textContent=`${n.nameTransliteration} — ${n.nameEnglish}`;const a=document.getElementById("surah-content");a.innerHTML=`
      <div style="text-align:center; font-size:1.8em; color:var(--accent2); direction:rtl; font-family:'Noto Naskh Arabic',serif; margin-bottom:24px; line-height:1.8;">
        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
      </div>
      ${(n.ayahs||[]).map(i=>`
        <div class="ayah">
          <div class="arabic">${i.textArabic} <span class="ref">(${i.ayahNumber})</span></div>
          ${i.translation?`<div class="translation">${i.translation}</div>`:""}
        </div>
      `).join("")}
    `}catch(n){document.getElementById("surah-content").innerHTML=`<p style="color:var(--danger);">${n.message}</p>`}}async function ut(e){var n,a,i;c(`
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      <a href="#/quran" class="btn btn-sm btn-secondary">←</a>
      <h2 style="flex:1;">📖 Sourate ${e}</h2>
    </div>
    <div id="verse-content" class="loading-center"><div class="spinner"></div></div>
  `);try{const o=await d(`/api/quran/verse/${e}`,{auth:!1}),s=document.getElementById("verse-content");s.innerHTML=`
      <div class="card">
        <div style="text-align:center; margin-bottom:8px; color:var(--muted);">${((n=o.surah)==null?void 0:n.nameTransliteration)||""} — Ayah ${((a=o.ayah)==null?void 0:a.ayahNumber)||""}</div>
        <div class="ayah">
          <div class="arabic" style="font-size:1.6em; line-height:2;">${((i=o.ayah)==null?void 0:i.textArabic)||""}</div>
        </div>
      </div>
    `}catch(o){document.getElementById("verse-content").innerHTML=`<p style="color:var(--danger);">${o.message}</p>`}}const pt=Object.freeze(Object.defineProperty({__proto__:null,renderQuran:dt},Symbol.toStringTag,{value:"Module"}));async function vt(e){const a=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});c(`
    <div class="card" style="text-align:center; padding:30px;">
      <div style="font-size:3em;">🌙</div>
      <h2 style="margin:12px 0;">${t("ramadan","Ramadan")}</h2>
      <p style="color:var(--muted);">${a}</p>
    </div>

    <div class="card-grid">
      <div class="card">
        <h3 class="card-header">🌅 ${t("imsak","Imsak")}</h3>
        <div style="font-size:2em; font-weight:700; text-align:center;">--:--</div>
        <div style="text-align:center; color:var(--muted); font-size:0.9em;">${t("pre_dawn","Avant l'aube")}</div>
      </div>

      <div class="card">
        <h3 class="card-header">🌅 ${t("fajr","Fajr")}</h3>
        <div style="font-size:2em; font-weight:700; text-align:center;">--:--</div>
        <div style="text-align:center; color:var(--muted); font-size:0.9em;">${t("dawn_prayer","Prière de l'aube")}</div>
      </div>

      <div class="card">
        <h3 class="card-header">🌇 ${t("maghrib","Maghrib")}</h3>
        <div style="font-size:2em; font-weight:700; text-align:center;">--:--</div>
        <div style="text-align:center; color:var(--muted); font-size:0.9em;">${t("iftar","Iftar")}</div>
      </div>

      <div class="card">
        <h3 class="card-header">🌙 ${t("tarawih","Tarawih")}</h3>
        <div style="font-size:2em; font-weight:700; text-align:center;">--:--</div>
        <div style="text-align:center; color:var(--muted); font-size:0.9em;">${t("night_prayer","Prière de la nuit")}</div>
      </div>
    </div>

    <div class="card">
      <h3 class="card-header">📖 ${t("juz_of_day","Juz du jour")}</h3>
      <p style="color:var(--muted);">${t("juz_info","Consultez le programme de la mosquée pour le calendrier de récitation")}</p>
    </div>
  `)}const gt=Object.freeze(Object.defineProperty({__proto__:null,renderRamadan:vt},Symbol.toStringTag,{value:"Module"}));
