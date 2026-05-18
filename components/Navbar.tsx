"use client";

import { BookOpen, UserCircle, Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
    const { user, userData, loading } = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Features", href: "/features" },
        { name: "Pricing", href: "/pricing" },
        { name: "Support", href: "/support" },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300 bg-white/80 backdrop-blur-xl border-b border-slate-100">
                <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 md:px-6">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-200/50 transition-transform duration-300 group-hover:scale-105">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 19.5C4 19.5 5 18.5 8 18.5C11 18.5 13 20.5 16 20.5C19 20.5 20 19.5 20 19.5V3.5C20 3.5 19 4.5 16 4.5C13 4.5 11 2.5 8 2.5C5 2.5 4 3.5 4 3.5V19.5Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M4 19.5C4 19.5 5 18.5 8 18.5C11 18.5 13 20.5 16 20.5C19 20.5 20 19.5 20 19.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M9 8L11 10L15 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M9 13H15" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Score<span className="text-indigo-600">Prep</span>Pro
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1 bg-slate-50/50 p-1.5 rounded-full border border-slate-100">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${pathname === link.href
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Auth / CTA */}
                    <div className="hidden md:flex items-center gap-4">
                        {!loading && (
                            user ? (
                                <Link href={(userData?.plan === 'teacher' || userData?.plan === 'premium' || userData?.plan === 'the_teacher') ? "/teacher-dashboard" : userData?.role === 'student' ? "/student" : "/dashboard"}>
                                    <Button size="lg" className="rounded-full px-6 bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/10 gap-2">
                                        <UserCircle className="h-4 w-4" />
                                        {userData?.plan === 'the_teacher' ? 'THE TEACHER' : userData?.plan === 'teacher' ? 'Teacher Panel' : userData?.plan === 'premium' ? 'Premium Panel' : userData?.role === 'student' ? 'Student Panel' : 'Dashboard'}
                                    </Button>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
                                        Teacher Login
                                    </Link>
                                    <Link href="/signup">
                                        <Button size="lg" className="rounded-full px-6 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25">
                                            Get Started
                                        </Button>
                                    </Link>
                                </div>
                            )
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-600"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-x-0 top-20 bg-white border-b border-slate-100 p-6 flex flex-col gap-4 shadow-xl z-40 md:hidden"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-lg font-medium text-slate-600 py-2 border-b border-slate-50"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="pt-4 flex flex-col gap-3">
                            <Link href="/login">
                                <Button variant="outline" className="w-full justify-center rounded-xl py-6">Login</Button>
                            </Link>
                            <Link href="/signup">
                                <Button className="w-full justify-center rounded-xl py-6 shadow-lg shadow-primary/20">Get Started Free</Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
