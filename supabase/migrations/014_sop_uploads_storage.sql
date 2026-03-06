-- 014_sop_uploads_storage.sql
-- Storage policies for the sop-uploads bucket

DROP POLICY IF EXISTS "Authenticated users can upload SOPs" ON storage.objects;
DROP POLICY IF EXISTS "QA and Admin can read SOP uploads" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete their SOP uploads" ON storage.objects;

-- Any authenticated user can upload
CREATE POLICY "Authenticated users can upload SOPs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'sop-uploads');

-- QA/Admin can read uploaded files for review
CREATE POLICY "QA and Admin can read SOP uploads"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'sop-uploads'
    AND (
      get_user_role() = 'admin'
      OR get_user_dept_is_qa(auth.uid())
      -- Submitter can read their own files (folder = user_id)
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- Submitters can delete their own uploads
CREATE POLICY "Owners can delete their SOP uploads"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'sop-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
