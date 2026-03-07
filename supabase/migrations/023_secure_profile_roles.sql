-- 019_secure_profile_roles.sql

-- 1. Function to prevent unauthorized role escalation
CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS TRIGGER AS $$
DECLARE
  admin_count integer;
BEGIN
  -- If the role is being changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    
    -- System bypass (service role)
    IF auth.uid() IS NULL THEN
      RETURN NEW;
    END IF;

    -- Check if changing to admin when no admins exist (Initial Claim)
    IF NEW.role = 'admin' AND NEW.id = auth.uid() THEN
      SELECT count(*) INTO admin_count FROM profiles WHERE role = 'admin';
      IF admin_count = 0 THEN
        -- Allow the first user to claim admin
        RETURN NEW;
      END IF;
    END IF;

    -- For any other role changes, the user making the change MUST be an admin
    IF (SELECT role FROM profiles WHERE id = auth.uid()) != 'admin' THEN
      RAISE EXCEPTION 'Unauthorized: Only administrators can modify roles.';
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS ensure_role_security ON profiles;
CREATE TRIGGER ensure_role_security
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_escalation();


-- 2. Secure RPC to check if ANY admin exists
CREATE OR REPLACE FUNCTION check_admin_exists()
RETURNS boolean AS $$
DECLARE
  admin_count integer;
BEGIN
  SELECT count(*) INTO admin_count FROM profiles WHERE role = 'admin';
  RETURN admin_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Secure RPC to claim the admin role IF NONE EXISTS
CREATE OR REPLACE FUNCTION claim_admin_role()
RETURNS boolean AS $$
DECLARE
  admin_count integer;
BEGIN
  SELECT count(*) INTO admin_count FROM profiles WHERE role = 'admin';
  
  IF admin_count > 0 THEN
    RAISE EXCEPTION 'Administrator role has already been claimed.';
  END IF;
  
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to claim the admin role.';
  END IF;

  -- The trigger allows this because admin_count is 0 and they are updating themselves
  UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
