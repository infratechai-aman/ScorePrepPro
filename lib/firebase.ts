
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


// Initialize Firebase
const getFirebaseApp = () => {
    if (!getApps().length) {
        // If config is missing, return dummy or throw clear error
        if (!firebaseConfig.apiKey) {
            console.warn("Firebase not configured: Missing NEXT_PUBLIC_FIREBASE_API_KEY");
            // During build time, this might happen. Return a dummy app or handle gracefully.
            // However, getAuth() will fail if app is invalid.
            // If running on server/build and no keys, we can't really init.

            // Check if we are in browser
            if (typeof window === 'undefined') {
                return null;
            }
            // Client side without keys? This is bad.
            throw new Error("Missing Firebase API Key");
        }
        return initializeApp(firebaseConfig);
    }
    return getApp();
};

const app = getFirebaseApp();

// Exports need to handle null app
// But AuthContext expects robust auth.
// Let's actually keep it simple: if API key is missing, don't crash immediately unless used.

// Better approach for build safety:
// If API key is missing, init with empty config IF valid? No.
// Let's initialize conditionally.

let auth: any;
let db: any;
let googleProvider: any;

if (app) {
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
} else {
    // Mock for build time
    auth = {} as any;
    db = {} as any;
    googleProvider = {} as any;
}

export { auth, db, googleProvider };
