const admin = require('firebase-admin');
require('dotenv').config();

let initialized = false;

try {
  if (!admin.apps.length) {
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      initialized = true;
      console.log('Firebase initialized');
    } else {
      console.warn('Firebase ENV missing → notifications disabled');
    }
  }
} catch (e) {
  console.error('Firebase init error:', e.message);
}

async function sendNotification(tokens, title, body, data = {}) {
  try {
    if (!initialized) return;

    if (!tokens || tokens.length === 0) return;

    const validTokens = tokens.filter(Boolean);
    if (validTokens.length === 0) return;

    const message = {
      notification: { title, body },
      data,
      tokens: validTokens,
    };

    const res = await admin.messaging().sendEachForMulticast(message);

    console.log(
      `Notifications sent: ${res.successCount}/${validTokens.length}`
    );
  } catch (err) {
    console.error('FCM error:', err.message);
  }
}

module.exports = { sendNotification };