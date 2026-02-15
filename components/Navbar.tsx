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
        { name: "Features", href: "/#features" },
        { name: "Pricing", href: "/pricing" },
        { name: "Support", href: "/support" },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300 bg-white/80 backdrop-blur-xl border-b border-slate-100">
                <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 md:px-6">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-primary/10 p-2.5 rounded-xl group-hover:bg-primary/20 transition-colors">
                            <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-2xl font-bold text-slate-900 font-serif tracking-tight">
                            ScorePrepPro
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
                                <Link href={userData?.plan === 'teacher' ? "/teacher-dashboard" : "/dashboard"}>
                                    <Button size="lg" className="rounded-full px-6 bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/10 gap-2">
                                        <UserCircle className="h-4 w-4" />
                                        {userData?.plan === 'teacher' ? 'Teacher Panel' : 'Dashboard'}
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
