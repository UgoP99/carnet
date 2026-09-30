# Carnet — journal d'entraînement

PWA personnelle pour noter tes séances (lutte, JJB, grappling, préparation physique, etc.), les détails techniques à retenir, l'intensité (RPE × durée) de chaque séance et de chaque semaine, et tes plans de jeu. Tout reste sur ton iPhone : pas de serveur, pas de compte, ça marche hors ligne.

Ce dépôt est prêt à être développé avec **Claude Code** : le squelette compile et est testé, la doc produit et technique est rédigée, les règles, hooks, skills et sous-agents sont configurés.

---

## 1. Prérequis (Windows)

Dans PowerShell :

```powershell
winget install OpenJS.NodeJS.LTS      # Node 22 LTS (22.12 minimum)
winget install Git.Git                # Git for Windows (Claude Code utilise Git Bash)
irm https://claude.ai/install.ps1 | iex   # Claude Code (installateur natif, mises à jour automatiques)
```

Ferme puis rouvre le terminal, puis vérifie : `node -v`, `git --version`, `claude --version`.

Il te faut aussi :

- un abonnement Claude Pro ou Max (Claude Code n'est pas inclus dans l'offre gratuite) ;
- un compte GitHub **avec la double authentification activée** (passkey ou application TOTP).

## 2. Installation du projet

```powershell
cd $HOME\Projects            # ou le dossier de ton choix
# dézippe carnet.zip ici, puis :
cd carnet
npm ci                       # installe les versions exactes du package-lock (scripts npm désactivés)
npm run check                # formatage, types, lint, tests, build : tout doit être vert
git init -b main
git config user.name "Ton Nom"
git config user.email "ton-email-github@exemple.com"
git add -A
git commit -m "chore: initial scaffold"
```

### Publier sur GitHub Pages (gratuit)

1. Sur GitHub, crée un dépôt **public** nommé `carnet` (sans README). Il doit être public pour que Pages soit gratuit ; ça ne pose pas de problème : le code ne contient aucun secret ni aucune donnée personnelle.
2. Pousse le code :
   ```powershell
   git remote add origin https://github.com/<ton-user>/carnet.git
   git push -u origin main
   ```
3. Dans le dépôt, ouvre **Settings → Pages → Build and deployment → Source : GitHub Actions**.
4. Toujours dans les Settings :
   - **Advanced Security** : active _Dependabot alerts_, _Dependabot security updates_, _Secret scanning_ et _Push protection_.
   - **Actions → General → Workflow permissions** : _Read repository contents_.
5. L'onglet **Actions** lance « CI & Deploy ». Une fois terminé, l'app est en ligne sur `https://<ton-user>.github.io/carnet/`.

> Si tu nommes le dépôt `<ton-user>.github.io`, remplace `BASE_PATH` par `/` dans `.github/workflows/ci.yml`.

## 3. Installer l'app sur l'iPhone

1. Ouvre `https://<ton-user>.github.io/carnet/` dans **Safari**.
2. Touche **Partager → Sur l'écran d'accueil**.
3. Lance toujours l'app depuis cette icône : c'est elle qui détient tes données, et iOS protège mieux le stockage d'une app installée que celui d'un onglet Safari.

⚠️ Les données sont liées à l'adresse de l'app. Avant de changer l'URL, de supprimer l'icône ou de réinstaller l'iPhone, **exporte une sauvegarde**.

## 4. Développer avec Claude Code

```powershell
cd carnet
claude
```

- Au premier lancement, **accepte le dialogue de confiance du dossier** : sans lui, les permissions et les hooks du projet ne s'appliquent pas.
- Tape `/next-step` : Claude lit uniquement l'étape suivante de `docs/ROADMAP.md` et les sections de doc utiles, propose un plan court, code en TDD, lance les vérifications, coche l'étape et te propose un commit.
- Après chaque commit, tape `/clear` : une étape par session.
- Pousse (`git push`) quand tu veux déployer ; l'iPhone proposera la mise à jour.

### Ce qui est configuré

| Élément                       | Rôle                                                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `CLAUDE.md`                   | Mémoire du projet, courte : contexte, règles non négociables, où trouver l'info.                                                                                         |
| `docs/*.md`                   | Spec, modèle de données, domaine sportif, architecture, sécurité, roadmap, décisions. Chargés à la demande.                                                              |
| `.claude/rules/*.md`          | Règles chargées **seulement** quand Claude touche les fichiers concernés (data, UI, tests, CI).                                                                          |
| `.claude/settings.json`       | Permissions : autorise les commandes courantes, demande confirmation pour installs, push et fichiers sensibles, interdit la lecture des secrets et des sauvegardes.      |
| Hooks (`.claude/hooks/*.mjs`) | Après chaque édition : prettier + eslint sur le fichier. En fin de tour : typecheck + tests liés aux changements (avec cache). Au démarrage : étape en cours + état git. |
| Skills                        | `/next-step`, `/release`, `security-check` (revue sécurité dans un sous-agent), `db-migration` (procédure de changement de schéma).                                      |
| Sous-agents                   | `security-reviewer` (lecture seule, Sonnet), `Explore` (recherche rapide, Haiku).                                                                                        |

### Économiser les tokens

- Une étape de roadmap par session, puis `/clear`. Utilise `/compact` si une session s'allonge.
- `/model` : Sonnet suffit pour la plupart des étapes. Garde Opus pour les étapes qui demandent de la réflexion (1, 4, 10) ou active le plan mode (`Shift+Tab`) pour valider le plan avant le code.
- La doc est découpée par sujet et rédigée en anglais (moins de tokens) ; Claude ne lit que ce que l'étape demande.
- Les hooks renvoient uniquement les erreurs, tronquées ; le quality gate ne relance rien si le code n'a pas changé depuis le dernier passage vert.
- `/context` montre ce qui occupe la fenêtre de contexte.

### Tester sur l'iPhone pendant le développement

- `npm run dev -- --host`, puis ouvre `http://<IP-du-PC>:5173` sur l'iPhone (même Wi-Fi, autorise Node dans le pare-feu Windows). Pratique pour l'interface ; pas de service worker ni d'installation en HTTP.
- Pour tester en conditions réelles (hors ligne, installation), pousse sur `main` et utilise l'URL GitHub Pages.

## 5. Sauvegardes (important)

App → **Réglages → Sauvegarde → Exporter** → enregistre dans **Fichiers / iCloud Drive**. L'app te le rappelle tous les 14 jours (réglable).
Le fichier contient tes notes (y compris les douleurs) : garde-le privé, ne le mets jamais dans le dépôt (il est déjà dans le `.gitignore`).

## 6. Commandes

| Commande                    | Effet                                            |
| --------------------------- | ------------------------------------------------ |
| `npm run dev`               | Serveur de dev (http://localhost:5173)           |
| `npm test` / `test:watch`   | Tests Vitest                                     |
| `npm run check`             | Toutes les vérifications (à lancer avant commit) |
| `npm run build` + `preview` | Build de prod + prévisualisation (CSP active)    |

## 7. Sécurité en bref

Aucune requête réseau à l'exécution (CSP `connect-src 'self'`), aucun rendu HTML de données, validation Zod de tout import, dépendances épinglées et publiées depuis au moins 7 jours, scripts npm désactivés, GitHub Actions épinglées par SHA avec des permissions minimales, CodeQL et Dependabot. Détails dans `docs/SECURITY.md`.

## 8. Structure

```
carnet/
├── CLAUDE.md                 mémoire projet (Claude Code)
├── docs/                     SPEC, DATA_MODEL, DOMAIN, ARCHITECTURE, SECURITY, ROADMAP, DECISIONS
├── .claude/
│   ├── settings.json         permissions + hooks
│   ├── hooks/                scripts Node (multiplateforme)
│   ├── rules/                règles par dossier
│   ├── skills/               next-step, security-check, db-migration, release
│   └── agents/               security-reviewer, Explore
├── .github/                  CI + déploiement Pages, CodeQL, Dependabot
├── public/                   icônes PWA
├── src/                      code de l'app (squelette)
└── vite.config.ts            build, PWA, CSP
```
