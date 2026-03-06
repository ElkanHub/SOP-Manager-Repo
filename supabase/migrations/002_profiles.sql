-- 002_profiles.sql

CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users,
    full_name text NOT NULL,
    email text NOT NULL,
    job_title text,
    employee_id text,
    phone text,
    avatar_url text,
    signature_url text,
    role text NOT NULL CHECK (role IN ('admin','manager','worker')),
    dept_id uuid REFERENCES departments(id),
    onboarding_complete boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Trigger to auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'worker')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
