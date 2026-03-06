-- 010_seed_qa_department.sql

-- Ensure the 'Quality Assurance' department exists and is flagged as QA
INSERT INTO departments (name, slug, is_qa, color)
VALUES ('Quality Assurance', 'qa', true, 'purple')
ON CONFLICT (name) DO UPDATE 
SET is_qa = true, color = 'purple';
