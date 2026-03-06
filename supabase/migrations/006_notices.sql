-- 006_notices.sql

CREATE TABLE notices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id uuid REFERENCES profiles(id) NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    audience text NOT NULL CHECK (audience IN ('everyone','department','individuals')),
    dept_id uuid REFERENCES departments(id),
    created_at timestamptz DEFAULT now(),
    deleted_at timestamptz
);

CREATE TABLE notice_recipients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    notice_id uuid REFERENCES notices(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES profiles(id) NOT NULL
);

CREATE TABLE notice_acknowledgements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    notice_id uuid REFERENCES notices(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES profiles(id) NOT NULL,
    acknowledged_at timestamptz DEFAULT now(),
    UNIQUE (notice_id, user_id)
);
