"use client";

import { PaperRepositoryList } from "@/components/dashboard/PaperRepositoryList";

export default function RepositoryPage() {
    return (
        <div className="p-8 h-full flex flex-col">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 font-serif">My Repository</h1>
                <p className="text-slate-500">Manage all your generated question papers and study notes.</p>
            </div>

            <PaperRepositoryList />
        </div>
    );
}
