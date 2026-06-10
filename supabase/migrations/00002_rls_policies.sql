-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users policies
-- Anyone authenticated can read user profiles
CREATE POLICY "Users can read any profile"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own profile
-- NOTE: In production, this policy should be restricted to prevent updating the
-- 'role' column. Use a database trigger or column-level restrictions to prevent
-- role escalation. The server action (src/lib/actions/profile.ts) explicitly
-- strips the 'role' field from update payloads as an application-level guard.
-- Additionally, a trigger (prevent_role_change) is defined below to enforce this
-- at the database level.
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger to prevent role escalation: disallow changing the role column after insert
CREATE OR REPLACE FUNCTION prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Changing user role is not allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_role_change_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_change();

-- Users can insert their own profile (on registration)
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Companies policies
-- Anyone authenticated can read companies
CREATE POLICY "Anyone can read companies"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

-- Only the owner (employer) can insert a company
CREATE POLICY "Employers can create companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Only the owner can update their company
CREATE POLICY "Owners can update own company"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Only the owner can delete their company
CREATE POLICY "Owners can delete own company"
  ON companies FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Jobs policies
-- Anyone can read active jobs
CREATE POLICY "Anyone can read active jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Employers can read all their jobs (including inactive)
CREATE POLICY "Employers can read own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Employers can insert jobs for their own companies
CREATE POLICY "Employers can create jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Employers can update their own company's jobs
CREATE POLICY "Employers can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id
      AND companies.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Employers can delete their own company's jobs
CREATE POLICY "Employers can delete own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Applications policies
-- Job seekers can read their own applications
CREATE POLICY "Job seekers can read own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Employers can read applications for their jobs
CREATE POLICY "Employers can read applications for own jobs"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN companies ON companies.id = jobs.company_id
      WHERE jobs.id = applications.job_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Job seekers can apply to active jobs (one per job enforced by unique constraint)
CREATE POLICY "Job seekers can create applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_id
      AND jobs.is_active = true
    )
  );

-- Only the job's company owner can update application status
CREATE POLICY "Employers can update application status"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN companies ON companies.id = jobs.company_id
      WHERE jobs.id = applications.job_id
      AND companies.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN companies ON companies.id = jobs.company_id
      WHERE jobs.id = applications.job_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Conversations policies
-- Only participants can view conversations, and only when application is accepted
CREATE POLICY "Participants can read accepted conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = conversations.company_id
      AND companies.owner_id = auth.uid()
    ))
    AND EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = conversations.application_id
      AND applications.status = 'accepted'
    )
  );

-- Participants can create conversations for accepted applications
CREATE POLICY "Participants can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = company_id
      AND companies.owner_id = auth.uid()
    ))
    AND EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = application_id
      AND applications.status = 'accepted'
    )
  );

-- Messages policies
-- Only conversation participants can read messages (when application is accepted)
CREATE POLICY "Participants can read messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      JOIN applications ON applications.id = conversations.application_id
      WHERE conversations.id = messages.conversation_id
      AND applications.status = 'accepted'
      AND (
        conversations.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM companies
          WHERE companies.id = conversations.company_id
          AND companies.owner_id = auth.uid()
        )
      )
    )
  );

-- Only conversation participants can send messages (when application is accepted)
CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      JOIN applications ON applications.id = conversations.application_id
      WHERE conversations.id = conversation_id
      AND applications.status = 'accepted'
      AND (
        conversations.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM companies
          WHERE companies.id = conversations.company_id
          AND companies.owner_id = auth.uid()
        )
      )
    )
  );

-- Message read status can be updated by the recipient
CREATE POLICY "Recipients can mark messages as read"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        conversations.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM companies
          WHERE companies.id = conversations.company_id
          AND companies.owner_id = auth.uid()
        )
      )
    )
  );
