-- 017_audit_log_triggers.sql

-- 1. Helper Function to create an audit log entry
CREATE OR REPLACE FUNCTION insert_audit_log(
    p_actor_id uuid,
    p_action text,
    p_entity_type text,
    p_entity_id uuid,
    p_dept_id uuid,
    p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void AS $$
BEGIN
    INSERT INTO audit_log (actor_id, action, entity_type, entity_id, dept_id, metadata)
    VALUES (p_actor_id, p_action, p_entity_type, p_entity_id, p_dept_id, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Trigger: SOP Status Changes (Activated, Archived, Needs Revision)
CREATE OR REPLACE FUNCTION log_sop_change()
RETURNS trigger AS $$
BEGIN
    -- Only log if the status changed
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        PERFORM insert_audit_log(
            auth.uid(), -- The active user making the change
            'Status changed to ' || NEW.status,
            'SOP',
            NEW.id,
            NEW.dept_id,
            jsonb_build_object('sop_number', NEW.sop_number, 'title', NEW.title, 'version', NEW.version)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sop_status_audit
    AFTER UPDATE OF status ON sops
    FOR EACH ROW
    EXECUTE FUNCTION log_sop_change();


-- 3. Trigger: PM Task Completed
CREATE OR REPLACE FUNCTION log_pm_completion()
RETURNS trigger AS $$
BEGIN
    IF NEW.status = 'complete' AND OLD.status != 'complete' THEN
        PERFORM insert_audit_log(
            auth.uid(),
            'PM Task Completed',
            'PM Task',
            NEW.id,
            NEW.assigned_dept,
            jsonb_build_object('equipment_id', NEW.equipment_id, 'notes', NEW.completion_notes)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER pm_task_audit
    AFTER UPDATE OF status ON pm_tasks
    FOR EACH ROW
    EXECUTE FUNCTION log_pm_completion();


-- 4. Trigger: New Equipment Added
CREATE OR REPLACE FUNCTION log_new_equipment()
RETURNS trigger AS $$
BEGIN
    PERFORM insert_audit_log(
        auth.uid(),
        'Asset Registered',
        'Equipment',
        NEW.id,
        NEW.department_id,
        jsonb_build_object('asset_id', NEW.asset_id, 'name', NEW.name)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER new_equipment_audit
    AFTER INSERT ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION log_new_equipment();


-- 5. RPC: PM Compliance Calculation
-- Returns percentage of PMs due this month that have been completed
CREATE OR REPLACE FUNCTION get_pm_compliance(p_dept_id uuid DEFAULT NULL)
RETURNS numeric AS $$
DECLARE
    total_due integer;
    total_complete integer;
BEGIN
    -- Count all tasks due this month
    SELECT count(*) INTO total_due
    FROM pm_tasks
    WHERE date_trunc('month', due_date) = date_trunc('month', CURRENT_DATE)
      AND (p_dept_id IS NULL OR assigned_dept = p_dept_id);

    -- Count tasks due this month that are marked complete
    SELECT count(*) INTO total_complete
    FROM pm_tasks
    WHERE date_trunc('month', due_date) = date_trunc('month', CURRENT_DATE)
      AND status = 'complete'
      AND (p_dept_id IS NULL OR assigned_dept = p_dept_id);

    IF total_due = 0 THEN
        RETURN 100.0; -- If nothing due, compliance is 100%
    END IF;

    RETURN round((total_complete::numeric / total_due::numeric) * 100.0, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
