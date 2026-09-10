# Gestion Mosquee (PWA)

Application standalone de gestion de mosquée — **totalement séparée** du projet "Traduction du prêche".

## Fonctionnalités

- **Horaires de prière** : adhan + iqama pour les 5 prières, modifiables en direct.
- **Annonces** : publication à destination des fidèles (urgences, religieux, social...).
- **Finances** : recettes / dépenses, solde global, catégories.
- **Événements** : agenda, lieux, récurrence, places max.
- **Membres** : annuaire avec rôles (imam, bénévole, fidèle, admin).
- **Dashboard** : résumé des stats en temps réel.
- **PWA** : installable, hors-ligne (coquille), manifeste + service worker.

## Stack

| Partie | Technologie |
|---|---|
| Backend | FastAPI + SQLAlchemy + SQLite + JWT |
| Frontend | Vite + PWA (vanilla JS, un seul fichier HTML SPA) |
| Port | `8001` (séparé du 8000 du projet khutbah) |

## Démarrage

### Backend

```bash
cd backend_gestion
python -m venv .venv
# Windows : .venv\Scripts\activate
pip install -r requirements.txt
python main.py
# → http://localhost:8001
```

Le premier compte est créé via "Créer un compte" dans l'app.

### Frontend (dev)

```bash
cd frontend/gestion-mosquee
npm install
npm run dev
# → http://localhost:5173
```

### Build PWA

```bash
npm run build
# → dist/ (éligible à l'installation PWA)
```

### Déploiement unique (recommandé)

En production, servez `dist/` directement par le backend (déjà câblé : `main.py` monte `frontend/gestion-mosquee/dist/`). L'API et la PWA sont alors sur la même origine (`http://localhost:8001`).

## API (résumé)

| Méthode | Route | Rôle |
|---|---|---|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Connexion → JWT |
| GET/POST | `/api/members/` | Membres |
| GET/POST | `/api/prayers/` | Horaires de prière |
| GET/POST | `/api/announcements/` | Annonces |
| GET/POST | `/api/finances/` | Transactions |
| GET | `/api/finances/summary` | Solde global |
| GET/POST | `/api/events/` | Événements |

## Configuration

- `frontend/gestion-mosquee/src/app.js` → `API_BASE` (défaut `http://localhost:8001`, ou `VITE_API_URL`).
- `backend_gestion/auth.py` → `SECRET_KEY` (à changer en production).

## Sécurité

- Les clés JWT expirent après 24 h.
- Le mot de passe est haché (bcrypt).
- L'API ne comporte pas (encore) d'autorisation par rôle — à durcir avant usage public réel.