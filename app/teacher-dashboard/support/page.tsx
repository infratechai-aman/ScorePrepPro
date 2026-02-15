"use client";

import { HelpCircle } from "lucide-react";

export default function SupportPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center p-8">
            <div className="bg-blue-50 p-6 rounded-full mb-6">
                <HelpCircle className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Help & Support</h1>
            <p className="text-slate-500 max-w-md">
                Need assistance? Our support team is here to help you with any issues or questions.
            </p>
            <span className="mt-8 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                Coming Soon
            </span>
        </div>
    );
}
