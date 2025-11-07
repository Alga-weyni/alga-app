# Git Commit & Push Guide
## Pushing INSA Documentation to GitHub Before Render Deployment

**Date:** November 7, 2025  
**Purpose:** Commit all INSA security audit documentation to GitHub repository

---

## FILES TO COMMIT

### INSA Documentation (11 files)
```
docs/insa/
├── INSA_WEB_APP_SUBMISSION.md (NEW)
├── INSA_MOBILE_APP_SUBMISSION.md (NEW)
├── INSA_TEST_CREDENTIALS.md
├── SECURITY_FUNCTIONALITY.md
├── THREAT_MODEL.md
├── API_DOCUMENTATION.md
├── THIRD_PARTY_SERVICES.md
├── AUTHENTICATION_AUTHORIZATION.md
├── COMPLIANCE_REQUIREMENTS.md
├── BUILD_INSTRUCTIONS.md
├── INSA_SUBMISSION_CHECKLIST.md
└── DEPLOYMENT_GUIDE.md (NEW)
└── GIT_COMMIT_GUIDE.md (NEW - this file)
```

### Architecture Diagrams (7 files - UPDATED with descriptions)
```
docs/diagrams/
├── System_Architecture.md (UPDATED)
├── DFD_Context_Level_0.md (UPDATED)
├── DFD_Detailed_Level_1.md (UPDATED)
├── Deployment_Architecture.md (UPDATED)
├── Component_Architecture.md (UPDATED)
├── Security_Layers.md (UPDATED)
└── ERD_Database_Schema.md (UPDATED)
```

### Project Documentation
```
replit.md (UPDATED - INSA audit section added)
```

---

## METHOD 1: Using Replit Git UI (Recommended)

### Step 1: Open Replit Git Panel
```
1. Look for the Git icon on the left sidebar (looks like a branch icon)
2. Click on it to open the Git panel
3. OR use keyboard shortcut: Ctrl+Shift+G (Windows/Linux) or Cmd+Shift+G (Mac)
```

### Step 2: Stage All Changes
```
1. In the Git panel, you'll see "Changes" section
2. Look for all modified files (should see ~20 files)
3. Click the "+" icon next to each file to stage
4. OR hover over "Changes" and click "Stage All Changes" (+ icon)
```

### Step 3: Commit Changes
```
1. In the "Message" box, type commit message:
   
   "Add INSA security audit documentation and submission package"

2. Optional detailed message:
   
   - Add INSA web and mobile app submission documents
   - Add 9 comprehensive security documentation files
   - Update all 7 architecture diagrams with descriptions
   - Add deployment guide for INSA test environment
   - Ready for Render deployment and INSA audit submission

3. Click "Commit" button
```

### Step 4: Push to GitHub
```
1. After committing, click "Push" button (or three dots → Push)
2. Wait for push to complete (green checkmark appears)
3. Verify on GitHub: Go to your repository and check latest commit
```

---

## METHOD 2: Using Replit Terminal

### Step 1: Configure Git (First Time Only)
```bash
git config --global user.name "Weyni Abraha"
git config --global user.email "Winnieaman94@gmail.com"
```

### Step 2: Check Status
```bash
# See what files have changed
git status
```

### Step 3: Stage All INSA Files
```bash
# Add all INSA documentation
git add docs/insa/

# Add all diagram updates
git add docs/diagrams/

# Add replit.md update
git add replit.md

# OR add everything:
git add .
```

### Step 4: Commit with Message
```bash
git commit -m "Add INSA security audit documentation and submission package

- Add INSA web and mobile app submission documents
- Add 9 comprehensive security documentation files  
- Update all 7 architecture diagrams with descriptions
- Add deployment guide for INSA test environment
- Ready for Render deployment and INSA audit submission"
```

### Step 5: Push to GitHub
```bash
# Push to main branch
git push origin main

# OR if your default branch is 'master':
git push origin master
```

---

## METHOD 3: Manual GitHub Upload (If Git Fails)

### Step 1: Download Files from Replit
```
1. In Replit file tree, right-click on "docs" folder
2. Select "Download as ZIP"
3. Extract ZIP on your computer
```

### Step 2: Upload to GitHub
```
1. Go to your GitHub repository
2. Click "Add file" → "Upload files"
3. Drag and drop the docs/insa folder
4. Drag and drop the docs/diagrams folder
5. Add commit message: "Add INSA security audit documentation"
6. Click "Commit changes"
```

---

## VERIFY SUCCESSFUL PUSH

### Check on GitHub
```
1. Go to: https://github.com/[your-username]/[your-repo]
2. Click "Commits" (or [X] commits near top)
3. Latest commit should be: "Add INSA security audit documentation..."
4. Click the commit to see changed files
5. Verify all 20+ files appear in the commit
```

### Check Files Exist on GitHub
```
Navigate to these paths on GitHub:
✅ docs/insa/INSA_WEB_APP_SUBMISSION.md
✅ docs/insa/INSA_MOBILE_APP_SUBMISSION.md
✅ docs/insa/DEPLOYMENT_GUIDE.md
✅ docs/diagrams/System_Architecture.md (check for description at top)
```

---

## TROUBLESHOOTING

### Issue: "Nothing to commit, working tree clean"
```
Solution:
This means files are already committed. Run:
git log -1

Check if your latest commit includes INSA files.
If yes, you're ready to deploy to Render!
```

### Issue: "Authentication failed"
```
Solution (GitHub Personal Access Token):
1. Go to GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token (classic)
4. Select scopes: repo (all), workflow
5. Generate token and copy it
6. In Replit terminal:
   git push https://[token]@github.com/[username]/[repo].git main
```

### Issue: "Replit won't let me use git"
```
Solution:
Use METHOD 3 (Manual GitHub Upload) or:
1. Export workspace as ZIP
2. Clone repo on your local computer
3. Copy files from ZIP to local repo
4. Commit and push from local computer
```

### Issue: Merge Conflict
```
Solution:
1. Pull latest changes: git pull origin main
2. Resolve any conflicts in files
3. Commit resolved changes
4. Push again: git push origin main
```

---

## AFTER SUCCESSFUL PUSH

### Next Steps:
```
✅ GitHub repository updated
✅ All INSA documentation committed
✅ Ready to deploy to Render

Now proceed with:
1. Go to https://render.com
2. Sign up / Sign in
3. Connect your GitHub repository
4. Follow DEPLOYMENT_GUIDE.md (Step 2 onwards)
```

---

## QUICK CHECKLIST

Before deploying to Render, verify:
```
✅ All files committed to GitHub
✅ Latest commit visible on GitHub
✅ docs/insa/ folder exists on GitHub (13 files)
✅ docs/diagrams/ folder updated on GitHub (7 files)
✅ No sensitive data committed (no API keys, passwords)
✅ .gitignore prevents .env files from being committed
✅ Ready to connect GitHub repo to Render
```

---

## IMPORTANT: What NOT to Commit

These should be in `.gitignore` (already configured):
```
❌ .env (environment variables)
❌ .env.local
❌ node_modules/
❌ dist/
❌ build/
❌ .DS_Store
❌ *.log
❌ Database credentials
❌ API keys and secrets
```

Verify your `.gitignore` includes these patterns.

---

## EMERGENCY: Lost Work?

### If you accidentally lost files:
```bash
# Undo last commit (keeps files):
git reset --soft HEAD~1

# Discard all uncommitted changes (CAREFUL!):
git checkout .

# View file history:
git log --all --full-history -- docs/insa/INSA_WEB_APP_SUBMISSION.md
```

---

## SUMMARY COMMANDS (Copy-Paste Ready)

```bash
# Quick commit and push (use in Replit terminal):
git add docs/insa/ docs/diagrams/ replit.md
git commit -m "Add INSA security audit documentation and submission package"
git push origin main

# Verify:
git log -1
```

---

**Next Document:** After successful push, proceed to `DEPLOYMENT_GUIDE.md`

**Contact:** If you encounter git issues, contact Weyni Abraha (Winnieaman94@gmail.com)
