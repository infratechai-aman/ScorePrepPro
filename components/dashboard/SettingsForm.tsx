"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useUsage } from "@/hooks/useUsage";
import { User, Mail, Shield, Bell, Moon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function SettingsForm() {
    const { user, userData, logout } = useAuth();
    const { usage, limits } = useUsage();

    return (
        <div className="max-w-4xl space-y-8">
            {/* Profile Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" /> Profile Details
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700">
                            <User className="w-4 h-4 text-slate-400" />
                            {userData?.name || "User"}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700">
                            <Mail className="w-4 h-4 text-slate-400" />
                            {user?.email}
                        </div>
                    </div>
                </div>
            </div>

            {/* Subscription & Usage */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" /> Subscription & Usage
                </h3>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                        <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Current Plan</p>
                        <div className="flex justify-between items-end mb-4">
                            <h4 className="text-3xl font-bold text-slate-900 capitalize">{userData?.plan || 'Free'}</h4>
                            <span className="text-xs bg-white px-2 py-1 rounded text-purple-600 font-bold border border-purple-100">Active</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">Your plan renews on Dec 31, 2026.</p>
                        <Button variant="outline" className="w-full bg-white hover:bg-purple-50 text-purple-700 border-purple-200">Manage Subscription</Button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium text-slate-600">Papers Generated</span>
                                <span className="font-bold text-slate-900">{usage.papers} / {limits.papers === Infinity ? '∞' : limits.papers}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min((usage.papers / (limits.papers || 100)) * 100, 100)}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium text-slate-600">Storage Used</span>
                                <span className="font-bold text-slate-900">45%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-orange-600" /> Preferences
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                <Bell className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">Email Notifications</h4>
                                <p className="text-xs text-slate-500">Receive updates about new features and exam patterns.</p>
                            </div>
                        </div>
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-200 rounded-lg text-slate-600">
                                <Moon className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">Dark Mode</h4>
                                <p className="text-xs text-slate-500">Switch to dark theme (Coming Soon).</p>
                            </div>
                        </div>
                        <div className="relative inline-flex items-center cursor-not-allowed opacity-60">
                            <input type="checkbox" className="sr-only peer" disabled />
                            <div className="w-11 h-6 bg-slate-200 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button onClick={logout} variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 gap-2">
                    <LogOut className="w-4 h-4" /> Sign Out
                </Button>
            </div>
        </div>
    );
}
