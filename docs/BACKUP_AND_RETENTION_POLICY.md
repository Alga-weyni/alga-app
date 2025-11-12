# Alga Electronic Signature Backup & Retention Policy

**Company**: Alga One Member PLC (TIN: 0101809194)  
**Policy Version**: 1.0  
**Effective Date**: November 12, 2025  
**Review Date**: November 12, 2026  
**Policy Owner**: Legal & Compliance Team  
**Regulatory Authority**: INSA (Information Network Security Agency)

---

## 1. Purpose

This policy establishes the backup and data retention procedures for electronic signature records (`consent_logs`) in compliance with:
- **Ethiopian Electronic Signature Proclamation No. 1072/2018**
- **Ethiopian Electronic Transactions Proclamation No. 1205/2020**
- **Ethiopian Tax Law** (5-year record retention requirement)
- **International best practices** (GDPR-equivalent standards)

---

## 2. Scope

This policy applies to:
- All electronic signature records stored in the `consent_logs` database table
- Associated encrypted data (IP addresses, device information)
- Signature hash verification data
- User consent audit trails
- All backup systems and storage locations

---

## 3. Data Retention

### 3.1 Retention Period

**Primary Retention**: **5 years** from the date of signature

**Legal Basis**:
- Ethiopian tax law requires 5-year retention for financial transactions
- Electronic Signature Proclamation No. 1072/2018 requires audit trail availability
- Statute of limitations for contract disputes in Ethiopia
- International compliance standards (GDPR: 5-7 years for legal obligations)

### 3.2 What is Retained

For each electronic signature, we retain:

| Data Element | Retention Period | Post-Retention Action |
|--------------|------------------|----------------------|
| **Signature ID** (UUID) | 5 years | Anonymize or delete |
| **User ID** | 5 years | Anonymize |
| **Action Type** | 5 years | Retain for analytics |
| **Timestamp** | 5 years | Retain for analytics |
| **IP Address** (encrypted) | 5 years | Delete |
| **Device Info** (encrypted) | 5 years | Delete |
| **Signature Hash** (SHA-256) | **Indefinite** | Anonymized analytics |
| **OTP/Fayda ID** | 5 years | Delete |
| **Related Entity Data** | 5 years | Depends on entity |
| **Verification Status** | 5 years | Retain for analytics |

**Post-Retention**:
- After 5 years, personally identifiable information (PII) is deleted
- Anonymized signature hashes may be retained for statistical analysis
- No PII can be linked to anonymized data

### 3.3 Deletion Process

**Automated Deletion**:
```sql
-- Scheduled job runs quarterly
DELETE FROM consent_logs
WHERE timestamp < NOW() - INTERVAL '5 years'
  AND anonymized = FALSE;

-- Anonymize remaining records
UPDATE consent_logs
SET 
  user_id = 'ANONYMIZED',
  ip_address_encrypted = NULL,
  device_info_encrypted = NULL,
  otp_id = NULL,
  fayda_id = NULL,
  metadata = '{}'
WHERE timestamp < NOW() - INTERVAL '5 years'
  AND anonymized = FALSE;
```

**Manual Deletion Requests**:
- Users can request deletion before 5-year period only by:
  1. Court order
  2. Legal requirement (e.g., data protection authority directive)
  3. Proven identity theft or fraud
- Deletion requests reviewed by Legal Team within 30 days
- Approved deletions executed within 60 days

---

## 4. Backup Strategy

### 4.1 Three-Tier Backup System

#### **Tier 1: Real-Time Replication**
- **Provider**: Neon Database (serverless PostgreSQL)
- **Type**: Synchronous replication
- **Frequency**: Continuous (real-time)
- **Recovery Point Objective (RPO)**: 0 minutes
- **Recovery Time Objective (RTO)**: 5 minutes
- **Retention**: 7 days point-in-time recovery

#### **Tier 2: Daily Incremental Backups**
- **Provider**: Google Cloud Storage (via Replit Object Storage)
- **Type**: Encrypted SQL dumps
- **Frequency**: Daily at 3:00 AM Ethiopian Time
- **Retention**: 90 days (rolling)
- **Encryption**: AES-256 server-side encryption
- **Location**: Off-site (different datacenter from primary)

#### **Tier 3: Weekly Full Backups**
- **Provider**: Google Cloud Storage (archival tier)
- **Type**: Complete database snapshot
- **Frequency**: Weekly on Sunday at 1:00 AM Ethiopian Time
- **Retention**: 5 years
- **Encryption**: AES-256 + customer-managed keys
- **Location**: Cold storage (Nearline/Coldline tier)

### 4.2 Backup Verification

**Automated Testing**:
- **Weekly**: Restore test of latest daily backup (non-production environment)
- **Monthly**: Integrity check of all backup files (checksum verification)
- **Quarterly**: Full disaster recovery drill (production restore simulation)

**Manual Testing**:
- **Annual**: Complete end-to-end restore from cold storage
- **Bi-annual**: Cross-region restore test
- **As needed**: Restore specific records upon user request

### 4.3 Backup Security

**Encryption**:
- All backups encrypted with AES-256
- Encryption keys managed separately from backup data
- Key rotation every 90 days

**Access Control**:
- Backup access requires multi-factor authentication (MFA)
- Only authorized personnel (max 3 people) have restore access
- All backup access logged and audited
- Principle of least privilege enforced

**Monitoring**:
- Backup success/failure alerts (email + SMS)
- Backup size anomaly detection
- Backup encryption verification
- Unauthorized access attempts logged

---

## 5. Disaster Recovery

### 5.1 Recovery Scenarios

| Scenario | Recovery Source | RTO | RPO |
|----------|----------------|-----|-----|
| **Database crash** | Tier 1 (Neon replication) | 5 min | 0 min |
| **Datacenter outage** | Tier 2 (daily backup) | 2 hours | 24 hours |
| **Regional disaster** | Tier 3 (weekly backup) | 24 hours | 7 days |
| **Ransomware attack** | Tier 3 (cold storage) | 48 hours | 7 days |
| **Data corruption** | Point-in-time recovery | 1 hour | Variable |

### 5.2 Recovery Process

1. **Detection**: Automated monitoring or manual report
2. **Assessment**: Determine scope and recovery point
3. **Authorization**: Legal/Compliance approval for production restore
4. **Execution**:
   - Stop affected services
   - Restore from appropriate backup tier
   - Verify data integrity (signature hash checks)
   - Resume services
5. **Verification**: Run integrity checks, user testing
6. **Documentation**: Incident report within 48 hours
7. **INSA Notification**: If data breach or loss detected (within 72 hours)

### 5.3 Backup Restoration Commands

**Tier 1 (Neon)**: Via Neon dashboard (point-in-time recovery)

**Tier 2 (Daily Backup)**:
```bash
# Download encrypted backup
gsutil cp gs://alga-backups/consent_logs_YYYY-MM-DD.sql.enc ./

# Decrypt backup
openssl enc -aes-256-cbc -d -in consent_logs_YYYY-MM-DD.sql.enc \
  -out consent_logs_YYYY-MM-DD.sql -k $BACKUP_DECRYPTION_KEY

# Restore to database
psql $DATABASE_URL < consent_logs_YYYY-MM-DD.sql

# Verify integrity
npm run integrity-check
```

**Tier 3 (Weekly Backup)**: Similar process with longer download time

---

## 6. Compliance & Auditing

### 6.1 Audit Trail

All backup and retention activities are logged:
- Backup creation timestamps
- Backup verification results
- Restore operations (who, when, why)
- Deletion operations (automated or manual)
- Policy changes and approvals

**Log Retention**: 7 years (longer than data retention for audit purposes)

### 6.2 INSA Compliance

**Annual INSA Reporting**:
- Total signatures retained
- Backup success rate
- Restoration test results
- Deletion statistics
- Security incidents (if any)

**INSA Audit Access**:
- Read-only credentials provided upon request
- Audit logs available for inspection
- Backup verification demonstrations
- Policy documentation review

### 6.3 Internal Audits

**Quarterly**:
- Backup verification (spot checks)
- Access log review
- Deletion process review
- Policy adherence check

**Annual**:
- Full backup/restore audit
- Third-party security assessment
- Policy effectiveness review
- Disaster recovery drill

---

## 7. Roles & Responsibilities

| Role | Responsibilities |
|------|------------------|
| **Legal Team** | Policy oversight, deletion approvals, INSA liaison |
| **DevOps Team** | Backup execution, monitoring, restoration |
| **Security Team** | Encryption management, access control, incident response |
| **Compliance Officer** | Audit coordination, policy review, reporting |
| **Database Admin** | Integrity checks, schema management, performance |

---

## 8. Off-Site Backup Locations

### 8.1 Primary Off-Site

**Provider**: Google Cloud Storage  
**Region**: europe-west1 (Belgium)  
**Replication**: Multi-region (automatic)  
**Type**: Nearline storage (daily backups)

### 8.2 Secondary Off-Site

**Provider**: Google Cloud Storage  
**Region**: us-central1 (Iowa)  
**Replication**: Single region  
**Type**: Coldline storage (weekly backups, 5-year archive)

### 8.3 Geographic Diversity

- Primary database: us-east-1 (Neon)
- Tier 2 backups: europe-west1 (Belgium)
- Tier 3 archival: us-central1 (Iowa)

**Rationale**: Geographic separation ensures disaster recovery from regional events

---

## 9. Cost Management

### 9.1 Backup Storage Costs

| Tier | Storage Class | Est. Size | Monthly Cost |
|------|--------------|-----------|--------------|
| Tier 1 | Neon (included) | N/A | $0 (included) |
| Tier 2 | Nearline (90 days) | 5 GB | ~$0.50 |
| Tier 3 | Coldline (5 years) | 250 GB | ~$2.50 |
| **Total** | | | **~$3.00/month** |

**Cost Optimization**:
- Compression before backup (gzip)
- Lifecycle policies (auto-move to cold storage)
- Retention-based deletion (automatic)
- Regional placement (lowest-cost regions)

---

## 10. User Rights & Transparency

### 10.1 User Requests

Users can request:
1. **Signature Records**: Complete list of their signatures
2. **Data Portability**: Export in JSON or PDF format
3. **Correction**: Fix errors in signature records (with legal review)
4. **Deletion**: After retention period or by court order

**Response Time**: 30 days maximum

### 10.2 Transparency

Users are informed of:
- 5-year retention period (in Terms of Service)
- Backup practices (in Privacy Policy)
- Deletion process (in User Guide)
- Data export options (in Account Settings)

---

## 11. Policy Review & Updates

**Review Frequency**: Annually (or as required by law changes)

**Update Process**:
1. Legal/Compliance team proposes changes
2. Technical team assesses implementation
3. Management approval
4. INSA notification (if required)
5. User notification (via email + website)
6. Policy version update

**Next Review**: November 12, 2026

---

## 12. Emergency Contacts

### 12.1 Internal

- **Legal Team**: legal@alga.et | +251 [TBD]
- **DevOps Team**: devops@alga.et | +251 [TBD]
- **Security Team**: security@alga.et | +251 [TBD]

### 12.2 External

- **INSA**: [Contact information]
- **Neon Support**: support@neon.tech
- **Google Cloud Support**: [Premium support contact]

---

## 13. Appendices

### Appendix A: Backup Schedule

```
Daily Backups (Tier 2):
- Time: 3:00 AM Ethiopian Time
- Days: Monday - Sunday
- Retention: 90 days

Weekly Backups (Tier 3):
- Time: 1:00 AM Ethiopian Time
- Day: Sunday
- Retention: 5 years

Integrity Checks:
- Time: 2:00 AM Ethiopian Time
- Frequency: Daily
- Scope: All signatures
```

### Appendix B: Restoration Checklist

- [ ] Identify recovery point (date/time)
- [ ] Obtain Legal/Compliance approval
- [ ] Notify stakeholders (users, INSA if required)
- [ ] Stop affected services (if necessary)
- [ ] Download backup from appropriate tier
- [ ] Decrypt backup (verify encryption key)
- [ ] Restore to staging environment
- [ ] Run integrity checks (signature hash verification)
- [ ] Verify sample records (spot check)
- [ ] Restore to production (if staging verification passes)
- [ ] Resume services
- [ ] Monitor for issues (24 hours)
- [ ] Document incident and restoration
- [ ] Post-mortem review (within 7 days)

### Appendix C: Encryption Key Management

**Key Rotation**:
- Frequency: Every 90 days
- Process: Generate new key, re-encrypt backups, retire old key
- Audit: All rotations logged

**Key Storage**:
- Primary: Google Cloud KMS (Key Management Service)
- Backup: Hardware security module (HSM) - offline
- Access: Multi-person authorization required

---

**END OF POLICY**

**Questions?** Contact legal@alga.et  
**For INSA Inquiries**: compliance@alga.et

---

**Document Classification**: Internal - INSA Inspection Ready  
**Distribution**: Legal, DevOps, Security, Compliance, INSA (upon request)  
**Approval**: [Signature] - Alga Legal Team Lead - November 12, 2025
