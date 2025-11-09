'use server';

import { initializeApp, getApps, getApp, ServiceAccount, cert } from 'firebase-admin/app';
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

let db: Firestore;
let dbInitializationError: Error | null = null;

function initializeDb() {
    // Prevent re-initialization if already done or if it failed previously.
    if (db || dbInitializationError) {
        return;
    }

    try {
        if (getApps().length === 0) {
            const serviceAccount = getServiceAccount();
            const options = serviceAccount 
                ? { credential: cert(serviceAccount) } 
                : {}; // For deployed environments, the SDK will auto-discover credentials.
            
            // If running locally without a service account, this will throw an error.
            const adminApp = initializeApp(options);
            db = getFirestore(adminApp);
        } else {
            db = getFirestore(getApp());
        }
    } catch (error: any) {
        console.error("CRITICAL: Failed to initialize Firebase Admin SDK.", error.message);
        dbInitializationError = error;
    }
}

// Initialize the database connection when the module is first loaded.
initializeDb();

// Export a function that returns the initialized database instance.
export async function getDb(): Promise<Firestore> {
    if (dbInitializationError) {
        throw new Error(`Firebase Admin SDK is not initialized. Reason: ${dbInitializationError.message}`);
    }
    if (!db) {
         throw new Error("Firebase Admin SDK could not be initialized. The 'db' instance is not available. This might happen if running locally without credentials.");
    }
    return db;
}