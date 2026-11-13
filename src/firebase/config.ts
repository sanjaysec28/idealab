import { FirebaseOptions, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import appletFirebaseConfig from '../../firebase-applet-config.json';

const EXPECTED_PROJECT_ID = 'devarena-ba727';
const EXPECTED_DATABASE_ID = 'ai-studio-idealabsaveethae-112d3000-c633-43ff-8c99-cbaaa472266e';

const env = (
  typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}
) as Partial<ImportMetaEnv>;

const resolvedConfig: FirebaseOptions = {
  apiKey: env.VITE_FIREBASE_API_KEY || appletFirebaseConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || appletFirebaseConfig.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || appletFirebaseConfig.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || appletFirebaseConfig.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletFirebaseConfig.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || appletFirebaseConfig.appId,
};

export const FIRESTORE_DATABASE_ID =
  env.VITE_FIREBASE_DATABASE_ID ||
  appletFirebaseConfig.firestoreDatabaseId ||
  EXPECTED_DATABASE_ID;

if (!resolvedConfig.apiKey || !resolvedConfig.appId || !resolvedConfig.projectId) {
  throw new Error('Firebase Web App configuration is incomplete. Check .env.local.');
}

if (resolvedConfig.projectId !== EXPECTED_PROJECT_ID) {
  throw new Error(
    `Firebase projectId mismatch: expected "${EXPECTED_PROJECT_ID}", received "${resolvedConfig.projectId}".`
  );
}

export const firebaseProjectId = resolvedConfig.projectId;
export const app = initializeApp(resolvedConfig);

export const db = getFirestore(app, FIRESTORE_DATABASE_ID);
export const auth = getAuth(app);
export const storage = getStorage(app);

export async function verifyFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    return true;
  }
}

void verifyFirestoreConnection();
