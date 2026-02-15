import Link from "next/link";
import { BookOpen, Twitter, Linkedin, Youtube } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-slate-50 pt-20 pb-10 px-4 md:px-6 border-t border-slate-200">
            <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-16">
                <div className="col-span-1 md:col-span-1">
                    <Link href="/" className="flex items-center gap-2 mb-6">
                        <div className="bg-indigo-600 p-1.5 rounded-lg">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900 font-serif">
                            ScorePrepPro
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
