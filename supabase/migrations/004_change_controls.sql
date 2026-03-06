-- 004_change_controls.sql

CREATE TABLE change_controls (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sop_id uuid REFERENCES sops(id) ON DELETE CASCADE NOT NULL,
    old_version text NOT NULL,
    new_version text NOT NULL,
    old_file_url text NOT NULL,
    new_file_url text NOT NULL,
    diff_json jsonb,
    delta_summary text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','complete')),
    issued_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

CREATE TABLE signature_certificates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    change_control_id uuid REFERENCES change_controls(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES profiles(id) NOT NULL,
    signature_url text NOT NULL,
    ip_address text,
    signed_at timestamptz DEFAULT now(),
    UNIQUE (change_control_id, user_id)
);
