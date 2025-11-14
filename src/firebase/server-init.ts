
'use server';

import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

/**
 * Initializes the Firebase Admin SDK and returns the Firestore instance.
 * It uses a singleton pattern that is safe for serverless environments
 * to ensure the app is only initialized once per instance.
 */
export async function getDb(): Promise<Firestore> {
    // Check if the app has not been initialized yet
    if (getApps().length === 0) {
        try {
            // Call initializeApp without arguments.
            // In Google Cloud environments (Cloud Functions, App Engine, Cloud Run, etc.),
            // the SDK will automatically detect the service credentials.
            console.log("Initializing Firebase Admin SDK with Application Default Credentials...");
            initializeApp();
            console.log("Firebase Admin SDK initialized successfully.");
            
        } catch (error: any) {
            console.error("CRITICAL: Failed to initialize Firebase Admin SDK.", error);
            // Throw a more descriptive error to help diagnose auth issues.
            throw new Error(`Firebase Admin SDK initialization failed. This might be due to missing or expired authentication credentials. Please try re-authenticating. Reason: ${error.message}`);
        }
    }
    
    // Return the existing Firestore instance
    return getFirestore(getApp());
}
