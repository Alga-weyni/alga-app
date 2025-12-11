# Alga Branch Protection Rules

**Version:** 1.0  
**Last Updated:** December 2024

---

## Overview

This document defines the Git branching strategy and protection rules for Alga's codebase to ensure stable, secure, and predictable releases.

---

## Branching Strategy

### Branch Structure

```
main (Production)
  │
  ├── staging (Pre-production testing)
  │     │
  │     └── dev (Daily development)
  │           │
  │           ├── feature/xxx
  │           ├── bugfix/xxx
  │           └── hotfix/xxx
```

### Branch Purposes

| Branch | Purpose | Deploys To |
|--------|---------|------------|
| `main` | Production code | app.alga.et / api.alga.et |
| `staging` | Pre-release testing, INSA fixes | staging.alga.et |
| `dev` | Daily development | dev.alga.et |
| `feature/*` | New features | Local/PR preview |
| `bugfix/*` | Bug fixes | Local/PR preview |
| `hotfix/*` | Emergency production fixes | Direct to staging → main |

---

## GitHub Branch Protection Rules

### 1. Main Branch (`main`)

**Settings to Enable:**
```
☑ Require a pull request before merging
  ☑ Require approvals: 2
  ☑ Dismiss stale pull request approvals when new commits are pushed
  ☑ Require review from Code Owners

☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging
  Required checks:
    - API Tests (from daily-tests.yml)
    - Security Scan (from weekly-security.yml)

☑ Require conversation resolution before merging

☑ Require signed commits (if available)

☑ Do not allow bypassing the above settings

☑ Restrict who can push to matching branches
  - Only: DevOps Lead, CTO
```

### 2. Staging Branch (`staging`)

**Settings to Enable:**
```
☑ Require a pull request before merging
  ☑ Require approvals: 1
  ☑ Dismiss stale pull request approvals when new commits are pushed

☑ Require status checks to pass before merging
  Required checks:
    - API Tests

☑ Do not allow bypassing the above settings (except admins)
```

### 3. Dev Branch (`dev`)

**Settings to Enable:**
```
☑ Require a pull request before merging
  ☑ Require approvals: 1

☑ Require status checks to pass before merging
  Required checks:
    - API Tests (optional for speed)
```

---

## CODEOWNERS File

Create `.github/CODEOWNERS`:

```
# Default owners for everything
* @alga-cto @alga-devops-lead

# Security-sensitive files require security review
server/security/ @alga-security-officer @alga-cto
scripts/ @alga-devops-lead @alga-cto

# Financial code requires finance + dev review
server/routes.ts @alga-cto @alga-finance-lead
shared/schema.ts @alga-cto

# Documentation
docs/ @alga-devops-lead

# GitHub Actions
.github/ @alga-devops-lead @alga-cto
```

---

## Pull Request Template

Create `.github/pull_request_template.md`:

```markdown
## Description
<!-- Describe what this PR does -->

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Security fix
- [ ] Documentation update

## Testing
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Security Checklist
- [ ] No sensitive data exposed in logs
- [ ] No hardcoded secrets
- [ ] Input validation added where needed
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified

## Documentation
- [ ] README updated if needed
- [ ] API documentation updated if needed
- [ ] Runbook updated if needed

## Screenshots (if applicable)
<!-- Add screenshots for UI changes -->

## Related Issues
<!-- Link to related issues: Fixes #123 -->
```

---

## Merge Requirements by Environment

### To `dev` Branch
1. At least 1 approval from team member
2. All conversations resolved
3. API tests passing (optional, for speed)

### To `staging` Branch
1. At least 1 approval from senior developer
2. All conversations resolved
3. API tests passing
4. No security vulnerabilities

### To `main` Branch (Production)
1. At least 2 approvals (including 1 from CTO or DevOps Lead)
2. All conversations resolved
3. All status checks passing:
   - API Tests
   - Security Scan
   - Reconciliation (if payment changes)
4. No blocking issues or bugs
5. Deployment approval form completed (see `docs/DEPLOYMENT_APPROVAL.md`)

---

## Hotfix Process

For emergency production fixes:

```
1. Create hotfix branch from main:
   git checkout main
   git pull
   git checkout -b hotfix/critical-bug-description

2. Make the fix (minimal changes only)

3. Push and create PR to staging:
   git push -u origin hotfix/critical-bug-description
   # Create PR: hotfix/* → staging

4. Fast-track review (1 approval minimum)

5. After staging verification, create PR to main:
   # Create PR: staging → main

6. Deploy immediately after merge

7. Backport to dev:
   git checkout dev
   git merge hotfix/critical-bug-description
```

---

## Setting Up in GitHub

### Step-by-Step Instructions

1. **Navigate to Repository Settings**
   - Go to your GitHub repository
   - Click "Settings" → "Branches"

2. **Add Branch Protection Rule for `main`**
   - Click "Add rule"
   - Branch name pattern: `main`
   - Configure as per section above
   - Click "Create"

3. **Add Branch Protection Rule for `staging`**
   - Click "Add rule"
   - Branch name pattern: `staging`
   - Configure as per section above
   - Click "Create"

4. **Create CODEOWNERS File**
   - Create `.github/CODEOWNERS` as shown above
   - Replace usernames with actual GitHub handles

5. **Create PR Template**
   - Create `.github/pull_request_template.md` as shown above

---

## Enforcement Exceptions

### Who Can Bypass Rules

| Role | Can Bypass `dev` | Can Bypass `staging` | Can Bypass `main` |
|------|------------------|----------------------|-------------------|
| Developer | No | No | No |
| Senior Developer | Yes (emergency) | No | No |
| DevOps Lead | Yes | Yes (emergency) | No |
| CTO | Yes | Yes | Yes (documented only) |

### When Bypasses Are Allowed

1. **P1 Critical Incident** - System down, requires immediate fix
2. **Security Emergency** - Active security threat
3. **Regulatory Deadline** - Compliance requirement with deadline

**All bypasses must be:**
- Documented with reason
- Reported in post-incident review
- Reviewed within 24 hours

---

## Monitoring Branch Protection

### Weekly Checks
- [ ] Review any bypass incidents
- [ ] Verify protection rules still active
- [ ] Check for unauthorized direct pushes

### Monthly Audit
- [ ] Review CODEOWNERS accuracy
- [ ] Update protection rules if needed
- [ ] Verify required status checks are running

---

**Document Control:**
- Created: December 2024
- Review Cycle: Quarterly
- Owner: Alga DevOps Team
