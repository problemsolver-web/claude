# Migrant Worker Protection Platform - Full Stack Development Prompt
## Anti-Recruitment Fraud Solution for Bangladesh

---

## 🎯 Executive Summary

Build a comprehensive web + SMS platform that verifies recruiting agents, prevents migration fraud, and protects Bangladesh's 10M+ migrant workers and their families from losing life savings to fake dalals (recruiting agents).

**Problem Scale:** Lakhs of workers annually lose 3-5 lakh taka (often by selling land or taking loans) to fraudulent recruiting agents. Families are destroyed. Ministry of Expatriates' Welfare actively seeks solutions.

**Solution:** A publicly accessible verification system where anyone can:
- Check if a recruiting agent is licensed by BMET (Bureau of Manpower, Employment and Training)
- See blacklist status and complaints against agencies
- Report fraudulent agents
- Access official salary/fee information for different destination countries

---

## 📋 Core Features

### 1. Agency Verification System

#### For End Users (Workers/Families)
- **Search Agency:**
  - Search by agency name
  - Search by license number (BMET ID)
  - Search by phone number
  - Real-time results

- **Verification Results Display:**
  - Agency name and license number
  - License status: ✅ Valid / ⚠️ Expired / ❌ Not Licensed
  - License expiry date
  - Official designation (if licensed)
  - Head office location and contact
  - Phone number verification
  - Website URL

- **Red Flags & Complaints:**
  - Number of complaints filed against this agency
  - Recent complaint summary (Last 3 months)
  - Complaint types: Money fraud, job mismatch, visa issues, false promises
  - Verified complaint count (from Ministry sources)
  - Unverified report count (from crowdsourced reports)
  - Severity indicator: 🟢 Safe / 🟡 Caution / 🔴 Danger

- **Crowd-Sourced Reports:**
  - "3 people reported this agent took money and disappeared"
  - Report date and location
  - Type of fraud reported
  - Anonymous reporter info (protected privacy)
  - Status: Under investigation / Confirmed / Closed

- **Official Information:**
  - Government-approved recruitment fees for top 5 destinations
  - Standard salary ranges for different job types
  - Average processing time
  - Required documents checklist
  - What to avoid (red flags)

- **Action Buttons:**
  - Report This Agent (if fraudulent)
  - Call Ministry Hotline
  - Download Safety Guide (PDF)
  - Share verification result
  - Print verification

#### For Recruiting Agencies (Business Portal)
- **Agency Dashboard:**
  - View their agency profile/listing
  - Complaint statistics
  - Reports overview
  - Complaint response system
  - License renewal tracking
  - Premium verification badge management
  - Analytics: searches for their agency, verification clicks

- **Profile Management:**
  - Edit agency information
  - Verify/validate phone and email
  - Upload license certificate
  - Add team members
  - Update working destinations

- **Complaint Response:**
  - View complaints filed against agency
  - Add response/explanation
  - Upload supporting documents
  - Mark as resolved
  - Appeal against false complaints

- **Trust Badge Application:**
  - Apply for "Premium Verified Agency" badge
  - Verification requirements: BMET license + clean record + verified contact
  - Display badge on profiles
  - Premium listing in search results
  - Certificate of verification (downloadable)

### 2. Reporting & Complaint System

#### For Workers/Families
- **Report an Agent:**
  - Anonymous form (name optional)
  - Agency being reported (search + select)
  - Type of fraud (dropdown): Money taken, job doesn't match, visa false, salary wrong, missing contact, other
  - Detailed description
  - Amount of money lost (optional)
  - Proof/documents (file upload: max 5 files)
  - Contact info (optional for follow-up)
  - Date of incident

- **Report Status Tracking:**
  - Report tracking number generated
  - Current status: Submitted / Under Review / Contacted for Info / Investigating / Resolved / Dismissed
  - Timeline of status updates
  - Expected resolution date

#### For Admin/Government
- **Complaint Management Dashboard:**
  - All complaints in one place
  - Filter by: agency, type, date, status, severity
  - Sort by: newest, most severe, most recent update
  - Bulk actions: mark as verified, dismiss, request more info
  - Trending complaints (what fraud is most common right now?)

- **Investigation Tools:**
  - Detailed complaint view
  - Attach internal notes
  - Link multiple complaints (find pattern)
  - Contact reporter (if they provided info)
  - Request additional evidence
  - Mark as "verified fraud"
  - Generate incident report

- **Blacklist Management:**
  - Add/remove agencies from blacklist
  - Blacklist reasons (with supporting documents)
  - Expiry dates for temporary blacklists
  - Public blacklist view

### 3. SMS/USSD Integration

#### SMS Lookup (Basic Phone Users)
- **Format:**
  ```
  VERIFY [Agency Name] or [License Number]
  Send to: 1234 or specific Telco shortcode
  
  Response:
  "ABC Agency - NOT LICENSED ⚠️ 4 fraud reports. 
   Do NOT send money. Call Ministry: 01700-000000"
  
  OR
  
  "XYZ Agency - ✅ VERIFIED. License active until 2025.
   Safe to contact. But verify job offer details first."
  ```

- **SMS Commands:**
  - `VERIFY [name]` - Check agency license status
  - `REPORT [name]` - Get form link to report fraud
  - `FEE [country]` - Get official recruitment fees for destination
  - `TIPS` - Get safety tips
  - `HELP` - Contact information

- **Telco Integration:**
  - Partner with Grameenphone, Banglalink, Robi (major carriers)
  - USSD code: *1234# for instant dial-based verification
  - No internet required
  - Cost: <1 taka per SMS (carriers may subsidize for social good)

### 4. Data Sources & Integration

#### Primary Data (Official)
- **BMET Licensed Agencies Database:**
  - Web-scraping + API integration of BMET's official list
  - Auto-sync: weekly or daily
  - Fields: License number, agency name, address, phone, email, license expiry, status
  - Historical data: track delistings

- **Ministry of Expatriates' Welfare Data:**
  - Blacklist of fraudulent agencies
  - Official recruitment fee schedules (by country, by job type)
  - Government advisory alerts
  - Official statistics

- **Bangladesh Bank / Bangladesh Regulatory Authority:**
  - Registered remittance channels
  - Legitimate money transfer routes

#### Secondary Data (Crowd-Sourced)
- **Worker Reports:**
  - Anonymous reports from platform users
  - Verified reports (confirmed by multiple reports or ministry)
  - Historical data for pattern detection

- **Social Media Integration (Optional):**
  - Monitor Twitter/Facebook for complaints about agencies
  - Auto-flag if many negative mentions

### 5. Official Information Hub

#### Destination Country Guides
- For each major destination (UAE, Saudi Arabia, Malaysia, Singapore, UK, etc.):
  - Government-approved recruitment fee
  - Standard salary ranges (by skill level)
  - Common job types
  - Visa process overview
  - Red flags specific to that country
  - Contact info for Bangladesh embassy

#### Safety Education
- **Pre-Departure Checklist:**
  - Documents needed (passport, visa, contract, etc.)
  - Questions to ask agent before signing
  - What to verify before paying
  - How to verify job offer legitimacy
  - Contact details to confirm

- **Red Flag Guide:**
  - Requesting cash upfront (vs. bank transfer)
  - Promises of high salary without interview
  - Rushing the process
  - Pressure to keep it secret
  - No written contract
  - Unlicensed agents
  - No verifiable business location

- **Legal Recourse:**
  - How to file a complaint with BMET
  - Legal aid resources
  - Insurance/protection schemes
  - Embassy contact information

### 6. Analytics & Insights Dashboard

#### For Ministry/Government
- **Real-Time Metrics:**
  - Total agencies in system
  - Licensed vs. unlicensed breakdown
  - Blacklisted agencies count
  - Trend chart: agency verifications over time
  - Geographic distribution of fraud (which regions most affected)

- **Complaint Analytics:**
  - Fraud types breakdown (pie chart)
  - Most complained-about agencies
  - Fraud severity trends
  - Resolution rate
  - Average resolution time
  - Most common fraud amounts

- **Impact Metrics:**
  - Estimated money saved (by tracking reported losses prevented)
  - Workers reached (lookup volume)
  - Reports generated
  - Complaints resolved
  - Agencies delisted/blacklisted

#### For Agencies
- **Agency-Level Metrics (Self-Service):**
  - How many times searched
  - Search trends (when/where searched)
  - Complaint count over time
  - Positive reviews/reports (optional)
  - Verification requests

### 7. User Roles & Permissions

```
1. Admin (Ministry Staff)
   - Full access to all data
   - Complaint investigation & resolution
   - Blacklist management
   - User/agency account management
   - System configuration
   - Analytics access
   - API key management

2. Super Admin (Government Authorized)
   - All admin permissions
   - Can create sub-admins
   - Can approve agency verification
   - Can delete/modify data
   - Audit logs access

3. Agency User (Recruiter/Owner)
   - View own agency profile
   - Respond to complaints
   - Apply for premium verification
   - View analytics (own agency only)
   - Manage team members
   - Update agency information

4. Verified Agency User (Premium)
   - All agency permissions +
   - Premium listing placement
   - Downloadable verification badge
   - Enhanced agency profile page

5. Public User (Worker/Family)
   - Search agencies (read-only)
   - Submit complaints/reports
   - Access safety guides
   - No login needed for basic search
   - Optional login for report tracking
```

### 8. Security & Data Protection

#### Authentication
- Multi-factor authentication for admin/agency accounts
- JWT token-based sessions
- Email verification for accounts
- Password reset with security questions
- Rate limiting on searches (prevent data scraping)
- IP-based access controls for admin panel

#### Data Protection
- End-to-end encryption for reported fraud data
- GDPR-compliant privacy policy
- Worker PII never stored (anonymous reports encouraged)
- Agency data encrypted at rest
- Regular backups (automated daily)
- Data retention policy: complaints kept for 5+ years

#### Fraud Prevention
- CAPTCHA on forms (prevent bot reports)
- Report verification system (flag obvious spam)
- Admin review of all reports before publishing
- Rate limit: 1 report per person per agency (prevent spam)
- IP block for repeated false reports

---

## 🏗️ Technical Stack

### Frontend
- **Framework:** Next.js (React) with TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui
- **Forms:** React Hook Form + Zod validation
- **State Management:** Redux Toolkit or Zustand
- **Charts/Analytics:** Recharts, Chart.js
- **Search:** Algolia or Meilisearch (for fast agency search)
- **File Upload:** React Dropzone
- **Animations:** Framer Motion
- **PDF Generation:** PDFKit or React-PDF
- **SMS UI Component:** Text input with live preview

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js or NestJS (NestJS recommended for structure)
- **Language:** TypeScript
- **Database:** PostgreSQL (main data store)
- **Cache:** Redis (agency searches, complaint metrics)
- **ORM:** Prisma
- **Authentication:** JWT + Passport.js + bcrypt
- **File Storage:** AWS S3 or Cloudinary
- **Email Service:** SendGrid or AWS SES
- **SMS Provider:** Twilio + local Bangladesh carriers (Grameenphone, Banglalink, Robi APIs)
- **Web Scraping:** Puppeteer or Cheerio (for BMET data)
- **Logging:** Winston
- **Testing:** Jest + Supertest
- **API Documentation:** Swagger/OpenAPI

### External Integrations
- **BMET Data Source:** 
  - Daily/Weekly automated scraping of BMET licensed agencies
  - Alternative: Direct API if BMET provides
  - Backup: Manual data entry from official documents

- **SMS Gateways:**
  - Twilio (international, reliable)
  - Grameenphone SMS API
  - Banglalink SMS API
  - Robi SMS API

- **Authentication:**
  - Google OAuth (optional, for easier login)
  - WhatsApp Business API (optional, for WhatsApp reports)

### Deployment
- **Frontend:** Vercel (Next.js native)
- **Backend:** AWS EC2 or DigitalOcean or Heroku or Railway
- **Database:** AWS RDS PostgreSQL or managed PostgreSQL service
- **Cache:** Redis Cloud or AWS ElastiCache
- **Storage:** AWS S3
- **Domain:** Custom .bd domain
- **CI/CD:** GitHub Actions or GitLab CI
- **Monitoring:** Sentry (error tracking), DataDog (performance)
- **SSL:** Let's Encrypt (auto-renew)

---

## 📊 Database Schema

### Core Tables

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255),
  user_type ENUM('admin', 'agency', 'public', 'super_admin'),
  is_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Agencies (BMET Licensed)
CREATE TABLE agencies (
  id UUID PRIMARY KEY,
  bmet_license_number VARCHAR(50) UNIQUE,
  agency_name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255),
  phone_primary VARCHAR(20) NOT NULL,
  phone_secondary VARCHAR(20),
  email VARCHAR(255),
  website_url VARCHAR(255),
  head_office_location TEXT,
  office_division VARCHAR(100),
  license_issue_date DATE,
  license_expiry_date DATE,
  license_status ENUM('active', 'expired', 'suspended', 'revoked'),
  destination_countries JSON,
  is_verified BOOLEAN DEFAULT false,
  verification_badge_level ENUM('none', 'basic', 'premium'),
  blacklist_status ENUM('none', 'temporary_blacklist', 'permanent_blacklist'),
  blacklist_reason TEXT,
  blacklist_expiry_date DATE,
  last_updated_from_bmet DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Complaints/Reports
CREATE TABLE complaints (
  id UUID PRIMARY KEY,
  agency_id UUID NOT NULL,
  reporter_name VARCHAR(255),
  reporter_phone VARCHAR(20),
  reporter_email VARCHAR(255),
  reporter_location VARCHAR(255),
  complaint_type ENUM('money_fraud', 'job_mismatch', 'visa_false', 'salary_wrong', 'missing_contact', 'other'),
  description TEXT NOT NULL,
  amount_lost DECIMAL(10, 2),
  proof_documents JSON,
  incident_date DATE,
  date_filed TIMESTAMP,
  status ENUM('submitted', 'under_review', 'contacted_for_info', 'investigating', 'verified_fraud', 'resolved', 'dismissed'),
  admin_notes TEXT,
  is_verified BOOLEAN DEFAULT false,
  severity_level ENUM('low', 'medium', 'high', 'critical'),
  resolution_date DATE,
  tracking_number VARCHAR(50) UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Destination Countries Info
CREATE TABLE destination_countries (
  id UUID PRIMARY KEY,
  country_name VARCHAR(100) UNIQUE,
  country_code VARCHAR(2),
  official_recruitment_fee_bdt DECIMAL(10, 2),
  salary_range_low_bdt DECIMAL(10, 2),
  salary_range_high_bdt DECIMAL(10, 2),
  common_job_types JSON,
  embassy_name VARCHAR(255),
  embassy_phone VARCHAR(20),
  embassy_website VARCHAR(255),
  red_flags_specific TEXT,
  updated_at TIMESTAMP
);

-- Salary Standards
CREATE TABLE salary_standards (
  id UUID PRIMARY KEY,
  destination_country_id UUID,
  job_category VARCHAR(100),
  skill_level ENUM('unskilled', 'semi_skilled', 'skilled', 'professional'),
  salary_per_month_bdt DECIMAL(10, 2),
  recruitment_fee_official_bdt DECIMAL(10, 2),
  updated_at TIMESTAMP
);

-- Verification Logs
CREATE TABLE verification_logs (
  id UUID PRIMARY KEY,
  agency_id UUID,
  search_query VARCHAR(255),
  search_type ENUM('by_name', 'by_license', 'by_phone'),
  search_timestamp TIMESTAMP
);

-- Blacklist History
CREATE TABLE blacklist_history (
  id UUID PRIMARY KEY,
  agency_id UUID NOT NULL,
  blacklist_date DATE,
  reason VARCHAR(255),
  temporary_until DATE,
  added_by_admin_id UUID,
  created_at TIMESTAMP
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action_type VARCHAR(100),
  target_entity_id UUID,
  timestamp TIMESTAMP
);
```

---

## 🚀 API Endpoints (Key ones for MVP)

### Public Endpoints

```
GET /api/v1/agencies/search?name=XYZ
GET /api/v1/agencies/:id
GET /api/v1/agencies/:id/complaints
POST /api/v1/complaints
GET /api/v1/complaints/:tracking_number/status
GET /api/v1/destinations
POST /api/v1/sms/verify
```

### Authenticated Endpoints

```
POST /api/v1/auth/register
POST /api/v1/auth/login
GET /api/v1/admin/dashboard
GET /api/v1/admin/complaints
PUT /api/v1/admin/complaints/:complaint_id
GET /api/v1/agencies/my-profile
PUT /api/v1/agencies/my-profile
```

---

## 🔄 3-Day Build Plan

### Day 1: Foundation & Data (8 hours)
- [ ] Project setup (Next.js + NestJS backend)
- [ ] Database schema in PostgreSQL
- [ ] Authentication system (JWT)
- [ ] Scrape/Load BMET licensed agencies data
- [ ] Basic agency search endpoint
- [ ] Admin login/panel scaffold

**Deliverable:** Backend can search agencies with real BMET data

### Day 2: MVP Features (16 hours)
- [ ] Frontend: Agency search UI + results display
- [ ] Backend: Complaints API + SMS integration
- [ ] Admin dashboard (view complaints, blacklist, verify)
- [ ] Agency portal (login, view profile, respond to complaints)
- [ ] Destination countries & salary info
- [ ] SMS verification working end-to-end
- [ ] Safety guides page

**Deliverable:** Live platform with all core features working

### Day 3: Polish & Launch (8 hours)
- [ ] Bug fixes and UI polish
- [ ] Mobile responsive design
- [ ] Performance optimization (Redis caching)
- [ ] Analytics dashboard
- [ ] Security testing
- [ ] Deploy to production
- [ ] Documentation

**Deliverable:** Live, production-ready platform

---

## 🎯 MVP Must-Have Features

1. ✅ Agency search (by name/license/phone)
2. ✅ Display verification status + complaint count
3. ✅ Report fraudulent agency (with file upload)
4. ✅ SMS lookup (VERIFY [agency name])
5. ✅ Admin dashboard (manage complaints, blacklist)
6. ✅ Agency portal (login, respond to complaints)
7. ✅ Destination country salary info
8. ✅ Complaint tracking with tracking number

---

## 🎉 Winning Pitch (5 minutes)

```
[HOOK - 30 sec]
Every year, over 1 lakh Bangladeshi workers lose everything to fake recruiting agents.
Everyone here knows someone this happened to.

[PROBLEM - 1 min]
There's NO way to verify if an agent is real before handing over your 3-5 lakh taka.

[SOLUTION - 1 min]
A platform where a worker texts "VERIFY [agent name]" and instantly gets:
Is this agent licensed? Yes or no. How many fraud complaints? Red flags.

[PROOF - 1 min]
Tested with 20 families. They all said: "This would have saved us millions."

[BUSINESS MODEL - 30 sec]
Licensed agencies pay for verification badge. Government contracts. Revenue: 1.5+ crore BDT/year.

[ASK - 30 sec]
We need 10 lakh taka to deploy and scale. We reach profitability in 6 months.

[CLOSE]
This saves families from financial ruin and creates accountability.
```

---

## ✅ Success in 3 Days

If you build this MVP with:
- Real BMET data
- Working SMS
- Live search + reporting
- Admin + agency portals
- Demo showing it prevents fraud

**You WILL win the national round.**

This is not just a startup idea — it's a solution to one of Bangladesh's most devastating, most widely-known problems. 🚀
