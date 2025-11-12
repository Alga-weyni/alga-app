# Admin Signature Dashboard Guide
## Ethiopian Electronic Signature Compliance System

**Document Version**: 1.0  
**Last Updated**: November 12, 2025  
**Company**: Alga One Member PLC (TIN: 0101809194)  
**Compliance**: Proclamations No. 1072/2018 & No. 1205/2020

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Access Requirements](#access-requirements)
3. [Dashboard Features](#dashboard-features)
4. [Login & Authentication](#login--authentication)
5. [Viewing Signature Logs](#viewing-signature-logs)
6. [Filtering & Search](#filtering--search)
7. [Verifying Signature Integrity](#verifying-signature-integrity)
8. [Decrypting Audit Information](#decrypting-audit-information)
9. [Exporting Records](#exporting-records)
10. [Rate Limits & Security](#rate-limits--security)
11. [INSA Inspection Checklist](#insa-inspection-checklist)
12. [Troubleshooting](#troubleshooting)

---

## Overview

The **Admin Signature Dashboard** is a centralized compliance tool for viewing, verifying, and exporting electronic signature consent logs in compliance with Ethiopian law.

### Purpose
- **Legal Compliance**: Monitor all electronic signatures for INSA audits
- **Security Auditing**: Verify signature integrity and detect tampering
- **Forensic Analysis**: Decrypt audit trails for investigations
- **Reporting**: Export compliance reports for stakeholders

### Key Features
✅ Real-time signature log viewing with pagination  
✅ Advanced filtering (User ID, action, date range, verification status)  
✅ SHA-256 integrity verification  
✅ AES-256 encrypted audit data decryption  
✅ Multi-format export (CSV, PDF, JSON)  
✅ Complete audit trail of all admin actions  
✅ Rate-limited operations for security  

---

## Access Requirements

### Role Requirement
- **Required Role**: `admin`
- **Access URL**: `/admin/signatures`

### Permissions
Only users with the `admin` role can access this dashboard. All access attempts are logged for audit purposes.

### Test Accounts
For testing and training:
- **Admin Account**: `test-admin@alga.et`
- **Password**: `Test@1234`

---

## Dashboard Features

### Main Components

#### 1. Filter Panel
- **User ID**: Filter by specific user
- **Action**: Filter by signature action type (booking, payment, confirm, submit)
- **Verification Status**: Filter by verified/not verified
- **Date Range**: Start and end date filters
- **Search**: Free-text search across User ID, Signature ID, and Action

#### 2. Data Table
Displays signature logs with columns:
- **ID**: Internal database ID
- **User ID**: User who created the signature
- **Action**: Type of signature action
- **Timestamp**: When signature was created (UTC)
- **Verified**: Session verification status
- **Signature Hash**: SHA-256 hash (truncated display)
- **Actions**: Verify and Decrypt buttons

#### 3. Pagination Controls
- Default page size: 50 records
- Maximum page size: 200 records
- Navigate between pages with Previous/Next buttons

---

## Login & Authentication

### Step 1: Navigate to Dashboard
```
https://alga.et/admin/signatures
```

### Step 2: Authenticate
- If not logged in, you'll be redirected to login page
- Enter admin credentials
- Complete OTP verification if enabled

### Step 3: Access Dashboard
- Upon successful authentication, dashboard loads automatically
- All admin actions are logged for audit trail

---

## Viewing Signature Logs

### Default View
- Shows most recent 50 signature logs
- Sorted by timestamp (newest first)
- All filters cleared by default

### Column Descriptions

| Column | Description | Example |
|--------|-------------|---------|
| **ID** | Unique database identifier | 1247 |
| **User ID** | User who signed | user_abc123... |
| **Action** | Signature type | booking, payment |
| **Timestamp** | When signed (UTC) | 2025-11-12 03:15:42 |
| **Verified** | Session verification | ✓ Verified / Not Verified |
| **Signature Hash** | SHA-256 integrity hash | a3b2c1d4e5f6... |

### Understanding Verification Status

#### ✅ Verified
- User completed session verification (OTP or Fayda ID)
- Signature legally valid
- Full audit trail available

#### ⚠️ Not Verified
- Session verification incomplete
- May indicate abandoned transaction
- Still legally logged for audit

---

## Filtering & Search

### Date Range Filter
**Use Case**: INSA quarterly audit for Q1 2025

1. **Start Date**: `2025-01-01`
2. **End Date**: `2025-03-31`
3. Click anywhere outside date picker
4. Results update automatically

**Best Practice**: For large date ranges (>30 days), combine with other filters to reduce result set.

### Action Filter
**Use Case**: Review all payment signatures

1. Click **Action** dropdown
2. Select **"payment"**
3. Results show only payment-related signatures

**Available Actions**:
- `booking` - Property booking confirmations
- `payment` - Payment processing signatures
- `confirm` - General confirmations
- `submit` - Form submissions

### User ID Filter
**Use Case**: Investigate signatures for specific user

1. Enter user ID in **User ID** field
2. Can be partial match (searches as you type)
3. Results filter in real-time

**Tip**: Use full user ID for exact match, or first few characters for broader search.

### Verification Status Filter
**Use Case**: Find all unverified signatures

1. Click **Verification Status** dropdown
2. Select **"Not Verified"**
3. Review incomplete verification sessions

**Use for**:
- Quality assurance
- Abandoned transaction analysis
- Fraud investigation

### Search Box
**Use Case**: Quick search across multiple fields

1. Enter search term in **Search** box
2. Searches across: User ID, Signature ID, Action
3. Case-insensitive matching

**Examples**:
- Search `"user_123"` - finds all signatures for that user
- Search `"booking"` - finds all booking-related signatures
- Search `"a3b2c1"` - finds signatures with matching hash prefix

### Clearing Filters
Click **"Clear Filters"** button to reset all filters to default state.

---

## Verifying Signature Integrity

### Purpose
Verify that signature hash has not been tampered with since creation.

### How It Works
1. System retrieves original signature record
2. Recomputes SHA-256 hash using: `userId + action + timestamp`
3. Compares original hash vs recomputed hash
4. Returns validation result

### Step-by-Step Process

#### Step 1: Select Signature
Click **"Verify"** button next to the signature you want to check.

#### Step 2: View Verification Result
Modal displays:
- **Status**: ✅ Valid or ❌ Invalid
- **Message**: Human-readable explanation
- **Original Hash**: Hash from database
- **Recomputed Hash**: Freshly calculated hash

#### Step 3: Interpret Results

**✅ Signature Valid**
```
Original Hash:  a3b2c1d4e5f67890...
Recomputed Hash: a3b2c1d4e5f67890...
Status: ✅ Signature integrity verified
```
- Hashes match perfectly
- No tampering detected
- Record legally valid

**❌ Signature Invalid**
```
Original Hash:  a3b2c1d4e5f67890...
Recomputed Hash: b4c3d2e1f6g78901...
Status: ❌ Signature hash mismatch - potential tampering detected
```
- Hashes do NOT match
- **CRITICAL**: Potential data tampering
- Immediate investigation required
- Report to legal and IT security teams

### When to Verify

**Regular Audits**:
- Weekly spot checks (random sample of 50 signatures)
- Monthly compliance reports (verify 5% of all signatures)
- Quarterly INSA audits (verify all high-value transactions)

**Incident Response**:
- User disputes signature
- Fraud investigation
- Legal proceedings requiring evidence
- INSA inspection request

### Verification Audit Trail
Every verification action is logged with:
- Admin user ID
- Timestamp
- Signature ID verified
- Verification result (valid/invalid)
- Original and recomputed hashes

---

## Decrypting Audit Information

### ⚠️ Security Warning
Decrypted data contains **sensitive personal information**:
- IP addresses
- Device information (user agent, browser, OS)
- Session details

**Use only when legally necessary** (court order, INSA audit, fraud investigation).

### Rate Limits
**20 decrypt operations per hour per admin**

After 20 decrypts, you'll see:
```
Rate limit exceeded. Maximum 20 decrypt operations per hour.
Next available: 2025-11-12 04:30:00
```

### Step-by-Step Process

#### Step 1: Select Signature
Click **"Decrypt"** button next to the signature.

#### Step 2: Modal Opens (Auto-Close in 30 Seconds)
Modal displays decrypted information:

**User Information**:
- User ID
- Action performed
- Timestamp

**Decrypted Audit Data**:
- **IP Address**: Client's IP address (e.g., `192.168.1.100`)
- **Device Info**: User agent string (e.g., `Mozilla/5.0 (Windows NT 10.0; Win64; x64)...`)

**Session Verification**:
- Verification status (Verified / Not Verified)
- OTP ID (if OTP verification used)
- Fayda ID (if Fayda verification used)

#### Step 3: Review Information
- **Read-only**: Text cannot be copied or pasted
- **Auto-close**: Modal automatically closes after 30 seconds
- **Manual close**: Click "Close" button to dismiss earlier

#### Step 4: Document Findings
**Important**: Modal does not allow copying. You must:
1. Read and document findings manually
2. Take screenshots if needed for legal case
3. Include decryption timestamp in your notes

### When to Decrypt

**Legal Requirements**:
- Court order requesting audit trail
- Law enforcement investigation
- INSA compliance audit
- Internal fraud investigation

**Compliance Audits**:
- INSA quarterly inspections
- Financial audits requiring transaction details
- Security incident response

**Do NOT Decrypt For**:
- Curiosity
- Informal user support
- Non-urgent administrative tasks

### Decryption Audit Trail
Every decryption is logged with:
- Admin user ID
- IP address
- User agent
- Timestamp
- Signature ID decrypted
- Decryption successful (yes/no)

---

## Exporting Records

### Export Formats

#### 1. CSV (Spreadsheet)
**Best for**: Excel analysis, data processing

**Contains**:
- All signature log fields
- Headers included
- UTF-8 encoded
- Compatible with Excel, Google Sheets, LibreOffice

**Use Cases**:
- Financial reconciliation
- Data analysis in Excel
- Importing into other systems

#### 2. PDF (INSA-Ready Report)
**Best for**: Legal compliance, official reports

**Features**:
- Watermark: "INSA-READY AUDIT COPY" (diagonal, light gray)
- Legal footer: Proclamation references
- Page numbers
- Export metadata (admin name, date)
- Table format with proper headers

**Use Cases**:
- INSA inspection submissions
- Court evidence
- Board presentations
- External auditor reports

#### 3. JSON (Developer Format)
**Best for**: API integration, programmatic access

**Structure**:
```json
{
  "exportDate": "2025-11-12T03:15:42.000Z",
  "totalRecords": 1247,
  "records": [
    {
      "id": 1,
      "signatureId": "abc123",
      "userId": "user_xyz",
      "action": "booking",
      ...
    }
  ]
}
```

**Use Cases**:
- System integration
- Automated compliance checks
- Database backups
- Developer tools

### Export Process

#### Step 1: Apply Filters (Optional)
Set filters to export specific subset:
- Date range for quarterly reports
- Action type for payment audits
- Verification status for quality checks

#### Step 2: Click "Export" Button
Opens export modal.

#### Step 3: Select Format
Choose from dropdown:
- CSV (Spreadsheet)
- PDF (INSA-Ready Report)
- JSON (Developer Format)

#### Step 4: Confirm Export
Click **"Export"** button.

**Processing**:
- System applies current filters
- Maximum 10,000 records per export
- File generates server-side
- Download starts automatically

#### Step 5: Save File
Browser downloads file with naming convention:
```
alga_signatures_export_2025-11-12_14-30-45_admin-john.pdf
alga_signatures_export_2025-11-12_14-30-45_admin-john.csv
alga_signatures_export_2025-11-12_14-30-45_admin-john.json
```

**Filename Format**:
- `alga_signatures_export` - Prefix
- `2025-11-12_14-30-45` - Timestamp (ISO format, colons replaced)
- `admin-john` - Admin user ID
- `.pdf|.csv|.json` - Format extension

### Rate Limits
**100 exports per admin per day**

After 100 exports:
```
Rate limit exceeded. Maximum 100 exports per day.
Next available: 2025-11-13 00:00:00
```

### Export Audit Trail
Every export is logged with:
- Admin user ID
- Export format
- Filters applied
- Record count exported
- Filename
- Timestamp

### Export Best Practices

**For INSA Audits**:
1. Use PDF format
2. Export quarterly (Q1, Q2, Q3, Q4)
3. Include all records for period
4. Save with descriptive filename: `INSA_Q1_2025_Signature_Report.pdf`

**For Financial Reconciliation**:
1. Use CSV format
2. Filter by date range (e.g., fiscal month)
3. Filter by action: "payment"
4. Open in Excel for pivot tables and analysis

**For Legal Cases**:
1. Use PDF format
2. Filter by specific user ID
3. Export complete audit trail
4. Print and notarize if required by court

---

## Integrity Alerts & Response Playbook

### Overview
The Signature Integrity Alert System automatically monitors all electronic signatures for potential tampering or data corruption. When the daily integrity checker detects anomalies, it creates alerts that appear on the Admin Signature Dashboard.

### How It Works

#### Automated Daily Check
- **Runs**: Every day at 2:00 AM Ethiopian time (Africa/Addis_Ababa)
- **Checks**: All signature hashes against stored values
- **Verifies**: Encrypted data can still be decrypted
- **Logs**: Results in console and alert database

#### Alert Creation
When a signature fails verification:
1. **Auto-categorization**: System analyzes error message
2. **Database record**: Alert stored in `integrity_alerts` table
3. **Email notification** (production only): Sent to `legal@alga.et` and `security@alga.et`
4. **Dashboard banner**: Red alert appears at top of dashboard

### Alert Categories

| Category | Description | Common Causes |
|----------|-------------|---------------|
| **HASH_MISMATCH** | SHA-256 hash doesn't match stored value | Database tampering, data corruption |
| **DECRYPT_FAILURE** | Cannot decrypt IP address or device info | Encryption key changed, data corruption |
| **DB_INTEGRITY_ERROR** | Database integrity constraint violated | Foreign key issues, constraint failures |
| **UNKNOWN** | Unclassified failure | New error type, system error |

### Red Alert Banner

#### When It Appears
The banner displays when:
- One or more unresolved alerts exist
- Alerts occurred within last 24 hours
- Banner hasn't been dismissed in current session

#### Banner Actions

**View Failed Only**
- Filters table to show only failed verifications (verified = false)
- Dismisses banner
- Use this to investigate specific failures

**Export Failures (PDF)**
- Opens export modal with PDF pre-selected
- Creates INSA-compliant report of all failures
- Includes SHA-256 watermark for legal evidence

**Acknowledge All**
- Marks all unresolved alerts as resolved
- Logs admin action in audit trail
- Records acknowledging admin's user ID
- Dismisses banner
- **Use only after investigation complete**

### Response Playbook

#### Step 1: Assess Severity

**Low Severity** (1-2 failures):
- Likely data corruption or temporary issue
- Review error details
- Check if signature can be re-verified

**Medium Severity** (3-10 failures):
- Potential system issue
- Export failures PDF immediately
- Contact technical support
- Do NOT decrypt personal data yet

**High Severity** (>10 failures):
- CRITICAL: Potential database tampering
- **STOP**: Do not acknowledge alerts
- **EXPORT**: Full audit trail PDF
- **NOTIFY**: Legal team (legal@alga.et)
- **NOTIFY**: INSA compliance officer
- **PRESERVE**: All logs and backups

#### Step 2: Investigate

**For HASH_MISMATCH**:
1. Click **Verify** button on affected signature
2. Check if hash recalculation matches
3. Review dashboard access logs for suspicious activity
4. Check database backups for original value

**For DECRYPT_FAILURE**:
1. Verify encryption keys haven't changed
2. Check environment variables for `ENCRYPTION_KEY`
3. Test decryption on recent signatures
4. Contact technical team if key rotation occurred

**For DB_INTEGRITY_ERROR**:
1. Review database logs for constraint violations
2. Check if related records (user, booking) exist
3. Run database integrity check
4. Contact database administrator

#### Step 3: Document

**Required Documentation**:
- Screenshot of red alert banner
- Export failures PDF
- Investigation notes
- Timeline of discovery
- Admin actions taken

**For INSA Reporting**:
- Alert category and count
- First detection timestamp (Ethiopian time)
- Root cause analysis
- Remediation steps taken
- Preventive measures implemented

#### Step 4: Resolve

**After Investigation**:
1. Click **Acknowledge All** button
2. Alert disappears from dashboard
3. Action logged in `dashboard_access_logs`
4. Email notification stops

**If Legal Issue Suspected**:
1. **DO NOT** acknowledge alerts
2. Export PDF evidence
3. Contact legal team
4. Await legal clearance before acknowledging

### Email Alerts (Production Only)

#### Email Recipients
- **Primary**: legal@alga.et
- **CC**: security@alga.et

#### Email Content
- Alert category
- Signature ID (no PII)
- User ID (no PII)
- Action type
- Timestamp (Ethiopian time)
- Error summary
- Link to dashboard

#### Deduplication Rules
- **Maximum 1 email** per signatureId per 24 hours
- Prevents alert fatigue
- Repeated failures increment `occurrence_count`

#### Global Rate Limit
- **Maximum 20 emails** per day (system-wide)
- Protects against email spam
- Critical alerts prioritized

### Testing the Alert System

#### Non-Production Testing

**Create Test Alert**:
```bash
curl -X POST http://localhost:5000/api/admin/signatures/alerts/test \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Verify Alert Appears**:
1. Refresh dashboard
2. Red banner should appear
3. Check console logs

**Acknowledge Test Alert**:
1. Click "Acknowledge All"
2. Banner disappears
3. Check audit logs

#### Production Testing
**DO NOT** create test alerts in production. Use manual review:
1. Review integrity check logs (daily 2:00 AM)
2. Monitor email alerts
3. Check dashboard banner daily

### Alert Database Schema

**Table**: `integrity_alerts`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Alert unique identifier |
| signatureId | varchar | Reference to consent_logs.signatureId |
| category | varchar | Alert category (HASH_MISMATCH, etc.) |
| firstSeenAt | timestamp | First detection time |
| lastSeenAt | timestamp | Most recent detection |
| occurrenceCount | integer | Number of times error occurred |
| resolved | boolean | Whether alert has been acknowledged |
| acknowledgedBy | varchar | Admin user ID who acknowledged |
| acknowledgedAt | timestamp | Time of acknowledgment |
| metadata | jsonb | Additional context (userId, action, errorMessage) |

### API Endpoints

**List Alerts**:
```
GET /api/admin/signatures/alerts?resolved=false&limit=50&offset=0
```

**Acknowledge Alerts**:
```
POST /api/admin/signatures/alerts/acknowledge
Body: { "alertIds": ["uuid1", "uuid2"] }
```

**Create Test Alert** (non-production):
```
POST /api/admin/signatures/alerts/test
```

### Best Practices

✅ **DO**:
- Check dashboard daily for new alerts
- Export failures PDF before acknowledging
- Document investigation findings
- Contact legal team for high-severity alerts
- Monitor email inbox (legal@alga.et)

❌ **DON'T**:
- Acknowledge alerts without investigation
- Decrypt personal data unless legally required
- Ignore repeated alerts for same signature
- Delete alert records (immutable audit trail)
- Create test alerts in production

### INSA Compliance Notes

**Audit Trail**:
- All alerts stored for 5 years minimum
- Alert acknowledgment logged
- Immutable records (no deletion)
- Timestamped in Africa/Addis_Ababa timezone

**Reporting**:
- Quarterly integrity summary included in INSA reports
- Alert statistics tracked (total, resolved, pending)
- Root cause analysis documented
- Remediation actions logged

**Legal Evidence**:
- Alerts can serve as evidence of tampering
- SHA-256 hashes provide cryptographic proof
- Export PDF includes INSA watermark
- Chain of custody maintained in audit logs

---

## Rate Limits & Security

### Rate Limiting Rules

| Operation | Limit | Time Window | Reason |
|-----------|-------|-------------|--------|
| **Decrypt** | 20 | Per hour | Protect sensitive data |
| **Export** | 100 | Per day | Prevent abuse, ensure audit quality |

### Rate Limit Enforcement
- Tracked per admin user ID
- Sliding time window (not reset at fixed time)
- Enforced at API level
- Returns HTTP 429 (Too Many Requests) when exceeded

### Security Measures

#### 1. Admin-Only Access
- Role-based access control (RBAC)
- Only `admin` role can access dashboard
- Automatic redirect for unauthorized users

#### 2. Audit Trail
**All actions logged**:
- View signature logs
- Verify integrity
- Decrypt audit info
- Export records

**Logged Details**:
- Admin user ID
- IP address
- User agent (browser/device)
- Action type
- Timestamp
- Metadata (filters, record IDs, etc.)

#### 3. Encrypted Data
- IP addresses: AES-256 encryption
- Device info: AES-256 encryption
- Signature hashes: SHA-256 (one-way, not encrypted)

#### 4. Read-Only Operations
- No editing or deleting signatures
- Immutable audit trail
- View and export only

#### 5. Auto-Logout
- Decrypt modal auto-closes after 30 seconds
- Session timeout after inactivity (configurable)
- Re-authentication required after timeout

---

## INSA Inspection Checklist

Use this checklist when preparing for INSA compliance inspection.

### Pre-Inspection Preparation

- [ ] **Test Admin Access**: Verify admin login works
- [ ] **Review Recent Logs**: Check for any anomalies or errors
- [ ] **Run Integrity Checks**: Verify random sample of signatures (50-100)
- [ ] **Prepare Reports**: Export quarterly PDF reports
- [ ] **Document Procedures**: Print this guide for inspector reference

### During Inspection

- [ ] **Demonstrate Login**: Show secure admin authentication
- [ ] **Show Filtering**: Demonstrate date range and action filters
- [ ] **Verify Signature**: Live demonstration of integrity check
- [ ] **Decrypt Sample**: Show audit trail decryption (with inspector's approval)
- [ ] **Export Report**: Generate PDF report in real-time
- [ ] **Show Audit Trail**: Display dashboard access logs for transparency

### Documents to Provide

- [ ] **Compliance Report**: `docs/INSA_REPORTS/2025_Q1/ALGA_ELECTRONIC_SIGNATURE_COMPLIANCE_REPORT.md`
- [ ] **Backup Policy**: `docs/BACKUP_AND_RETENTION_POLICY.md`
- [ ] **This Guide**: `docs/ADMIN_SIGNATURE_DASHBOARD_GUIDE.md`
- [ ] **Terms of Service**: `/terms` (E-Signature Policy section)
- [ ] **Exported Signature Logs**: Quarterly PDF reports

### Questions to Prepare For

**Q: How do you ensure signature integrity?**  
**A**: We use SHA-256 hashing. Admins can verify integrity via dashboard by recomputing hash and comparing to original.

**Q: How is sensitive data protected?**  
**A**: IP addresses and device info encrypted with AES-256. Decryption requires admin role and is rate-limited (20/hour).

**Q: What is your data retention policy?**  
**A**: 5-year retention per Ethiopian tax law. Three-tier backup system (Neon + Google Cloud Storage).

**Q: How do you audit admin actions?**  
**A**: All admin dashboard actions logged in `dashboard_access_logs` table with timestamp, IP, user agent, and metadata.

**Q: Can signatures be edited or deleted?**  
**A**: No. Dashboard is read-only. All signatures are immutable for legal compliance.

---

## Troubleshooting

### Common Issues & Solutions

#### Issue: "Access denied. Admin role required."
**Cause**: User does not have `admin` role.

**Solution**:
1. Verify user role in database:
   ```sql
   SELECT id, email, role FROM users WHERE email = 'user@alga.et';
   ```
2. Update role if needed (requires database admin):
   ```sql
   UPDATE users SET role = 'admin' WHERE id = 'user_id';
   ```

#### Issue: "Rate limit exceeded. Maximum 20 decrypt operations per hour."
**Cause**: Admin has exceeded hourly decrypt limit.

**Solution**:
- Wait until next available time (shown in error message)
- Plan decryption operations in batches
- Prioritize critical decrypts

#### Issue: "Rate limit exceeded. Maximum 100 exports per day."
**Cause**: Admin has exceeded daily export limit.

**Solution**:
- Wait until next day (resets at midnight UTC)
- Use filters to reduce unnecessary exports
- Coordinate with other admins to distribute load

#### Issue: Signature logs not loading
**Cause**: Network issue or backend error.

**Solution**:
1. Check network connection
2. Refresh page (Ctrl+F5 or Cmd+Shift+R)
3. Check browser console for errors (F12)
4. Contact IT support if issue persists

#### Issue: Export file not downloading
**Cause**: Browser popup blocker or network issue.

**Solution**:
1. Allow popups for Alga domain
2. Check Downloads folder
3. Try different format (CSV instead of PDF)
4. Contact IT support if issue persists

#### Issue: Decrypted data shows "[ENCRYPTED]"
**Cause**: Decryption failed (corrupted data or wrong encryption key).

**Solution**:
1. Verify encryption key in environment variables
2. Check server logs for decryption errors
3. Contact IT security team

### Getting Help

**Internal Support**:
- **IT Team**: dev@alga.et
- **Legal Team**: legal@alga.et
- **Security Team**: security@alga.et

**External Support**:
- **INSA**: [To be provided]
- **Neon Database**: support@neon.tech

---

## Summary

The Admin Signature Dashboard provides comprehensive tools for:
- ✅ **Viewing** all electronic signature consent logs
- ✅ **Filtering** by user, action, date, verification status
- ✅ **Verifying** signature integrity with SHA-256 hash checks
- ✅ **Decrypting** audit trails for legal investigations
- ✅ **Exporting** compliance reports in multiple formats
- ✅ **Auditing** all admin actions for transparency

**Remember**:
- All operations are logged for audit trail
- Rate limits protect sensitive data
- Decryption is for legal use only
- Signatures are immutable and read-only

**For INSA Inspections**:
- Use PDF export format
- Verify random signature samples
- Provide complete documentation
- Demonstrate live dashboard functionality

---

**Legal Compliance**: This dashboard is compliant with Electronic Signature Proclamation No. 1072/2018 and Electronic Transactions Proclamation No. 1205/2020.

**Company**: Alga One Member PLC  
**TIN**: 0101809194  
**Contact**: legal@alga.et

**🌸 Alga is a women-run, women-owned, and women-operated company.**

---

**Document End**
