-- 019_fix_rls_policies.sql

-- 1. Fix: Remove USING (true) from departments
DROP POLICY IF EXISTS "All authenticated users can view departments" ON departments;
CREATE POLICY "All authenticated users can view departments" ON departments FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- 2. Fix: Remove USING (true) from mobile_signatures
DROP POLICY IF EXISTS "Anyone can view a signature request by ID" ON public.mobile_signatures;
CREATE POLICY "Anyone can view a signature request by ID" ON public.mobile_signatures 
  FOR SELECT TO anon, authenticated USING (status = 'pending');

-- 3. Fix: Cross-department isolation for active SOPs
DROP POLICY IF EXISTS "All users can view active SOPs" ON sops;
CREATE POLICY "All users can view active SOPs" ON sops FOR SELECT
USING (
  status = 'active' AND (
    get_user_role() = 'admin' OR 
    get_user_dept_is_qa(auth.uid()) OR 
    dept_id = (SELECT dept_id FROM profiles WHERE id = auth.uid())
  )
);

-- 4. Fix: Cross-department isolation for active equipment
DROP POLICY IF EXISTS "View active equipment" ON equipment;
CREATE POLICY "View active equipment" ON equipment FOR SELECT USING (
  status = 'active' AND (
    get_user_role() = 'admin' OR 
    get_user_dept_is_qa(auth.uid()) OR 
    dept_id = (SELECT dept_id FROM profiles WHERE id = auth.uid())
  )
);
