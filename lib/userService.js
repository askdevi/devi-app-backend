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
      userId: doc.id,
      firstName: data.firstName,
      preferredLanguage: data.preferredLanguage,
      token: data.fcmToken,
    };
  });
}

async function getUsersWithNoFreeTime() {
  const { db } = getFirebaseAdmin();
  const snapshot = await db.collection('users')
    .where('startedFreeMinutes', '==', 1)
    .get();

  let batch = db.batch();
  const batchSize = 450;
  let writeCount = 0;

  const users = [];
  const date = new Date();
  const currentDay = date.getDay();
  const currentHour = date.getHours();
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const timeEnd = new Date(data.timeEnd._seconds * 1000);
    if (timeEnd > date) {
      continue;
    }
    const schedule = await db.collection('freeChatSchedule').doc(doc.id).get();
    if (!schedule.exists) {
      continue;
    }
    const scheduleData = schedule.data();
    let send = false;
    if(scheduleData.days[0] === currentDay){
      if(scheduleData.hours[0] === currentHour){
        send = true;
      }
    }
    else if(scheduleData.days[1] === currentDay){
      if(scheduleData.hours[1] === currentHour){
        send = true;
      }
    }
    else if(scheduleData.days[2] === currentDay){
      if(scheduleData.hours[2] === currentHour){
        send = true;
      }
    }
    if (send) {
      batch.update(db.collection('users').doc(doc.id), { startedFreeMinutes: 0 });
      writeCount++;
      if (writeCount % batchSize === 0) {
        await batch.commit();
        batch = db.batch();
      }
      if (data.fcmToken) {
        users.push({
          userId: doc.id,
          firstName: data.firstName,
          preferredLanguage: data.preferredLanguage,
          token: data.fcmToken,
        });
      }
    }
  }

  if (writeCount % batchSize !== 0) {
    await batch.commit();
  }

  return users;
}

module.exports = { getUsersWithTokens, getUsersWithNoFreeTime };
