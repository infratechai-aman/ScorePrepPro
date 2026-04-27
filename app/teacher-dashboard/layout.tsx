import { Sidebar } from "@/components/dashboard/Sidebar";

export default function TeacherDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen bg-slate-50 font-sans flex overflow-hidden print:bg-white">
            <Sidebar />
            <div className="flex-1 ml-64 overflow-y-auto print:ml-0 print:p-0">
                {children}
            </div>
        </div>
    );
}
