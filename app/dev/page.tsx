
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";

export default function DevUpgradePage() {
    const { user, userData, refreshUserData } = useAuth();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [pin, setPin] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkPin = () => {
        if (pin === "1234") {
            setIsAuthenticated(true);
        } else {
            alert("Incorrect PIN");
            setPin("");
        }
    };

    const upgradePlan = async (plan: "free" | "basic" | "premium" | "teacher") => {
        if (!user) {
            alert("Please login first!");
            router.push("/login");
            return;
        }

        setLoading(true);
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                plan: plan,
                planExpiry: plan === "free" ? null : Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
            });
            await refreshUserData();
            alert(`Success! Plan updated to ${plan.toUpperCase()}`);
        } catch (error) {
            console.error("Error updating plan:", error);
            alert("Failed to update plan via client-side. Check console.");
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <GlassCard className="max-w-sm w-full p-8 space-y-6 border-red-200 bg-red-50/50">
                    <div className="text-center">
                        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-red-900">Restricted Access</h1>
                        <p className="text-red-700 text-sm mt-2">Enter Developer PIN to continue.</p>
                    </div>
                    <input
                        type="password"
                        className="w-full p-3 rounded-lg border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-center text-2xl tracking-widest"
                        placeholder="••••"
                        maxLength={4}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                    />
                    <Button onClick={checkPin} className="w-full bg-red-600 hover:bg-red-700">Unlock</Button>
                </GlassCard>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <GlassCard className="max-w-md w-full p-8 space-y-6 border-amber-200 bg-amber-50/50">
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-6 w-6 text-amber-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-amber-900">Developer Tools</h1>
                    <p className="text-amber-700 text-sm mt-2">Force upgrade accounts for testing.</p>
                </div>

                <div className="bg-white/50 p-4 rounded-lg text-sm text-slate-700">
                    <p><strong>Current User:</strong> {user?.email || "Not Logged In"}</p>
                    <p><strong>Current Plan:</strong> <span className="font-bold uppercase text-primary">{userData?.plan || "-"}</span></p>
                </div>

                <div className="space-y-3">
                    <Button
                        onClick={() => upgradePlan("teacher")}
                        isLoading={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                        Force Upgrade to TEACHER
                    </Button>

                    <Button
                        onClick={() => upgradePlan("premium")}
                        isLoading={loading}
                        className="w-full bg-amber-500 hover:bg-amber-600 border-none"
                    >
                        Force Upgrade to PREMIUM
                    </Button>

                    <Button
                        onClick={() => upgradePlan("free")}
                        isLoading={loading}
                        variant="outline"
                        className="w-full border-slate-300 text-slate-600"
                    >
                        Reset to FREE
                    </Button>
                </div>

                <Button variant="ghost" className="w-full" onClick={() => router.push("/dashboard")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
            </GlassCard>
        </main>
    );
}
