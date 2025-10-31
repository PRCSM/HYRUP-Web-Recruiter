// // Firebase configuration
// import { initializeApp } from 'firebase/app';
// import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// // Your Firebase config - using environment variables
// const firebaseConfig = {
//     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//     appId: import.meta.env.VITE_FIREBASE_APP_ID
// };

// // Validate that all required environment variables are loaded
// if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
//     console.error('Missing Firebase configuration. Please check your .env file.');
//     console.error('Required variables:', {
//         apiKey: firebaseConfig.apiKey ? '✓' : '✗',
//         authDomain: firebaseConfig.authDomain ? '✓' : '✗',
//         projectId: firebaseConfig.projectId ? '✓' : '✗',
//         storageBucket: firebaseConfig.storageBucket ? '✓' : '✗',
//         messagingSenderId: firebaseConfig.messagingSenderId ? '✓' : '✗',
//         appId: firebaseConfig.appId ? '✓' : '✗'
//     });
// }

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Firebase Authentication and get a reference to the service
// export const auth = getAuth(app);
// export const googleProvider = new GoogleAuthProvider();

// // Configure Google provider to reduce popup blocking
// googleProvider.setCustomParameters({
//     prompt: 'select_account',  // Always show account selection
//     access_type: 'offline',    // Get refresh token
// });

// // Add additional scopes if needed
// googleProvider.addScope('profile');
// googleProvider.addScope('email');

// export default app;


// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Add this import
import { getMessaging, isSupported } from "firebase/messaging";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, // This is used for Storage
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firebase Auth
export const auth = getAuth(app);

// ✅ Configure Google provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'offline',
});

// ✅ Initialize Firestore with offline persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// ✅ Initialize Firebase Storage - Add this
export const storage = getStorage(app);

// ✅ Messaging instance - only create on client side
let messaging = null;

export const getMessagingInstance = async () => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (messaging) {
    return messaging;
  }

  try {
    const supported = await isSupported();
    if (supported) {
      messaging = getMessaging(app);

      // Optional: Check if VAPID key is available
      if (!import.meta.env.VITE_FIREBASE_VAPID_KEY) {
        // VAPID key not found - push notifications may not be available
      }

      return messaging;
    }
    if (import.meta.env.DEV) console.warn('Firebase Messaging not supported');
    return null;
  } catch (error) {
    // Error initializing messaging - suppress console output
    return null;
  }
};

export default app;