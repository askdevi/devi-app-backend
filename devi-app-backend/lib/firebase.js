const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(), // Or use admin.credential.cert(serviceAccount) with key file
        databaseURL: 'https://ask-devi-default-rtdb.firebaseio.com',
        storageBucket: 'ask-devi.appspot.com', // corrected domain
    });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = {
    admin,
    db,
    auth
};
