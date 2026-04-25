import { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db, UserProfile, UserRole } from '../firebase';
import { motion } from 'motion/react';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface OnboardingProps {
  user: User;
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding = ({ user, onComplete }: OnboardingProps) => {
  const [role, setRole] = useState<UserRole>(UserRole.CLASS_REP);
  const [department, setDepartment] = useState('');
  const [course, setCourse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const profile: UserProfile = {
      id: user.uid,
      name: user.displayName || 'Anonymous User',
      email: user.email || '',
      role,
      departmentId: department,
      courseId: course,
    };

    try {
      await setDoc(doc(db, 'users', user.uid), profile);
      onComplete(profile);
    } catch (error) {
      console.error('Error saving profile', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl"
      >
        <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
        <p className="mt-1 text-gray-500">Welcome, {user.displayName}. Please select your role and department.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Your Role</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {[
                { id: UserRole.CLASS_REP, label: 'Class Representative' },
                { id: UserRole.TRAINER, label: 'Trainer' },
                { id: UserRole.HOD, label: 'Head of Department' },
                { id: UserRole.DEPUTY_PRINCIPAL, label: 'Deputy Principal' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id as UserRole)}
                  className={`flex items-center justify-center rounded-lg border p-3 text-sm font-medium transition-all ${
                    role === r.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {r.label}
                  {role === r.id && <CheckCircle2 className="ml-2 h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
              <input
                id="department"
                type="text"
                required={role !== UserRole.DEPUTY_PRINCIPAL}
                placeholder="e.g. Information Technology"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            {role === UserRole.CLASS_REP && (
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700">Course / Class</label>
                <input
                  id="course"
                  type="text"
                  required
                  placeholder="e.g. Diploma in CS 2024"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Get Started'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
