# Step-by-Step GitHub Push Guide — MoveIQ

---

## STEP 1 — Install Git (if not already installed)

```bash
# Check if git is installed
git --version

# If not installed:
# Windows  → https://git-scm.com/download/windows
# Mac      → brew install git
# Ubuntu   → sudo apt install git
```

---

## STEP 2 — Create the Repository on GitHub

1. Go to [https://github.com/new](https://github.com/new)
2. Fill in:
   - **Repository name:** `moveiq` (or any name you prefer)
   - **Description:** `AI-powered mobility intelligence platform for Delhi NCR`
   - **Visibility:** Public or Private — your choice
   - ❌ Do NOT check "Add a README file" (you already have one)
   - ❌ Do NOT check "Add .gitignore" (you already have one)
3. Click **Create repository**
4. Copy the repo URL shown — it will look like:
   `https://github.com/adhithyalakshman/MOBILITY.git`

---

## STEP 3 — Set Up .gitignore Files BEFORE Touching Git

This is the most important step. Do this BEFORE running `git init`.

### 3a. Root .gitignore

Place the `root-gitignore.txt` file at the **root of your entire project folder** and rename it to `.gitignore`:

```
moveiq/              ← your root folder
├── .gitignore       ← paste root-gitignore.txt content here
├── backend/
│   ├── .env         ← secret — protected by .gitignore
│   └── .env.example ← safe to commit
└── frontend/
    ├── .env         ← secret — protected by .gitignore
    └── .env.example ← safe to commit
```

### 3b. Create .env.example files

**frontend/.env.example** — commit this, not .env:
```env
# Copy this file to .env and fill in your values
VITE_API_BASE_URL=http://localhost:8000
```

**backend/.env.example** — commit this, not .env:
```env
# Copy this file to .env and fill in your values
DATABASE_URL=
SECRET_KEY=
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
```

---

## STEP 4 — Open Terminal in Your Project Root

```bash
# Navigate to your root project folder
# Example:
cd /path/to/moveiq
```

---

## STEP 5 — Initialise Git

```bash
git init
```

---

## STEP 6 — Verify .env Files Are Ignored (CRITICAL CHECK)

Run this BEFORE adding any files:

```bash
git status
```

**You should NOT see any `.env` files in the output.**

If you see `.env` listed, your `.gitignore` is not set up correctly — stop and fix Step 3 before continuing.

You can also double-check with:

```bash
git check-ignore -v backend/.env
git check-ignore -v frontend/.env
```

Both should print a line confirming they are ignored. If they print nothing, they are NOT ignored — fix your `.gitignore` first.

---

## STEP 7 — Stage All Safe Files

```bash
git add .
```

---

## STEP 8 — Verify One More Time (Important)

```bash
git status
```

Scroll through the output. Confirm:
- ✅ `README.md` is listed
- ✅ `frontend/src/` files are listed
- ✅ `backend/` source files are listed
- ✅ `.env.example` files are listed
- ❌ `.env` files are NOT listed
- ❌ `node_modules/` is NOT listed
- ❌ `venv/` or `__pycache__/` is NOT listed

---

## STEP 9 — Make Your First Commit

```bash
git commit -m "Initial commit: MoveIQ mobility intelligence platform"
```

---

## STEP 10 — Connect to GitHub

```bash
# Replace YOUR-USERNAME and your repo name
git remote add origin https://github.com/YOUR-USERNAME/moveiq.git
```

Confirm it was added:
```bash
git remote -v
```

---

## STEP 11 — Set Branch Name and Push

```bash
git branch -M main
git push -u origin main
```

You will be asked for your GitHub username and password.
> ⚠️ GitHub no longer accepts your account password here.
> You need a **Personal Access Token** instead — see below.

---

## STEP 12 — GitHub Personal Access Token (Required for HTTPS push)

1. Go to GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **Generate new token (classic)**
3. Give it a name, set expiry, and tick **repo** scope
4. Click **Generate token**
5. Copy the token immediately (you won't see it again)
6. When Git asks for your password during `git push` — paste this token

---

## STEP 13 — Verify on GitHub

1. Go to `https://github.com/YOUR-USERNAME/moveiq`
2. Confirm you can see all your files
3. Click into `frontend/.env` or `backend/.env` — these files should NOT exist in the repo
4. You should see `.env.example` files instead

---

## Future Pushes (After Initial Setup)

Whenever you make changes:

```bash
git add .
git commit -m "Fix: brief description of what you changed"
git push
```

---

## Quick Recovery — If You Accidentally Committed .env

If you already committed `.env` before setting up `.gitignore`, run:

```bash
# Remove .env from git tracking (keeps the local file)
git rm --cached backend/.env
git rm --cached frontend/.env

# Now add .gitignore and recommit
git add .gitignore
git commit -m "Fix: remove .env from tracking, add .gitignore"
git push
```

---

## Summary Checklist

- [ ] `.gitignore` at repo root covers both `frontend/.env` and `backend/.env`
- [ ] `frontend/.env.example` created and committed
- [ ] `backend/.env.example` created and committed  
- [ ] `git status` shows NO `.env` files before committing
- [ ] `git check-ignore -v frontend/.env` confirms it is ignored
- [ ] GitHub repo created at github.com/new
- [ ] `git remote add origin ...` points to your repo
- [ ] First push successful with Personal Access Token
