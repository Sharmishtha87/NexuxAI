const { initializeApp, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const path = require("path");
const fs = require("fs");

// Check if service account key exists in the backend directory
const serviceAccountPath = path.resolve(__dirname, "./serviceAccountKey.json");

let initialized = false;

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  initializeApp({
    credential: cert(serviceAccount)
  });
  initialized = true;
  console.log("Firebase Admin SDK initialized successfully.");
} else {
  console.warn("WARNING: Firebase Admin SDK not initialized. Please place serviceAccountKey.json in the backend folder.");
}

const sendNotification = async (fcmToken, title, body, data = {}) => {
  if (!initialized) {
    console.error("Cannot send notification: Firebase Admin SDK is not initialized.");
    return false;
  }
  
  if (!fcmToken) {
    console.error("Cannot send notification: No FCM token provided.");
    return false;
  }

  const message = {
    notification: {
      title,
      body,
    },
    data,
    token: fcmToken,
  };

  try {
    const response = await getMessaging().send(message);
    console.log("Successfully sent message:", response);
    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
};

module.exports = {
  sendNotification
};
