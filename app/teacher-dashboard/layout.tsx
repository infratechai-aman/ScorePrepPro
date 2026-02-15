import { Sidebar } from "@/components/dashboard/Sidebar";

export default function TeacherDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans flex">
            <Sidebar />
            <div className="flex-1 ml-64">
                {children}
            </div>
        </div>
    );
}
