-- 012_storage_policies.sql
-- Storage RLS policies for avatars and signatures buckets

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own signature" ON storage.objects;
DROP POLICY IF EXISTS "Signatures are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own signature" ON storage.objects;

-- AVATARS bucket
-- File path format: {user_id}/{filename}
CREATE POLICY "Avatars are publicly viewable"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- SIGNATURES bucket
-- File path format: {user_id}/{filename}
CREATE POLICY "Signatures are publicly viewable"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'signatures');

CREATE POLICY "Users can upload own signature"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'signatures' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own signature"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'signatures' AND (storage.foldername(name))[1] = auth.uid()::text);
