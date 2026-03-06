-- 005_equipment.sql

CREATE TABLE equipment (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id text NOT NULL UNIQUE,
    name text NOT NULL,
    dept_id uuid REFERENCES departments(id) NOT NULL,
    serial_number text,
    model text,
    photo_url text,
    linked_sop_id uuid REFERENCES sops(id),
    frequency text CHECK (frequency IN ('daily','weekly','monthly','quarterly','custom')),
    custom_interval_days int,
    last_serviced date,
    next_due date,
    status text DEFAULT 'pending_qa' CHECK (status IN ('pending_qa','active','inactive')),
    submitted_by uuid REFERENCES profiles(id),
    approved_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE pm_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id uuid REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
    assigned_dept uuid REFERENCES departments(id) NOT NULL,
    due_date date NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending','complete','overdue')),
    completed_by uuid REFERENCES profiles(id),
    completed_at timestamptz,
    notes text,
    photo_url text,
    created_at timestamptz DEFAULT now()
);

-- Function to calculate the next due date based on frequency
CREATE OR REPLACE FUNCTION calculate_next_due(last_dt date, freq text, custom_days int)
RETURNS date AS $$
BEGIN
  IF freq = 'daily' THEN RETURN last_dt + interval '1 day'; END IF;
  IF freq = 'weekly' THEN RETURN last_dt + interval '1 week'; END IF;
  IF freq = 'monthly' THEN RETURN last_dt + interval '1 month'; END IF;
  IF freq = 'quarterly' THEN RETURN last_dt + interval '3 months'; END IF;
  IF freq = 'custom' AND custom_days IS NOT NULL THEN RETURN last_dt + (custom_days || ' days')::interval; END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to update equipment next_due and auto-create next pm_task on completion
CREATE OR REPLACE FUNCTION handle_pm_task_completion()
RETURNS trigger AS $$
DECLARE
  eq_record RECORD;
  new_due_date date;
BEGIN
  -- Only execute if status changed to complete
  IF NEW.status = 'complete' AND OLD.status != 'complete' THEN
    -- Get the parent equipment record
    SELECT * INTO eq_record FROM equipment WHERE id = NEW.equipment_id;
    
    -- Calculate the new due date based on today (or the completion date)
    new_due_date := calculate_next_due(CURRENT_DATE, eq_record.frequency, eq_record.custom_interval_days);
    
    -- Update the equipment record
    UPDATE equipment 
    SET last_serviced = CURRENT_DATE, next_due = new_due_date
    WHERE id = NEW.equipment_id;

    -- Generate the next PM task automatically if we have a next due date
    IF new_due_date IS NOT NULL THEN
      INSERT INTO pm_tasks (equipment_id, assigned_dept, due_date, status)
      VALUES (NEW.equipment_id, NEW.assigned_dept, new_due_date, 'pending');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_pm_task_completed
  AFTER UPDATE ON pm_tasks
  FOR EACH ROW EXECUTE PROCEDURE handle_pm_task_completion();
