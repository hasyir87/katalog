
'use server';

import { initializeApp, getApps, getApp, cert, App, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

/**
 * Initializes the Firebase Admin SDK and returns the Firestore instance.
 * It uses a singleton pattern that is safe for serverless environments
 * to ensure the app is only initialized once per instance.
 */
export async function getDb(): Promise<Firestore> {
    if (getApps().length === 0) {
        try {
            const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
            
            if (!serviceAccountString) {
                throw new Error("The FIREBASE_SERVICE_ACCOUNT environment variable is not set. Please add it to your project settings.");
            }

            const serviceAccount = JSON.parse(serviceAccountString) as ServiceAccount;

            if (!serviceAccount.project_id) {
                 throw new Error("Service account object must contain a 'project_id' property. Check if the service account JSON is correct.");
            }

            initializeApp({
                credential: cert(serviceAccount)
            });
            
        } catch (error: any) {
            console.error("CRITICAL: Failed to initialize Firebase Admin SDK.", error);
            // Re-throw a more user-friendly error to avoid leaking implementation details.
            throw new Error(`Firebase Admin SDK initialization failed. Please check server logs and FIREBASE_SERVICE_ACCOUNT environment variable. Reason: ${error.message}`);
        }
    }
    
    // Always get the app and firestore instance after ensuring initialization.
    // This is safer in serverless environments than relying on a global variable.
    const adminApp = getApp();
    const db = getFirestore(adminApp);
    return db;
}
