'use server';
import { initializeApp, getApps, getApp, ServiceAccount, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getServiceAccount(): ServiceAccount | undefined {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }
    return undefined;
}


if (!getApps().length) {
    const serviceAccount = getServiceAccount();
    initializeApp({
        credential: serviceAccount ? cert(serviceAccount) : undefined,
    });
}

const adminApp = getApp();
const db = getFirestore(adminApp);

export async function getDb() {
    return db;
};
