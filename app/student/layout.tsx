"use client";
import { Navbar } from "@/components/Navbar";
export default function StudentLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />
            <div className="pt-20">{children}</div>
        </div>
    );
}
