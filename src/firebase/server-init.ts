
'use server';

import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let db: Firestore;

/**
 * Initializes the Firebase Admin SDK and returns the Firestore instance.
 * It uses a singleton pattern to ensure the app is only initialized once.
 * This function is designed to work reliably in serverless environments
 * by relying on Google's default application credentials.
 */
export async function getDb(): Promise<Firestore> {
    if (!db) {
        try {
            // Check if any apps are already initialized.
            if (getApps().length === 0) {
                // If not, initialize a new app. In a Google Cloud environment (like App Hosting),
                // the SDK will automatically find the service account credentials.
                // No need to parse process.env.FIREBASE_SERVICE_ACCOUNT.
                initializeApp();
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
