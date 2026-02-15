"use client";

import { SupportForm } from "@/components/dashboard/SupportForm";

export default function SupportPage() {
    return (
        <div className="p-8 h-full overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 font-serif">Help & Support</h1>
                <p className="text-slate-500">Find answers to common questions or reach out to our team.</p>
            </div>

            <SupportForm />
        </div>
    );
}
