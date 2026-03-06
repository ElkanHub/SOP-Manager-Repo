-- 016_pm_calendar_events.sql
-- Extends the PM completion trigger to auto-create calendar events

CREATE OR REPLACE FUNCTION handle_pm_task_completion()
RETURNS trigger AS $$
DECLARE
  eq_record RECORD;
  new_due_date date;
  new_task_id uuid;
BEGIN
  IF NEW.status = 'complete' AND OLD.status != 'complete' THEN
    SELECT * INTO eq_record FROM equipment WHERE id = NEW.equipment_id;

    new_due_date := calculate_next_due(CURRENT_DATE, eq_record.frequency, eq_record.custom_interval_days);

    UPDATE equipment
      SET last_serviced = CURRENT_DATE, next_due = new_due_date
      WHERE id = NEW.equipment_id;

    IF new_due_date IS NOT NULL THEN
      -- Create the next PM task
      INSERT INTO pm_tasks (equipment_id, assigned_dept, due_date, status)
        VALUES (NEW.equipment_id, NEW.assigned_dept, new_due_date, 'pending')
        RETURNING id INTO new_task_id;

      -- Auto-populate calendar with this PM event
      INSERT INTO events (title, event_date, event_type, dept_id, metadata)
        VALUES (
          'PM Due: ' || eq_record.name,
          new_due_date,
          'pm_auto',
          eq_record.dept_id,
          jsonb_build_object('equipment_id', eq_record.id, 'pm_task_id', new_task_id)
        )
        ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
