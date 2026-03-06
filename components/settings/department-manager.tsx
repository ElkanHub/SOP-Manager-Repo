'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Plus, Building2, Save, Trash2, Pencil } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Department {
    id: string
    name: string
    slug: string
    is_qa: boolean
    created_at: string
}

export function DepartmentManager() {
    const [departments, setDepartments] = useState<Department[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [editQa, setEditQa] = useState(false)

    // Add Form State
    const [addName, setAddName] = useState('')
    const [addQa, setAddQa] = useState(false)
    const [addLoading, setAddLoading] = useState(false)

    const supabase = createClient()

    const fetchDepartments = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('departments')
            .select('*')
            .order('name')

        if (data) {
            setDepartments(data.map(d => ({
                id: d.id,
                name: d.name,
                slug: d.slug,
                is_qa: d.is_qa || false,
                created_at: d.created_at || new Date().toISOString()
            })))
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchDepartments()
    }, [])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        setAddLoading(true)
        try {
            // Generate slug
            const slug = addName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

            const { error } = await supabase
                .from('departments')
                .insert({ name: addName, slug, is_qa: addQa })

            if (error) throw error

            toast.success('Department created')
            setIsAddOpen(false)
            setAddName('')
            setAddQa(false)
            fetchDepartments()
        } catch (err: any) {
            toast.error(err.message || 'Failed to create department')
        } finally {
            setAddLoading(false)
        }
    }

    const startEdit = (dept: Department) => {
        setEditingId(dept.id)
        setEditName(dept.name)
        setEditQa(dept.is_qa)
    }

    const saveEdit = async (id: string) => {
        try {
            const slug = editName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
            const { error } = await supabase
                .from('departments')
                .update({ name: editName, slug, is_qa: editQa })
                .eq('id', id)

            if (error) throw error
            toast.success('Department updated')
            setEditingId(null)
            fetchDepartments()
        } catch (err: any) {
            toast.error('Failed to update: ' + err.message)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete the ${name} department? This will fail if users or SOPs are attached.`)) return

        try {
            const { error } = await supabase.from('departments').delete().eq('id', id)
            if (error) throw error
            toast.success('Department deleted')
            fetchDepartments()
        } catch (err: any) {
            toast.error('Cannot delete: Department is likely in use.')
        }
    }

    if (loading) return (
        <div className="flex h-32 items-center justify-center bg-white rounded-xl border border-slate-200">
            <Loader2 className="h-6 w-6 animate-spin text-brand-teal" />
        </div>
    )

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-brand-navy">Departments Manager</h2>
                    <p className="text-sm text-slate-500">Add or modify company departments.</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-brand-teal hover:bg-teal-700 text-white">
                            <Plus className="h-4 w-4 mr-2" /> Add Department
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Department</DialogTitle>
                            <DialogDescription>
                                Add a new organizational unit. A unique slug will be generated automatically.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAdd} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="dept-name">Department Name</Label>
                                <Input
                                    id="dept-name"
                                    value={addName}
                                    onChange={e => setAddName(e.target.value)}
                                    placeholder="e.g. Manufacturing"
                                    required
                                />
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox
                                    id="is-qa"
                                    checked={addQa}
                                    onCheckedChange={(c) => setAddQa(c as boolean)}
                                />
                                <Label htmlFor="is-qa" className="cursor-pointer">
                                    This is a Quality Assurance (QA) department
                                </Label>
                            </div>
                            <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={addLoading} className="bg-brand-navy hover:bg-brand-navy/90">
                                    {addLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Create Department
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Department Name</th>
                            <th className="px-6 py-3 font-semibold">Slug</th>
                            <th className="px-6 py-3 font-semibold text-center">Is QA</th>
                            <th className="px-6 py-3 font-semibold">Created</th>
                            <th className="px-6 py-3 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {departments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                    <Building2 className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                                    No departments found.
                                </td>
                            </tr>
                        ) : departments.map(dept => (
                            <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    {editingId === dept.id ? (
                                        <Input
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            className="h-8 w-48"
                                            autoFocus
                                        />
                                    ) : (
                                        dept.name
                                    )}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                    {dept.slug}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {editingId === dept.id ? (
                                        <Checkbox
                                            checked={editQa}
                                            onCheckedChange={(c) => setEditQa(c as boolean)}
                                        />
                                    ) : (
                                        dept.is_qa ? (
                                            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                                QA Role
                                            </span>
                                        ) : (
                                            <span className="text-slate-300">-</span>
                                        )
                                    )}
                                </td>
                                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                    {format(new Date(dept.created_at), 'MMM d, yyyy')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {editingId === dept.id ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="h-8 text-xs text-slate-500">Cancel</Button>
                                            <Button size="sm" onClick={() => saveEdit(dept.id)} className="h-8 text-xs bg-brand-teal text-white hover:bg-teal-700">Save</Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => startEdit(dept)} className="h-8 w-8 text-slate-400 hover:text-brand-navy" aria-label={`Edit ${dept.name} department`}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(dept.id, dept.name)} className="h-8 w-8 text-slate-400 hover:text-red-600" aria-label={`Delete ${dept.name} department`}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
