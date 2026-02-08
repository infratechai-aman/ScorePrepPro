
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Check, X, CreditCard } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Add Razorpay type definition
declare global {
    interface Window {
        Razorpay: any;
    }
}

const PLANS = [
    {
        id: "basic",
        name: "Basic Plan",
        price: "₹499",
        amount: 499,
        period: "/month",
        features: [
            "100 Papers / month",
            "Classes 7th - 10th",
            "Standard Support",
            "No Watermark (Draft)"
        ],
        missing: [
            "Answer Key Generation",
            "Diagrams & Maps",
            "Blueprint Mode",
            "Classes 11th - 12th"
        ],
        color: "blue"
    },
    {
        id: "premium",
        name: "Premium Plan",
        price: "₹699",
        amount: 699,
        period: "/month",
        features: [
            "300 Papers / month",
            "Classes 7th - 12th",
            "Answer Key Generation",
            "Diagram Support",
            "Blueprint Control",
            "Priority Support"
        ],
        missing: [],
        color: "amber"
    }
];

export default function PricingPage() {
    const { user, userData, refreshUserData } = useAuth();
    const [processing, setProcessing] = useState<string | null>(null);
    const router = useRouter();

    const handleUpgrade = async (planId: string, amount: number) => {
        if (!user) {
            router.push("/login?redirect=/pricing");
            return;
        }

        setProcessing(planId);

        try {
            // 1. Create Order
            const response = await fetch("/api/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount }), // Amount in INR
            });

            const order = await response.json();

            if (order.error) {
                alert("Error creating order: " + order.error);
                setProcessing(null);
                return;
            }

            // 2. Load Razorpay Script
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: order.amount,
                    currency: order.currency,
                    name: "ScorePrepPro",
                    description: `${planId === 'premium' ? 'Premium' : 'Basic'} Plan Subscription`,
                    order_id: order.id,
                    handler: async function (response: any) {
                        // 3. Verify Payment
                        const verifyResponse = await fetch("/api/verify-payment", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyResult = await verifyResponse.json();

                        if (verifyResult.status === "success") {
                            // 4. Update User Plan in Firestore
                            if (userData?.uid && db) {
                                const userRef = doc(db, "users", userData.uid);
                                await updateDoc(userRef, {
                                    plan: planId as "basic" | "premium",
                                    planExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000 // +30 days
                                });
                                await refreshUserData();
                                alert(`Upgrade Successful! You are now on the ${planId} plan.`);
                                router.push("/dashboard");
                            }
                        } else {
                            alert("Payment Verification Failed");
                        }
                    },
                    prefill: {
                        name: userData?.name || "",
                        email: userData?.email || "",
                        contact: ""
                    },
                    theme: {
                        color: "#3B82F6"
                    }
                };
                const rzp1 = new window.Razorpay(options);
                rzp1.open();
                setProcessing(null);
            };

            script.onerror = () => {
                alert("Razorpay SDK failed to load. Are you online?");
                setProcessing(null);
            };

        } catch (error) {
            console.error("Payment failed:", error);
            alert("Payment initialization failed");
            setProcessing(null);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 pb-20 pt-24 px-4 md:px-6">
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-white opacity-70"></div>

            <div className="max-w-5xl mx-auto space-y-12 text-center">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold font-serif text-slate-900">Choose Your Plan</h1>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Unlock the full power of AI paper generation. Start with Basic or go Premium for advanced features.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {PLANS.map((plan) => (
                        <GlassCard key={plan.id} className={`p-8 relative ${plan.id === 'premium' ? 'border-amber-200 bg-amber-50/30' : ''}`}>
                            {plan.id === 'premium' && (
                                <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                                    Recommended
                                </div>
                            )}

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                                    <div className="mt-4 flex items-baseline justify-center">
                                        <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                                        <span className="text-slate-500 ml-1">{plan.period}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 text-left">
                                    {plan.features.map((feat) => (
                                        <div key={feat} className="flex items-center gap-3">
                                            <div className={`p-1 rounded-full ${plan.id === 'premium' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                                <Check className="h-3 w-3" />
                                            </div>
                                            <span className="text-slate-700">{feat}</span>
                                        </div>
                                    ))}
                                    {plan.missing.map((feat) => (
                                        <div key={feat} className="flex items-center gap-3 opacity-50">
                                            <div className="p-1 rounded-full bg-slate-100 text-slate-400">
                                                <X className="h-3 w-3" />
                                            </div>
                                            <span className="text-slate-500">{feat}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    className={`w-full ${plan.id === 'premium' ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                                    size="lg"
                                    isLoading={processing === plan.id}
                                    onClick={() => handleUpgrade(plan.id, plan.amount)}
                                    disabled={userData?.plan === plan.id}
                                >
                                    {userData?.plan === plan.id ? "Current Plan" : (
                                        <>
                                            <CreditCard className="mr-2 h-4 w-4" /> Upgrade to {plan.name}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </main>
    );
}
