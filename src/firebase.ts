import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';
import rawFirebaseConfig from '../firebase-applet-config.json';

const firebaseConfig = {
  projectId: rawFirebaseConfig?.projectId || 'astral-totality-3smzh',
  appId: rawFirebaseConfig?.appId || '1:539864316565:web:821c81d53008e41643399c',
  apiKey: rawFirebaseConfig?.apiKey || 'AIzaSyB1c2HCH6fqo87Ilt0w0NJ6ZvJqZj87fhI',
  authDomain: rawFirebaseConfig?.authDomain || 'astral-totality-3smzh.firebaseapp.com',
  firestoreDatabaseId: rawFirebaseConfig?.firestoreDatabaseId || 'ai-studio-duocalendarcalen-bbc00bbd-fd69-4dfc-b861-76dbc0e3c83c',
  storageBucket: rawFirebaseConfig?.storageBucket || 'astral-totality-3smzh.firebasestorage.app',
  messagingSenderId: rawFirebaseConfig?.messagingSenderId || '539864316565',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore with ignoreUndefinedProperties: true to prevent any setDoc failures
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(app, {
    ignoreUndefinedProperties: true,
  }, firebaseConfig.firestoreDatabaseId);
} catch (e) {
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreInstance;
export const auth = getAuth(app);

// Authenticate anonymously so all cloud operations have an active session
signInAnonymously(auth).catch((err) => {
  console.info('Anonymous auth initial check:', err?.message || err);
});

// Test connection on boot as required by Firestore integration skill
async function testConnection() {
  try {
    const { doc, getDocFromServer } = await import('firebase/firestore');
    await getDocFromServer(doc(db, 'couple', 'config'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline mode active.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Strips all undefined properties recursively from an object before saving to Firestore
 */
export function cleanForFirestore<T extends Record<string, unknown>>(data: T): T {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        cleaned[key] = cleanForFirestore(value as Record<string, unknown>);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned as T;
}
