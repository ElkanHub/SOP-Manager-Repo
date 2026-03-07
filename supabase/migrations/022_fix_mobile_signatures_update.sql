-- 022_fix_mobile_signatures_update.sql

-- Drop the faulty UPDATE policy
DROP POLICY IF EXISTS "Anyone can complete a pending signature" ON public.mobile_signatures;

-- Recreate it with both USING and WITH CHECK to satisfy Supabase RLS requirements for UPDATEs
CREATE POLICY "Anyone can complete a pending signature" ON public.mobile_signatures 
  FOR UPDATE TO anon, authenticated 
  USING (status = 'pending' AND expires_at > now())
  WITH CHECK (status = 'completed');

-- Also re-secure the SELECT policy which had USING (true) but was broken in migration 019 because of conflicting names
DROP POLICY IF EXISTS "Anyone can view a signature request by ID" ON public.mobile_signatures;
CREATE POLICY "Anyone can view a pending signature request by ID" ON public.mobile_signatures 
  FOR SELECT TO anon, authenticated 
  USING (status = 'pending' OR status = 'completed');
