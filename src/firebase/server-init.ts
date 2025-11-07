'use server';
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// When deployed to Firebase App Hosting, the service account credentials
// are automatically available in the environment. We don't need to pass them manually.
// initializeApp() will automatically pick them up.
if (!getApps().length) {
  initializeApp();
}

const adminApp = getApp();
const db = getFirestore(adminApp);

export { db as getDb };
