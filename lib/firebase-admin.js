const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Firebase Admin initialization config
const firebaseAdminConfig = {
  credential: cert({
    projectId: 'ask-devi',
    clientEmail: 'firebase-adminsdk-3ht2r@ask-devi.iam.gserviceaccount.com',
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
  }),
};

let app;

// Ensure only one Firebase Admin app is initialized
function getAdminApp() {
  if (!getApps().length) {
    app = initializeApp(firebaseAdminConfig);
  } else {
    app = getApps()[0];
  }
  return app;
}

// Export Firebase Auth and Firestore clients
function getFirebaseAdmin() {
  const app = getAdminApp();
  const auth = getAuth(app);
  const db = getFirestore(app);
  return { auth, db };
}

module.exports = { getFirebaseAdmin };
