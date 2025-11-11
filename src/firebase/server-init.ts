
'use server';

import { initializeApp, getApps, getApp, ServiceAccount, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This function is carefully designed to work in both local and deployed environments.
function getServiceAccount(): ServiceAccount | undefined {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    // In a deployed environment (like App Hosting), the service account is often
    // discovered automatically and this environment variable may not be set.
    // If it's missing, we let the SDK try to find default credentials.
    if (!serviceAccountJson) {
        console.log("FIREBASE_SERVICE_ACCOUNT env var not found. Relying on default credentials.");
        return undefined;
    }

    try {
        const parsed = JSON.parse(serviceAccountJson);
        // The error "Service account object must contain a string 'project_id' property"
        // indicates that the parsed JSON is not a valid Service Account object.
        // We add a check to ensure the essential properties exist.
        if (parsed.project_id && parsed.client_email && parsed.private_key) {
            return parsed as ServiceAccount;
        }
        console.error("Parsed FIREBASE_SERVICE_ACCOUNT JSON is not a valid service account object.");
        throw new Error("Invalid service account JSON.");
    } catch (e: any) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", e.message);
        throw new Error("Could not parse FIREBASE_SERVICE_ACCOUNT JSON.");
    }
}

function initializeAdminApp(): App {
    // If an app is already initialized, return it to prevent re-initialization.
    if (getApps().length > 0) {
        return getApp();
    }

    const serviceAccount = getServiceAccount();
    const options = serviceAccount 
        ? { credential: cert(serviceAccount) } 
        : {}; // For deployed environments, the SDK will auto-discover credentials.
    
    // If running locally without a service account, this will throw an error.
    return initializeApp(options);
}


let db: Firestore;

// Export a function that returns the initialized database instance.
// This new pattern ensures initialization happens reliably.
export async function getDb(): Promise<Firestore> {
    if (!db) {
        try {
            const adminApp = initializeAdminApp();
            db = getFirestore(adminApp);
        } catch (error: any) {
            console.error("CRITICAL: Failed to initialize Firebase Admin SDK.", error.message);
            // This throw will be caught by the server action and result in a 500 error,
            // but with a clear server-side log of what went wrong.
            throw new Error(`Firebase Admin SDK is not initialized. Reason: ${error.message}`);
        }
    }
    return db;
}
