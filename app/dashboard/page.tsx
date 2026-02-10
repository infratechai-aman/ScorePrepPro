
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useUsage } from "@/hooks/useUsage";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Crown, FileText, Key, TrendingUp, LogOut, Clock, ChevronRight, Eye } from "lucide-react";
import { collection, query, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function DashboardPage() {
    const { user, userData, logout, loading } = useAuth();
    const { usage, limits } = useUsage();
    const router = useRouter();
    const [recentPapers, setRecentPapers] = useState<any[]>([]);
    const [viewPaper, setViewPaper] = useState<any | null>(null); // For modal

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (user) {
            // Fetch History
            const fetchHistory = async () => {
                try {
                    const q = query(
                        collection(db, "users", user.uid, "papers"),
                        orderBy("createdAt", "desc"),
                        limit(5)
                    );
                    const querySnapshot = await getDocs(q);
                    const papers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setRecentPapers(papers);
                } catch (error) {
                    console.error("Error fetching history:", error);
                }
            };
            fetchHistory();
        }
    }, [user, loading, router]);

    if (loading || !userData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const paperPercentage = Math.min((usage.papers / (limits.papers || 1)) * 100, 100);
    const keyPercentage = limits.keys > 0 ? Math.min((usage.keys / limits.keys) * 100, 100) : 0;

    return (
        <main className="min-h-screen bg-slate-50 pb-20 pt-24 px-4 md:px-6">
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-white opacity-70"></div>

            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-slate-900">Dashboard</h1>
                        <p className="text-slate-600">Welcome back, <span className="font-semibold text-primary">{userData.name}</span></p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => router.push("/")}>
                            Create New Paper
                        </Button>
                        <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={async () => { await logout(); router.push("/login"); }}>
                            <LogOut className="mr-2 h-4 w-4" /> Sign Out
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Plan Info */}
                    <GlassCard className="p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Crown className="h-24 w-24 text-primary" />
                        </div>
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl ${userData.plan === 'premium' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                    <Crown className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Current Plan</p>
                                    <h3 className="text-xl font-bold text-slate-900 capitalize">{userData.plan === 'basic' ? 'Free' : userData.plan} Plan</h3>
                                </div>
                            </div>

                            {userData.plan === 'basic' && (
                                <Button className="w-full" onClick={() => router.push("/pricing")}>
                                    Upgrade to Premium
                                </Button>
                            )}
                        </div>
                    </GlassCard>

                    {/* Paper Quota */}
                    <GlassCard className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Papers Generated</p>
                                    <h3 className="text-xl font-bold text-slate-900">{usage.papers} / {limits.papers}</h3>
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${paperPercentage}%` }}></div>
                            </div>
                            <p className="text-xs text-slate-400">Resets next month</p>
                        </div>
                    </GlassCard>

                    {/* Key Quota */}
                    <GlassCard className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                    <Key className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Answer Keys</p>
                                    <h3 className="text-xl font-bold text-slate-900">
                                        {userData.plan === 'basic' ? "Not Included" : `${usage.keys} / ${limits.keys}`}
                                    </h3>
                                </div>
                            </div>
                            {userData.plan === 'premium' && (
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${keyPercentage}%` }}></div>
                                </div>
                            )}
                            {userData.plan === 'basic' && (
                                <p className="text-xs text-red-400">Upgrade to unlock answer keys</p>
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* Recent Activity Placeholder */}
                <div className="pt-4">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Activity</h2>

                    {recentPapers.length > 0 ? (
                        <div className="grid gap-4">
                            {recentPapers.map((paper) => (
                                <GlassCard key={paper.id} className="p-4 flex items-center justify-between group hover:border-primary/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">{paper.subject} - Class {paper.grade}</h4>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {paper.createdAt?.seconds ? new Date(paper.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</span>
                                                <span>•</span>
                                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium capitalize">{paper.difficulty}</span>
                                                <span>•</span>
                                                <span>{paper.totalMarks} Marks</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => setViewPaper(paper)}>
                                        <Eye className="mr-2 h-4 w-4" /> View
                                    </Button>
                                </GlassCard>
                            ))}
                        </div>
                    ) : (
                        <GlassCard className="p-8 text-center text-slate-500 italic">
                            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                            No recent papers found. Start generating to see history here.
                        </GlassCard>
                    )}
                </div>

                {/* View Paper Modal */}
                {viewPaper && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setViewPaper(null)}>
                        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                            <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{viewPaper.subject} - Class {viewPaper.grade}</h3>
                                    <p className="text-xs text-slate-500">Generated on {viewPaper.createdAt?.seconds ? new Date(viewPaper.createdAt.seconds * 1000).toLocaleString() : 'Just now'}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setViewPaper(null)}>Close</Button>
                            </div>
                            <div className="p-8 prose prose-slate max-w-none">
                                <ReactMarkdown>{viewPaper.content}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}
