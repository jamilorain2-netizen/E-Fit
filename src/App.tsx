/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  StudentProfile,
  FitnessTestKey,
  AssessmentRecord,
  StandardRow,
  TeacherConfig,
  DailyHabit,
  UserRole,
} from './types';
import { StorageService } from './services/storageService';
import { FirebaseService } from './services/firebaseService';
import { hashPin } from './utils/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Navbar, NavTab } from './components/Navbar';
import { StudentProfileScreen } from './components/StudentProfileScreen';
import { SafetyScreen } from './components/SafetyScreen';
import { StepTestComponent } from './components/tests/StepTestComponent';
import { PlankTestComponent } from './components/tests/PlankTestComponent';
import { PushUpTestComponent } from './components/tests/PushUpTestComponent';
import { ZipperTestComponent } from './components/tests/ZipperTestComponent';
import { SitAndReachComponent } from './components/tests/SitAndReachComponent';
import { BmiComponent } from './components/tests/BmiComponent';
import { FinalReportScreen } from './components/FinalReportScreen';
import { ProgressHistoryView } from './components/ProgressHistoryView';
import { TeacherDashboard } from './components/TeacherDashboard';
import { TeacherSettingsScreen } from './components/TeacherSettingsScreen';
import { DailyHabitsScreen } from './components/DailyHabitsScreen';
import { FitnessGoalPlanScreen } from './components/FitnessGoalPlanScreen';
import { DataPrivacyNotice } from './components/DataPrivacyNotice';
import { TeacherPinModal } from './components/TeacherPinModal';
import { StudentLoginModal } from './components/StudentLoginModal';
import {
  Heart,
  Timer,
  ShieldCheck,
  ArrowRightLeft,
  Ruler,
  Scale,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function App() {
  // Navigation & User Role
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [activeTab, setActiveTab] = useState<NavTab>('profile');
  const [activeTestKey, setActiveTestKey] = useState<FitnessTestKey>('step_test');

  // Modals
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showStudentLogin, setShowStudentLogin] = useState(false);

  // Persistence State
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [standards, setStandards] = useState<StandardRow[]>([]);
  const [teacherConfig, setTeacherConfig] = useState<TeacherConfig>(
    StorageService.getTeacherConfig()
  );
  const [dailyHabits, setDailyHabits] = useState<DailyHabit[]>([]);

  // Load state on mount
  useEffect(() => {
    // 1. Check Data Privacy Notice
    const privacyAck = StorageService.getDataPrivacyAcknowledged();
    if (!privacyAck) {
      setShowPrivacyNotice(true);
    }

    // 2. Load role
    const storedRole = StorageService.getCurrentRole();
    setCurrentRole(storedRole);

    // 3. Load students
    const loadedStudents = StorageService.getStudents();
    setStudents(loadedStudents);

    // 4. Load active student
    const activeId = StorageService.getActiveStudentId();
    const found = loadedStudents.find((s) => s.id === activeId) || loadedStudents[0] || null;
    if (found) {
      setCurrentStudent(found);
      StorageService.setActiveStudentId(found.id);
    } else if (storedRole === 'student') {
      setShowStudentLogin(true);
    }

    // 5. Load assessments, standards, config, habits
    setAssessments(StorageService.getAllAssessments());
    setStandards(StorageService.getStandards());
    setTeacherConfig(StorageService.getTeacherConfig());
    setDailyHabits(StorageService.getDailyHabits());

    // 6. Set initial tab based on role
    if (storedRole === 'teacher') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('profile');
    }
  }, []);

  // Real-time synchronization with Firestore (Students & Assessments)
  useEffect(() => {
    const classCode = teacherConfig.classCode || 'JH7X9K';
    const unsubStudents = FirebaseService.subscribeClassStudents(classCode, (firestoreStudents) => {
      setStudents(firestoreStudents);
      StorageService.saveStudents(firestoreStudents);
      if (currentStudent) {
        const found = firestoreStudents.find((s) => s.id === currentStudent.id);
        if (found) {
          setCurrentStudent(found);
        }
      }
    });

    const unsubAssessments = FirebaseService.subscribeClassAssessments(classCode, (firestoreAssessments) => {
      setAssessments(firestoreAssessments);
      StorageService.saveAllAssessments(firestoreAssessments);
    });

    return () => {
      unsubStudents();
      unsubAssessments();
    };
  }, [teacherConfig.classCode, currentStudent?.id]);

  // Current student's assessments (sorted)
  const studentAssessments = currentStudent
    ? assessments
        .filter((a) => a.studentId === currentStudent.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  // Latest assessment record for current student
  const latestAssessment: AssessmentRecord =
    studentAssessments.length > 0
      ? studentAssessments[studentAssessments.length - 1]
      : currentStudent
      ? {
          id: `assess-${currentStudent.id}-${Date.now()}`,
          studentId: currentStudent.id,
          date: currentStudent.assessmentDate,
          termLabel: 'Quarter 1 (Pre-Test Baseline)',
        }
      : {
          id: 'temp',
          studentId: '',
          date: new Date().toISOString().split('T')[0],
        };

  // Privacy Notice Accept
  const handleAcceptPrivacy = () => {
    StorageService.setDataPrivacyAcknowledged(true);
    setShowPrivacyNotice(false);
  };

  // Role switching
  const handleRequestTeacherMode = () => {
    setShowStudentLogin(false);
    setShowPinModal(true);
  };

  const handleTeacherPinSuccess = () => {
    setCurrentRole('teacher');
    StorageService.setCurrentRole('teacher');
    setShowPinModal(false);
    setShowStudentLogin(false);
    setActiveTab('dashboard');
  };

  const handleSwitchToStudentMode = () => {
    setCurrentRole('student');
    StorageService.setCurrentRole('student');
    if (!currentStudent) {
      setShowStudentLogin(true);
    }
    setActiveTab('profile');
  };

  // Student Enrollment & Login Handlers
  const handleStudentEnrolled = (newStudent: StudentProfile) => {
    setStudents((prev) => {
      const exists = prev.some((s) => s.id === newStudent.id);
      const updated = exists ? prev.map((s) => (s.id === newStudent.id ? newStudent : s)) : [...prev, newStudent];
      StorageService.saveStudents(updated);
      return updated;
    });
    setCurrentStudent(newStudent);
    StorageService.setActiveStudentId(newStudent.id);
    setShowStudentLogin(false);
    // Student goes straight to the Safety screen and the tests
    setActiveTab('safety');
  };

  const handleStudentLoggedIn = (student: StudentProfile) => {
    setStudents((prev) => {
      const exists = prev.some((s) => s.id === student.id);
      const updated = exists ? prev.map((s) => (s.id === student.id ? student : s)) : [...prev, student];
      StorageService.saveStudents(updated);
      return updated;
    });
    setCurrentStudent(student);
    StorageService.setActiveStudentId(student.id);
    setShowStudentLogin(false);
    if (student.safetyAcknowledged) {
      setActiveTab('tests');
    } else {
      setActiveTab('safety');
    }
  };

  const handleStudentLogout = () => {
    setCurrentStudent(null);
    StorageService.setActiveStudentId(null);
    setShowStudentLogin(true);
    setActiveTab('profile');
  };

  // Student Profile CRUD
  const handleSaveStudent = async (updatedStudent: StudentProfile) => {
    StorageService.saveStudent(updatedStudent);
    const updatedList = StorageService.getStudents();
    setStudents(updatedList);
    if (currentStudent?.id === updatedStudent.id || !currentStudent) {
      setCurrentStudent(updatedStudent);
      StorageService.setActiveStudentId(updatedStudent.id);
    }
    try {
      await FirebaseService.updateStudent(updatedStudent);
    } catch (e) {
      console.warn('Could not sync student update to Firestore', e);
    }
  };

  const handleResetStudentPin = async (studentId: string, newPin: string) => {
    try {
      await FirebaseService.resetStudentPin(studentId, newPin);
      const hashed = await hashPin(newPin);
      const updated = students.map((s) => (s.id === studentId ? { ...s, pinHash: hashed } : s));
      setStudents(updated);
      StorageService.saveStudents(updated);
      alert(`Student PIN successfully reset to ${newPin}`);
    } catch (err) {
      console.error('Error resetting PIN:', err);
      alert('Error updating PIN in Firestore.');
    }
  };

  const handleSelectStudent = (id: string) => {
    const found = students.find((s) => s.id === id);
    if (found) {
      setCurrentStudent(found);
      StorageService.setActiveStudentId(found.id);
    }
  };

  const handleNewStudent = () => {
    const newStudent: StudentProfile = {
      id: `student-jhs-${Date.now()}`,
      lrnOrId: '',
      classCode: teacherConfig.classCode || 'JH7X9K',
      fullName: '',
      age: 13,
      sex: 'female',
      gradeLevel: 'Grade 7',
      section: '',
      schoolName: teacherConfig.defaultSchoolName,
      teacherName: teacherConfig.defaultTeacherName,
      assessmentDate: new Date().toISOString().split('T')[0],
      safetyAcknowledged: false,
      flaggedForGuidance: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    StorageService.saveStudent(newStudent);
    setStudents(StorageService.getStudents());
    setCurrentStudent(newStudent);
    StorageService.setActiveStudentId(newStudent.id);
    setActiveTab('profile');
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await FirebaseService.deleteStudent(id);
    } catch (e) {
      console.warn('Could not delete from Firestore', e);
    }
    StorageService.deleteStudent(id);
    const updated = StorageService.getStudents();
    setStudents(updated);
    if (currentStudent?.id === id) {
      const next = updated[0] || null;
      setCurrentStudent(next);
      StorageService.setActiveStudentId(next ? next.id : null);
    }
  };

  const handleImportStudents = (imported: Partial<StudentProfile>[]) => {
    imported.forEach(async (p) => {
      const full: StudentProfile = {
        id: `student-jhs-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        lrnOrId: p.lrnOrId || '000000000000',
        classCode: teacherConfig.classCode || 'JH7X9K',
        fullName: p.fullName || 'Student',
        age: p.age || 13,
        sex: p.sex || 'female',
        gradeLevel: p.gradeLevel || 'Grade 7',
        section: p.section || '',
        schoolName: teacherConfig.defaultSchoolName,
        teacherName: teacherConfig.defaultTeacherName,
        assessmentDate: new Date().toISOString().split('T')[0],
        safetyAcknowledged: false,
        flaggedForGuidance: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      StorageService.saveStudent(full);
      try {
        await FirebaseService.enrollStudent(full);
      } catch (e) {
        console.warn('Firestore import error:', e);
      }
    });
    setStudents(StorageService.getStudents());
  };

  // Assessment Updates
  const handleSaveAssessmentData = async (updater: (prev: AssessmentRecord) => AssessmentRecord) => {
    if (!currentStudent) return;
    const updated = updater(latestAssessment);
    StorageService.saveAssessment(updated);
    setAssessments(StorageService.getAllAssessments());

    // Persist to Firestore: saves full assessment record & pushes to student_results live feed
    try {
      await FirebaseService.saveAssessment(updated, currentStudent);
    } catch (e) {
      console.error('Firestore assessment save error:', e);
    }
  };

  // Safety acknowledgment
  const handleAcknowledgeSafety = () => {
    if (!currentStudent) return;
    const updated: StudentProfile = {
      ...currentStudent,
      safetyAcknowledged: true,
      safetyAcknowledgedDate: new Date().toISOString().split('T')[0],
    };
    handleSaveStudent(updated);
  };

  // Standards Table Update
  const handleSaveStandards = (newStandards: StandardRow[]) => {
    StorageService.saveStandards(newStandards);
    setStandards(newStandards);
  };

  // Teacher Config Update
  const handleSaveTeacherConfig = (newConfig: TeacherConfig) => {
    StorageService.saveTeacherConfig(newConfig);
    setTeacherConfig(newConfig);
  };

  // Daily Habits
  const handleToggleHabit = (id: string) => {
    const updated = dailyHabits.map((h) =>
      h.id === id ? { ...h, completed: !h.completed } : h
    );
    StorageService.saveDailyHabits(updated);
    setDailyHabits(updated);
  };

  const handleResetHabits = () => {
    const reset = dailyHabits.map((h) => ({ ...h, completed: false }));
    StorageService.saveDailyHabits(reset);
    setDailyHabits(reset);
  };

  // Stepper Header Items
  const TEST_ITEMS: { key: FitnessTestKey; label: string; short: string; icon: React.ReactNode }[] = [
    {
      key: 'step_test',
      label: '3-Min Step Test',
      short: 'Step',
      icon: <Heart className="w-4 h-4 text-rose-500" />,
    },
    {
      key: 'plank',
      label: 'Plank Test',
      short: 'Plank',
      icon: <Timer className="w-4 h-4 text-emerald-600" />,
    },
    {
      key: 'push_up',
      label: 'Push-Up Test',
      short: 'Push-Up',
      icon: <ShieldCheck className="w-4 h-4 text-indigo-600" />,
    },
    {
      key: 'zipper',
      label: 'Zipper Test',
      short: 'Zipper',
      icon: <ArrowRightLeft className="w-4 h-4 text-teal-600" />,
    },
    {
      key: 'sit_and_reach',
      label: 'Sit-and-Reach',
      short: 'Sit & Reach',
      icon: <Ruler className="w-4 h-4 text-sky-600" />,
    },
    {
      key: 'bmi',
      label: 'BMI Screening',
      short: 'BMI',
      icon: <Scale className="w-4 h-4 text-purple-600" />,
    },
  ];

  const isTestCompleted = (key: FitnessTestKey): boolean => {
    switch (key) {
      case 'step_test':
        return !!latestAssessment.stepTest;
      case 'plank':
        return !!latestAssessment.plankTest;
      case 'push_up':
        return !!latestAssessment.pushUpTest;
      case 'zipper':
        return !!latestAssessment.zipperTest;
      case 'sit_and_reach':
        return !!latestAssessment.sitAndReach;
      case 'bmi':
        return !!latestAssessment.bmi;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f5ef] dark:bg-[#0e1411] text-[#1c2420] dark:text-[#f2f0ea] flex flex-col font-sans selection:bg-[#144e34] selection:text-white transition-colors">
      {/* 1. Philippine RA 10173 Data Privacy Notice Modal on First Use */}
      {showPrivacyNotice && <DataPrivacyNotice onAccept={handleAcceptPrivacy} />}

      {/* 2. Teacher PIN Modal */}
      {showPinModal && (
        <TeacherPinModal
          correctPin={teacherConfig.teacherPin || '1234'}
          onSuccess={handleTeacherPinSuccess}
          onCancel={() => {
            setShowPinModal(false);
            if (!currentStudent && currentRole === 'student') {
              setShowStudentLogin(true);
            }
          }}
        />
      )}

      {/* 3. Student Self-Enrollment & Login Modal (When in Student mode with no student active) */}
      {showStudentLogin && !showPinModal && currentRole === 'student' && (
        <StudentLoginModal
          onEnrolled={handleStudentEnrolled}
          onLoggedIn={handleStudentLoggedIn}
          onSwitchToTeacher={handleRequestTeacherMode}
          defaultClassCode={teacherConfig.classCode || 'JH7X9K'}
        />
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeTestKey={activeTestKey}
        setActiveTestKey={setActiveTestKey}
        student={currentStudent}
        profiles={students}
        currentRole={currentRole}
        onRequestTeacherMode={handleRequestTeacherMode}
        onSwitchToStudentMode={handleSwitchToStudentMode}
        onSelectProfile={handleSelectStudent}
        onNewProfile={handleNewStudent}
        onStudentLogout={handleStudentLogout}
      />

      {/* Main App Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Tab: Teacher Dashboard (Teacher Only) */}
        {activeTab === 'dashboard' && currentRole === 'teacher' && (
          <TeacherDashboard
            students={students}
            assessments={assessments}
            standards={standards}
            teacherConfig={teacherConfig}
            onSelectStudent={(id) => {
              handleSelectStudent(id);
              setActiveTab('tests');
            }}
            onViewStudentReport={(id) => {
              handleSelectStudent(id);
              setActiveTab('report');
            }}
            onViewStudentProgress={(id) => {
              handleSelectStudent(id);
              setActiveTab('progress');
            }}
            onSaveStudent={handleSaveStudent}
            onDeleteStudent={handleDeleteStudent}
            onImportStudents={handleImportStudents}
            onNavigateToSettings={() => setActiveTab('teacher')}
            onUpdateTeacherConfig={handleSaveTeacherConfig}
            onResetStudentPin={handleResetStudentPin}
          />
        )}

        {/* Tab: Student Profile */}
        {activeTab === 'profile' && currentStudent && (
          <StudentProfileScreen
            currentStudent={currentStudent}
            profiles={students}
            currentRole={currentRole}
            onSaveProfile={handleSaveStudent}
            onSelectProfile={handleSelectStudent}
            onNewProfile={handleNewStudent}
            onDeleteProfile={handleDeleteStudent}
            onProceedToSafety={() => setActiveTab('safety')}
          />
        )}

        {/* Tab: Safety Reminders Screen */}
        {activeTab === 'safety' && currentStudent && (
          <SafetyScreen
            student={currentStudent}
            onAcknowledgeSafety={handleAcknowledgeSafety}
            onProceedToTests={() => setActiveTab('tests')}
          />
        )}

        {/* Tab: Fitness Tests (Six Tests) */}
        {activeTab === 'tests' && currentStudent && (
          <div className="space-y-6">
            {/* Safety Lock Notice if student hasn't acknowledged safety */}
            {!currentStudent.safetyAcknowledged && (
              <div className="bg-amber-100 dark:bg-amber-950/60 border-l-4 border-amber-600 p-4 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 dark:text-amber-200">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <strong className="block text-sm font-heading uppercase tracking-wide">Safety Acknowledgment Needed</strong>
                    Please acknowledge the pre-testing safety guidelines and medical check prior to taking tests.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('safety')}
                  className="px-3.5 py-2 bg-[#d95f02] hover:bg-[#b84f00] text-white font-heading uppercase tracking-wider font-bold rounded-xs shrink-0 self-start sm:self-auto transition-colors"
                >
                  Review Safety Screen
                </button>
              </div>
            )}

            {/* Test Navigation Stepper Bar (Scoreboard Strip) */}
            <div className="bg-[#ffffff] dark:bg-[#141c18] rounded-xs p-2 border-2 border-[#144e34]/30 dark:border-[#283a31] shadow-xs overflow-x-auto">
              <div className="flex items-center gap-1.5 min-w-max">
                {TEST_ITEMS.map((item, idx) => {
                  const isActive = activeTestKey === item.key;
                  const isDone = isTestCompleted(item.key);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveTestKey(item.key)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xs text-xs font-heading uppercase tracking-wider transition-all border ${
                        isActive
                          ? 'bg-[#144e34] text-white border-[#227e56] font-bold shadow-xs'
                          : isDone
                          ? 'bg-emerald-50 dark:bg-[#11241a] text-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100/70'
                          : 'bg-[#faf9f5] dark:bg-[#19231e] text-[#4a5550] dark:text-[#a0b0a8] border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      <span>
                        {idx + 1}. {item.short}
                      </span>
                      {isDone && (
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${
                            isActive ? 'text-emerald-300' : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Test 1: 3-Minute Step Test */}
            {activeTestKey === 'step_test' && (
              <StepTestComponent
                student={currentStudent}
                standards={standards}
                teacherConfig={teacherConfig}
                savedData={latestAssessment.stepTest}
                onSaveData={(data) =>
                  handleSaveAssessmentData((prev) => ({ ...prev, stepTest: data }))
                }
                onNextTest={() => setActiveTestKey('plank')}
              />
            )}

            {/* Test 2: Plank Test */}
            {activeTestKey === 'plank' && (
              <PlankTestComponent
                student={currentStudent}
                standards={standards}
                teacherConfig={teacherConfig}
                savedData={latestAssessment.plankTest}
                onSaveData={(data) =>
                  handleSaveAssessmentData((prev) => ({ ...prev, plankTest: data }))
                }
                onNextTest={() => setActiveTestKey('push_up')}
                onPrevTest={() => setActiveTestKey('step_test')}
              />
            )}

            {/* Test 3: Push-Up Test */}
            {activeTestKey === 'push_up' && (
              <PushUpTestComponent
                student={currentStudent}
                standards={standards}
                teacherConfig={teacherConfig}
                savedData={latestAssessment.pushUpTest}
                onSaveData={(data) =>
                  handleSaveAssessmentData((prev) => ({ ...prev, pushUpTest: data }))
                }
                onNextTest={() => setActiveTestKey('zipper')}
                onPrevTest={() => setActiveTestKey('plank')}
              />
            )}

            {/* Test 4: Zipper Test */}
            {activeTestKey === 'zipper' && (
              <ZipperTestComponent
                student={currentStudent}
                standards={standards}
                teacherConfig={teacherConfig}
                savedData={latestAssessment.zipperTest}
                onSaveData={(data) =>
                  handleSaveAssessmentData((prev) => ({ ...prev, zipperTest: data }))
                }
                onNextTest={() => setActiveTestKey('sit_and_reach')}
                onPrevTest={() => setActiveTestKey('push_up')}
              />
            )}

            {/* Test 5: Sit-and-Reach */}
            {activeTestKey === 'sit_and_reach' && (
              <SitAndReachComponent
                student={currentStudent}
                standards={standards}
                teacherConfig={teacherConfig}
                savedData={latestAssessment.sitAndReach}
                onSaveData={(data) =>
                  handleSaveAssessmentData((prev) => ({ ...prev, sitAndReach: data }))
                }
                onNextTest={() => setActiveTestKey('bmi')}
                onPrevTest={() => setActiveTestKey('zipper')}
              />
            )}

            {/* Test 6: BMI Screening */}
            {activeTestKey === 'bmi' && (
              <BmiComponent
                student={currentStudent}
                standards={standards}
                teacherConfig={teacherConfig}
                savedData={latestAssessment.bmi}
                onSaveData={(data) =>
                  handleSaveAssessmentData((prev) => ({ ...prev, bmi: data }))
                }
                onGoToReport={() => setActiveTab('report')}
                onPrevTest={() => setActiveTestKey('sit_and_reach')}
              />
            )}
          </div>
        )}

        {/* Tab: Final Printable Report */}
        {activeTab === 'report' && currentStudent && (
          <FinalReportScreen
            student={currentStudent}
            assessment={latestAssessment}
            assessmentHistory={studentAssessments}
            standards={standards}
            teacherConfig={teacherConfig}
            onNavigateToTest={(key) => {
              setActiveTestKey(key as FitnessTestKey);
              setActiveTab('tests');
            }}
          />
        )}

        {/* Tab: Progress History & Longitudinal Tracking */}
        {activeTab === 'progress' && currentStudent && (
          <ProgressHistoryView
            student={currentStudent}
            assessments={studentAssessments}
            standards={standards}
            onSelectAssessment={() => setActiveTab('report')}
          />
        )}

        {/* Tab: Daily Healthy Habits Checklist */}
        {activeTab === 'habits' && currentStudent && (
          <DailyHabitsScreen
            student={currentStudent}
            habits={dailyHabits}
            onToggleHabit={handleToggleHabit}
            onResetHabits={handleResetHabits}
          />
        )}

        {/* Tab: My Fitness Goal Plan */}
        {activeTab === 'goalPlan' && currentStudent && (
          <FitnessGoalPlanScreen
            student={currentStudent}
            assessment={latestAssessment}
            standards={standards}
            onNavigateToReport={() => setActiveTab('report')}
          />
        )}

        {/* Tab: Teacher Standards & Protocol Settings (Teacher Only) */}
        {activeTab === 'teacher' && currentRole === 'teacher' && (
          <TeacherSettingsScreen
            standards={standards}
            teacherConfig={teacherConfig}
            students={students}
            assessments={assessments}
            onSaveStandards={handleSaveStandards}
            onSaveTeacherConfig={handleSaveTeacherConfig}
            onSaveStudent={handleSaveStudent}
            onDeleteStudent={handleDeleteStudent}
            onBulkImportStudents={handleImportStudents}
            onViewStudentReport={(student) => {
              handleSelectStudent(student.id);
              setActiveTab('report');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#082115] dark:bg-[#05110b] text-[#a0cbb5] py-6 text-xs border-t-2 border-[#196343] dark:border-[#143b27] print:hidden mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <div className="font-heading uppercase tracking-wider font-extrabold text-sm text-white">
              STUDENT FIT: HEALTH-RELATED FITNESS ASSESSMENT
            </div>
            <div className="text-[11px] text-[#78a990] mt-0.5 font-mono">
              Philippine Junior High School PE (Grades 7–10) · DepEd Physical Fitness Protocol
            </div>
          </div>
          <div className="text-[11px] text-[#78a990] max-w-md font-sans">
            Educational PE assessment only. Data stored in local browser storage under RA 10173 guidelines.
          </div>
        </div>
      </footer>
    </div>
  );
}
