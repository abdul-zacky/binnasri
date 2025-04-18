import * as admin from 'firebase-admin';

// This approach prevents multiple initializations
export function initAdmin() {
  if (!admin.apps.length) {
    // Using environment variables is better
    // For local development, generate a service account key from Firebase console
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  }
  
  return admin;
}