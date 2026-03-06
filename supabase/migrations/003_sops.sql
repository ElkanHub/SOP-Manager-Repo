-- 003_sops.sql

CREATE TABLE sops (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sop_number text NOT NULL UNIQUE,
    title text NOT NULL,
    dept_id uuid REFERENCES departments(id) NOT NULL,
    version text NOT NULL DEFAULT 'v1.0',
    status text NOT NULL DEFAULT 'pending_qa' CHECK (status IN ('draft','pending_qa','active','superseded','pending_cc')),
    file_url text,
    date_listed date DEFAULT CURRENT_DATE,
    date_revised date,
    due_for_revision date,
    submitted_by uuid REFERENCES profiles(id),
    approved_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE sop_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sop_id uuid REFERENCES sops(id) ON DELETE CASCADE NOT NULL,
    version text NOT NULL,
    file_url text NOT NULL,
    diff_json jsonb,
    delta_summary text,
    uploaded_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE sop_approval_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sop_id uuid REFERENCES sops(id) ON DELETE CASCADE NOT NULL,
    submitted_by uuid REFERENCES profiles(id) NOT NULL,
    type text NOT NULL CHECK (type IN ('new','update')),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','changes_requested','approved','rejected')),
    notes_to_qa text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE sop_approval_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id uuid REFERENCES sop_approval_requests(id) ON DELETE CASCADE NOT NULL,
    author_id uuid REFERENCES profiles(id) NOT NULL,
    comment text NOT NULL,
    action text CHECK (action IN ('comment','changes_requested','approved','resubmitted')),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE sop_acknowledgements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sop_id uuid REFERENCES sops(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES profiles(id) NOT NULL,
    version text NOT NULL,
    acknowledged_at timestamptz DEFAULT now(),
    UNIQUE (sop_id, user_id, version)
);
