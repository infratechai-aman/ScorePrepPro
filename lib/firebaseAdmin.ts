import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App;

if (!getApps().length) {
    // Initialize with project ID only (uses Application Default Credentials in production,
    // or falls back to project ID matching for environments like Vercel)
    adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
} else {
    adminApp = getApps()[0];
}

const adminDb = getFirestore(adminApp);

export { adminDb };
