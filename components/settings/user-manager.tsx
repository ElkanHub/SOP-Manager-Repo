'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Users, ShieldAlert, BadgeCheck, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { format } from 'date-fns'

interface UserProfile {
    id: string
    full_name: string
    email: string
    role: 'admin' | 'manager' | 'worker'
    departments: { name: string } | null
    created_at: string
}

export function UserManager() {
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const supabase = createClient()

    const fetchUsers = async () => {
        setLoading(true)

        // Get current user to prevent self-demotion
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setCurrentUserId(user.id)

        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, created_at, departments(name)')
            .order('created_at', { ascending: false })

        if (data) setUsers(data as any)
        setLoading(false)
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId)

            if (error) throw error
            toast.success('User role updated')
            fetchUsers() // Refresh
        } catch (err: any) {
            toast.error('Failed to update role: ' + err.message)
        }
    }

    if (loading) return (
        <div className="flex h-32 items-center justify-center bg-white rounded-xl border border-slate-200">
            <Loader2 className="h-6 w-6 animate-spin text-brand-teal" />
        </div>
    )

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between pointer-events-none">
                <div>
                    <h2 className="text-lg font-bold text-brand-navy">User Access & Roles</h2>
                    <p className="text-sm text-slate-500">Manage permissions across all registered staff.</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <Users className="h-5 w-5 text-slate-400" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                            <th className="px-6 py-3 font-semibold">User</th>
                            <th className="px-6 py-3 font-semibold">Department</th>
                            <th className="px-6 py-3 font-semibold">Joined</th>
                            <th className="px-6 py-3 font-semibold">Role Level</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-brand-navy flex items-center gap-2">
                                        {u.full_name}
                                        {u.id === currentUserId && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">You</span>}
                                    </div>
                                    <div className="text-xs text-slate-500">{u.email}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {u.departments?.name || <span className="text-slate-400 italic">Unassigned</span>}
                                </td>
                                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                    {format(new Date(u.created_at), 'MMM d, yyyy')}
                                </td>
                                <td className="px-6 py-4">
                                    <Select
                                        value={u.role}
                                        onValueChange={(val) => handleRoleChange(u.id, val)}
                                        disabled={u.id === currentUserId} // Prevent self demotion
                                    >
                                        <SelectTrigger className="w-[140px] h-8 text-xs bg-white">
                                            <SelectValue placeholder="Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="worker">
                                                <div className="flex items-center">
                                                    Worker
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="manager">
                                                <div className="flex items-center text-amber-700">
                                                    <BadgeCheck className="w-3 h-3 mr-2" />
                                                    Manager
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="admin">
                                                <div className="flex items-center text-brand-teal">
                                                    <ShieldAlert className="w-3 h-3 mr-2" />
                                                    QA Admin
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="bg-amber-50/50 border-t border-slate-200 px-6 py-3 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800">
                    <strong>Warning:</strong> Changing a user's role takes immediate effect. QA Admins have global read/write access to all departments. Managers can approve SOPs within their assigned department.
                </p>
            </div>
        </div>
    )
}
