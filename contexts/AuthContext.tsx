
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

type UserRole = "student" | "teacher" | "coaching";
type PlanType = "basic" | "premium";

interface UserData {
    uid: string;
    email: string | null;
    name: string | null;
    role: UserRole;
    plan: PlanType;
    planExpiry: number | null; // Timestamp
    papersGenerated: number;
    keysGenerated: number;
    generationMonth: string; // YYYY-MM to track monthly quota
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    // Helper to fetch user data from Firestore
    const fetchUserData = async (uid: string) => {
        if (!db) return; // Guard clause for missing DB

        try {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                setUserData(userSnap.data() as UserData);
            } else {
                // If user document doesn't exist (e.g. first Google login), create it
                const newUserData: UserData = {
                    uid,
                    email: auth?.currentUser?.email || null,
                    name: auth?.currentUser?.displayName || null,
                    role: "student", // Default role
                    plan: "basic",
                    planExpiry: null,
                    papersGenerated: 0,
                    keysGenerated: 0,
                    generationMonth: new Date().toISOString().slice(0, 7) // Current YYYY-MM
                };
                await setDoc(userRef, newUserData);
                setUserData(newUserData);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    useEffect(() => {
        if (!auth) {
            console.warn("Auth not initialized, skipping auth listener");
            setLoading(false);
            return;
        }

        try {
            const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                setUser(currentUser);
                if (currentUser) {
                    await fetchUserData(currentUser.uid);
                } else {
                    setUserData(null);
                }
                setLoading(false);
            });
            return () => unsubscribe();
        } catch (error) {
            console.error("Error setting up auth listener:", error);
            setLoading(false);
        }
    }, []);

    const loginWithGoogle = async () => {
        if (!auth) {
            alert("Authentication is not configured. Please add Firebase keys.");
            return;
        }
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Google Login Error:", error);
            throw error;
        }
    };

    const logout = async () => {
        if (!auth) return;
        await signOut(auth);
    };

    const refreshUserData = async () => {
        if (user) await fetchUserData(user.uid);
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, loginWithGoogle, logout, refreshUserData }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
