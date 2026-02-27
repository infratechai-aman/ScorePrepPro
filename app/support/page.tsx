"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SupportForm } from "@/components/dashboard/SupportForm";

export default function SupportPage() {
    return (
        <main className="min-h-screen bg-slate-50 pt-24 font-sans flex flex-col relative overflow-hidden">
            <Navbar />
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-white opacity-70"></div>

            <div className="flex-grow max-w-6xl mx-auto px-4 md:px-6 w-full space-y-12 pb-24 relative z-10">
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 font-serif tracking-tight">
                        Help & Support
                    </h1>
                    <p className="text-lg text-slate-600">
                        Need assistance? We're here to help you get the most out of ScorePrepPro. Check out our FAQs or send us a message.
                    </p>
                </div>

                <SupportForm />
            </div>
            <Footer />
        </main>
    );
}
