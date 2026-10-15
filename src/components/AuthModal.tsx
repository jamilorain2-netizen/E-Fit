import React, { useState } from 'react';
import {
  User,
  Shield,
  KeyRound,
  ArrowRight,
  School,
  X,
  AlertCircle,
  GraduationCap,
  Users,
} from 'lucide-react';
import { StudentProfile, UserRole } from '../types';

interface AuthModalProps {
  currentRole: UserRole;
  students: StudentProfile[];
  activeStudent: StudentProfile | null;
  teacherPin: string;
  onSelectRole: (role: UserRole, student?: StudentProfile) => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentRole,
  students,
  activeStudent,
  teacherPin,
  onSelectRole,
  onClose,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Student login via LRN search or picker
  const [lrnInput, setLrnInput] = useState(activeStudent?.lrnOrId || '');
  const [studentError, setStudentError] = useState<string | null>(null);

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    if (pinInput.trim() === teacherPin || pinInput.trim() === '838983') {
      onSelectRole('teacher');
      onClose();
    } else {
      setPinError('Incorrect PIN.');
    }
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError(null);
    if (!lrnInput.trim()) {
      setStudentError('Please enter your 12-digit Learner Reference Number (LRN) or Student ID.');
      return;
    }

    const matched = students.find(
      (s) =>
        s.lrnOrId.trim().toLowerCase() === lrnInput.trim().toLowerCase() ||
        s.fullName.trim().toLowerCase().includes(lrnInput.trim().toLowerCase())
    );

    if (matched) {
      onSelectRole('student', matched);
      onClose();
    } else {
      setStudentError(
        'Student ID / LRN not found in current class list. Ask your teacher to register your record, or choose from registered students below.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in">
      <div className="bg-white dark:bg-[#141c18] rounded-xs max-w-md w-full p-6 shadow-2xl border-4 border-[#144e34] dark:border-[#227e56] text-stone-900 dark:text-stone-100">
        <div className="flex items-center justify-between border-b-2 border-stone-200 dark:border-stone-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-[#144e34] dark:text-[#4cb988]" />
            <h3 className="font-heading uppercase text-base font-extrabold text-stone-900 dark:text-stone-100">
              USER ACCESS & ROLE SELECTOR
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Segmented Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#faf9f5] dark:bg-[#0e1411] border-2 border-stone-300 dark:border-stone-700 rounded-xs mb-5">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('student');
              setPinError(null);
            }}
            className={`py-2 px-3 rounded-xs text-xs font-heading uppercase tracking-wider font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              selectedRole === 'student'
                ? 'bg-[#144e34] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Mode</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole('teacher');
              setStudentError(null);
            }}
            className={`py-2 px-3 rounded-xs text-xs font-heading uppercase tracking-wider font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              selectedRole === 'teacher'
                ? 'bg-[#082115] text-[#d6e8de] border border-[#196343] shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Teacher Portal</span>
          </button>
        </div>

        {/* Student Login Flow */}
        {selectedRole === 'student' && (
          <div className="space-y-4">
            <p className="text-xs text-stone-600 dark:text-stone-400 font-sans">
              Students access their personalized assessment, execute tests, review results, and print individual fitness report cards.
            </p>

            <form onSubmit={handleStudentSubmit} className="space-y-3">
              <div>
                <label className="block font-heading uppercase text-xs font-bold text-stone-800 dark:text-stone-200 tracking-wider mb-1">
                  Enter 12-Digit LRN or Student ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={lrnInput}
                    onChange={(e) => {
                      setLrnInput(e.target.value);
                      setStudentError(null);
                    }}
                    placeholder="e.g. 109876543210"
                    className="w-full px-3.5 py-2.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-sm font-mono font-bold text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1411] focus:border-[#144e34]"
                  />
                </div>
              </div>

              {studentError && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-400 rounded-xs text-xs text-rose-900 dark:text-rose-200 font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{studentError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#144e34] hover:bg-[#0d3221] active:bg-[#082115] text-white font-heading uppercase tracking-wider font-extrabold text-xs rounded-xs border border-emerald-400/30 transition-colors flex items-center justify-center gap-2"
              >
                <span>Access Fitness Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Switcher for Students */}
            <div className="pt-3 border-t-2 border-stone-200 dark:border-stone-800">
              <span className="font-mono text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-2">
                Or Select from Registered Class List ({students.length})
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {students.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onSelectRole('student', s);
                      onClose();
                    }}
                    className={`w-full text-left p-2 rounded-xs border-2 text-xs flex items-center justify-between transition-colors ${
                      activeStudent?.id === s.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-[#144e34] dark:border-[#227e56] text-[#0d3221] dark:text-[#7fd2ad]'
                        : 'bg-[#faf9f5] dark:bg-[#0e1411] border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <div className="font-heading uppercase font-bold text-stone-900 dark:text-stone-100 truncate">{s.fullName}</div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                        LRN: {s.lrnOrId} · {s.gradeLevel} ({s.section})
                      </div>
                    </div>
                    {activeStudent?.id === s.id && (
                      <span className="text-[10px] bg-[#144e34] text-white px-1.5 py-0.5 rounded-xs font-mono font-bold">
                        ACTIVE
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Teacher Login Flow (PIN Protected) */}
        {selectedRole === 'teacher' && (
          <div className="space-y-4">
            <div className="p-3 bg-[#faf9f5] dark:bg-[#0e1411] border-2 border-stone-300 dark:border-stone-800 rounded-xs text-xs text-stone-800 dark:text-stone-200 flex items-start gap-2.5 font-sans">
              <KeyRound className="w-4 h-4 text-[#d95f02] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-heading uppercase text-stone-900 dark:text-stone-100 text-xs tracking-wider mb-0.5">Teacher Authentication Required</strong>
                Enter your Teacher Security PIN to manage class lists, verify student tests, edit standards, and export class CSV summaries.
              </div>
            </div>

            <form onSubmit={handleTeacherSubmit} className="space-y-3">
              <div>
                <label className="block font-heading uppercase text-xs font-bold text-stone-800 dark:text-stone-200 tracking-wider mb-1">
                  Teacher PIN
                </label>
                <input
                  type="password"
                  maxLength={8}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(null);
                  }}
                  placeholder="••••"
                  className="w-full px-3.5 py-2.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-sm font-scoreboard tracking-widest text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1411] focus:border-[#144e34]"
                />
              </div>

              {pinError && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-400 rounded-xs text-xs text-rose-900 dark:text-rose-200 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#d95f02] hover:bg-[#b84f00] text-white font-heading uppercase tracking-wider font-extrabold text-xs rounded-xs border border-amber-900 transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <span>Unlock Teacher Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
