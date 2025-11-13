
'use server';

import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let db: Firestore;
let adminApp: App;

/**
 * Initializes the Firebase Admin SDK and returns the Firestore instance.
 * It uses a singleton pattern to ensure the app is only initialized once.
 * This function is designed to work reliably in serverless environments.
 */
export async function getDb(): Promise<Firestore> {
    if (getApps().length === 0) {
        try {
            const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
            
            if (!serviceAccountString) {
                throw new Error("The FIREBASE_SERVICE_ACCOUNT environment variable is not set. Please add it to your project settings.");
            }

            const serviceAccount = JSON.parse(serviceAccountString);

            if (!serviceAccount.project_id) {
                 throw new Error("Service account object must contain a string 'project_id' property. Check if the service account JSON is correct.");
            }

            adminApp = initializeApp({
                credential: cert(serviceAccount)
            });
            
            db = getFirestore(adminApp);

        } catch (error: any) {
            console.error("CRITICAL: Failed to initialize Firebase Admin SDK.", error);
            throw new Error(`Firebase Admin SDK is not initialized. Reason: ${error.message}`);
        }
    } else {
        if (!adminApp) adminApp = getApp();
        if (!db) db = getFirestore(adminApp);
    }
    return db;
}
