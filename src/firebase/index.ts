'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// Hardcoded the correct config to ensure it's always used.
const firebaseConfig = {
  "projectId": "katalog-parfum-next",
  "appId": "1:782806346931:web:5337213437255858971165",
  "apiKey": "AIzaSyAz_jC69yq_8Kx04zYjW1zJ5k-FpCk1i3w",
  "authDomain": "katalog-parfum-next.firebaseapp.com",
  "storageBucket": "katalog-parfum-next.appspot.com",
  "messagingSenderId": "782806346931",
  "measurementId": "G-L9E1V3E28V"
};

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';