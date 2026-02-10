
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





export default function PricingPage() {
    const { user, userData, refreshUserData } = useAuth();
    const [processing, setProcessing] = useState<string | null>(null);
    const [billingCycle, setBillingCycle] = useState<"half-yearly" | "yearly">("yearly");
    const router = useRouter();

    const PLANS = [
        {
            id: "free",
            name: "Free Plan",
            price: "₹0",
            amount: 0,
            features: [
                "1 Paper Total",
                "Classes 9th - 10th",
                "View Only (No Download)"
            ],
            missing: [
                "Answer Key Generation",
                "Diagrams & Maps",
                "Standard Support",
                "Blueprint Mode",
                "Teacher Mode"
            ],
            color: "slate",
            popular: false
        },
        {
            id: "basic",
            name: "Basic Plan",
            price: billingCycle === "half-yearly" ? "₹3,000" : "₹5,000",
            amount: billingCycle === "half-yearly" ? 3000 : 5000,
            features: [
                "Unlimited Papers",
                "Classes 7th - 10th",
                "Standard Support",
                "No Watermark"
            ],
            missing: [
                "Answer Key Generation",
                "Blueprint Mode",
                "Classes 11th - 12th",
                "Teacher Mode"
            ],
            color: "blue",
            popular: false
        },
        {
            id: "premium",
            name: "Premium Plan",
            price: billingCycle === "half-yearly" ? "₹3,500" : "₹6,000",
            amount: billingCycle === "half-yearly" ? 3500 : 6000,
            features: [
                "Unlimited Papers",
                "Classes 7th - 12th",
                "Answer Key Generation",
                "Diagram Support",
                "Blueprint Control",
                "Priority Support"
            ],
            missing: ["Teacher Mode"],
            color: "amber",
            popular: true
        },
        {
            id: "teacher",
            name: "Teacher Mode",
            price: billingCycle === "half-yearly" ? "₹4,500" : "₹8,000",
            amount: billingCycle === "half-yearly" ? 4500 : 8000,
            features: [
                "All Premium Features",
                "Custom Subjects (Add up to 3)",
                "Unit & Topic Management",
                "AI Notes Generator (5/unit)",
                "Custom Paper Generator",
                "Flip Question Feature"
            ],
            missing: [],
            color: "purple",
            popular: false
        }
    ];

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

                <div className="flex justify-center mb-8">
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex">
                        <button
                            onClick={() => setBillingCycle("half-yearly")}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === "half-yearly" ? "bg-primary text-white shadow-md" : "text-slate-500 hover:text-slate-800"}`}
                        >
                            6 Months
                        </button>
                        <button
                            onClick={() => setBillingCycle("yearly")}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === "yearly" ? "bg-primary text-white shadow-md" : "text-slate-500 hover:text-slate-800"}`}
                        >
                            Yearly (Best Value)
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 max-w-7xl mx-auto">
                    {PLANS.map((plan) => (
                        <GlassCard key={plan.id} className={`p-6 relative ${plan.id === 'teacher' ? 'border-purple-200 bg-purple-50/30' : plan.id === 'premium' ? 'border-amber-200 bg-amber-50/30' : ''}`}>
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">
                                    Popular
                                </div>
                            )}

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                                    <div className="mt-4 flex items-baseline justify-center">
                                        <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
                                        <span className="text-slate-500 ml-1 text-sm">{plan.id === 'free' ? '' : billingCycle === 'half-yearly' ? '/6mo' : '/yr'}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 text-left">
                                    {plan.features.map((feat) => (
                                        <div key={feat} className="flex items-center gap-3">
                                            <div className={`p-1 rounded-full ${plan.id === 'teacher' ? 'bg-purple-100 text-purple-600' : plan.id === 'premium' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
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
                                    className={`w-full ${plan.id === 'teacher' ? 'bg-purple-600 hover:bg-purple-700' : plan.id === 'premium' ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
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
