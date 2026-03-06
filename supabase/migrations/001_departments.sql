-- 001_departments.sql

CREATE TABLE departments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    is_qa boolean DEFAULT false,
    color text DEFAULT 'blue',
    created_at timestamptz DEFAULT now()
);
