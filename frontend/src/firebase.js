// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBmBIR9V6QoQLcwY8rUYmLzbb-cdEktF1s",
    authDomain: "github-clone-3fd61.firebaseapp.com",
    projectId: "github-clone-3fd61",
    storageBucket: "github-clone-3fd61.firebasestorage.app",
    messagingSenderId: "489738542068",
    appId: "1:489738542068:web:87bc029c5ab6bd56bd77a1",
    measurementId: "G-ECJPCWGX7X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

import { getMessaging, getToken, onMessage } from "firebase/messaging";
export const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, {
      // NOTE: You need to generate a VAPID key in Firebase Console > Project Settings > Cloud Messaging > Web configuration
      // and place it here or in your .env file
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || "YOUR_VAPID_KEY_HERE"
    });
    if (currentToken) {
      console.log("current token for client: ", currentToken);
      return currentToken;
    } else {
      console.log("No registration token available. Request permission to generate one.");
      return null;
    }
  } catch (err) {
    console.log("An error occurred while retrieving token. ", err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });