/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { auth, db, UserProfile, UserRole, signIn, logout, testConnection } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as UserProfile);
        } else {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={signIn} />;
  }

  if (!profile) {
    return <Onboarding user={user} onComplete={handleOnboardingComplete} />;
  }

  return (
    <Layout user={user} profile={profile} onLogout={logout}>
      <Dashboard profile={profile} />
    </Layout>
  );
}

