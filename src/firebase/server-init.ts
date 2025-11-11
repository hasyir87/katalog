
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
        try {
            if (getApps().length === 0) {
                // For Vercel and other non-Google environments, use a service account key from env vars.
                const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
                if (serviceAccountString) {
                    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);
                    initializeApp({
                        credential: cert(serviceAccount)
                    });
                } else {
                    // Fallback for Google Cloud environments (like App Hosting)
                    initializeApp();
                }
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
