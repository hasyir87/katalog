
'use server';

import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

/**
 * Initializes the Firebase Admin SDK and returns the Firestore instance.
 * It uses a singleton pattern that is safe for serverless environments
 * to ensure the app is only initialized once per instance.
 */
export async function getDb(): Promise<Firestore> {
    // Cek jika aplikasi belum diinisialisasi
    if (getApps().length === 0) {
        try {
            // Panggil initializeApp tanpa argumen.
            // Di lingkungan Google Cloud (Cloud Functions, App Engine, Cloud Run, dll.),
            // SDK akan secara otomatis mendeteksi kredensial layanan.
            console.log("Initializing Firebase Admin SDK with Application Default Credentials...");
            initializeApp();
            console.log("Firebase Admin SDK initialized successfully.");
            
        } catch (error: any) {
            console.error("CRITICAL: Failed to initialize Firebase Admin SDK.", error);
            // Lemparkan error yang lebih deskriptif
            throw new Error(`Firebase Admin SDK initialization failed. This might be due to missing or expired authentication credentials. Please try re-authenticating. Reason: ${error.message}`);
        }
    }
    
    // Kembalikan instance Firestore yang sudah ada
    return getFirestore(getApp());
}
