"use client";

import { Navbar } from "@/components/Navbar";
import { Features } from "@/components/landing/Features";
import { Workflow } from "@/components/landing/Workflow";
import { Footer } from "@/components/landing/Footer";

export default function FeaturesPage() {
    return (
        <main className="min-h-screen bg-slate-50 overflow-x-hidden font-sans pt-20 flex flex-col">
            <Navbar />
            <div className="flex-grow">
                <div className="bg-white pt-16 pb-8 border-b border-slate-100">
                    <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 font-serif tracking-tight mb-6">
                            Powerful Features for Modern Teachers
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Everything you need to create top-quality board question papers in minutes, not hours.
                        </p>
                    </div>
                </div>
                <Features />
                <Workflow />
            </div>
            <Footer />
        </main>
    );
}
