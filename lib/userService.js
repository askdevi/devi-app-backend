const { getFirebaseAdmin } = require('./firebase-admin');

async function getUsersWithTokens() {
  const { db } = getFirebaseAdmin();
  const snapshot = await db.collection('users')
    .where('fcmToken', '>', '')
    .select('fcmToken', 'firstName', 'preferredLanguage')
    .get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      userId:    doc.id,
      firstName: data.firstName,
      preferredLanguage: data.preferredLanguage,
      token:     data.fcmToken,
    };
  });
}

module.exports = { getUsersWithTokens };
