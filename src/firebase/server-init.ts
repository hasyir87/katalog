
'use server';

import { initializeApp, getApps, getApp, cert, ServiceAccount } from 'firebase-admin/app';
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

            initializeApp({
                credential: cert(serviceAccount)
            });
            
        } catch (error: any) {
            console.error("CRITICAL: Failed to initialize Firebase Admin SDK.", error);
            // Re-throw a more user-friendly error to avoid leaking implementation details,
            // but include the original reason for easier debugging.
            throw new Error(`Firebase Admin SDK initialization failed. Please check server logs and the FIREBASE_SERVICE_ACCOUNT environment variable. Reason: ${error.message}`);
        }
    }
    
    // Always get the app and firestore instance after ensuring initialization.
    // This is safer in serverless environments than relying on a global variable.
    const adminApp = getApp();
    const db = getFirestore(adminApp);
    return db;
}
