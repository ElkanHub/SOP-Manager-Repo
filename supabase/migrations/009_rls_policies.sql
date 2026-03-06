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

-- Helper function: Returns the user's role, bypassing RLS to prevent infinite recursion
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

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
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (get_user_role() = 'admin');
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (get_user_role() = 'admin');
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
CREATE POLICY "Admins can delete profiles" ON profiles FOR DELETE USING (get_user_role() = 'admin');

-- 2. DEPARTMENTS
DROP POLICY IF EXISTS "All authenticated users can view departments" ON departments;
CREATE POLICY "All authenticated users can view departments" ON departments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can manage departments" ON departments;
CREATE POLICY "Admins can manage departments" ON departments FOR ALL USING (get_user_role() = 'admin');

-- 3. SOPS
-- Read: Active SOPs
DROP POLICY IF EXISTS "All users can view active SOPs" ON sops;
CREATE POLICY "All users can view active SOPs" ON sops FOR SELECT
USING (status = 'active');

-- Read: Non-Active SOPs
DROP POLICY IF EXISTS "Managers/QA can view draft/pending SOPs" ON sops;
CREATE POLICY "Managers/QA can view draft/pending SOPs" ON sops FOR SELECT
USING (
  status != 'active' AND (
    get_user_dept_is_qa(auth.uid()) 
    OR 
    (get_user_role() IN ('manager', 'admin') AND dept_id = (SELECT dept_id FROM profiles WHERE id = auth.uid()))
  )
);

-- Insert: Managers/Workers own dept OR QA
DROP POLICY IF EXISTS "Insert SOPs" ON sops;
CREATE POLICY "Insert SOPs" ON sops FOR INSERT
WITH CHECK (
  get_user_dept_is_qa(auth.uid()) 
  OR 
  dept_id = (SELECT dept_id FROM profiles WHERE id = auth.uid())
);

-- Update: Manager own dept OR QA
DROP POLICY IF EXISTS "Update SOPs" ON sops;
CREATE POLICY "Update SOPs" ON sops FOR UPDATE
USING (
  get_user_dept_is_qa(auth.uid()) 
  OR 
  (get_user_role() = 'manager' AND dept_id = (SELECT dept_id FROM profiles WHERE id = auth.uid()))
);

-- Delete: Admin only
DROP POLICY IF EXISTS "Delete SOPs" ON sops;
CREATE POLICY "Delete SOPs" ON sops FOR DELETE USING (get_user_role() = 'admin');

-- 4. SOP_VERSIONS
DROP POLICY IF EXISTS "View SOP versions" ON sop_versions;
CREATE POLICY "View SOP versions" ON sop_versions FOR SELECT USING (
  EXISTS (SELECT 1 FROM sops WHERE sops.id = sop_id)
);
DROP POLICY IF EXISTS "Insert SOP version" ON sop_versions;
CREATE POLICY "Insert SOP version" ON sop_versions FOR INSERT WITH CHECK (
  auth.uid() = uploaded_by AND 
  EXISTS (SELECT 1 FROM sops WHERE sops.id = sop_id)
);

-- 5. APPROVAL REQUESTS
DROP POLICY IF EXISTS "View approval requests" ON sop_approval_requests;
CREATE POLICY "View approval requests" ON sop_approval_requests FOR SELECT USING (
  submitted_by = auth.uid() OR get_user_dept_is_qa(auth.uid()) OR get_user_role() = 'admin'
);
DROP POLICY IF EXISTS "Insert approval requests" ON sop_approval_requests;
CREATE POLICY "Insert approval requests" ON sop_approval_requests FOR INSERT WITH CHECK (auth.uid() = submitted_by);
DROP POLICY IF EXISTS "Update approval requests" ON sop_approval_requests;
CREATE POLICY "Update approval requests" ON sop_approval_requests FOR UPDATE USING (
  get_user_dept_is_qa(auth.uid()) OR get_user_role() = 'admin'
);

-- 6. APPROVAL COMMENTS
DROP POLICY IF EXISTS "View comments" ON sop_approval_comments;
CREATE POLICY "View comments" ON sop_approval_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM sop_approval_requests WHERE id = request_id)
);
DROP POLICY IF EXISTS "Insert comments" ON sop_approval_comments;
CREATE POLICY "Insert comments" ON sop_approval_comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 7. ACKNOWLEDGEMENTS
DROP POLICY IF EXISTS "View acknowledgements" ON sop_acknowledgements;
CREATE POLICY "View acknowledgements" ON sop_acknowledgements FOR SELECT USING (
  user_id = auth.uid() OR get_user_dept_is_qa(auth.uid()) OR (get_user_role() IN ('manager', 'admin'))
);
DROP POLICY IF EXISTS "Insert acknowledgements" ON sop_acknowledgements;
CREATE POLICY "Insert acknowledgements" ON sop_acknowledgements FOR INSERT WITH CHECK (user_id = auth.uid());

-- 8. CHANGE CONTROLS
DROP POLICY IF EXISTS "View change controls" ON change_controls;
CREATE POLICY "View change controls" ON change_controls FOR SELECT USING (
  get_user_dept_is_qa(auth.uid()) OR get_user_role() = 'admin' OR 
  EXISTS (SELECT 1 FROM sops WHERE sops.id = sop_id AND sops.dept_id = (SELECT dept_id FROM profiles WHERE id = auth.uid()))
);
DROP POLICY IF EXISTS "Manage change controls (QA/Admin)" ON change_controls;
CREATE POLICY "Manage change controls (QA/Admin)" ON change_controls FOR ALL USING (
  get_user_dept_is_qa(auth.uid()) OR get_user_role() = 'admin'
);

-- 9. SIGNATURES
DROP POLICY IF EXISTS "View signatures" ON signature_certificates;
CREATE POLICY "View signatures" ON signature_certificates FOR SELECT USING (
  get_user_dept_is_qa(auth.uid()) OR 
  EXISTS (SELECT 1 FROM change_controls cc JOIN sops s ON cc.sop_id = s.id WHERE cc.id = change_control_id AND s.dept_id = (SELECT dept_id FROM profiles WHERE id = auth.uid()))
);
DROP POLICY IF EXISTS "Insert signature" ON signature_certificates;
CREATE POLICY "Insert signature" ON signature_certificates FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. EQUIPMENT
DROP POLICY IF EXISTS "View active equipment" ON equipment;
CREATE POLICY "View active equipment" ON equipment FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "View pending/inactive equipment" ON equipment;
CREATE POLICY "View pending/inactive equipment" ON equipment FOR SELECT USING (
  status != 'active' AND (
    get_user_dept_is_qa(auth.uid()) OR dept_id = (SELECT dept_id FROM profiles WHERE id = auth.uid())
  )
);
DROP POLICY IF EXISTS "Insert equipment" ON equipment;
CREATE POLICY "Insert equipment" ON equipment FOR INSERT WITH CHECK (status = 'pending_qa');
DROP POLICY IF EXISTS "Update equipment" ON equipment;
CREATE POLICY "Update equipment" ON equipment FOR UPDATE USING (
  get_user_dept_is_qa(auth.uid()) OR (dept_id = (SELECT dept_id FROM profiles WHERE id = auth.uid()) AND get_user_role() IN ('manager','admin'))
);

-- 11. PM TASKS
DROP POLICY IF EXISTS "View PM tasks" ON pm_tasks;
CREATE POLICY "View PM tasks" ON pm_tasks FOR SELECT USING (
  assigned_dept = (SELECT dept_id FROM profiles WHERE id = auth.uid()) OR get_user_dept_is_qa(auth.uid()) OR get_user_role() = 'admin'
);
DROP POLICY IF EXISTS "System/Manager insert PM tasks" ON pm_tasks;
CREATE POLICY "System/Manager insert PM tasks" ON pm_tasks FOR INSERT WITH CHECK (
  get_user_role() IN ('manager','admin') OR get_user_dept_is_qa(auth.uid())
  -- System trigger bypasses RLS
);
DROP POLICY IF EXISTS "Update own completion" ON pm_tasks;
CREATE POLICY "Update own completion" ON pm_tasks FOR UPDATE USING (
  assigned_dept = (SELECT dept_id FROM profiles WHERE id = auth.uid())
);

-- 12. NOTICES
DROP POLICY IF EXISTS "View notices" ON notices;
CREATE POLICY "View notices" ON notices FOR SELECT USING (
  author_id = auth.uid() OR 
  get_user_dept_is_qa(auth.uid()) OR 
  get_user_role() = 'admin' OR 
  audience = 'everyone' OR 
  (audience = 'department' AND dept_id = (SELECT dept_id FROM profiles WHERE id = auth.uid())) OR
  (audience = 'individuals' AND EXISTS (SELECT 1 FROM notice_recipients WHERE notice_id = id AND user_id = auth.uid()))
);
DROP POLICY IF EXISTS "Insert notice" ON notices;
CREATE POLICY "Insert notice" ON notices FOR INSERT WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "Soft delete notice" ON notices;
CREATE POLICY "Soft delete notice" ON notices FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "View notice recipients" ON notice_recipients;
CREATE POLICY "View notice recipients" ON notice_recipients FOR SELECT USING (
  EXISTS (SELECT 1 FROM notices WHERE notices.id = notice_id)
);
DROP POLICY IF EXISTS "Insert recipients" ON notice_recipients;
CREATE POLICY "Insert recipients" ON notice_recipients FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM notices WHERE notices.id = notice_id AND notices.author_id = auth.uid())
);

DROP POLICY IF EXISTS "View notice acks" ON notice_acknowledgements;
CREATE POLICY "View notice acks" ON notice_acknowledgements FOR SELECT USING (
  user_id = auth.uid() OR EXISTS (SELECT 1 FROM notices WHERE notices.id = notice_id AND notices.author_id = auth.uid())
);
DROP POLICY IF EXISTS "Insert notice acks" ON notice_acknowledgements;
CREATE POLICY "Insert notice acks" ON notice_acknowledgements FOR INSERT WITH CHECK (user_id = auth.uid());

-- 13. EVENTS
DROP POLICY IF EXISTS "View events" ON events;
CREATE POLICY "View events" ON events FOR SELECT USING (
  visibility = 'public' OR 
  (visibility = 'dept' AND dept_id = (SELECT dept_id FROM profiles WHERE id = auth.uid())) OR 
  get_user_dept_is_qa(auth.uid())
);
DROP POLICY IF EXISTS "Insert events" ON events;
CREATE POLICY "Insert events" ON events FOR INSERT WITH CHECK (auth.uid() = created_by);
DROP POLICY IF EXISTS "Manage own events" ON events;
CREATE POLICY "Manage own events" ON events FOR UPDATE USING (auth.uid() = created_by OR get_user_role() = 'admin');
DROP POLICY IF EXISTS "Delete own events" ON events;
CREATE POLICY "Delete own events" ON events FOR DELETE USING (auth.uid() = created_by OR get_user_role() = 'admin');

-- 14. AUDIT LOG
DROP POLICY IF EXISTS "View audit log" ON audit_log;
CREATE POLICY "View audit log" ON audit_log FOR SELECT USING (
  get_user_dept_is_qa(auth.uid()) OR get_user_role() = 'admin'
);
