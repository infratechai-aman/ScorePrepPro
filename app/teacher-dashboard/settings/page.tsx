"use client";

import { SettingsForm } from "@/components/dashboard/SettingsForm";

export default function SettingsPage() {
    return (
        <div className="p-8 h-full overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 font-serif">Account Settings</h1>
                <p className="text-slate-500">Manage your profile, subscription, and app preferences.</p>
            </div>

            <SettingsForm />
        </div>
    );
}
