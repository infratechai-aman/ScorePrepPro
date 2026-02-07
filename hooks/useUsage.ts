
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { doc, increment, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";

export function useUsage() {
    const { userData, refreshUserData } = useAuth();
    const [loading, setLoading] = useState(false);

    const PLAN_LIMITS = {
        basic: { papers: 100, keys: 0 }, // 0 keys = not allowed
        premium: { papers: 300, keys: 300 }
    };

    const getLimit = () => {
        if (!userData) return { papers: 1, keys: 0 }; // Free preview
        return PLAN_LIMITS[userData.plan] || PLAN_LIMITS.basic;
    };

    const checkLimit = (type: "paper" | "key") => {
        if (!userData) {
            // Logic for free preview (e.g., check local storage)
            return true; // Allowing 1 free generation via generic check for now
        }

        const limits = getLimit();
        if (type === "paper") {
            return userData.papersGenerated < limits.papers;
        }
        if (type === "key") {
            return limits.keys > 0 && userData.keysGenerated < limits.keys;
        }
        return false;
    };

    const incrementUsage = async (type: "paper" | "key") => {
        if (!userData) return; // Free preview logic handled separately or strictly frontend
        setLoading(true);
        try {
            const userRef = doc(db, "users", userData.uid);
            await updateDoc(userRef, {
                [type === "paper" ? "papersGenerated" : "keysGenerated"]: increment(1)
            });
            await refreshUserData();
        } catch (error) {
            console.error("Failed to update usage:", error);
        } finally {
            setLoading(false);
        }
    };

    const limits = getLimit();
    const usage = userData ? { papers: userData.papersGenerated, keys: userData.keysGenerated } : { papers: 0, keys: 0 };

    return {
        checkLimit,
        incrementUsage,
        loading,
        limits,
        usage,
        canGenerateKey: userData?.plan === "premium"
    };
}
