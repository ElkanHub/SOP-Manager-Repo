-- 007_calendar.sql

CREATE TABLE events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    start_date date NOT NULL,
    end_date date,
    start_time time,
    end_time time,
    visibility text NOT NULL DEFAULT 'dept' CHECK (visibility IN ('public','dept')),
    dept_id uuid REFERENCES departments(id),
    event_type text DEFAULT 'manual' CHECK (event_type IN ('manual','pm_auto')),
    equipment_id uuid REFERENCES equipment(id),
    created_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now()
);

-- 008_audit_log.sql

CREATE TABLE audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id uuid REFERENCES profiles(id),
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    dept_id uuid REFERENCES departments(id),
    metadata jsonb,
    created_at timestamptz DEFAULT now()
);
