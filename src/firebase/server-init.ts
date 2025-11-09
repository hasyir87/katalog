'use server';

import { initializeApp, getApps, getApp, ServiceAccount, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// This function is carefully designed to work in both local and deployed environments.
function getServiceAccount(): ServiceAccount | undefined {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountJson) {
        // In a deployed environment (like App Hosting), the service account is often
        // discovered automatically and this environment variable may not be set.
        // Returning undefined is the correct behavior in this case.
        return undefined;
    }
    try {
        const parsed = JSON.parse(serviceAccountJson);
        // The error "Service account object must contain a string 'project_id' property"
        // indicates that the parsed JSON is not a valid Service Account object.
        // We add a check to ensure the essential properties exist.
        if (parsed.project_id && parsed.client_email && parsed.private_key) {
            return parsed as ServiceAccount;
        }
        console.error("Parsed FIREBASE_SERVICE_ACCOUNT JSON is not a valid service account object.");
        return undefined;
    } catch (e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", e);
        return undefined;
    }
}

let db: ReturnType<typeof getFirestore>;

function initializeAdminApp() {
    // Ensure this only runs once.
    if (getApps().length > 0) {
        return getApp();
    }

    const serviceAccount = getServiceAccount();
    
    const options = serviceAccount 
        ? { credential: cert(serviceAccount) } 
        : {}; // For deployed environments, the SDK will auto-discover credentials.

    return initializeApp(options);
}

// Initialize the app and the database connection.
const adminApp = initializeAdminApp();
db = getFirestore(adminApp);

// Export the initialized database instance for use in server actions.
export { db };
