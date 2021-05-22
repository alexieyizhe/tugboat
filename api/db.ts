import admin from "firebase-admin";

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "intern-plus",
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_SERVICE_KEY,
  }),
  databaseURL: "https://<DATABASE_NAME>.firebaseio.com",
});

const db = admin.firestore();

export { db };
