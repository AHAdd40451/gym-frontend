/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAO8yNTSvL27lHwz7cdujhpxUYB2q-jq6I",
  authDomain: "gym-management-notifications.firebaseapp.com",
  projectId: "gym-management-notifications",
  storageBucket: "gym-management-notifications.firebasestorage.app",
  messagingSenderId: "504195953024",
  appId: "1:504195953024:web:35f41470762caff2c99165",
  measurementId: "G-XQN7SM7KCD"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || "Notification";
  const options = {
    body: payload?.notification?.body || "",
    icon: "/favicon.ico"
  };

  self.registration.showNotification(title, options);
});
