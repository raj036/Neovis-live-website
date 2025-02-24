import firebase from "firebase/app";
import "firebase/storage";
import "firebase/messaging";
import axios from "axios";
import { getUser, getToken } from "./utils/helper";
import { setState, getState } from "./contexts/zustand-store";

export const amplifyConfig = {
  aws_project_region: process.env.NEXT_PUBLIC_AWS_PROJECT_REGION,
  aws_cognito_identity_pool_id:
    process.env.NEXT_PUBLIC_AWS_COGNITO_IDENTITY_POOL_ID,
  aws_cognito_region: process.env.NEXT_PUBLIC_AWS_COGNITO_REGION,
  aws_user_pools_id: process.env.NEXT_PUBLIC_AWS_USER_POOLS_ID,
  aws_user_pools_web_client_id:
    process.env.NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID,
};

export const auth0Config = {
  client_id: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
};

const firebaseConfig = {
  apiKey: "AIzaSyBBxw32ZmzxxwjOSmGyWJtf8UKH69beopE",
  authDomain: "virtual-inspect-5390b.firebaseapp.com",
  projectId: "virtual-inspect-5390b",
  storageBucket: "virtual-inspect-5390b.appspot.com",
  messagingSenderId: "903302113012",
  appId: "1:903302113012:web:0552ef5edfc6f1ab8760a1",
  measurementId: "G-TEW919LFYM",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const storage = firebase.storage();

const enableMessaging = async () => {
  if (typeof window !== "undefined") {
    await import("firebase/messaging");
    if (firebase.messaging.isSupported()) {
      try {
        await Notification.requestPermission();
        const fcmToken = await firebase.messaging().getToken({
          vapidKey:
            "BBbFN5Ae2W5Uo37qGzYxbdbOr2xQ3p2ky1Kuv2HqY7NaaKF8jLMP4_Fovwd2zCZneioJUq5Y7Safx65t4rfOEHE",
        });
        const user = getUser();
        const token = getToken();
        if (user && user.fcm_token !== fcmToken) {
          // "http://localhost:8000"
          // "https://vinspect-server-dev.herokuapp.com"
          // "https://shark-app-6wiyn.ondigitalocean.app"
          await axios.patch(
            // `https://api.neovis.io/api/v1/users/update-fcm-token/${user?.id}`,
            `https://shark-app-6wiyn.ondigitalocean.app/api/v1/users/update-fcm-token/${user?.id}`,
            { fcm_token: fcmToken, device_type: "WEB" },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
        firebase.messaging().onMessage((payload) => {
          if (payload?.data) {
            const notifications = getState().notifications;
            setState({
              notifications: [
                {
                  ...payload.data,
                  roomInfo: JSON.parse(payload.data.roomInfo),
                  read: false,
                  newCall: true,
                  foregroundCall: true,
                },
                ...notifications,
              ],
            });
          }
        });
      } catch (error) {
        console.log(error);
        throw "Unknown error occurred";
      }
    } else {
      throw "Not Supported";
    }
  }
};

enableMessaging();

export const gtmConfig = {
  containerId: process.env.NEXT_PUBLIC_GTM_CONTAINER_ID,
};

export { enableMessaging };
