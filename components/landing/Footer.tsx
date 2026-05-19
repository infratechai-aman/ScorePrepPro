import Link from "next/link";
import { Twitter, Linkedin, Youtube } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-slate-50 pt-20 pb-10 px-4 md:px-6 border-t border-slate-200">
            <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-16">
                <div className="col-span-1 md:col-span-1">
                    <Link href="/" className="flex items-center gap-2.5 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 flex items-center justify-center shadow-md">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 19.5C4 19.5 5 18.5 8 18.5C11 18.5 13 20.5 16 20.5C19 20.5 20 19.5 20 19.5V3.5C20 3.5 19 4.5 16 4.5C13 4.5 11 2.5 8 2.5C5 2.5 4 3.5 4 3.5V19.5Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M9 8L11 10L15 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M9 13H15" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Score<span className="text-indigo-600">Prep</span>Pro
                        </span>
                    </Link>
                    <p className="text-slate-500 text-sm mb-6">
                        Empowering Indian educators with AI-driven tools for better questions, faster results, and smarter assessments.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="text-slate-400 hover:text-indigo-600"><Twitter className="w-5 h-5" /></a>
                        <a href="#" className="text-slate-400 hover:text-indigo-600"><Linkedin className="w-5 h-5" /></a>
                        <a href="#" className="text-slate-400 hover:text-indigo-600"><Youtube className="w-5 h-5" /></a>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-wider">Platform</h4>
                    <ul className="space-y-4 text-sm text-slate-500">
                        <li><Link href="#" className="hover:text-indigo-600">Paper Generator</Link></li>
                        <li><Link href="#" className="hover:text-indigo-600">AI Tutor</Link></li>
                        <li><Link href="#" className="hover:text-indigo-600">Syllabus Explorer</Link></li>
                        <li><Link href="#" className="hover:text-indigo-600">Pricing</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-wider">Support</h4>
                    <ul className="space-y-4 text-sm text-slate-500">
                        <li><Link href="#" className="hover:text-indigo-600">Help Center</Link></li>
                        <li><Link href="#" className="hover:text-indigo-600">Video Tutorials</Link></li>
                        <li><Link href="#" className="hover:text-indigo-600">Contact Support</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-wider">Legal</h4>
                    <ul className="space-y-4 text-sm text-slate-500">
                        <li><Link href="#" className="hover:text-indigo-600">Privacy Policy</Link></li>
                        <li><Link href="#" className="hover:text-indigo-600">Terms of Service</Link></li>
                        <li><Link href="#" className="hover:text-indigo-600">Cookie Policy</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 text-center text-sm text-slate-400">
                <p>© {new Date().getFullYear()} ScorePrepPro. All rights reserved. Built for the Modern Indian Classroom.</p>
            </div>
        </footer>
    );
}
