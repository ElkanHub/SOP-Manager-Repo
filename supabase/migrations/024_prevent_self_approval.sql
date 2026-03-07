-- Migration to prevent self-approvals
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
  v_sop     sops%ROWTYPE;
  v_outcome text;
BEGIN
  SELECT * INTO v_request FROM sop_approval_requests WHERE id = p_request_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Approval request % not found', p_request_id;
  END IF;

  -- Prevent self-approval conflict of interest
  IF v_request.submitted_by = p_qa_user_id THEN
    RAISE EXCEPTION 'Self-approval is not allowed. Another QA/Admin must approve this SOP.';
  END IF;

  SELECT * INTO v_sop FROM sops WHERE id = v_request.sop_id;

  UPDATE sop_approval_requests
    SET status = 'approved', updated_at = now()
    WHERE id = p_request_id;

  IF v_request.type = 'new' THEN
    UPDATE sops
      SET status = 'active', approved_by = p_qa_user_id, updated_at = now()
      WHERE id = v_request.sop_id;
    v_outcome := 'activated';

  ELSIF v_request.type = 'update' THEN
    -- Insert a complete change_controls row using current sop data as old version
    -- The new file was uploaded to sop-uploads and set on sops.file_url
    INSERT INTO change_controls (
      sop_id, old_version, new_version,
      old_file_url, new_file_url,
      issued_by, status
    )
    VALUES (
      v_request.sop_id,
      v_sop.version,
      'v' || (CAST(REPLACE(v_sop.version, 'v', '') AS numeric) + 0.1)::text,
      COALESCE(v_sop.file_url, ''),
      COALESCE(v_sop.file_url, ''),  -- new file is the one just uploaded (same field updated)
      p_qa_user_id,
      'pending_signatures'
    );

    UPDATE sops SET status = 'pending_cc', updated_at = now() WHERE id = v_request.sop_id;
    v_outcome := 'change_control_issued';
  END IF;

  INSERT INTO audit_log (actor_id, action, target_type, target_id, metadata)
  VALUES (
    p_qa_user_id, 'approved_sop_request', 'sop_approval_requests', p_request_id,
    jsonb_build_object('outcome', v_outcome, 'sop_id', v_request.sop_id)
  );

  RETURN jsonb_build_object('outcome', v_outcome, 'sop_id', v_request.sop_id);
END;
$$;
