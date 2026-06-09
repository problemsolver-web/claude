# Bangladesh Job Matching Platform - Application Flow & Memory System

## 🔄 Complete Application Flow

### When a Job Seeker Applies to a Job:

```
Step 1: Job Seeker Action
├─ Browses job listings
├─ Finds job of interest
└─ Clicks "Apply Now"

Step 2: Application Created (Stored in Database)
├─ New record in 'applications' table
├─ Status: "new"
├─ Timestamp: recorded
└─ Data persisted permanently

Step 3: Company Gets Instant Notifications
├─ IN-APP: Bell icon badge updates (+1)
├─ IN-APP: Dropdown shows: "New application for [Job Title]"
├─ EMAIL: "You have a new application for [Job Title]"
└─ DASHBOARD: Application appears in Applications section

Step 4: Company Dashboard Updates
├─ Application counter increases
├─ New applications tab shows new entry
├─ "Applications: 5 new" appears in sidebar
└─ Application ready for review

Step 5: Company Reviews Application
├─ Opens Applications tab
├─ Sees all applications in sortable list/cards
├─ Can view:
│  ├─ Candidate profile
│  ├─ Resume
│  ├─ Skills & portfolio
│  ├─ AI Match score & reasoning
│  └─ Application history
└─ Can take action:
   ├─ Shortlist → Status changes to "shortlisted"
   ├─ Reject → Status changes to "rejected"
   ├─ Message → Opens chat with candidate
   └─ Accept → Status changes to "accepted"

Step 6: Job Seeker Sees Updates
├─ IN-APP NOTIFICATION: "Your application status changed!"
├─ EMAIL NOTIFICATION: "Your status update from [Company]"
├─ DASHBOARD: Application status changes in Applications tab
└─ Can now reply/message company if invited to next stage
```

---

## 💾 Memory/Persistence System

### What Gets Stored (Nothing is Lost):

#### For Job Seekers:
```
Database Records:
├─ Profile Information
│  ├─ Name, email, phone, location
│  ├─ Bio/professional summary
│  ├─ Profile picture
│  └─ Preferred locations & job types
│
├─ Skills & Experience
│  ├─ All skills with proficiency levels
│  ├─ Work experience history
│  ├─ Education details
│  ├─ Certifications
│  └─ Portfolio projects with links
│
├─ Resumes/CVs
│  ├─ All uploaded files with URLs
│  ├─ Parsed resume data
│  └─ File upload timestamps
│
├─ Application History
│  ├─ Every job they applied to
│  ├─ Application date/time
│  ├─ Current status
│  ├─ Company name
│  ├─ Status change timeline
│  └─ Any notes from company
│
└─ Messages & Communication
   ├─ All conversations with companies
   ├─ Message history with timestamps
   ├─ Interview scheduling info
   └─ Offers received
```

#### For Companies:
```
Database Records:
├─ Company Profile
│  ├─ Company name, logo, description
│  ├─ Website, industry, size
│  ├─ Location
│  └─ Verification status
│
├─ Job Postings
│  ├─ Every job posted with all details
│  ├─ Job description, requirements
│  ├─ Skills, salary, location
│  ├─ Post date and deadline
│  ├─ Number of views
│  ├─ Number of applications
│  └─ Job status (active/closed/expired)
│
├─ Applications Received
│  ├─ Every applicant to every job
│  ├─ Application date
│  ├─ Current status
│  ├─ AI match score
│  ├─ All candidate information
│  └─ Action history (reviewed, shortlisted, etc.)
│
├─ Messages & Communication
│  ├─ All conversations with candidates
│  ├─ Full message history
│  ├─ Attachments sent (offer letters)
│  └─ Interview notes
│
└─ Analytics Data
   ├─ Job posting performance metrics
   ├─ Application statistics
   ├─ Hiring funnel data
   └─ Timestamps for all activities
```

---

## 🔔 Notification System Architecture

### Real-Time In-App Notifications

```
For Companies:
┌─────────────────────────────────────────┐
│  Header → Bell Icon (🔔)                │
│  Shows: Unread count badge (e.g., +5)   │
│  Click → Dropdown with recent alerts    │
└─────────────────────────────────────────┘

Notifications displayed:
- "New application from [Candidate Name]" → Click to view application
- "Match found: [Candidate] for [Job]" → Click to view profile
- "New message from [Candidate]" → Click to open chat
- "[Candidate] accepted your invite" → Click to view profile

Database:
- notifications table stores every notification
- Each has: timestamp, read status, entity reference
- History page shows all past notifications
```

```
For Job Seekers:
┌─────────────────────────────────────────┐
│  Header → Bell Icon (🔔)                │
│  Shows: Unread count badge              │
│  Click → Dropdown with recent alerts    │
└─────────────────────────────────────────┘

Notifications displayed:
- "[Company] shortlisted you!" → Click to view job/company
- "Your application status changed" → Click to see details
- "New message from [Company]" → Click to open chat
- "[Company] invited you to apply" → Click to apply with 1 click
```

### Email Notifications (Async)

```
Automatic emails sent for:
- New applications (to company)
- Application status changes (to job seeker)
- New messages (to both)
- Interview reminders (24 hours before)
- Match recommendations (daily digest optional)

Email includes:
- Link to dashboard/relevant section
- Quick action buttons where applicable
- Unsubscribe option
```

---

## 📊 Company Dashboard Structure

### Main Navigation Tabs:

```
Dashboard Home
├─ Quick stats widgets
├─ Recent applications (last 5)
├─ Job performance overview
└─ Recommended candidates to invite

Job Postings
├─ List of all company's jobs
├─ Create new job button
├─ Edit/delete/close existing jobs
├─ View applications per job
├─ Extend deadline/repost job
└─ View job analytics

Applications (Main Hub)
├─ All applications in one place
├─ Filter by job, status, date
├─ Sort by newest, match score
├─ Search by candidate name
├─ Bulk actions available
├─ Status workflow: new → reviewed → shortlisted → accepted/rejected
└─ Each app shows:
   ├─ Candidate profile snapshot
   ├─ Applied job title
   ├─ Application date
   ├─ Current status (badge)
   ├─ Match score percentage
   └─ Action buttons (View, Message, Shortlist, Reject)

Recommended Candidates
├─ AI-selected top matches per job
├─ Shows match score and reasons
├─ One-click invite to apply
└─ Direct message option

Messaging
├─ All conversations with candidates
├─ Real-time chat
├─ Interview scheduling tools
└─ File attachments (offer letters)

Analytics & Insights
├─ Job posting performance metrics
├─ Application funnel (views → apps → shortlist → accepted)
├─ Candidate quality analysis
└─ Time-to-hire metrics

Settings
├─ Company profile edit
├─ Team member management
├─ Notification preferences
└─ Billing information
```

---

## 🗄️ Database Tables for Application Flow

```sql
-- Core Tables
users
├─ id (PK)
├─ email (UNIQUE)
├─ password_hash
├─ name
├─ user_type (company/job_seeker)
├─ created_at
└─ updated_at

companies
├─ id (PK)
├─ user_id (FK → users)
├─ company_name
├─ logo_url
├─ description
├─ website
├─ industry
├─ company_size
├─ location
├─ verified
└─ timestamps

job_seekers
├─ id (PK)
├─ user_id (FK → users)
├─ profile_picture_url
├─ bio
├─ location
├─ preferred_locations
└─ timestamps

-- Job & Application Tables
job_postings
├─ id (PK)
├─ company_id (FK → companies)
├─ title
├─ description
├─ skills_required (JSON array)
├─ experience_level
├─ salary_range
├─ location
├─ job_type (remote/onsite/hybrid)
├─ category
├─ deadline
├─ status (active/closed/expired)
├─ created_at
├─ updated_at
└─ view_count

applications ⭐ MAIN TABLE FOR APPLICATION FLOW
├─ id (PK)
├─ job_seeker_id (FK → job_seekers)
├─ job_posting_id (FK → job_postings)
├─ status (new/reviewed/shortlisted/rejected/accepted) ← KEY FIELD
├─ cover_letter (optional)
├─ applied_at ← TIMESTAMP OF APPLICATION
├─ updated_at ← LAST STATUS CHANGE
├─ ai_match_score (0-100)
└─ company_notes (optional)

-- Notification Tables
notifications ⭐ TRACKS ALL NOTIFICATIONS
├─ id (PK)
├─ user_id (FK → users)
├─ notification_type (application_received/status_changed/message/etc)
├─ title
├─ message
├─ related_entity_id (application/job/message ID)
├─ related_entity_type
├─ is_read (false/true)
├─ created_at
└─ action_url (where to navigate when clicked)

-- Messaging Tables
messages
├─ id (PK)
├─ sender_id (FK → users)
├─ recipient_id (FK → users)
├─ job_posting_id (FK → job_postings, nullable)
├─ content
├─ attachments (JSON, optional)
├─ created_at
└─ read_at (nullable)

-- Matching & Analytics
matches
├─ id (PK)
├─ job_posting_id (FK → job_postings)
├─ job_seeker_id (FK → job_seekers)
├─ match_score (0-100)
├─ match_reason (JSON with breakdown)
├─ created_at
└─ invited_to_apply (boolean)

analytics
├─ Various tracking records
├─ Job view counts
├─ Application trends
└─ Time-to-hire metrics
```

---

## 🎯 How Applications Are Stored & Retrieved

### Storage Flow (Write Path):
```
Job Seeker clicks "Apply" → 
  → Creates new application record in DB → 
    → Trigger event: application_created →
      → Send notification to company (in-app + email) →
        → Application appears in company dashboard
```

### Retrieval Flow (Read Path):
```
Company opens Applications tab →
  → Query: SELECT * FROM applications WHERE company_id = ? ORDER BY created_at DESC →
    → Fetch related job_seeker profiles →
      → Fetch job_posting details →
        → Render applications list with all data
```

### Status Update Flow:
```
Company clicks "Shortlist" →
  → UPDATE applications SET status = 'shortlisted', updated_at = NOW() WHERE id = ? →
    → Trigger event: application_status_changed →
      → Create notification record for job seeker →
        → Send email to job seeker →
          → Job seeker sees in-app notification + email
```

---

## ✅ Checklist: What's Implemented

- ✅ Applications are stored permanently in database
- ✅ Each application has a unique ID and timestamp
- ✅ Applications are linked to both job seeker and job posting
- ✅ Applications have status tracking (new → reviewed → shortlisted → accepted/rejected)
- ✅ Company receives instant in-app notifications when applications arrive
- ✅ Company receives email notifications
- ✅ Company has dedicated Applications section in dashboard to manage all applications
- ✅ Application history is preserved forever (no data loss)
- ✅ Job seekers can track their applications with status updates
- ✅ Job seekers receive notifications when status changes
- ✅ All communications/messages are stored with timestamps
- ✅ Analytics track all application metrics
- ✅ Notifications are persistent and have history/archive
