# Agent Commission Payment Flow

## Overview
This document explains how agent commissions work within Alga's payment ecosystem, ensuring **property owners receive their full payment** while **agents earn their 5% commission separately**.

---

## 💰 Payment Flow (Step-by-Step)

### 1. **Guest Books Property**
- Guest selects property and dates
- Total booking price calculated (e.g., 5,000 Birr/night × 3 nights = 15,000 Birr)
- Guest proceeds to checkout

### 2. **Alga Pay Processes Payment**
```
Guest pays 15,000 Birr → Alga Pay (unified payment gateway)
```
- **Alga Pay** receives the full 15,000 Birr from guest
- Payment processors: Chapa, Stripe, PayPal, TeleBirr (for guests)
- All payments routed through Alga Pay for unified tracking

### 3. **Property Owner Payment (Via Alga Pay)**
```
Alga Pay → Property Owner: 15,000 Birr (full amount)
```
- **Owner receives 100% of booking price** (15,000 Birr)
- Paid via Alga Pay to owner's preferred method
- Owner payment is **NOT reduced** by agent commission
- Owner is **unaware of agent commission** (transparent to them)

### 4. **Agent Commission Calculation (Automatic)**
When booking status changes to `completed`:
```javascript
// Triggered automatically in server/routes.ts
if (status === 'completed') {
  await storage.calculateAndCreateCommission(bookingId);
  // Creates commission record: 5% of 15,000 = 750 Birr
}
```

**Commission Record Created:**
- Booking ID: 123
- Property ID: 456
- Agent ID: 789
- Booking Total: 15,000 Birr
- Commission Rate: 5%
- **Commission Amount: 750 Birr**
- Status: `pending`

### 5. **Agent Commission Payout (Separate from Owner)**
```
Alga Platform → Agent: 750 Birr (via TeleBirr)
```
- **Paid directly from Alga's revenue** (not from owner's payment)
- Paid to agent's TeleBirr mobile money account
- Separate transaction, independent of owner payment
- Admin triggers payout via `/admin/agents` page

---

## 🔄 Complete Example Flow

**Scenario:** 
- Property: 5,000 Birr/night
- Booking: 3 nights
- Agent: Verified Delala agent who listed the property

**Timeline:**

| Step | Action | Amount | Status |
|------|--------|--------|--------|
| Day 1 | Guest books property | 15,000 Birr paid | Booking created |
| Day 1 | **Owner receives full payment** | **15,000 Birr** | ✅ Owner paid |
| Day 4 | Guest checks out | - | Booking completed |
| Day 4 | **Commission auto-calculated** | 750 Birr (5%) | Commission pending |
| Day 5 | Admin processes agent payout | 750 Birr | ✅ Agent paid |

---

## 💡 Key Points

### ✅ Property Owners
- **Always receive 100% of booking price**
- No deductions for agent commissions
- Paid via Alga Pay (their preferred method)
- Commission is **invisible to owners**

### ✅ Agents
- Earn **5% of every booking** for 36 months
- Paid **separately** via TeleBirr
- Commission comes from **Alga's platform revenue**
- Not deducted from owner's payment

### ✅ Alga Platform
- Collects full booking amount via Alga Pay
- Pays owners 100% of booking price
- Pays agents 5% commission from platform revenue
- Platform revenue = service fees, subscriptions, etc.

---

## 🏦 Payment Sources

### Guest → Alga Pay
**Methods:** Chapa, Stripe, PayPal, TeleBirr (for guests)
- Full booking amount collected

### Alga Pay → Property Owner
**Methods:** Bank transfer, Chapa, TeleBirr, whatever owner prefers
- 100% of booking price

### Alga Platform → Agent
**Method:** TeleBirr ONLY (mobile money)
- 5% commission (separate transaction)

---

## 📊 Commission Tracking

### Database Tables

**1. `bookings` table**
```sql
id: 123
property_id: 456
total_price: 15000.00 Birr
status: 'completed'
payment_status: 'paid'
```

**2. `agent_properties` table**
```sql
agent_id: 789
property_id: 456
first_booking_date: 2025-10-27
commission_expiry_date: 2028-10-27 (36 months later)
is_active: true
```

**3. `agent_commissions` table**
```sql
id: 1
agent_id: 789
property_id: 456
booking_id: 123
booking_total: 15000.00 Birr
commission_rate: 5.00%
commission_amount: 750.00 Birr
status: 'paid'
telebirr_transaction_id: 'TB-17615...'
```

---

## 🔐 Security & Compliance

### Agent Verification
- Only **verified agents** can earn commissions
- Admin approval required before listing properties
- TeleBirr account validated during registration

### Commission Expiry
- Automatically expires after **36 months from first booking**
- System marks `agent_properties.is_active = false`
- No new commissions after expiry
- Agent can list new properties to restart earning

### Fraud Prevention
- One property can only be linked to one agent
- Commission only calculated for `completed` bookings
- Admin oversight on all payouts
- Transaction IDs tracked for audit trail

---

## 🚀 Implementation Details

### Auto-Commission Hook
**File:** `server/routes.ts`
```typescript
app.patch('/api/bookings/:id/status', async (req, res) => {
  const booking = await storage.updateBookingStatus(id, status);
  
  // AUTO-CALCULATE COMMISSION WHEN COMPLETED
  if (status === 'completed') {
    const commission = await storage.calculateAndCreateCommission(id);
    if (commission) {
      console.log(`✅ Commission created: ${commission.commissionAmount} Birr`);
    }
  }
});
```

### TeleBirr Payout
**File:** `server/telebirr.ts`
```typescript
await teleBirrService.sendPayout({
  agentId: agent.id,
  commissionId: commission.id,
  amount: 750.00,
  telebirrAccount: '+251911234567',
  description: 'Alga agent commission for booking #123',
});
```

---

## 📈 Revenue Model

### Alga's Revenue Sources
To pay agent commissions sustainably, Alga earns from:

1. **Service Fees** (10-15% on bookings)
2. **Host Subscriptions** (premium listing features)
3. **Add-On Services** (meal delivery, beauty services, etc.)
4. **Payment Processing Margins**

**Example:**
- Booking: 15,000 Birr
- Service fee (12%): 1,800 Birr (Alga revenue)
- Agent commission (5%): 750 Birr (paid from 1,800 Birr)
- **Net revenue: 1,050 Birr** (still profitable)

---

## ✅ Benefits of This Model

### For Property Owners
- ✅ No commission deductions
- ✅ Simple, predictable income
- ✅ No need to know about agents

### For Agents
- ✅ Passive income for 3 years
- ✅ Instant TeleBirr payouts
- ✅ Transparent earnings tracking

### For Alga Platform
- ✅ Rapid property acquisition via agents
- ✅ Solves cold start problem
- ✅ Builds agent network across Ethiopia
- ✅ Sustainable from service fees

---

## 🎯 Summary

**Payment Flow:**
```
Guest (15,000 Birr) 
  ↓ [Alga Pay]
Owner (15,000 Birr) ✅ FULL AMOUNT
  
Alga Platform Revenue (service fees)
  ↓ [TeleBirr]
Agent (750 Birr) ✅ 5% COMMISSION
```

**Key Takeaway:** Agent commission is a **marketing expense** paid by Alga from its service fee revenue, **NOT deducted from property owners**. This ensures owners stay happy while agents are incentivized to list properties.
