-- 018_profile_settings_and_preferences.sql

-- Add notification preferences JSONB column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS notification_prefs jsonb DEFAULT '{"email": true, "pulse": true}'::jsonb;

-- Ensure RLS allows users to update their own profiles
-- (This should already be in 009_rls_policies, but we can make sure)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Notify postgrest to reload schema
NOTIFY pgrst, 'reload schema';
