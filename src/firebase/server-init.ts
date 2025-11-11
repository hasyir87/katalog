
'use server';

import { initializeApp, getApps, getApp, cert, App, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let db: Firestore;

/**
 * Initializes the Firebase Admin SDK and returns the Firestore instance.
 * It uses a singleton pattern to ensure the app is only initialized once.
 * This function is designed to work reliably in serverless environments
 * like Vercel by checking for the FIREBASE_SERVICE_ACCOUNT environment variable.
 */
export async function getDb(): Promise<Firestore> {
    if (!db) {
        // Vercel build environment might not have the env var set.
        // We check for the existence of the variable before trying to initialize.
        const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (!serviceAccountString) {
             throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set. Skipping Firebase Admin initialization.");
        }

        try {
            if (getApps().length === 0) {
                const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);
                initializeApp({
                    credential: cert(serviceAccount)
                });
            }
            // Get the singleton app instance.
            const adminApp = getApp();
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
