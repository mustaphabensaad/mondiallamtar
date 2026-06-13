# Déploiement — mundial.lamtar.net

**Frontend :** `mundial.lamtar.net`
**Backend :** `api2.lamtar.net` (Node.js App séparée)
**Sans GitHub — upload direct via cPanel**

---

## Vue d'ensemble

```
Navigateur
    │
    ├── mundial.lamtar.net          → public_html/mundial/  (React SPA)
    │       └── /api/*  proxy →    api2.lamtar.net  (Node.js, port 3001)
    │
    └── api2.lamtar.net             → ~/mundial_backend/  (Express + Socket.io)
            └── /uploads/*          → ~/mundial_backend/uploads/
```

---

## Étape 1 — Base de données MySQL

1. cPanel → **MySQL Databases**
2. Créer base : `USERNAME_mundial`
3. Créer utilisateur : `USERNAME_mundial_u` + mot de passe fort
4. Ajouter utilisateur à la base → **ALL PRIVILEGES**
5. cPanel → **phpMyAdmin** → sélectionner `USERNAME_mundial` → **Importer**
6. Importer `database/schema.sql`
7. *(Si la table posts n'existe pas encore)* Importer `database/posts_table.sql`

---

## Étape 2 — Déployer le backend

### 2a — Uploader les fichiers

1. cPanel → **File Manager** → aller dans `/home/USERNAME/` (hors de `public_html`)
2. Créer dossier : `mundial_backend`
3. Zipper le dossier `backend/` localement, uploader le zip, extraire sur le serveur
   - **Exclure** `node_modules/` et `.env` du zip
4. Créer le dossier `mundial_backend/uploads/` (avec sous-dossiers `teams/`, `players/`, `payments/`, `posts/`)

### 2b — Créer l'application Node.js

1. cPanel → **Setup Node.js App** → **Create Application**
2. Remplir :
   - **Node.js version :** 18.x ou 20.x
   - **Application mode :** Production
   - **Application root :** `/home/USERNAME/mundial_backend`
   - **Application URL :** `api2.lamtar.net`
   - **Application startup file :** `src/app.js`
3. Cliquer **Create**

### 2c — Variables d'environnement

Dans le panneau Node.js App → **Environment Variables** :

```
PORT=3001
FRONTEND_URL=https://mundial.lamtar.net
DB_HOST=localhost
DB_USER=USERNAME_mundial_u
DB_PASS=MOT_DE_PASSE_DB
DB_NAME=USERNAME_mundial
JWT_SECRET=GENERER_64_BYTES_HEX
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=5242880
```

> Générer JWT_SECRET via SSH :
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### 2d — Installer les dépendances

Dans le panneau Node.js App → **Run NPM Install**

Ou via SSH :
```bash
cd /home/USERNAME/mundial_backend
npm install --production
```

### 2e — Créer le compte admin

```bash
cd /home/USERNAME/mundial_backend
node scripts/create-admin.js
```

### 2f — Lancer le seed de production

```bash
cd /home/USERNAME/mundial_backend
node scripts/seed_production.js
```

Ce script :
- ✓ Ne touche **jamais** aux comptes admin
- ✓ Crée 16 équipes dans 4 groupes (A–D)
- ✓ Crée 176 joueurs (11 par équipe, tous validés)
- ✓ Génère 24 matchs programmés (round-robin)
- ✓ Crée les comptes capitaines : `captain1@lamtar.net` … `captain16@lamtar.net` / `mundial123`
- ✓ Crée 6 articles, 3 sponsors, 5 images carrousel

### 2g — Démarrer l'application

Node.js App panel → **Start App** ✅

Tester : `https://api2.lamtar.net/api/health` → `{"status":"ok"}`

---

## Étape 3 — Builder le frontend (sur ta machine locale)

### 3a — Configurer l'URL de l'API

Éditer `frontend/.env.production` :
```env
VITE_API_URL=https://api2.lamtar.net
VITE_APP_NAME=Mundial Lamtar
```

### 3b — Builder

```bash
cd frontend
npm install
npm run build
```

Cela génère `frontend/dist/`.

---

## Étape 4 — Uploader le frontend

### Option A — Via File Manager (petit projet)

1. cPanel → **File Manager** → `/home/USERNAME/public_html/mundial/`
2. Supprimer l'ancien contenu (sauf `.htaccess` si déjà en place)
3. Uploader tout le contenu de `frontend/dist/` :
   - `index.html`
   - `assets/`
   - `locales/`
   - `logo.png`, `team1.jpeg`, `team2.jpeg`, `mahrez1.jpeg`, `mahrez2.jpeg`

### Option B — Via FTP (FileZilla, recommandé)

1. Connecter FileZilla : Host=`ftp.lamtar.net`, User/Pass cPanel
2. Naviguer vers `public_html/mundial/`
3. Glisser-déposer tout le contenu de `dist/`

---

## Étape 5 — Créer le fichier .htaccess

Dans `/home/USERNAME/public_html/mundial/`, créer `.htaccess` :

```apache
Options -MultiViews
RewriteEngine On

# Proxy /api → backend Node.js sur api2.lamtar.net
RewriteCond %{REQUEST_URI} ^/api [NC]
RewriteRule ^api/(.*)$ https://api2.lamtar.net/api/$1 [P,L]

# Proxy /uploads → backend
RewriteCond %{REQUEST_URI} ^/uploads [NC]
RewriteRule ^uploads/(.*)$ https://api2.lamtar.net/uploads/$1 [P,L]

# React SPA — toutes les routes → index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
```

> **Note :** Si le frontend appelle directement `https://api2.lamtar.net`, le proxy `.htaccess` n'est pas obligatoire. Vérifie que `VITE_API_URL` dans `.env.production` pointe bien vers `https://api2.lamtar.net`.

---

## Étape 6 — Vérification finale

| URL | Résultat attendu |
|-----|-----------------|
| `https://mundial.lamtar.net` | Page d'accueil |
| `https://api2.lamtar.net/api/health` | `{"status":"ok"}` |
| `https://mundial.lamtar.net/standings` | Classements des groupes |
| `https://mundial.lamtar.net/login` | Page login (pas de 404) |

---

## Mise à jour après modification

### Backend modifié
```bash
# 1. Uploader les fichiers modifiés dans ~/mundial_backend/
# 2. cPanel → Setup Node.js App → Restart
```

### Frontend modifié
```bash
# 1. Sur ta machine :
npm run build   # dans frontend/

# 2. Uploader dist/ vers public_html/mundial/
#    (remplacer index.html + assets/ — ne pas supprimer .htaccess)
```

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Page blanche | Console navigateur → vérifier que `index.html` est bien dans `public_html/mundial/` |
| 404 sur refresh | `.htaccess` manquant ou `RewriteEngine` désactivé |
| `/api` renvoie 404 | `mod_proxy` non activé — contacter l'hébergeur ou utiliser `VITE_API_URL` direct |
| Erreur CORS | Vérifier `FRONTEND_URL=https://mundial.lamtar.net` (sans slash) dans les env vars |
| DB connection refused | Vérifier les variables `DB_*` dans l'app Node.js |
| App Node.js ne démarre pas | cPanel → Error logs ; vérifier que `npm install` a bien tourné |
| Images upload échouent | Vérifier que `uploads/` et ses sous-dossiers existent et sont en chmod 755 |
| Socket.io ne fonctionne pas | Certains hébergeurs bloquent WebSocket — utiliser polling comme fallback |

---

## Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | *(créé par create-admin.js)* | *(défini à la création)* |
| Capitaine 1 | captain1@lamtar.net | mundial123 |
| Capitaine 2 | captain2@lamtar.net | mundial123 |
| … | … | … |
| Capitaine 16 | captain16@lamtar.net | mundial123 |
