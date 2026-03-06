-- 009_rls_policies.sql

-- Helper function: Returns true if the user's department is QA
CREATE OR REPLACE FUNCTION get_user_dept_is_qa(user_id uuid)
RETURNS boolean AS $$
DECLARE
  is_qa_flag boolean;
BEGIN
  SELECT d.is_qa INTO is_qa_flag
  FROM profiles p
  JOIN departments d ON p.dept_id = d.id
  WHERE p.id = user_id;
  
  RETURN COALESCE(is_qa_flag, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_approval_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notice_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE notice_acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can delete profiles" ON profiles FOR DELETE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- 2. DEPARTMENTS
CREATE POLICY "All authenticated users can view departments" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage departments" ON departments FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- 3. SOPS
-- Read: Active SOPs
CREATE POLICY "All users can view active SOPs" ON sops FOR SELECT
USING (status = 'active');

-- Read: Non-Active SOPs
CREATE POLICY "Managers/QA can view draft/pending SOPs" ON sops FOR SELECT
USING (
  status != 'active' AND (
    get_user_dept_is_qa(auth.uid()) 
    OR 
    ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'admin') AND dept_id = (SELECT dept_id FROM profiles WHERE id = auth.uid()))
  )
);

-- Insert: Managers/Workers own dept OR QA
CREATE POLICY "Insert SOPs" ON sops FOR INSERT
WITH CHECK (
  get_user_dept_is_qa(auth.uid()) 
  OR 
  dept_id = (SELECT dept_id FROM profiles WHERE id = auth.uid())
);

-- Update: Manager own dept OR QA
CREATE POLICY "Update SOPs" ON sops FOR UPDATE
USING (
  get_user_dept_is_qa(auth.uid()) 
  OR 
  ((SELECT role FROM profiles WHERE id = auth.uid()) = 'manager' AND dept_id = (SELECT dept_id FROM profiles WHERE id = auth.uid()))
);

-- Delete: Admin only
CREATE POLICY "Delete SOPs" ON sops FOR DELETE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- 4. SOP_VERSIONS
CREATE POLICY "View SOP versions" ON sop_versions FOR SELECT USING (
  EXISTS (SELECT 1 FROM sops WHERE sops.id = sop_id) -- Relies on SOP read access
);
CREATE POLICY "Insert SOP version" ON sop_versions FOR INSERT WITH CHECK (
  auth.uid() = uploaded_by AND 
  EXISTS (SELECT 1 FROM sops WHERE sops.id = sop_id)
);

-- 5. APPROVAL REQUESTS
CREATE POLICY "View approval requests" ON sop_approval_requests FOR SELECT USING (
  submitted_by = auth.uid() OR get_user_dept_is_qa(auth.uid()) OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Insert approval requests" ON sop_approval_requests FOR INSERT WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Update approval requests" ON sop_approval_requests FOR UPDATE USING (
  get_user_dept_is_qa(auth.uid()) OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 6. APPROVAL COMMENTS
CREATE POLICY "View comments" ON sop_approval_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM sop_approval_requests WHERE id = request_id)
);
CREATE POLICY "Insert comments" ON sop_approval_comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 7. ACKNOWLEDGEMENTS
CREATE POLICY "View acknowledgements" ON sop_acknowledgements FOR SELECT USING (
  user_id = auth.uid() OR get_user_dept_is_qa(auth.uid()) OR ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'admin'))
);
CREATE POLICY "Insert acknowledgements" ON sop_acknowledgements FOR INSERT WITH CHECK (user_id = auth.uid());

-- 8. CHANGE CONTROLS
CREATE POLICY "View change controls" ON change_controls FOR SELECT USING (
  get_user_dept_is_qa(auth.uid()) OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR 
  EXISTS (SELECT 1 FROM sops WHERE sops.id = sop_id AND sops.dept_id = (SELECT dept_id FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY "Manage change controls (QA/Admin)" ON change_controls FOR ALL USING (
  get_user_dept_is_qa(auth.uid()) OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 9. SIGNATURES
CREATE POLICY "View signatures" ON signature_certificates FOR SELECT USING (
  get_user_dept_is_qa(auth.uid()) OR 
  EXISTS (SELECT 1 FROM change_controls cc JOIN sops s ON cc.sop_id = s.id WHERE cc.id = change_control_id AND s.dept_id = (SELECT dept_id FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY "Insert signature" ON signature_certificates FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. EQUIPMENT
CREATE POLICY "View active equipment" ON equipment FOR SELECT USING (status = 'active');
CREATE POLICY "View pending/inactive equipment" ON equipment FOR SELECT USING (
  status != 'active' AND (
    get_user_dept_is_qa(auth.uid()) OR dept_id = (SELECT dept_id FROM profiles WHERE id = auth.uid())
  )
);
CREATE POLICY "Insert equipment" ON equipment FOR INSERT WITH CHECK (status = 'pending_qa');
CREATE POLICY "Update equipment" ON equipment FOR UPDATE USING (
  get_user_dept_is_qa(auth.uid()) OR (dept_id = (SELECT dept_id FROM profiles WHERE id = auth.uid()) AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager','admin'))
);

-- 11. PM TASKS
CREATE POLICY "View PM tasks" ON pm_tasks FOR SELECT USING (
  assigned_dept = (SELECT dept_id FROM profiles WHERE id = auth.uid()) OR get_user_dept_is_qa(auth.uid()) OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "System/Manager insert PM tasks" ON pm_tasks FOR INSERT WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager','admin') OR get_user_dept_is_qa(auth.uid())
  -- System trigger bypasses RLS
);
CREATE POLICY "Update own completion" ON pm_tasks FOR UPDATE USING (
  assigned_dept = (SELECT dept_id FROM profiles WHERE id = auth.uid())
);

-- 12. NOTICES
CREATE POLICY "View notices" ON notices FOR SELECT USING (
  author_id = auth.uid() OR 
  get_user_dept_is_qa(auth.uid()) OR 
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR 
  audience = 'everyone' OR 
  (audience = 'department' AND dept_id = (SELECT dept_id FROM profiles WHERE id = auth.uid())) OR
  (audience = 'individuals' AND EXISTS (SELECT 1 FROM notice_recipients WHERE notice_id = id AND user_id = auth.uid()))
);
CREATE POLICY "Insert notice" ON notices FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Soft delete notice" ON notices FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "View notice recipients" ON notice_recipients FOR SELECT USING (
  EXISTS (SELECT 1 FROM notices WHERE notices.id = notice_id)
);
CREATE POLICY "Insert recipients" ON notice_recipients FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM notices WHERE notices.id = notice_id AND notices.author_id = auth.uid())
);

CREATE POLICY "View notice acks" ON notice_acknowledgements FOR SELECT USING (
  user_id = auth.uid() OR EXISTS (SELECT 1 FROM notices WHERE notices.id = notice_id AND notices.author_id = auth.uid())
);
CREATE POLICY "Insert notice acks" ON notice_acknowledgements FOR INSERT WITH CHECK (user_id = auth.uid());

-- 13. EVENTS
CREATE POLICY "View events" ON events FOR SELECT USING (
  visibility = 'public' OR 
  (visibility = 'dept' AND dept_id = (SELECT dept_id FROM profiles WHERE id = auth.uid())) OR 
  get_user_dept_is_qa(auth.uid())
);
CREATE POLICY "Insert events" ON events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Manage own events" ON events FOR UPDATE USING (auth.uid() = created_by OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Delete own events" ON events FOR DELETE USING (auth.uid() = created_by OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- 14. AUDIT LOG
CREATE POLICY "View audit log" ON audit_log FOR SELECT USING (
  get_user_dept_is_qa(auth.uid()) OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
-- Inserts to audit log are handled by service role bypassing RLS
