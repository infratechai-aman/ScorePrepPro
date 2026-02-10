"use client";

import { BookOpen, UserCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

export function Navbar() {
    const { user, userData, loading } = useAuth();
    const pathname = usePathname();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/40 bg-white/60 backdrop-blur-xl">
            <div className="container mx-auto h-full flex items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 font-serif">
                        ScorePrepPro
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link href="/" className={`text-sm font-medium transition-colors ${pathname === '/' ? 'text-primary font-semibold' : 'text-slate-600 hover:text-primary'}`}>
                        Home
                    </Link>
                    <Link href="/generate" className={`text-sm font-medium transition-colors ${pathname === '/generate' ? 'text-primary font-semibold' : 'text-slate-600 hover:text-primary'}`}>
                        Generator
                    </Link>
                    <Link href="/pricing" className={`text-sm font-medium transition-colors ${pathname === '/pricing' ? 'text-primary font-semibold' : 'text-slate-600 hover:text-primary'}`}>
                        Pricing
                    </Link>

                    {!loading && (
                        user ? (
                            <Link href={userData?.plan === 'teacher' ? "/teacher-dashboard" : "/dashboard"}>
                                <Button size="sm" variant="outline" className="gap-2">
                                    <UserCircle className="h-4 w-4" /> {userData?.plan === 'teacher' ? 'Teacher Panel' : 'Dashboard'}
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login">
                                <Button size="sm" variant="primary">
                                    Login / Sign Up
                                </Button>
                            </Link>
                        )
                    )}
                </div>
            </div>
        </nav>
    );
}
