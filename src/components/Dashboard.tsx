import { useState, useEffect } from 'react';
import { UserProfile, UserRole, MissedLesson, db, LessonStatus } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, updateDoc, doc, Timestamp, getDocs } from 'firebase/firestore';
import { Plus, Clock, CheckCircle2, XCircle, AlertCircle, Trash2, MessageSquare, ArrowRight, FileCheck, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  profile: UserProfile;
}

export const Dashboard = ({ profile }: DashboardProps) => {
  const [lessons, setLessons] = useState<MissedLesson[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<MissedLesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q;
    const lessonsRef = collection(db, 'missed_lessons');

    if (profile.role === UserRole.CLASS_REP) {
      q = query(lessonsRef, where('classRepId', '==', profile.id), orderBy('createdAt', 'desc'));
    } else if (profile.role === UserRole.TRAINER) {
      q = query(lessonsRef, where('trainerId', '==', profile.id), orderBy('createdAt', 'desc'));
    } else if (profile.role === UserRole.HOD) {
      q = query(lessonsRef, where('departmentId', '==', profile.departmentId), orderBy('createdAt', 'desc'));
    } else {
      q = query(lessonsRef, orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MissedLesson));
      setLessons(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const stats = {
    total: lessons.length,
    pending: lessons.filter(l => l.status === LessonStatus.PENDING_VERIFICATION).length,
    verified: lessons.filter(l => l.status === LessonStatus.VERIFIED_MISSED).length,
    active: lessons.filter(l => l.status === LessonStatus.RECOVERY_ACTIVE).length,
    completed: lessons.filter(l => l.status === LessonStatus.COMPLETED).length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / (stats.total)) * 100) : 0;

  return (
    <div className="flex flex-col min-h-full">
      {/* Top Statistics Row */}
      <header className="h-auto lg:h-48 border-b border-[#1A1A1A] grid grid-cols-1 md:grid-cols-3 bg-white">
        <div className="p-8 border-b md:border-b-0 md:border-r border-[#1A1A1A] flex flex-col justify-between">
          <span className="text-[11px] uppercase tracking-widest font-bold opacity-60 italic">Missed Units (Total)</span>
          <h2 className="text-6xl lg:text-7xl font-serif leading-none tracking-tighter mt-4">{stats.total}</h2>
        </div>
        <div className="p-8 border-b md:border-b-0 md:border-r border-[#1A1A1A] flex flex-col justify-between">
          <span className="text-[11px] uppercase tracking-widest font-bold opacity-60 italic text-[#F59E0B]">Active Recoveries</span>
          <h2 className="text-6xl lg:text-7xl font-serif leading-none tracking-tighter text-[#F59E0B] mt-4">{stats.active}</h2>
        </div>
        <div className="p-8 flex flex-col justify-between bg-[#1A1A1A] text-white">
          <span className="text-[11px] uppercase tracking-widest font-bold opacity-60 italic">Completion Rate</span>
          <h2 className="text-6xl lg:text-7xl font-serif leading-none tracking-tighter text-[#10B981] mt-4">{completionRate}%</h2>
        </div>
      </header>

      {/* Main Content Detail Section */}
      <section className="flex-1 p-8">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h3 className="text-3xl font-serif italic text-[#1A1A1A]">Accountability Tracker</h3>
            <p className="text-[10px] uppercase tracking-widest opacity-50 font-bold mt-1">Department: {profile.departmentId || 'System Wide'}</p>
          </div>
          
          {profile.role === UserRole.CLASS_REP && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus size={16} />
              New Report
            </button>
          )}
        </div>

        <div className="border border-[#1A1A1A] bg-white overflow-hidden shadow-[4px_4px_0px_0px_#1A1A1A]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest opacity-40 border-b border-[#1A1A1A] bg-gray-50">
                <th className="px-6 py-4 font-bold italic">Unit / Subject</th>
                <th className="px-6 py-4 font-bold italic">Trainer</th>
                <th className="px-6 py-4 font-bold italic hidden sm:table-cell">Week</th>
                <th className="px-6 py-4 font-bold italic">Status</th>
                <th className="px-6 py-4 font-bold italic text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {lessons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic font-serif">
                    No accountability records found.
                  </td>
                </tr>
              ) : (
                lessons.map((lesson) => (
                  <LessonItem 
                    key={lesson.id} 
                    lesson={lesson} 
                    profile={profile} 
                    onEdit={() => setEditingLesson(lesson)} 
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AnimatePresence>
        {showAddForm && (
          <ReportModal profile={profile} onClose={() => setShowAddForm(false)} />
        )}
        {editingLesson && (
          <ReportModal 
            profile={profile} 
            lesson={editingLesson} 
            onClose={() => setEditingLesson(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const LessonItem = ({ lesson, profile, onEdit }: { lesson: MissedLesson, profile: UserProfile, onEdit: () => void }) => {
  const [submitting, setSubmitting] = useState(false);
  const [showTrainerModal, setShowTrainerModal] = useState(false);

  const updateStatus = async (newStatus: LessonStatus, comment?: string) => {
    setSubmitting(true);
    try {
      const update: any = { status: newStatus };
      if (profile.role === UserRole.HOD) update.hodComment = comment;
      if (profile.role === UserRole.TRAINER) {
        update.trainerResponse = newStatus === LessonStatus.VERIFIED_MISSED ? 'confirmed' : 'disputed';
        update.trainerComment = comment;
      }
      
      await updateDoc(doc(db, 'missed_lessons', lesson.id), update);
      
      // Notify HOD
      if (profile.role === UserRole.TRAINER) {
        await addDoc(collection(db, 'notifications'), {
          userId: 'dept_' + lesson.departmentId,
          message: `Trainer ${profile.name} has ${update.trainerResponse} the report for ${lesson.unitId}`,
          status: 'UNREAD',
          createdAt: Timestamp.now(),
          referenceId: lesson.id
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrainerResponse = async (response: 'confirmed' | 'disputed', comment: string) => {
    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'missed_lessons', lesson.id), {
        trainerResponse: response,
        trainerComment: comment
      });
      
      await addDoc(collection(db, 'notifications'), {
        userId: 'dept_' + lesson.departmentId, 
        message: `Trainer ${profile.name} has ${response} the missed lesson report for ${lesson.unitId}`,
        status: 'UNREAD',
        createdAt: Timestamp.now(),
        referenceId: lesson.id
      });
      setShowTrainerModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const activateRecovery = async () => {
     setSubmitting(true);
     try {
       await updateDoc(doc(db, 'missed_lessons', lesson.id), { status: LessonStatus.RECOVERY_ACTIVE });
       await addDoc(collection(db, 'recoveries'), {
         missedLessonId: lesson.id,
         status: 'ACTIVE',
         updatedAt: Timestamp.now()
       });
     } catch (e) { console.error(e); }
     finally { setSubmitting(false); }
  };

  const statusColors = {
    [LessonStatus.PENDING_VERIFICATION]: 'bg-[#E11D48]',
    [LessonStatus.VERIFIED_MISSED]: 'bg-[#F59E0B]',
    [LessonStatus.REJECTED]: 'bg-gray-400',
    [LessonStatus.RECOVERY_ACTIVE]: 'bg-[#F59E0B]',
    [LessonStatus.COMPLETED]: 'bg-[#10B981]',
  };

  return (
    <>
      <tr className="border-b border-[#1A1A1A] border-opacity-10 hover:bg-gray-50 transition-colors">
        <td className="px-6 py-6 font-medium">
          <div className="flex flex-col">
            <span>{lesson.unitId}</span>
            <span className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Ref: #{lesson.id.slice(0, 6)}</span>
          </div>
        </td>
        <td className="px-6 py-6 opacity-80">{lesson.trainerId}</td>
        <td className="px-6 py-6 opacity-60 hidden sm:table-cell italic">{lesson.week}</td>
        <td className="px-6 py-6">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${statusColors[lesson.status]}`}></span>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
              {lesson.status.replace('_', ' ')}
            </span>
          </div>
          {lesson.trainerComment && (
             <p className="text-[10px] italic opacity-50 mt-1 max-w-[200px] truncate">"{lesson.trainerComment}"</p>
          )}
        </td>
        <td className="px-6 py-6 text-right">
          <div className="flex justify-end gap-3">
            {((profile.role === UserRole.CLASS_REP && lesson.classRepId === profile.id) || 
              (profile.role === UserRole.HOD && profile.departmentId === lesson.departmentId)) && 
              lesson.status === LessonStatus.PENDING_VERIFICATION && (
              <button 
                onClick={onEdit} 
                className="text-[#1A1A1A] hover:bg-gray-200 p-2 rounded transition-colors" 
                title="Edit Report"
              >
                <Pencil size={14} />
              </button>
            )}

            {profile.role === UserRole.TRAINER && lesson.trainerId === profile.id && lesson.status === LessonStatus.PENDING_VERIFICATION && !lesson.trainerResponse && (
               <button 
                  onClick={() => setShowTrainerModal(true)}
                  className="text-xs font-bold uppercase tracking-widest border-b border-[#1A1A1A] hover:opacity-50 transition-opacity"
               >
                 Respond
               </button>
            )}

            {profile.role === UserRole.HOD && lesson.status === LessonStatus.PENDING_VERIFICATION && (
               <div className="flex gap-4">
                 <button onClick={() => updateStatus(LessonStatus.VERIFIED_MISSED, 'Approved by HOD')} className="text-green-600 hover:opacity-60" title="Verify Report"><CheckCircle2 size={16} /></button>
                 <button onClick={() => updateStatus(LessonStatus.REJECTED, 'Rejected by HOD')} className="text-red-600 hover:opacity-60" title="Reject Report"><XCircle size={16} /></button>
               </div>
            )}
            
            {profile.role === UserRole.CLASS_REP && lesson.status === LessonStatus.VERIFIED_MISSED && (
               <button onClick={activateRecovery} disabled={submitting} className="text-xs font-bold uppercase tracking-widest border-b border-[#1A1A1A] hover:opacity-50 transition-opacity">
                 {submitting ? '...' : 'Recover'}
               </button>
            )}

            {profile.role === UserRole.TRAINER && lesson.status === LessonStatus.RECOVERY_ACTIVE && (
              <button 
                onClick={() => updateStatus(LessonStatus.COMPLETED, 'Taught successfully')} 
                className="text-xs font-bold uppercase tracking-widest border-b border-[#1A1A1A] hover:opacity-50 transition-opacity"
              >
                Done
              </button>
            )}

            {profile.role === UserRole.HOD && lesson.status === LessonStatus.RECOVERY_ACTIVE && (
               <button onClick={() => updateStatus(LessonStatus.COMPLETED, 'Verified recovery')} className="text-xs font-bold uppercase tracking-widest px-3 py-1 bg-[#1A1A1A] text-white">
                 Close
               </button>
            )}
          </div>
        </td>
      </tr>
      <AnimatePresence>
        {showTrainerModal && (
          <TrainerResponseModal 
            onConfirm={(comment) => handleTrainerResponse('confirmed', comment)}
            onDispute={(comment) => handleTrainerResponse('disputed', comment)}
            onClose={() => setShowTrainerModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

const TrainerResponseModal = ({ onConfirm, onDispute, onClose }: { onConfirm: (c: string) => void, onDispute: (c: string) => void, onClose: () => void }) => {
  const [comment, setComment] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#FAF9F6] w-full max-w-md border border-[#1A1A1A] p-10 shadow-[8px_8px_0px_0px_#1A1A1A]">
        <h3 className="text-2xl font-serif italic mb-2">Trainer Response</h3>
        <p className="text-xs text-gray-500 mb-8 uppercase tracking-widest font-bold opacity-60 italic">Academic Accountability</p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2 italic">Contextual Explanation</label>
            <textarea 
              value={comment} 
              onChange={e => setComment(e.target.value)} 
              placeholder="Provide reason for dispute if applicable..."
              className="w-full p-4 bg-white border border-[#1A1A1A] border-opacity-20 focus:border-opacity-100 outline-none h-32 resize-none text-sm italic"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => onDispute(comment)} 
              disabled={!comment}
              className="px-6 py-4 border border-[#1A1A1A] text-xs font-bold uppercase tracking-widest hover:bg-red-50 disabled:opacity-30 transition-all"
            >
              Dispute
            </button>
            <button 
              onClick={() => onConfirm(comment)} 
              className="px-6 py-4 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md"
            >
              Confirm
            </button>
          </div>
          <button onClick={onClose} className="w-full text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-opacity">Abort Response</button>
        </div>
      </motion.div>
    </div>
  );
};

const ReportModal = ({ profile, lesson, onClose }: { profile: UserProfile, lesson?: MissedLesson, onClose: () => void }) => {
  const [unit, setUnit] = useState(lesson?.unitId || '');
  const [trainer, setTrainer] = useState(lesson?.trainerId || '');
  const [week, setWeek] = useState(lesson?.week || 1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (lesson) {
        await updateDoc(doc(db, 'missed_lessons', lesson.id), {
          unitId: unit,
          trainerId: trainer,
          week: Number(week),
        });
      } else {
        await addDoc(collection(db, 'missed_lessons'), {
          unitId: unit,
          trainerId: trainer,
          classRepId: profile.id,
          departmentId: profile.departmentId,
          week: Number(week),
          status: LessonStatus.PENDING_VERIFICATION,
          createdAt: Timestamp.now()
        });
      }
      onClose();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#FAF9F6] w-full max-w-md border border-[#1A1A1A] p-10 shadow-[8px_8px_0px_0px_#1A1A1A]">
        <h3 className="text-2xl font-serif italic mb-6">
          {lesson ? 'Modify Accountability Report' : 'New Missed Lesson Report'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2 italic">Unit / Academic Subject</label>
            <input required value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. Advanced Algorithms" className="w-full p-4 bg-white border border-[#1A1A1A] border-opacity-20 focus:border-opacity-100 outline-none text-sm font-medium" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2 italic">Lead Trainer / Researcher</label>
            <input required value={trainer} onChange={e => setTrainer(e.target.value)} placeholder="Instructor Full Name" className="w-full p-4 bg-white border border-[#1A1A1A] border-opacity-20 focus:border-opacity-100 outline-none text-sm font-medium" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2 italic">Semester Week</label>
               <input type="number" min="1" max="15" value={week} onChange={e => setWeek(Number(e.target.value))} className="w-full p-4 bg-white border border-[#1A1A1A] border-opacity-20 focus:border-opacity-100 outline-none text-sm font-medium" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2 italic">Initial State</label>
              <div className="p-4 bg-gray-100 italic opacity-40 text-sm">Awaiting Audit</div>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 border border-[#1A1A1A] text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all italic">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-6 py-4 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md italic">
              {loading ? '...' : (lesson ? 'Apply Changes' : 'Lodge Report')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
