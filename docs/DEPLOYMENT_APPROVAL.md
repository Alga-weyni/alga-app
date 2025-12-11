# Staging → Production Deployment Approval Workflow

## Overview

This document defines the formal approval process for deploying code changes to production. All deployments to `main` branch (production) require explicit approval.

## Branching Strategy

```
dev (development) → staging (testing) → main (production)
```

| Branch | Purpose | Auto-deploy | Approval Required |
|--------|---------|-------------|-------------------|
| `dev` | Daily development | No | No |
| `staging` | Testing & QA | Yes (to staging env) | No |
| `main` | Production | Yes (to production) | **Yes** |

## Approval Process

### Step 1: Development Complete

Developer:
1. Complete feature/fix in `dev` branch
2. Run local tests: `npx tsx scripts/api-tests.ts`
3. Verify no security regressions
4. Create Pull Request to `staging`

### Step 2: Staging Review

Tech Lead:
1. Review code changes
2. Merge PR to `staging`
3. Verify staging deployment works
4. Run disaster recovery test: `npx tsx scripts/disaster-recovery-test.ts`
5. If payment-related: Run `npx tsx scripts/payment-reconciliation.ts`

### Step 3: Production Approval

**Required Approvers:**
- Tech Lead (mandatory)
- CEO (for major features or breaking changes)

**Approval Checklist:**
- [ ] All automated tests pass
- [ ] Security scan completed
- [ ] No critical vulnerabilities
- [ ] Staging tested successfully
- [ ] Database migrations reviewed
- [ ] Rollback plan documented

### Step 4: Production Deployment

After approval:
1. Merge staging → main
2. Monitor deployment on Render
3. Verify health endpoint: `curl https://api.alga.et/api/health`
4. Monitor for 30 minutes post-deploy
5. Run smoke tests

## GitHub Branch Protection Rules

Configure in GitHub Settings → Branches → Branch protection rules:

### For `main` branch:
```yaml
Branch name pattern: main
Protection rules:
  - Require pull request reviews before merging
  - Required approving reviews: 1
  - Dismiss stale pull request approvals
  - Require review from code owners
  - Require status checks to pass before merging
    - Required checks: "api-tests"
  - Do not allow bypassing the above settings
```

### For `staging` branch:
```yaml
Branch name pattern: staging
Protection rules:
  - Require pull request reviews before merging
  - Required approving reviews: 1
```

## Emergency Hotfix Process

For critical production issues:

1. **Assess Severity**
   - P1: Platform down, payments failing → Hotfix allowed
   - P2-P4: Follow normal approval process

2. **Emergency Hotfix Steps**
   ```bash
   # Create hotfix branch from main
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-issue
   
   # Make minimal fix
   # ... edit code ...
   
   # Test locally
   npx tsx scripts/api-tests.ts
   
   # Create expedited PR with "HOTFIX" label
   git push origin hotfix/critical-issue
   ```

3. **Expedited Approval**
   - Tech Lead verbal approval (Slack/phone)
   - Document in PR description
   - Post-incident: Full documentation within 24 hours

## Deployment Schedule

| Day | Deployments Allowed |
|-----|---------------------|
| Monday | Yes |
| Tuesday | Yes (preferred) |
| Wednesday | Yes (preferred) |
| Thursday | Yes |
| Friday | Avoid unless critical |
| Weekend | Emergency only |

**Preferred Deployment Window:** Tuesday-Wednesday, 9 AM - 3 PM EAT

## Rollback Authority

| Scenario | Authorized to Rollback |
|----------|------------------------|
| API errors > 5% | On-call Engineer |
| Payment failures | Tech Lead |
| Security incident | Anyone |
| Customer-reported bugs | Tech Lead approval |

## Approval Record Template

```markdown
## Production Deployment Approval

**Date:** YYYY-MM-DD
**Requester:** [Name]
**Changes:** [Brief description]

### Pre-Deployment Checklist
- [ ] Code reviewed by: [Name]
- [ ] Tests pass: Yes/No
- [ ] Staging verified: Yes/No
- [ ] Security scan: Pass/Fail
- [ ] Database changes: None/Documented

### Approvals
- [ ] Tech Lead: [Name] - Approved/Rejected
- [ ] CEO (if required): [Name] - Approved/Rejected

### Post-Deployment
- [ ] Health check passed
- [ ] Monitoring active
- [ ] Rollback plan ready
```

## Contact for Approvals

| Role | Name | Contact |
|------|------|---------|
| Tech Lead | [TBD] | [Email/Slack] |
| CEO | [TBD] | [Email/Slack] |
| On-Call | [Rotation] | [Slack channel] |

---

*Last Updated: December 2024*
*Owner: Alga Engineering Team*
