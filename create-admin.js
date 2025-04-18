// create-admin.js
const admin = require('firebase-admin');
const fs = require('fs');

// Path to your service account file
const SERVICE_ACCOUNT_PATH = './wisma1-firebase-adminsdk-944ey-8bad8df6a7.json'; // Update this path

// Admin user details
const adminUser = {
  email: 'wismabinnasri@gmail.com',
  password: '1212NasriBin2121',
  displayName: 'Admin User'
};

// Initialize Firebase Admin with better error handling
async function initializeFirebaseAdmin() {
  try {
    // Check if service account file exists
    if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      throw new Error(`Service account file not found at: ${SERVICE_ACCOUNT_PATH}`);
    }

    // Load service account file
    const serviceAccount = require(SERVICE_ACCOUNT_PATH);
    
    // Debug information
    console.log("Service Account Project ID:", serviceAccount.project_id);
    console.log("Service Account Client Email:", serviceAccount.client_email);
    
    // Initialize app with explicit options
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    
    return true;
  } catch (error) {
    console.error("Firebase Admin initialization error:", error.message);
    if (error.code) {
      console.error("Error code:", error.code);
    }
    return false;
  }
}

// Create user and make them an admin
async function createAndMakeAdmin() {
  try {
    // Initialize Firebase Admin
    const initialized = await initializeFirebaseAdmin();
    if (!initialized) {
      throw new Error("Failed to initialize Firebase Admin SDK");
    }
    
    let user;
    
    // Check if user already exists
    try {
      user = await admin.auth().getUserByEmail(adminUser.email);
      console.log(`User ${adminUser.email} already exists with UID: ${user.uid}`);
    } catch (error) {
      console.log("Unexpected error checking user:", error);
      
      // User doesn't exist, create a new one
      if (error.code === 'auth/user-not-found') {
        try {
          user = await admin.auth().createUser({
            email: adminUser.email,
            password: adminUser.password,
            displayName: adminUser.displayName,
            emailVerified: true
          });
          console.log(`Created new user: ${adminUser.email} with UID: ${user.uid}`);
        } catch (createError) {
          console.error("Error creating user:", createError);
          throw createError;
        }
      } else {
        throw error;
      }
    }
    
    if (!user) {
      throw new Error("Failed to get or create user");
    }
    
    // Set custom claims to make user an admin
    try {
      await admin.auth().setCustomUserClaims(user.uid, {
        admin: true
      });
      console.log(`Success! ${adminUser.email} is now an admin.`);
      console.log(`Email: ${adminUser.email}`);
      console.log(`Password: ${adminUser.password}`);
      console.log(`UID: ${user.uid}`);
    } catch (claimsError) {
      console.error("Error setting admin claims:", claimsError);
      throw claimsError;
    }
    
  } catch (error) {
    console.error("Error in createAndMakeAdmin:", error);
    console.error("Full error object:", JSON.stringify(error.errorInfo || {}, null, 2));
  } finally {
    process.exit();
  }
}

createAndMakeAdmin();