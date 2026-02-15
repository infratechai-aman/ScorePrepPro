"use client";

import { Settings } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center p-8">
            <div className="bg-slate-100 p-6 rounded-full mb-6">
                <Settings className="w-12 h-12 text-slate-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Settings</h1>
            <p className="text-slate-500 max-w-md">
                Manage your account, subscription, and teaching preferences here.
            </p>
            <span className="mt-8 px-4 py-2 bg-slate-200 text-slate-700 rounded-full text-xs font-bold uppercase tracking-wider">
                Coming Soon
            </span>
        </div>
    );
}
