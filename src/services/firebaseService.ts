import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  getDocFromServer,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { ResourceItem, OsceVideo } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore using the configured database ID
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
export const storage = getStorage(app, firebaseConfig.storageBucket);
export const googleAuthProvider = new GoogleAuthProvider();

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
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate connection to Firestore on initial boot
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return false;
    }
    const testDocRef = doc(db, 'resources', '__connection_test__');
    // Attempt quick server check with timeout
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('connection timeout')), 4000)
    );
    await Promise.race([getDocFromServer(testDocRef), timeoutPromise]);
    return true;
  } catch (error) {
    if (error instanceof Error && (error.message.includes('offline') || error.message.includes('unavailable') || error.message.includes('timeout'))) {
      // Expected when offline or on intermittent connectivity - client seamlessly operates in offline mode
      return false;
    }
    return false;
  }
}

/**
 * Save or sync a resource document / file item to Firestore
 */
export async function saveResourceToFirestore(item: ResourceItem): Promise<void> {
  const path = `resources/${item.id}`;
  try {
    const cleanItem = JSON.parse(JSON.stringify(item));
    await setDoc(doc(db, 'resources', item.id), {
      ...cleanItem,
      updatedAt: item.updatedAt || new Date().toISOString()
    });
  } catch (error: any) {
    if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
      console.warn('Firestore write queued in local offline cache:', path);
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetch all resources from Firestore
 */
export async function fetchResourcesFromFirestore(): Promise<ResourceItem[]> {
  const path = 'resources';
  try {
    const q = query(collection(db, 'resources'), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    const resources: ResourceItem[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as ResourceItem;
      if (data && data.id && data.id !== '__connection_test__') {
        resources.push(data);
      }
    });
    return resources;
  } catch (error: any) {
    if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
      console.warn('Operating in offline mode for resources collection.');
      return [];
    }
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

/**
 * Subscribe in real-time to Firestore resources collection.
 * Triggers callback immediately and whenever any document is uploaded or updated.
 */
export function subscribeToFirestoreResources(callback: (resources: ResourceItem[]) => void) {
  const q = query(collection(db, 'resources'), orderBy('updatedAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const resources: ResourceItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as ResourceItem;
        if (data && data.id && data.id !== '__connection_test__') {
          resources.push(data);
        }
      });
      callback(resources);
    },
    (error) => {
      console.warn('Firestore real-time snapshot error:', error);
    }
  );
}

/**
 * Delete a resource from Firestore
 */
export async function deleteResourceFromFirestore(id: string): Promise<void> {
  const path = `resources/${id}`;
  try {
    await deleteDoc(doc(db, 'resources', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Auth utilities
 */
export async function signInWithGoogleFirebase(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    return result.user;
  } catch (error) {
    console.error('Firebase Auth sign in error:', error);
    return null;
  }
}

export async function signOutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Firebase Auth sign out error:', error);
  }
}

export function subscribeAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Upload a File or Blob directly to Firebase Cloud Storage.
 * Provides real-time percentage progress callback and resolves with the public download URL.
 */
export async function uploadFileToFirebaseStorage(
  file: File | Blob,
  destinationPath: string,
  onProgress?: (progressPercentage: number) => void
): Promise<string> {
  try {
    const storageRef = ref(storage, destinationPath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0) {
            const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            if (onProgress) onProgress(percent);
          }
        },
        (error) => {
          console.error('Firebase Storage upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error initiating upload to Firebase Storage:', error);
    throw error;
  }
}

/**
 * Delete a file from Firebase Cloud Storage by path or URL
 */
export async function deleteFileFromFirebaseStorage(storagePathOrUrl: string): Promise<void> {
  try {
    const storageRef = storagePathOrUrl.startsWith('http')
      ? ref(storage, storagePathOrUrl)
      : ref(storage, storagePathOrUrl);
    await deleteObject(storageRef);
  } catch (error) {
    console.warn('Firebase Storage file delete note:', error);
  }
}

/**
 * Save an OSCE procedure video item to Firestore collection `osce_videos`
 */
export async function saveOsceVideoToFirestore(video: OsceVideo): Promise<void> {
  const path = `osce_videos/${video.id}`;
  try {
    const cleanVideo = JSON.parse(JSON.stringify(video));
    await setDoc(doc(db, 'osce_videos', video.id), {
      ...cleanVideo,
      updatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
      console.warn('Firestore OSCE video write queued in offline cache:', path);
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetch all OSCE procedure videos from Firestore
 */
export async function fetchOsceVideosFromFirestore(): Promise<OsceVideo[]> {
  const path = 'osce_videos';
  try {
    const q = query(collection(db, 'osce_videos'));
    const snapshot = await getDocs(q);
    const videos: OsceVideo[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as OsceVideo;
      if (data && data.id) {
        videos.push(data);
      }
    });
    return videos;
  } catch (error: any) {
    if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
      console.warn('Operating in offline mode for OSCE videos collection.');
      return [];
    }
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

/**
 * Subscribe in real-time to Firestore `osce_videos` collection.
 * Any new video uploaded to the cloud immediately updates all connected clients.
 */
export function subscribeToFirestoreOsceVideos(callback: (videos: OsceVideo[]) => void) {
  const q = query(collection(db, 'osce_videos'));
  return onSnapshot(
    q,
    (snapshot) => {
      const videos: OsceVideo[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as OsceVideo;
        if (data && data.id) {
          videos.push(data);
        }
      });
      callback(videos);
    },
    (error) => {
      console.warn('Firestore real-time OSCE videos snapshot error:', error);
    }
  );
}

/**
 * Delete an OSCE video from Firestore
 */
export async function deleteOsceVideoFromFirestore(videoId: string): Promise<void> {
  const path = `osce_videos/${videoId}`;
  try {
    await deleteDoc(doc(db, 'osce_videos', videoId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Seed initial Zambian OSCE videos into Firestore if database is empty
 */
export async function seedInitialOsceVideosToFirestore(initialVideos: OsceVideo[]): Promise<void> {
  try {
    const existing = await fetchOsceVideosFromFirestore();
    if (existing.length === 0) {
      console.log('Seeding initial Zambian OSCE procedure videos to Firestore Cloud...');
      for (const video of initialVideos) {
        await saveOsceVideoToFirestore(video);
      }
    }
  } catch (error) {
    console.warn('Could not auto-seed OSCE videos to Firestore:', error);
  }
}

