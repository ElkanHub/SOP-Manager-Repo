export type UserRole = 'admin' | 'manager' | 'worker'

export interface Profile {
    id: string
    full_name: string
    email: string
    job_title?: string
    employee_id?: string
    phone?: string
    avatar_url?: string
    signature_url?: string
    role: UserRole
    dept_id: string
    created_at: string
}

export interface Department {
    id: string
    name: string
    slug: string
    is_qa: boolean
    created_at: string
}

export type SopStatus = 'draft' | 'pending_qa' | 'active' | 'superseded'

export interface SopRecord {
    id: string
    sop_number: string
    title: string
    dept_id: string
    version: string
    status: SopStatus
    file_url?: string
    date_listed: string
    date_revised?: string
    due_for_revision?: string
    submitted_by?: string
    approved_by?: string
    created_at: string
    updated_at: string
}

export interface SopVersion {
    id: string
    sop_id: string
    version: string
    file_url: string
    diff_json?: any
    delta_summary?: string
    uploaded_by: string
    created_at: string
}

export interface Equipment {
    id: string
    asset_id: string
    name: string
    dept_id: string
    serial_number?: string
    model?: string
    photo_url?: string
    linked_sop_id?: string
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom'
    custom_interval_days?: number
    last_serviced?: string
    next_due?: string
    status: 'pending_qa' | 'active' | 'inactive'
    submitted_by?: string
    approved_by?: string
    created_at: string
}

export interface PmTask {
    id: string
    equipment_id: string
    assigned_dept: string
    due_date: string
    status: 'pending' | 'complete' | 'overdue'
    completed_by?: string
    completed_at?: string
    notes?: string
    photo_url?: string
    created_at: string
}

export interface Notice {
    id: string
    author_id: string
    subject: string
    message: string
    audience: 'everyone' | 'department' | 'individuals'
    dept_id?: string
    created_at: string
    deleted_at?: string
}
