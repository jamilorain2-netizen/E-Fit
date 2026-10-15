import React, { useState } from 'react';
import {
  UserPlus,
  LogIn,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  School,
} from 'lucide-react';
import { StudentProfile, Sex, JuniorHighGrade } from '../types';
import { FirebaseService } from '../services/firebaseService';
import { StorageService } from '../services/storageService';
import { hashPin, validateLrn, validatePin, validateClassCode } from '../utils/auth';

interface StudentLoginModalProps {
  onEnrolled: (student: StudentProfile) => void;
  onLoggedIn: (student: StudentProfile) => void;
  onSwitchToTeacher: () => void;
  defaultClassCode?: string;
}

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({
  onEnrolled,
  onLoggedIn,
  onSwitchToTeacher,
  defaultClassCode = '',
}) => {
  const [activeTab, setActiveTab] = useState<'join' | 'login'>('join');

  // Join form state
  const [classCode, setClassCode] = useState(defaultClassCode || '');
  const [lrn, setLrn] = useState('');
  const [fullName, setFullName] = useState('');
  const [sex, setSex] = useState<Sex>('female');
  const [age, setAge] = useState<number>(14);
  const [gradeLevel, setGradeLevel] = useState<JuniorHighGrade>('Grade 8');
  const [section, setSection] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [parentConsent, setParentConsent] = useState(false);

  // Login form state (Returning students)
  const [loginLrn, setLoginLrn] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [showLoginPin, setShowLoginPin] = useState(false);

  // Status & Errors
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle Enrollment of New Student
  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const cleanCode = classCode.trim().toUpperCase();
    const cleanLrn = lrn.trim();
    const cleanName = fullName.trim();
    const cleanSection = section.trim();
    const cleanPin = pin.trim();

    if (!cleanCode) {
      setErrorMsg('Please enter your 6-character Class Code given by your PE teacher.');
      return;
    }

    if (!validateClassCode(cleanCode)) {
      setErrorMsg('Invalid Class Code format. Must be a 4 to 8 character code (e.g. JH7X9K).');
      return;
    }

    if (!cleanLrn || !validateLrn(cleanLrn)) {
      setErrorMsg('Learner Reference Number (LRN) must be exactly 12 numeric digits.');
      return;
    }

    if (!cleanName) {
      setErrorMsg('Please enter your full student name.');
      return;
    }

    if (!cleanSection) {
      setErrorMsg('Please enter your class section (e.g. Sampaguita).');
      return;
    }

    if (!cleanPin || !validatePin(cleanPin)) {
      setErrorMsg('Please create a 4-digit numeric PIN for your account.');
      return;
    }

    if (!parentConsent) {
      setErrorMsg('Please confirm parent or guardian consent under RA 10173.');
      return;
    }

    setLoading(true);

    try {
      // 1. Check if LRN already exists under this class code in Firestore or locally
      const existing = await FirebaseService.findStudentByLrn(cleanLrn);
      if (existing) {
        setInfoMsg(`LRN ${cleanLrn} is already registered! Please enter your 4-digit PIN below to log in.`);
        setLoginLrn(cleanLrn);
        setActiveTab('login');
        setLoading(false);
        return;
      }

      // 2. Hash PIN securely (SHA-256)
      const hashed = await hashPin(cleanPin);

      // 3. Build Student Profile
      const newStudent: StudentProfile = {
        id: `student_${Date.now()}_${cleanLrn.slice(-4)}`,
        lrnOrId: cleanLrn,
        classCode: cleanCode,
        pinHash: hashed,
        fullName: cleanName,
        age: Number(age),
        sex,
        gradeLevel,
        section: cleanSection,
        schoolName: 'Mabini National High School (Junior High)',
        teacherName: 'PE Department Facilitator',
        assessmentDate: new Date().toISOString().split('T')[0],
        safetyAcknowledged: false, // will complete on safety screen next
        flaggedForGuidance: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 4. Save to Firestore
      await FirebaseService.enrollStudent(newStudent);

      // 5. Save locally and proceed
      StorageService.saveStudent(newStudent);
      StorageService.setActiveStudentId(newStudent.id);
      onEnrolled(newStudent);
    } catch (err: any) {
      console.error('Enrollment error:', err);
      // Fallback: save locally even if offline
      try {
        const hashed = await hashPin(cleanPin);
        const fallbackStudent: StudentProfile = {
          id: `student_${Date.now()}_${cleanLrn.slice(-4)}`,
          lrnOrId: cleanLrn,
          classCode: cleanCode,
          pinHash: hashed,
          fullName: cleanName,
          age: Number(age),
          sex,
          gradeLevel,
          section: cleanSection,
          schoolName: 'Mabini National High School (Junior High)',
          teacherName: 'PE Department Facilitator',
          assessmentDate: new Date().toISOString().split('T')[0],
          safetyAcknowledged: false,
          flaggedForGuidance: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        StorageService.saveStudent(fallbackStudent);
        StorageService.setActiveStudentId(fallbackStudent.id);
        onEnrolled(fallbackStudent);
      } catch (e) {
        setErrorMsg('Unable to enroll right now. Please verify your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Returning Student Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const cleanLrn = loginLrn.trim();
    const cleanPin = loginPin.trim();

    if (!cleanLrn || !validateLrn(cleanLrn)) {
      setErrorMsg('Please enter your valid 12-digit DepEd LRN.');
      return;
    }

    if (!cleanPin || !validatePin(cleanPin)) {
      setErrorMsg('Please enter your 4-digit PIN.');
      return;
    }

    setLoading(true);

    try {
      // First check Firestore
      const res = await FirebaseService.verifyStudentLogin(cleanLrn, cleanPin);
      if (res.success && res.student) {
        StorageService.saveStudent(res.student);
        StorageService.setActiveStudentId(res.student.id);
        onLoggedIn(res.student);
        return;
      }

      // Check local students as fallback
      const localStudents = StorageService.getStudents();
      const localMatched = localStudents.find((s) => s.lrnOrId === cleanLrn);
      if (localMatched) {
        const hashed = await hashPin(cleanPin);
        if (localMatched.pinHash === hashed || !localMatched.pinHash) {
          StorageService.setActiveStudentId(localMatched.id);
          onLoggedIn(localMatched);
          return;
        }
      }

      setErrorMsg(res.message || 'Incorrect LRN or PIN. If you forgot your PIN, ask your PE teacher to reset it.');
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('Connection error. Please check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#141c18] rounded-xs max-w-lg w-full p-5 sm:p-7 shadow-2xl border-4 border-[#144e34] dark:border-[#227e56] text-stone-900 dark:text-stone-100 my-auto max-h-[95vh] overflow-y-auto">
        {/* Top Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-xs bg-[#082115] text-[#4cb988] border-2 border-[#196343] flex items-center justify-center mx-auto mb-2.5 font-bold shadow-xs">
            {activeTab === 'join' ? <UserPlus className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
          </div>
          <h2 className="font-heading uppercase text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 tracking-wide">
            {activeTab === 'join' ? 'JOIN YOUR CLASS' : 'STUDENT LOGIN'}
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-sans">
            {activeTab === 'join'
              ? 'Self-enroll in your PE class using your teacher\'s Class Code.'
              : 'Enter your 12-digit LRN and 4-digit PIN to continue your tests.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-stone-100 dark:bg-[#082115] rounded-xs border border-stone-300 dark:border-stone-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab('join');
              setErrorMsg('');
              setInfoMsg('');
            }}
            className={`py-2 px-3 text-xs font-heading uppercase tracking-wider font-bold rounded-xs transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'join'
                ? 'bg-[#144e34] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Join Your Class</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
              setInfoMsg('');
            }}
            className={`py-2 px-3 text-xs font-heading uppercase tracking-wider font-bold rounded-xs transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-[#144e34] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>I Already Joined</span>
          </button>
        </div>

        {/* Status Messages */}
        {infoMsg && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-400 rounded-xs text-xs text-amber-900 dark:text-amber-200 font-bold flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-400 rounded-xs text-xs text-rose-900 dark:text-rose-200 font-bold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: JOIN YOUR CLASS */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinSubmit} className="space-y-3.5 font-sans">
            {/* Class Code */}
            <div>
              <label className="block font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider mb-1">
                TEACHER'S CLASS CODE <span className="text-[#E10600]">*</span>
              </label>
              <input
                type="text"
                maxLength={8}
                value={classCode}
                onChange={(e) => {
                  setClassCode(e.target.value.toUpperCase());
                  setErrorMsg('');
                }}
                placeholder="e.g. JH7X9K"
                className="w-full px-3.5 py-2.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1411] font-mono font-black text-center text-lg tracking-widest focus:border-[#144e34] uppercase"
                required
              />
              <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 block">
                Ask your PE teacher for this 6-character code.
              </span>
            </div>

            {/* 12-digit LRN */}
            <div>
              <label className="block font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider mb-1">
                12-DIGIT DEPED LRN <span className="text-[#E10600]">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={12}
                value={lrn}
                onChange={(e) => {
                  setLrn(e.target.value.replace(/\D/g, ''));
                  setErrorMsg('');
                }}
                placeholder="e.g. 109876543210"
                className="w-full px-3.5 py-2.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1411] font-mono font-bold text-sm focus:border-[#144e34]"
                required
              />
              <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 block">
                Found on your school ID or DepEd Form 137 / 138 ({lrn.length}/12 digits).
              </span>
            </div>

            {/* Full Name */}
            <div>
              <label className="block font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider mb-1">
                FULL NAME <span className="text-[#E10600]">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="e.g. Maria Elena Santos"
                className="w-full px-3.5 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1411] text-sm focus:border-[#144e34]"
                required
              />
            </div>

            {/* Sex Selection */}
            <div>
              <label className="block font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider mb-1">
                SEX FOR NORMATIVE STANDARDS <span className="text-[#E10600]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSex('female')}
                  className={`py-2 px-3 rounded-xs text-xs font-heading font-bold uppercase transition-colors border-2 ${
                    sex === 'female'
                      ? 'bg-[#E10600] text-white border-[#E10600]'
                      : 'bg-white dark:bg-[#0e1411] text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  Female
                </button>
                <button
                  type="button"
                  onClick={() => setSex('male')}
                  className={`py-2 px-3 rounded-xs text-xs font-heading font-bold uppercase transition-colors border-2 ${
                    sex === 'male'
                      ? 'bg-[#E10600] text-white border-[#E10600]'
                      : 'bg-white dark:bg-[#0e1411] text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  Male
                </button>
              </div>
            </div>

            {/* Age & Grade */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider mb-1">
                  AGE (12-16) <span className="text-[#E10600]">*</span>
                </label>
                <select
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1411] text-sm font-mono focus:border-[#144e34]"
                >
                  <option value={12}>12 years old</option>
                  <option value={13}>13 years old</option>
                  <option value={14}>14 years old</option>
                  <option value={15}>15 years old</option>
                  <option value={16}>16 years old</option>
                </select>
              </div>

              <div>
                <label className="block font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider mb-1">
                  GRADE <span className="text-[#E10600]">*</span>
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value as JuniorHighGrade)}
                  className="w-full px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1411] text-sm font-heading font-bold focus:border-[#144e34]"
                >
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                </select>
              </div>
            </div>

            {/* Section */}
            <div>
              <label className="block font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider mb-1">
                SECTION <span className="text-[#E10600]">*</span>
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => {
                  setSection(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="e.g. Sampaguita, Diamond, Rizal"
                className="w-full px-3.5 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1411] text-sm focus:border-[#144e34]"
                required
              />
            </div>

            {/* Create 4-Digit PIN */}
            <div>
              <label className="block font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider mb-1">
                CREATE 4-DIGIT PIN <span className="text-[#E10600]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ''));
                    setErrorMsg('');
                  }}
                  placeholder="••••"
                  className="w-full px-3.5 py-2.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1411] font-mono text-center text-lg tracking-widest font-black focus:border-[#144e34]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 block">
                Create a private 4-digit PIN to securely access your data on any device.
              </span>
            </div>

            {/* Parental Consent Agreement */}
            <label className="flex items-start gap-2.5 p-3 rounded-xs border border-stone-300 dark:border-stone-800 bg-[#faf9f5] dark:bg-[#0e1411] cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={parentConsent}
                onChange={(e) => setParentConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-[#144e34] rounded-xs border-stone-400 focus:ring-[#144e34]"
                required
              />
              <span className="text-stone-700 dark:text-stone-300 leading-tight">
                <strong>Parent / Guardian Consent:</strong> I confirm parent/guardian awareness to participate in DepEd physical fitness testing under RA 10173 data privacy guidelines.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#144e34] hover:bg-[#0d3221] active:bg-[#082115] text-white font-heading uppercase tracking-wider font-extrabold text-sm rounded-xs border border-emerald-400/30 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span>{loading ? 'Enrolling in Class...' : 'Enroll & Start Tests'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 2: RETURNING STUDENT LOGIN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 font-sans">
            <div>
              <label className="block font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider mb-1">
                ENTER 12-DIGIT DEPED LRN
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={12}
                value={loginLrn}
                onChange={(e) => {
                  setLoginLrn(e.target.value.replace(/\D/g, ''));
                  setErrorMsg('');
                }}
                placeholder="e.g. 109876543210"
                className="w-full px-3.5 py-2.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1411] font-mono font-bold text-sm focus:border-[#144e34]"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider mb-1">
                ENTER YOUR 4-DIGIT PIN
              </label>
              <div className="relative">
                <input
                  type={showLoginPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={4}
                  value={loginPin}
                  onChange={(e) => {
                    setLoginPin(e.target.value.replace(/\D/g, ''));
                    setErrorMsg('');
                  }}
                  placeholder="••••"
                  className="w-full px-3.5 py-2.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1411] font-mono text-center text-lg tracking-widest font-black focus:border-[#144e34]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPin(!showLoginPin)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  {showLoginPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 block">
                Forgot your PIN? Ask your PE teacher to reset it from their dashboard.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#144e34] hover:bg-[#0d3221] active:bg-[#082115] text-white font-heading uppercase tracking-wider font-extrabold text-sm rounded-xs border border-emerald-400/30 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Logging In...' : 'Log In & View My Scores'}</span>
            </button>
          </form>
        )}

        {/* Footer: Teacher Switch Modal Trigger */}
        <div className="mt-6 pt-3.5 border-t-2 border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
          <span className="text-stone-600 dark:text-stone-400 font-sans">Are you a PE teacher?</span>
          <button
            type="button"
            onClick={onSwitchToTeacher}
            className="text-[#d95f02] hover:text-[#b84f00] font-heading uppercase tracking-wider font-bold flex items-center gap-1.5 p-1 rounded-xs hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <KeyRound className="w-4 h-4 text-[#d95f02]" />
            <span>Teacher Login (PIN)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
