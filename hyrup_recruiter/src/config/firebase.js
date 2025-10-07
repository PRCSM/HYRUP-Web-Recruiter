// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your Firebase config - using environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate that all required environment variables are loaded
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    console.error('Missing Firebase configuration. Please check your .env file.');
    console.error('Required variables:', {
        apiKey: firebaseConfig.apiKey ? '✓' : '✗',
        authDomain: firebaseConfig.authDomain ? '✓' : '✗',
        projectId: firebaseConfig.projectId ? '✓' : '✗',
        storageBucket: firebaseConfig.storageBucket ? '✓' : '✗',
        messagingSenderId: firebaseConfig.messagingSenderId ? '✓' : '✗',
        appId: firebaseConfig.appId ? '✓' : '✗'
    });
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider to reduce popup blocking
googleProvider.setCustomParameters({
    prompt: 'select_account',  // Always show account selection
    access_type: 'offline',    // Get refresh token
});

// Add additional scopes if needed
googleProvider.addScope('profile');
googleProvider.addScope('email');

export default app;