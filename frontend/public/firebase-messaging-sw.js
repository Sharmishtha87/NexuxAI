importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyBmBIR9V6QoQLcwY8rUYmLzbb-cdEktF1s",
    authDomain: "github-clone-3fd61.firebaseapp.com",
    projectId: "github-clone-3fd61",
    storageBucket: "github-clone-3fd61.firebasestorage.app",
    messagingSenderId: "489738542068",
    appId: "1:489738542068:web:87bc029c5ab6bd56bd77a1",
    measurementId: "G-ECJPCWGX7X"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
