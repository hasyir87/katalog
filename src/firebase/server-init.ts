
'use server';

import { initializeApp, getApps, getApp, cert, App, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let db: Firestore;

/**
 * Initializes the Firebase Admin SDK and returns the Firestore instance.
 * It uses a singleton pattern to ensure the app is only initialized once.
 * This function is designed to work reliably in serverless environments.
 */
export async function getDb(): Promise<Firestore> {
    if (!db) {
        try {
            const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
            
            if (!serviceAccountString) {
                throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set.");
            }

            const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);

            if (getApps().length === 0) {
                initializeApp({
                    credential: cert(serviceAccount)
                });
            }
            
            const adminApp = getApp();
            db = getFirestore(adminApp);

        } catch (error: any) {
            console.error("CRITICAL: Failed to initialize Firebase Admin SDK.", error.message);
            throw new Error(`Firebase Admin SDK is not initialized. Reason: ${error.message}`);
        }
    }
    return db;
}
