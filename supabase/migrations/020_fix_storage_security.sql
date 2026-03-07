-- 020_fix_storage_security.sql
-- Enforces private buckets and restrictive policies for files

-- 1. Ensure buckets are private
UPDATE storage.buckets SET public = false WHERE id IN ('avatars', 'signatures', 'sop-uploads');

-- 2. Drop insecure policies
DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Signatures are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete their SOP uploads" ON storage.objects;

-- 3. Restrict Avatars (Authenticated only, not public)
CREATE POLICY "Authenticated users can read avatars"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');

-- 4. Restrict Signatures (Owner and QA only)
CREATE POLICY "Users can read own signature"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'signatures' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "QA can read signatures"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'signatures' 
    AND get_user_dept_is_qa(auth.uid())
  );
