// ── Auth Module ────────────────────────────────────────────────────────

import { api, setTokens, clearTokens, isAuthenticated } from "../../core/api.js";
import { toast, renderMain } from "../../core/components.js";
import { t } from "../../core/i18n.js";
import { navigate } from "../../core/router.js";

export async function renderAuth(params) {
  const action = params?.action || "login";

  renderMain(`
    <div class="card" style="max-width:420px; margin:40px auto;">
      <h2 class="card-header" style="justify-content:center;">
        🕌 ${action === "register" ? t("register", "Créer un compte") : t("login", "Connexion")}
      </h2>

      <form id="auth-form">
        ${action === "register" ? `
          <div class="form-group">
            <label>${t("name", "Nom")}</label>
            <input type="text" name="name" required placeholder="${t("your_name", "Votre nom")}" />
          </div>
        ` : ""}

        <div class="form-group">
          <label>${t("email", "Email")}</label>
          <input type="email" name="email" required placeholder="email@mosquee.org" />
        </div>

        <div class="form-group">
          <label>${t("password", "Mot de passe")}</label>
          <input type="password" name="password" required minlength="8" placeholder="••••••••" />
        </div>

        <button type="submit" class="btn btn-primary btn-block" id="auth-submit">
          ${action === "register" ? t("create_account", "Créer le compte") : t("login_btn", "Se connecter")}
        </button>
      </form>

      <div style="text-align:center; margin-top:16px;">
        ${action === "register"
          ? `<a href="#/auth/login">${t("have_account", "Déjà un compte ? Se connecter")}</a>`
          : `<a href="#/auth/register">${t("no_account", "Pas de compte ? Créer un compte")}</a>`}
      </div>
    </div>
  `);

  document.getElementById("auth-form").onsubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const btn = document.getElementById("auth-submit");
    btn.disabled = true;
    btn.textContent = "⏳ ...";

    try {
      const body = Object.fromEntries(form);
      const endpoint = action === "register" ? "/api/auth/register" : "/api/auth/login";
      const data = await api(endpoint, { method: "POST", body, auth: false });
      setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem("userName", data.user.name);
      toast(t("welcome", "Bienvenue") + ", " + data.user.name + " !", "success");
      navigate("/");
    } catch (err) {
      toast(err.message, "error");
      btn.disabled = false;
      btn.textContent = action === "register" ? t("create_account", "Créer le compte") : t("login_btn", "Se connecter");
    }
  };
}
