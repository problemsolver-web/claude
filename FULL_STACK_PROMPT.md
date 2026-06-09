# Bangladesh Job Matching Platform - Full Stack Development Prompt

## Project Overview
Build a complete AI-powered job matching platform connecting companies in Bangladesh with fresh graduates and unemployed youths. The system will intelligently match job seekers with opportunities using AI-driven recommendations.

## Core Features

### 1. User Management & Authentication
- **User Types:**
  - Companies (employers)
  - Job Seekers (fresh graduates, unemployed youths)
  
- **Authentication:**
  - Email/password registration and login
  - JWT token-based authentication
  - Email verification
  - Password reset functionality
  - OAuth integration (Google, GitHub optional)

### 2. Company Dashboard (Comprehensive)

#### Dashboard Home/Overview
- Quick stats: Active job postings, total applications, shortlisted candidates, pending interviews
- Recent applications widget (last 5 applications)
- Job posting performance chart
- Recommended candidates to invite

#### Job Postings Management Tab
- **List View:**
  - All company's job postings in table/card format
  - Columns: Job Title, Posted Date, Deadline, Status (Active/Closed/Expired), Applications Count, Views Count
  - Sorting: By date, by applications count, by status
  - Filters: Active, Closed, Expired jobs
  - Search by job title

- **Job Posting Card/Row Actions:**
  - Edit job posting
  - Delete job posting
  - View all applications for this job
  - View AI recommended candidates
  - Close job posting (mark as filled)
  - Extend deadline
  - View analytics (views, clicks, applications over time)

- **Create New Job Posting:**
  - Form with all required fields
  - Title, Description, Skills Required, Experience Level, Salary Range
  - Location, Job Type (Remote/Onsite/Hybrid)
  - Category, Benefits, Application Deadline
  - Auto-generated job URL for sharing
  - Preview before publishing

#### Applications Management Tab
- **All Applications View:**
  - Filter by: job posting, status (new/reviewed/shortlisted/rejected/accepted), date range
  - Sort by: newest, oldest, match score
  - Search by candidate name or email
  - Bulk actions: select multiple applications, bulk status change, bulk message

- **Application Card Details:**
  - Candidate name, profile picture, headline/bio
  - Applied to which job
  - Applied date/time
  - Current status (color-coded badge)
  - Match score percentage
  - Preview of key skills that match

- **Application Detail Page:**
  - Full candidate profile
  - Resume preview/download
  - All submitted information
  - AI match score breakdown (why matched)
  - Timeline of actions (view date, message date, status changes)
  - Full application history for this job posting
  - Interview scheduling tools
  - Change status dropdown: new → reviewed → shortlisted → accepted/rejected
  - Message button to open chat

#### Recommended Candidates Tab
- **Per Job Basis:**
  - For each active job posting, show top 5-10 AI-recommended candidates
  - Candidates sorted by match score (highest first)
  - Each candidate shows:
    - Profile card with picture and name
    - Match score (85% Match)
    - Top matching skills highlighted
    - Location (with match indicator)
    - Quick action buttons: View Full Profile, Send Invite to Apply, Send Message

- **Send Invite to Apply:**
  - One-click invitation
  - Job seeker receives notification: "[Company] thinks you'd be great for [Job Title]"
  - Candidate can apply directly from notification
  - Track which candidates have been invited

#### Messaging/Communication Tab
- **Conversations List:**
  - All ongoing conversations with candidates
  - Sorted by most recent
  - Show: candidate name, last message preview, timestamp, unread count
  - Search conversations

- **Conversation View:**
  - Full message history with candidate
  - Message input box
  - Timestamp on each message
  - Read receipts (optional)
  - Share job posting link in chat
  - Schedule interview feature (calendar integration)
  - Attach files (offer letter, etc.)

#### Analytics & Insights Tab
- **Job Posting Performance:**
  - For each job: Total views, Total clicks, Total applications, Conversion rate
  - Chart: applications received over time
  - Most viewed jobs
  - Jobs with highest conversion rates

- **Hiring Funnel:**
  - Visualization: Applications → Reviewed → Shortlisted → Accepted
  - Percentages at each stage
  - Average time in each stage
  - Bottleneck identification

- **Candidate Metrics:**
  - Average quality of applicants
  - Most common skills applied for
  - Average salary expectations
  - Geographic distribution of applicants

#### Company Settings/Profile Tab
- Edit company profile (name, description, logo, website, industry, company size)
- Team members management (add recruiters, set roles/permissions)
- Notification preferences (email alerts for new applications, etc.)
- Billing & subscription (if applicable)
- API keys (if they want to integrate with their own systems)


### 3. Job Seeker Dashboard
- **Profile Management:**
  - Personal information
  - Contact details
  - Profile picture
  - Professional summary/bio
  - Location (preferred work locations)

- **CV/Resume Upload:**
  - Upload multiple resume formats (PDF, DOCX)
  - Parse and extract key information
  - Store and manage resume versions

- **Skills & Portfolio:**
  - Add skills with proficiency levels (beginner, intermediate, advanced, expert)
  - Add portfolio projects with descriptions, links, and technologies used
  - Highlight GitHub profile (optional)
  - Add certifications and achievements
  - Work experience (if any)
  - Education details (university, degree, field, graduation year)

- **Job Search:**
  - Browse job listings with filters (location, salary range, job type, industry, skills required)
  - Search functionality with keywords
  - Save/bookmark favorite jobs
  - Apply to jobs with one-click or custom application
  - View application status history

- **Messaging:**
  - Direct messaging with companies
  - Track interview communications

### 4. AI-Powered Matching Engine
- **Smart Matching Algorithm:**
  - Analyze job requirements vs. job seeker skills
  - Match on: skills, experience level, salary expectations, location preferences
  - Score compatibility (0-100)
  - Learn from past matches and outcomes

- **Recommendations:**
  - Suggest best candidates to companies for each job posting
  - Show top 5-10 recommended candidates per job
  - Suggest matching jobs to job seekers based on their profile
  - Explain why matches were made (transparency)

- **Ranking System:**
  - Weight skill matches
  - Consider experience level alignment
  - Factor in portfolio/project quality
  - Prioritize location preferences

### 5. Analytics & Insights
- **For Companies:**
  - Job posting performance metrics
  - Application statistics
  - Hiring funnel analytics
  - Time-to-hire metrics

- **For Job Seekers:**
  - Profile completion percentage
  - Profile views count
  - Application submission history
  - Success rate (interviews/offers received)

- **Admin Dashboard:**
  - Total users (companies & job seekers)
  - Active jobs posted
  - Successful hires/matches
  - Platform health metrics

### 6. Notifications System
- **Email Notifications:**
  - New job matches (for job seekers)
  - New applications (for companies)
  - Interview reminders
  - Account alerts
  - Application status changes (accepted/rejected)

- **In-App Notifications (Real-Time):**
  - Badge counter showing unread notifications
  - Real-time notifications for:
    - New applications received (for companies)
    - Application status updates (for job seekers)
    - Messages from companies/candidates
    - Match recommendations
    - Job posting expiring soon
  - Notification bell icon with dropdown showing recent notifications
  - Click notification to navigate to relevant page (job posting, application, message)

- **Notification Persistence:**
  - Store notifications in database
  - Mark as read/unread
  - Archive old notifications
  - Notification history page
  - Bulk actions (mark all as read, delete notifications)

## Technical Stack

### Frontend
- **Framework:** React.js or Next.js (SSR for better SEO/performance)
- **State Management:** Redux Toolkit or Zustand
- **UI Library:** Tailwind CSS or Material-UI
- **Forms:** React Hook Form
- **Charts:** Chart.js or Recharts (for analytics)
- **File Upload:** React Dropzone or similar
- **Real-time:** Socket.io or WebSocket for messaging
- **Deployment:** Vercel (Next.js) or Netlify

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js or NestJS
- **Database:** PostgreSQL (relational data) + Redis (caching, sessions)
- **ORM:** Prisma or TypeORM
- **Authentication:** JWT + Passport.js
- **File Storage:** AWS S3 or Cloudinary
- **Email Service:** SendGrid, Nodemailer, or AWS SES
- **AI/ML:**
  - Natural Language Processing: NLP.js, TensorFlow.js, or OpenAI API
  - Recommendation Engine: Custom algorithm or Firebase ML
  - Text similarity: Cosine similarity, TF-IDF for CV parsing
- **API:** RESTful API (or GraphQL for flexibility)
- **Deployment:** AWS EC2, Heroku, Railway, or DigitalOcean

### Database Schema
```
Tables:
- users (id, email, password, name, userType, createdAt, updatedAt)
- companies (id, userId, companyName, logo, description, website, location, industry, verified, createdAt)
- jobSeekers (id, userId, profilePicture, bio, location, preferredLocations, createdAt)
- skills (id, jobSeekerId, skillName, proficiencyLevel)
- experience (id, jobSeekerId, company, position, startDate, endDate)
- education (id, jobSeekerId, university, degree, field, graduationYear)
- certifications (id, jobSeekerId, certificationName, issuer, date)
- resumes (id, jobSeekerId, fileUrl, fileName, isPrimary, uploadedAt)
- portfolioProjects (id, jobSeekerId, title, description, link, technologies)
- jobPostings (id, companyId, title, description, skillsRequired, experienceLevel, salaryRange, location, jobType, category, deadline, createdAt, updatedAt)
- applications (id, jobSeekerId, jobPostingId, status, appliedAt, updatedAt)
- messages (id, senderId, recipientId, content, createdAt)
- matches (id, jobPostingId, jobSeekerId, matchScore, reason, createdAt)
- analytics (various tracking tables for metrics)
```

## Development Phases

### Phase 1: Core Infrastructure (Week 1-2)
- Project setup and scaffolding
- User authentication system
- Basic user profiles
- Database schema and migrations

### Phase 2: Main Features (Week 3-4)
- Job posting functionality
- Resume upload and CV parsing
- Job search and browse
- Application system
- Messaging system

### Phase 3: AI Matching Engine (Week 5-6)
- Implement matching algorithm
- Build recommendation system
- Integrate AI/ML for CV analysis
- Test matching accuracy

### Phase 4: Polish & Optimization (Week 7-8)
- Frontend UI/UX refinement
- Performance optimization
- Analytics implementation
- Testing and bug fixes
- Deployment setup

## Key Implementation Details

### Complete Application Flow (Step by Step)

#### Scenario: Job Seeker Applies to Job Posting

1. **Job Seeker Submits Application:**
   - Job seeker browses available jobs
   - Clicks "Apply Now" button on a job posting
   - Application created in `applications` table with status = "new"
   - Application timestamp recorded

2. **Application Appears in Company Dashboard:**
   - Company receives **instant in-app notification** (bell icon badge +1)
   - Notification shows: "New application received for [Job Title]"
   - Email notification sent: "You have a new application for [Job Title]"
   - Application appears in "Applications" section of company dashboard
   - Default view: sorted by newest first

3. **Company Reviews Application:**
   - Company opens company dashboard → Applications tab
   - Lists all applications with:
     - Candidate name and profile picture
     - Job title they applied for
     - Applied date/time
     - Application status badge (new/reviewed/shortlisted/rejected/accepted)
     - Quick action buttons: View Full Profile, Download Resume, Message, Shortlist, Reject
   - Company clicks "View Full Profile" to see:
     - Job seeker's full profile (bio, skills, experience, education)
     - Resume file(s) download links
     - Portfolio projects
     - AI Match Score (why this candidate was recommended)

4. **Company Takes Action:**
   - **Shortlist:** Application status → "shortlisted", send notification to candidate: "You've been shortlisted!"
   - **Reject:** Application status → "rejected", send notification to candidate: "Thank you for applying..."
   - **Message:** Send direct message to candidate for interview scheduling
   - **Accept:** Application status → "accepted", offer sent (optional job offer document)

5. **Job Seeker Sees Updates:**
   - Receives **instant in-app notification** when application status changes
   - Email notification sent automatically
   - On job seeker dashboard → Applications tab → sees all application history:
     - Job title
     - Application date
     - Current status (new/reviewed/shortlisted/rejected/accepted)
     - Company name and logo
     - Button to view job details again
   - If shortlisted/accepted, can reply via messaging to confirm interest

#### Scenario: AI Matching Recommendation

1. **Company Posts New Job:**
   - Job created in `jobPostings` table
   - AI matching engine runs automatically

2. **AI Matching Process:**
   - System analyzes job requirements (skills, experience, location, salary)
   - Searches all job seeker profiles for matches
   - Calculates match score for each candidate
   - Stores top matches in `matches` table

3. **Company Sees AI Recommendations:**
   - Company dashboard → "Recommended Candidates" section for each job
   - Shows top 5-10 candidates with:
     - Candidate card (name, profile pic, headline)
     - Match score (85% Match)
     - Key matching skills highlighted
     - Location match status
     - Quick action buttons: View Profile, Invite to Apply, Message

4. **Company Can Invite Candidate:**
   - Click "Invite to Apply"
   - System sends notification to candidate: "[Company] thinks you'd be perfect for [Job Title]"
   - Candidate sees in-app notification and can apply with one click

### Notification Database Schema

```
Tables added/enhanced:
- notifications (id, userId, notificationType, title, message, relatedEntityId, relatedEntityType, isRead, createdAt)
  - userId: who receives the notification
  - notificationType: application_received, application_status_changed, message_received, match_found, job_shortlisted, etc.
  - relatedEntityId: ID of job posting, application, message, etc.
  - relatedEntityType: job_posting, application, message, match, etc.
  - isRead: boolean for tracking read status

- applications (updated):
  - id, jobSeekerId, jobPostingId, status, appliedAt, updatedAt, message (optional cover letter)
```

### Application Status Workflow

```
Job Seeker View:
new → reviewed → shortlisted → accepted/rejected
       ↓
    (receives notifications at each step)

Company View:
new (badge notification) → reviewed (company action) → shortlisted → accepted/rejected
     ↓
  (appears in applications list)
```

### Real-Time Notification Architecture

- **Socket.io Events:**
  - `application_received` → sent to company when new application arrives
  - `application_status_changed` → sent to job seeker when status updates
  - `new_message` → sent to recipient when message arrives
  - `match_recommendation` → sent to company when AI finds candidate match

- **Notification Center:**
  - Bell icon in header shows unread count
  - Dropdown shows 5 most recent notifications
  - "View All" link goes to notifications history page
  - Notifications persist in database for history tracking

### Memory/Persistence System

- **All data is stored in PostgreSQL:**
  - Every application submission
  - Every application status change
  - Every notification sent
  - Every message exchanged
  - Complete audit trail with timestamps

- **No data is lost:**
  - Job seekers can see full application history
  - Companies can see all candidates who applied
  - Both can reference past conversations
  - Analytics tracks all interactions

- **Caching with Redis:**
  - Cache active job postings
  - Cache recent notifications (for instant retrieval)
  - Cache user profiles
  - Cache match scores (regenerated periodically)


## Security Considerations
- Hash passwords with bcrypt
- Validate all inputs server-side
- Implement rate limiting on API endpoints
- HTTPS for all communications
- CORS configuration
- SQL injection prevention (using ORM)
- XSS protection
- CSRF tokens for state-changing operations

## Performance Optimization
- Database indexing on frequently queried fields
- Redis caching for job listings and user profiles
- Pagination for large datasets
- Image optimization and compression
- CDN for static assets
- Lazy loading for components

## Testing Strategy
- Unit tests for utility functions and matching algorithm
- Integration tests for API endpoints
- E2E tests for critical user flows
- Recommend: Jest, Supertest, Cypress

## Deployment Strategy
- Containerize with Docker
- CI/CD pipeline (GitHub Actions, GitLab CI)
- Environment variables for configuration
- Database migrations automation
- Zero-downtime deployments

## Additional Features (Future Enhancement)
- Advanced filters and saved searches
- Video interview integration
- Skill verification badges
- Referral program
- Company reviews and ratings
- AI-powered cover letter generator
- Mobile app (React Native or Flutter)
- Blockchain-based credential verification
- Subscription tiers for premium features

## Success Metrics
- User registration rate
- Job posting volume
- Application conversion rate
- Successful matches and hires
- User retention rate
- Average time-to-hire
- User satisfaction scores

---

## Build Instructions for Claude Opus 4.8

You are an expert full-stack developer. Build this Bangladesh Job Matching Platform based on the specifications above. 

**Priority Order:**
1. Start with Phase 1 (authentication, user profiles, database)
2. Implement Phase 2 (core job marketplace features)
3. Build Phase 3 (AI matching engine)
4. Polish and optimize in Phase 4

**For Each Phase:**
- Provide complete, production-ready code
- Include error handling and validation
- Write clear documentation
- Create API documentation
- Suggest deployment configuration

**Code Quality Standards:**
- Follow clean code principles
- Use TypeScript for type safety
- Implement proper logging
- Write modular, reusable components
- Include environment configuration
- Add comprehensive comments for complex logic

**Start with:**
1. Project structure and setup
2. Database schema and migrations
3. Backend API scaffold
4. Frontend project setup
5. Authentication implementation

Then proceed phase by phase, iterating based on requirements and integrating all features into a cohesive platform.
