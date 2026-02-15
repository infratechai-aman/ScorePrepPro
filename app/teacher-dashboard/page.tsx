"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { SubjectProgress } from "@/components/dashboard/SubjectProgress";
import { RecentPapers } from "@/components/dashboard/RecentPapers";
import { ActivityGraph } from "@/components/dashboard/ActivityGraph";
import { RightSidebar } from "@/components/dashboard/RightSidebar";

export default function TeacherDashboardPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <DashboardHeader title="Overview" />

            <div className="flex flex-1">
                <main className="flex-1 p-8 space-y-8 overflow-y-auto h-[calc(100vh-80px)]">
                    {/* Welcome Section */}
                    {/* Note: Welcome message is inside Header or can be added here if needed. 
                        Header has breadcrumbs style title, so we can add a persistent welcome here 
                        or minimal header. I'll stick to a clean layout. 
                    */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 font-serif mb-2">Welcome, Teacher!</h1>
                        <p className="text-slate-500">Here is what's happening with your classes today.</p>
                    </div>

                    <StatsCards />

                    <div className="grid xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 space-y-8">
                            <SubjectProgress />
                            <RecentPapers />
                        </div>
                        <div className="xl:col-span-1 border-l border-slate-100 pl-8 -my-2 hidden xl:block">
                            {/* Activity Graph could go here or in main column. 
                                The design shows Activity Graph at bottom left. 
                                I'll put Activity Graph in main column.
                            */}
                        </div>
                    </div>

                    {/* Mobile/Tablet adjustment for layout */}
                    <div className="xl:grid xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-3">
                            <ActivityGraph />
                        </div>
                    </div>
                </main>

                <RightSidebar />
            </div>
        </div>
    );
}
