'use server';

import { initializeApp, getApps, getApp, ServiceAccount, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getServiceAccount(): ServiceAccount | undefined {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountJson) {
        try {
            // Trim the string to remove potential whitespace or quotes
            // that might be added by the environment variable loader.
            const cleanedJson = serviceAccountJson.trim();
            return JSON.parse(cleanedJson);
        } catch (e) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", e);
            // Log the problematic string for debugging, but be careful in production.
            // console.error("Problematic JSON string:", serviceAccountJson);
            return undefined;
        }
    }
    return undefined;
}

if (getApps().length === 0) {
    const serviceAccount = getServiceAccount();
    // Only initialize if a valid service account is found
    if (serviceAccount && serviceAccount.project_id) {
        initializeApp({
            credential: cert(serviceAccount),
        });
    } else {
        // In a deployed environment, App Hosting provides default credentials.
        // For local development, this might mean the .env file is missing or incorrect.
        // We can attempt to initialize without explicit credentials,
        // which works in some environments (like Cloud Run, Cloud Functions).
        // If it fails, it will throw a clearer error.
        try {
             initializeApp();
        } catch(e) {
            console.error("Failed to initialize Firebase Admin SDK. Ensure FIREBASE_SERVICE_ACCOUNT is set in .env for local development.", e)
        }
    }
}


// This function will now safely return the initialized db instance,
// or throw an error if initialization failed.
export async function getDb() {
    if (getApps().length === 0) {
        // This case should ideally not be hit if the top-level logic is correct.
        throw new Error("Firebase Admin SDK not initialized.");
    }
    const adminApp = getApp();
    return getFirestore(adminApp);
};
