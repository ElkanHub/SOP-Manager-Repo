export default function DashboardPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-brand-navy">Dashboard</h2>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-8 text-center">
                <h3 className="text-xl font-semibold text-brand-navy mb-2">Welcome to SOP-Guard Pro</h3>
                <p className="text-slate-500">The application shell and layout architecture is now active.</p>
            </div>
        </div>
    )
}
