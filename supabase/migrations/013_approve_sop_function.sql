-- 013_approve_sop_function.sql
-- Server-side approval logic for SOP approval requests

-- Add 'pending_cc' status to sops if not already present
ALTER TABLE sops DROP CONSTRAINT IF EXISTS sops_status_check;
ALTER TABLE sops ADD CONSTRAINT sops_status_check 
  CHECK (status IN ('draft', 'pending_qa', 'active', 'superseded', 'pending_cc'));

-- Main RPC function for approving an SOP request
CREATE OR REPLACE FUNCTION approve_sop_request(
  p_request_id uuid,
  p_qa_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request sop_approval_requests%ROWTYPE;
  v_outcome text;
BEGIN
  -- Fetch the request
  SELECT * INTO v_request
  FROM sop_approval_requests
  WHERE id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Approval request % not found', p_request_id;
  END IF;

  -- Update the request status
  UPDATE sop_approval_requests
  SET status = 'approved', updated_at = now()
  WHERE id = p_request_id;

  IF v_request.type = 'new' THEN
    -- New SOP: make it Active immediately
    UPDATE sops
    SET status = 'active', approved_by = p_qa_user_id, updated_at = now()
    WHERE id = v_request.sop_id;
    v_outcome := 'activated';

  ELSIF v_request.type = 'update' THEN
    -- Updated SOP: issue a Change Control, put SOP in pending_cc
    INSERT INTO change_controls (sop_id, issued_by, status)
    VALUES (v_request.sop_id, p_qa_user_id, 'pending_signatures');

    UPDATE sops
    SET status = 'pending_cc', updated_at = now()
    WHERE id = v_request.sop_id;
    v_outcome := 'change_control_issued';
  END IF;

  -- Log to audit_log
  INSERT INTO audit_log (actor_id, action, target_type, target_id, metadata)
  VALUES (
    p_qa_user_id,
    'approved_sop_request',
    'sop_approval_requests',
    p_request_id,
    jsonb_build_object('outcome', v_outcome, 'sop_id', v_request.sop_id)
  );

  RETURN jsonb_build_object('outcome', v_outcome, 'sop_id', v_request.sop_id);
END;
$$;

-- Grant execute to authenticated users (RLS on function itself handles security via SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION approve_sop_request TO authenticated;
