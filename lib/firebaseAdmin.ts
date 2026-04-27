import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App;

if (!getApps().length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccount) {
        // Use service account credentials
        const parsed = JSON.parse(serviceAccount);
        adminApp = initializeApp({
            credential: cert(parsed),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
    } else {
        // Fallback for local dev — will only work with Application Default Credentials
        adminApp = initializeApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
    }
} else {
    adminApp = getApps()[0];
}

const adminDb = getFirestore(adminApp);

export { adminDb };
