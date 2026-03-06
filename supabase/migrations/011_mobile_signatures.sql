-- 011_mobile_signatures.sql

CREATE TABLE public.mobile_signatures (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    signature_base64 text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz DEFAULT now() + interval '15 minutes'
);

ALTER TABLE public.mobile_signatures ENABLE ROW LEVEL SECURITY;

-- The logged-in user who creates it can view and insert it
CREATE POLICY "Users can create their mobile signatures" ON public.mobile_signatures 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their mobile signatures" ON public.mobile_signatures 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Anonymous users (mobile device) can view by ID to check if pending
CREATE POLICY "Anyone can view a signature request by ID" ON public.mobile_signatures 
  FOR SELECT TO anon, authenticated USING (true);

-- Anonymous users (mobile device) can update it with the signature data
CREATE POLICY "Anyone can complete a pending signature" ON public.mobile_signatures 
  FOR UPDATE TO anon, authenticated 
  USING (status = 'pending' AND expires_at > now());

-- Add to Realtime publication for immediate sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.mobile_signatures;
