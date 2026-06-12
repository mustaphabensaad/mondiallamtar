# Déploiement — mundial.lamtar.net

**Frontend :** `mundial.lamtar.net`
**Backend :** `mundial.lamtar.net/api`
**Sans GitHub — upload direct via cPanel**

---

## Étape 1 — Créer le sous-domaine

1. cPanel → **Sous-domaines (Subdomains)**
2. Sous-domaine : `mundial` → Domaine : `lamtar.net`
3. Racine du document : `/home/USERNAME/public_html/mundial` (cPanel la remplit auto)
4. Cliquer **Créer**

---

## Étape 2 — Base de données MySQL

1. cPanel → **MySQL Databases**
2. Créer une base : `USERNAME_mundial`
3. Créer un utilisateur : `USERNAME_mundial_u` + mot de passe fort
4. Ajouter l'utilisateur à la base → **ALL PRIVILEGES**
5. cPanel → **phpMyAdmin** → sélectionner `USERNAME_mundial` → **Importer**
6. Importer le fichier `database/schema.sql`

---

## Étape 3 — Déployer le backend (Node.js App)

### 3a — Uploader les fichiers backend

1. cPanel → **File Manager** → aller dans `/home/USERNAME/` (hors de `public_html`)
2. Créer un dossier : `mundial_backend`
3. Uploader tout le contenu du dossier `backend/` dans `mundial_backend/`
   - Uploader via **Upload** dans File Manager, ou via FTP (FileZilla)
   - **Ne pas uploader** `node_modules/` ni `.env`

### 3b — Créer l'application Node.js

1. cPanel → **Setup Node.js App** → **Create Application**
2. Remplir :
   - **Node.js version :** 18.x ou 20.x
   - **Application mode :** Production
   - **Application root :** `/home/USERNAME/mundial_backend`
   - **Application URL :** `mundial.lamtar.net` *(on va proxy /api après)*
   - **Application startup file :** `src/app.js`
3. Cliquer **Create**

### 3c — Variables d'environnement

Dans le panneau Node.js App → section **Environment Variables**, ajouter :

```
PORT=3001
FRONTEND_URL=https://mundial.lamtar.net
DB_HOST=localhost
DB_USER=USERNAME_mundial_u
DB_PASS=TON_MOT_DE_PASSE
DB_NAME=USERNAME_mundial
JWT_SECRET=GENERER_UNE_CLE_LONGUE_ICI
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=5242880
```

> Pour générer `JWT_SECRET` : dans le terminal Node.js App (ou SSH) :
> `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### 3d — Installer les dépendances

Dans le panneau Node.js App → cliquer **Run NPM Install**

Ou via SSH :
```bash
cd /home/USERNAME/mundial_backend
npm install --production
```

### 3e — Créer le compte admin

Via SSH uniquement :
```bash
cd /home/USERNAME/mundial_backend
node scripts/create-admin.js
```

### 3f — Démarrer l'application

Node.js App panel → **Start App** ✅

---

## Étape 4 — Builder le frontend localement

Sur **ta machine** (pas le serveur) :

### 4a — Configurer l'URL de l'API

Éditer `frontend/.env.production` :
```env
VITE_API_URL=https://mundial.lamtar.net
VITE_APP_NAME=Mundial Lamtar
```

### 4b — Builder

```bash
cd frontend
npm install
npm run build
```

Cela crée le dossier `frontend/dist/`.

---

## Étape 5 — Uploader le frontend

1. cPanel → **File Manager** → aller dans `/home/USERNAME/public_html/mundial/`
2. Supprimer le contenu existant (s'il y en a)
3. Uploader **tout le contenu** de `frontend/dist/` dans ce dossier
   - `index.html`
   - `assets/`
   - `locales/`
   - etc.

> **Astuce FileZilla :** Connecte-toi en FTP, navigue vers `public_html/mundial/`, sélectionne tout dans `dist/` et glisse-dépose.

---

## Étape 6 — Configurer .htaccess

Dans `/home/USERNAME/public_html/mundial/`, créer un fichier `.htaccess` :

```apache
Options -MultiViews
RewriteEngine On

# Proxy /api → backend Node.js (port 3001)
RewriteCond %{REQUEST_URI} ^/api [NC]
RewriteRule ^api/(.*)$ http://127.0.0.1:3001/api/$1 [P,L]

# Proxy /uploads → backend Node.js
RewriteCond %{REQUEST_URI} ^/uploads [NC]
RewriteRule ^uploads/(.*)$ http://127.0.0.1:3001/uploads/$1 [P,L]

# React SPA — rediriger toutes les routes vers index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
```

> Si `mod_proxy` n'est pas activé chez ton hébergeur, contacte leur support pour l'activer, ou demande-leur de pointer `/api` vers le port 3001.

---

## Étape 7 — Vérification finale

Ouvrir dans le navigateur :

| URL | Résultat attendu |
|-----|-----------------|
| `https://mundial.lamtar.net` | Page d'accueil de l'app |
| `https://mundial.lamtar.net/api/health` | `{"status":"ok"}` ou réponse JSON |
| `https://mundial.lamtar.net/login` | Page login (pas de 404) |

---

## Mettre à jour après modification

### Mise à jour du backend
1. Uploader les fichiers modifiés dans `/home/USERNAME/mundial_backend/`
2. cPanel → Setup Node.js App → **Restart**

### Mise à jour du frontend
1. Sur ta machine : `npm run build` dans `frontend/`
2. Uploader le contenu de `dist/` dans `public_html/mundial/`
   - Remplacer `index.html` et le dossier `assets/`
   - **Ne pas supprimer** `.htaccess`

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Page blanche | Vérifier la console navigateur ; vérifier que `index.html` est bien dans `public_html/mundial/` |
| 404 sur refresh | `.htaccess` manquant ou mal placé |
| `/api` renvoie 404 | `mod_proxy` non activé — contacter l'hébergeur |
| Erreur de connexion DB | Vérifier les variables d'env DB dans Node.js App |
| App Node.js ne démarre pas | cPanel → **Errors** logs ; vérifier `npm install` bien fait |
| CORS error | Vérifier que `FRONTEND_URL=https://mundial.lamtar.net` (sans slash final) |
