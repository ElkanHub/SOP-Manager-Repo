-- 015_cc_signatures_trigger.sql
-- Auto-completes a Change Control when all required managers have signed

-- Add 'pending_signatures' to change_controls status if not present
ALTER TABLE change_controls DROP CONSTRAINT IF EXISTS change_controls_status_check;
ALTER TABLE change_controls ADD CONSTRAINT change_controls_status_check
  CHECK (status IN ('pending', 'pending_signatures', 'complete'));

-- Function called by the trigger
CREATE OR REPLACE FUNCTION check_and_complete_change_control()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cc          change_controls%ROWTYPE;
  v_sop         sops%ROWTYPE;
  v_dept_mgr_count int;
  v_sig_count   int;
BEGIN
  SELECT * INTO v_cc FROM change_controls WHERE id = NEW.change_control_id;
  SELECT * INTO v_sop FROM sops WHERE id = v_cc.sop_id;

  -- Count required signatories: all managers in the SOP's department
  SELECT COUNT(*) INTO v_dept_mgr_count
    FROM profiles
    WHERE dept_id = v_sop.dept_id AND role IN ('manager', 'admin');

  -- Count collected signatures
  SELECT COUNT(*) INTO v_sig_count
    FROM signature_certificates
    WHERE change_control_id = NEW.change_control_id;

  -- If all signed, finalise the CC
  IF v_sig_count >= v_dept_mgr_count AND v_dept_mgr_count > 0 THEN
    UPDATE change_controls
      SET status = 'complete', completed_at = now()
      WHERE id = NEW.change_control_id;

    -- Archive old version as superseded
    UPDATE sops
      SET status = 'active',
          version = v_cc.new_version,
          file_url = v_cc.new_file_url,
          updated_at = now()
      WHERE id = v_cc.sop_id;

    -- Log to audit
    INSERT INTO audit_log (actor_id, action, target_type, target_id, metadata)
    VALUES (
      NEW.user_id, 'change_control_completed', 'change_controls', NEW.change_control_id,
      jsonb_build_object('sop_id', v_cc.sop_id, 'new_version', v_cc.new_version)
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS trg_check_cc_completion ON signature_certificates;
CREATE TRIGGER trg_check_cc_completion
  AFTER INSERT ON signature_certificates
  FOR EACH ROW
  EXECUTE FUNCTION check_and_complete_change_control();
