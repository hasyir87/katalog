
'use server';

import { initializeApp, getApps, getApp, cert, App, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let db: Firestore;
let adminApp: App;

function parseServiceAccount(): ServiceAccount {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccountString) {
        throw new Error("The FIREBASE_SERVICE_ACCOUNT environment variable is not set. Please add it to your Vercel project settings.");
    }
    
    try {
        // First, try to parse it directly. This works if the string is a clean JSON.
        return JSON.parse(serviceAccountString);
    } catch (e1) {
        try {
            // If direct parsing fails, it might be an escaped string from a CI/CD environment.
            // Un-escape the string and try parsing again.
            const cleanedString = serviceAccountString.replace(/\\n/g, '\n').replace(/\\"/g, '"');
            return JSON.parse(cleanedString);
        } catch (e2) {
            // If both attempts fail, the format is invalid.
            console.error("Failed to parse service account JSON after multiple attempts.");
            throw new Error("The FIREBASE_SERVICE_ACCOUNT environment variable is malformed.");
        }
    }
}


/**
 * Initializes the Firebase Admin SDK and returns the Firestore instance.
 * It uses a singleton pattern to ensure the app is only initialized once.
 * This function is designed to work reliably in serverless environments.
 */
export async function getDb(): Promise<Firestore> {
    if (getApps().length === 0) {
        try {
            const serviceAccount = parseServiceAccount();

            if (!serviceAccount.project_id) {
                 throw new Error("Service account object must contain a string 'project_id' property. Check if the service account JSON is correct.");
            }

            initializeApp({
                credential: cert(serviceAccount)
            });
            
            adminApp = getApp();
            db = getFirestore(adminApp);

        } catch (error: any) {
            console.error("CRITICAL: Failed to initialize Firebase Admin SDK.", error.message);
            // This throw will be caught by the server action and result in a 500 error,
            // but with a clear server-side log of what went wrong.
            throw new Error(`Firebase Admin SDK is not initialized. Reason: ${error.message}`);
        }
    } else {
        if (!adminApp) adminApp = getApp();
        if (!db) db = getFirestore(adminApp);
    }
    return db;
}
