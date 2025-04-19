import * as admin from 'firebase-admin';

// Check if we need to initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // Check for required environment variables
    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY
    ) {
      throw new Error('Missing Firebase Admin environment variables');
    }
    
    // Remove extra quotes if present (Vercel sometimes adds them)
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    // If the key starts and ends with quotes, remove them
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    
    // Replace literal \n with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    // Initialize the app with the service account
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey
      }),
    });
    
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    
    // Log more details about the environment variables for debugging
    console.error('Environment variable details:', {
      projectIdExists: !!process.env.FIREBASE_PROJECT_ID,
      clientEmailExists: !!process.env.FIREBASE_CLIENT_EMAIL,
      privateKeyExists: !!process.env.FIREBASE_PRIVATE_KEY,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length
    });
    
    throw error;
  }
}

export default admin;