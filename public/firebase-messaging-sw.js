importScripts("https://www.gstatic.com/firebasejs/8.3.2/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.3.2/firebase-messaging.js");
importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyBBxw32ZmzxxwjOSmGyWJtf8UKH69beopE",
  authDomain: "virtual-inspect-5390b.firebaseapp.com",
  projectId: "virtual-inspect-5390b",
  storageBucket: "virtual-inspect-5390b.appspot.com",
  messagingSenderId: "903302113012",
  appId: "1:903302113012:web:0552ef5edfc6f1ab8760a1",
  measurementId: "G-TEW919LFYM",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(async (payload) => {
  if (payload?.data) {
    const notificationTitle = payload.data.title;
    const notificationOptions = {
      body: payload.data.body,
      icon: "/firebase-logo.png",
    };

    let notification_store = await localforage.getItem("v-inspect-zustand");
    notification_store = JSON.parse(notification_store);
    const notifications = notification_store?.state?.notifications ?? [];

    if (!notification_store) {
      notification_store.state = { notifications: [] };
    }

    notification_store.state.notifications = [
      {
        ...payload.data,
        roomInfo: JSON.parse(payload.data.roomInfo),
        read: false,
        newCall: true,
        foregroundCall: false,
      },
      ...notifications,
    ];

    await localforage.setItem(
      "v-inspect-zustand",
      JSON.stringify(notification_store)
    );

    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});
