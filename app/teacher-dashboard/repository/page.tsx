"use client";

import { FolderOpen } from "lucide-react";

export default function RepositoryPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center p-8">
            <div className="bg-indigo-50 p-6 rounded-full mb-6">
                <FolderOpen className="w-12 h-12 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Paper Repository</h1>
            <p className="text-slate-500 max-w-md">
                Your vault of generated papers and answer keys will appear here.
                We are currently enhancing the storage system.
            </p>
            <span className="mt-8 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
                Coming Soon
            </span>
        </div>
    );
}
