# Shabka — cPanel Deployment Guide

> **Stack:** Node.js/Express backend (port 3001) + React/Vite frontend + MySQL 8.x + Socket.io
> **Target:** cPanel shared/VPS hosting with Node.js App support

---

## Prerequisites — Check These First

Before starting, verify your cPanel host supports:
- [ ] **"Setup Node.js App"** in cPanel (most modern hosts do — LiteSpeed or CloudLinux based)
- [ ] **"Git Version Control"** in cPanel
- [ ] **MySQL Databases** (standard on all cPanel)
- [ ] Node.js version **18+** available

> If your host does NOT have "Setup Node.js App", you need SSH + PM2. Get SSH access from your host and skip to the SSH section below.

---

## Step 1 — Database Setup (cPanel MySQL)

1. Log in to cPanel → **MySQL Databases**
2. Create a new database: `yourusername_shabka`
3. Create a new user: `yourusername_shabka_user` with a strong password
4. Add the user to the database → grant **ALL PRIVILEGES**
5. Open **phpMyAdmin** → select your new database → **Import**
6. Import `database/schema.sql` from this repo
7. After import, note your credentials:
   ```
   DB_HOST=localhost
   DB_NAME=yourusername_shabka
   DB_USER=yourusername_shabka_user
   DB_PASS=your_strong_password
   ```

---

## Step 2 — GitHub Repository Setup

Your repo must be on GitHub (public or private). If it is not yet pushed:

```bash
git remote add origin https://github.com/YOUR_USERNAME/shabka.git
git push -u origin main
```

> Make sure `backend/.env` and `frontend/.env` are in `.gitignore` — never commit real credentials.

---

## Step 3 — Connect cPanel Git Version Control

This pulls your code automatically when you push to GitHub.

1. cPanel → **Git Version Control** → **Create**
2. Fill in:
   - **Clone URL:** `https://github.com/YOUR_USERNAME/shabka.git`
   - **Repository Path:** `/home/yourusername/shabka` (outside `public_html`)
   - **Repository Name:** `shabka`
3. Click **Create** — cPanel will clone the repo

### 3a — Deploy on Push (Webhook)

To auto-deploy when you push to `main`:

1. In cPanel Git Version Control → click **Manage** on your repo
2. Copy the **Deployment URL** (looks like `https://yourhost.com/cpanel/git-clone/deploy/...`)
3. Go to GitHub → your repo → **Settings** → **Webhooks** → **Add webhook**
   - Payload URL: paste the cPanel deployment URL
   - Content type: `application/json`
   - Event: **Just the push event**
   - Active: checked
4. Click **Add webhook**

> From now on, every `git push origin main` will automatically pull the latest code to the server. **Yes, this is the correct approach.**

---

## Step 4 — Backend Deployment (Node.js App)

### 4a — Create the Node.js App

1. cPanel → **Setup Node.js App** → **Create Application**
2. Fill in:
   - **Node.js version:** 18.x or 20.x (latest available)
   - **Application mode:** Production
   - **Application root:** `/home/yourusername/shabka/backend`
   - **Application URL:** `api.yourdomain.com` (subdomain) or `yourdomain.com/api`
   - **Application startup file:** `src/app.js`
3. Click **Create**

### 4b — Set Environment Variables

In the same Node.js App panel → **Environment Variables** section, add:

```
PORT=3001
FRONTEND_URL=https://yourdomain.com
DB_HOST=localhost
DB_USER=yourusername_shabka_user
DB_PASS=your_strong_password
DB_NAME=yourusername_shabka
JWT_SECRET=generate_a_long_random_string_here
JWT_EXPIRES_IN=7d
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email@yourdomain.com
SMTP_PASS=your_email_password
EMAIL_FROM=noreply@yourdomain.com
MAX_FILE_SIZE=5242880
```

> Generate `JWT_SECRET` with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### 4c — Install Dependencies & Start

1. In the Node.js App panel, click **Run NPM Install** (or via SSH):
   ```bash
   cd /home/yourusername/shabka/backend
   npm install --production
   ```
2. Click **Start App** in the panel

### 4d — Create Admin User

Via SSH (required for this step):
```bash
cd /home/yourusername/shabka/backend
node scripts/create-admin.js
```

---

## Step 5 — Frontend Build & Deployment

The React frontend must be **built** and the static `dist/` folder served from `public_html`.

### 5a — Set Production API URL

Before building, create `frontend/.env.production` locally:
```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=Shabka
```

If your backend is on the same domain under `/api`, use:
```env
VITE_API_URL=https://yourdomain.com
```

### 5b — Build Locally

```bash
cd frontend
npm install
npm run build
```

This creates `frontend/dist/`.

### 5c — Upload dist/ to public_html

**Option A — File Manager (no SSH):**
1. cPanel → **File Manager** → navigate to `public_html`
2. Delete existing contents (or back them up)
3. Upload the `dist/` folder contents directly into `public_html`
   - Upload `index.html`, `assets/`, `locales/` into `public_html` (not inside a subfolder)

**Option B — Via SSH:**
```bash
cp -r /home/yourusername/shabka/frontend/dist/. /home/yourusername/public_html/
```

### 5d — Fix React Router (SPA redirect)

React Router requires all unknown URLs to serve `index.html`. Create `public_html/.htaccess`:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
```

If the file already exists, just add those rules inside the existing `<IfModule mod_rewrite.c>` block.

---

## Step 6 — Subdomain for Backend API (Recommended)

Serving frontend and backend on the same domain avoids CORS issues.

**Option A — Subdomain `api.yourdomain.com`:**
1. cPanel → **Subdomains** → create `api.yourdomain.com`
2. Point its document root to `/home/yourusername/shabka/backend`
3. In Node.js App, set Application URL to `api.yourdomain.com`

**Option B — Proxy `/api` through `.htaccess` (same domain):**

Add to `public_html/.htaccess` (before the React Router rules):
```apache
RewriteEngine On

# Proxy /api to Node.js backend
RewriteCond %{REQUEST_URI} ^/api [NC]
RewriteRule ^api/(.*)$ http://127.0.0.1:3001/api/$1 [P,L]

# Proxy /uploads to Node.js backend
RewriteCond %{REQUEST_URI} ^/uploads [NC]
RewriteRule ^uploads/(.*)$ http://127.0.0.1:3001/uploads/$1 [P,L]

# React SPA fallback
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
```

> Option B requires `mod_proxy` to be enabled on your host. Ask support if unsure.

---

## Step 7 — Socket.io (WebSocket) Support

Socket.io uses WebSockets. cPanel shared hosting often **does not support persistent WebSocket connections** (they get killed after a timeout).

- **If your host supports WebSockets:** Set `FRONTEND_URL` env var and the Socket.io connection will work.
- **If not:** Socket.io will fall back to long-polling automatically — live match updates will still work but with slight delay.
- **Best solution:** Ask your host to enable WebSocket support or upgrade to a VPS plan.

In `frontend/src/` wherever you initialize the Socket.io client, make sure the URL points to your backend:
```js
const socket = io('https://api.yourdomain.com'); // or your backend URL
```

---

## Step 8 — Auto-Deploy Workflow (After Setup)

Once everything above is configured, your workflow is:

```bash
# Make changes locally
git add .
git commit -m "your change"
git push origin main
# → GitHub webhook fires → cPanel pulls latest code automatically
```

**For backend changes:** After the pull, the Node.js app needs a restart:
- cPanel → Setup Node.js App → Restart (manual), OR
- Set up a `.cpanel.yml` deployment script (see below)

### Optional: `.cpanel.yml` for post-pull hooks

Create `.cpanel.yml` in the repo root:

```yaml
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/yourusername/shabka/backend
    - cd $DEPLOYPATH && /home/yourusername/nodevenv/shabka/backend/18/bin/npm install --production
```

> The exact path to `npm` inside the virtual environment is shown in your Node.js App panel. Replace `18` with your Node version.

---

## Step 9 — Frontend Auto-Build (CI/CD via GitHub Actions)

To avoid manually rebuilding and uploading `dist/` after every frontend change, use GitHub Actions to build and FTP-upload automatically.

Create `.github/workflows/deploy.yml` in your repo:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install & Build
        working-directory: frontend
        run: |
          npm ci
          npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_APP_NAME: Shabka

      - name: Deploy to cPanel via FTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_HOST }}
          username: ${{ secrets.FTP_USER }}
          password: ${{ secrets.FTP_PASS }}
          local-dir: frontend/dist/
          server-dir: /public_html/
```

Add these GitHub repo secrets (**Settings → Secrets → Actions**):
| Secret | Value |
|---|---|
| `VITE_API_URL` | `https://api.yourdomain.com` |
| `FTP_HOST` | your cPanel FTP hostname |
| `FTP_USER` | your cPanel FTP username |
| `FTP_PASS` | your cPanel FTP password |

> FTP credentials are in cPanel → **FTP Accounts**.

---

## Checklist Summary

- [ ] Database created and schema imported in phpMyAdmin
- [ ] Node.js App created in cPanel, env vars set, app started
- [ ] Admin user created via `node scripts/create-admin.js`
- [ ] `frontend/.env.production` set with correct API URL
- [ ] Frontend built locally → `dist/` uploaded to `public_html`
- [ ] `.htaccess` created with SPA fallback (and optional proxy)
- [ ] GitHub repo connected via cPanel Git Version Control
- [ ] GitHub webhook pointing to cPanel deployment URL
- [ ] (Optional) GitHub Actions workflow for automatic frontend builds

---

## Getting SSH Access

SSH makes everything above much easier (running npm, node scripts, managing PM2). To enable:

1. cPanel → **SSH Access** → **Manage SSH Keys** → **Generate New Key**
2. After generating, click **Authorize** on the key
3. Download the private key and connect:
   ```bash
   ssh -i ~/.ssh/your_key yourusername@yourhost.com -p 22
   ```
   (Some hosts use port 2222 — check your welcome email)

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Backend 502/503 | Check Node.js App is started; check logs in cPanel → Errors |
| CORS errors | Verify `FRONTEND_URL` env var matches your exact frontend domain (no trailing slash) |
| React pages 404 on refresh | `.htaccess` SPA redirect is missing or incorrect |
| Socket.io not connecting | Check backend URL in frontend socket init; verify WebSocket support with host |
| DB connection refused | Verify DB credentials; on cPanel DB host is always `localhost` |
| `sharp` install fails | Run `npm install --ignore-scripts` then `npm rebuild sharp` via SSH |
