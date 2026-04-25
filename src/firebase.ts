import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, onSnapshot, addDoc, updateDoc, Timestamp, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export enum UserRole {
  CLASS_REP = 'class_rep',
  TRAINER = 'trainer',
  HOD = 'hod',
  DEPUTY_PRINCIPAL = 'deputy_principal',
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  courseId?: string;
}

export enum LessonStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  VERIFIED_MISSED = 'VERIFIED_MISSED',
  REJECTED = 'REJECTED',
  RECOVERY_ACTIVE = 'RECOVERY_ACTIVE',
  COMPLETED = 'COMPLETED',
}

export interface MissedLesson {
  id: string;
  unitId: string;
  unitName?: string;
  trainerId: string;
  trainerName?: string;
  classRepId: string;
  departmentId: string;
  week: number;
  status: LessonStatus;
  trainerResponse?: 'confirmed' | 'disputed';
  trainerComment?: string;
  hodComment?: string;
  createdAt: any;
}

export interface Recovery {
  id: string;
  missedLessonId: string;
  status: 'INACTIVE' | 'ACTIVE' | 'COMPLETED';
  sessionPlanUrl?: string;
  attendanceUrl?: string;
  classRepConfirmation?: boolean;
  scheduledAt?: any;
  updatedAt?: any;
}

export const signIn = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in', error);
    throw error;
  }
};

export const logout = () => signOut(auth);

// Test connection as required by guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
