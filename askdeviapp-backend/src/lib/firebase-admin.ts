import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Firebase Admin initialization config
const firebaseAdminConfig = {
  credential: cert({
    projectId: "ask-devi",
    clientEmail: "firebase-adminsdk-3ht2r@ask-devi.iam.gserviceaccount.com",
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || "",
  }),
};

let app: App;

// Ensure only one Firebase Admin app is initialized
function getAdminApp(): App {
  if (!getApps().length) {
    app = initializeApp(firebaseAdminConfig);
  } else {
    app = getApps()[0];
  }
  return app;
}

// Export Firebase Auth and Firestore clients
export function getFirebaseAdmin(): { auth: Auth; db: Firestore } {
  const app = getAdminApp();
  const auth = getAuth(app);
  const db = getFirestore(app);
  return { auth, db };
}
