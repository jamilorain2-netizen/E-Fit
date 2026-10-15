import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  PlusCircle,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Flag,
  ChevronRight,
  Filter,
  CheckSquare,
  Printer,
  Sparkles,
  TrendingUp,
  X,
  Trash2,
  Calendar,
  Sliders,
  Settings,
  Copy,
  RefreshCw,
  KeyRound,
} from 'lucide-react';
import {
  StudentProfile,
  AssessmentRecord,
  StandardRow,
  JuniorHighGrade,
  TeacherConfig,
} from '../types';
import { exportClassSummaryToCSV, parseClassListCSV } from '../utils/storage';
import { evaluateTestScore } from '../utils/scoring';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { generateClassCode } from '../utils/auth';
import { FirebaseService } from '../services/firebaseService';

interface TeacherDashboardProps {
  students: StudentProfile[];
  assessments: AssessmentRecord[];
  standards: StandardRow[];
  teacherConfig?: TeacherConfig;
  onSelectStudent: (studentId: string) => void;
  onViewStudentReport: (studentId: string) => void;
  onViewStudentProgress: (studentId: string) => void;
  onSaveStudent: (student: StudentProfile) => void;
  onDeleteStudent: (studentId: string) => void;
  onImportStudents: (students: Partial<StudentProfile>[]) => void;
  onNavigateToSettings?: () => void;
  onUpdateTeacherConfig?: (newConfig: TeacherConfig) => void;
  onResetStudentPin?: (studentId: string, newPin: string) => void;
}

const JHS_GRADES: JuniorHighGrade[] = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  students,
  assessments,
  standards,
  teacherConfig,
  onSelectStudent,
  onViewStudentReport,
  onViewStudentProgress,
  onSaveStudent,
  onDeleteStudent,
  onImportStudents,
  onNavigateToSettings,
  onUpdateTeacherConfig,
  onResetStudentPin,
}) => {
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'flagged'>('all');

  // Modals
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [flagModalStudent, setFlagModalStudent] = useState<StudentProfile | null>(null);
  const [flagReasonInput, setFlagReasonInput] = useState('');

  // New Student form state (Junior High Only)
  const [newStudentData, setNewStudentData] = useState<Partial<StudentProfile>>({
    lrnOrId: '',
    fullName: '',
    age: 13,
    sex: 'female',
    gradeLevel: 'Grade 7',
    section: '',
    schoolName: teacherConfig?.defaultSchoolName || 'Mabini National High School (Junior High)',
    teacherName: teacherConfig?.defaultTeacherName || 'Coach R. Cruz',
    assessmentDate: new Date().toISOString().split('T')[0],
  });

  // Class Code State & Handlers
  const currentClassCode = teacherConfig?.classCode || 'JH7X9K';
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyClassCode = () => {
    navigator.clipboard.writeText(currentClassCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleGenerateNewCode = () => {
    if (confirm('Generate a new 6-character Class Code? You will need to share this new code with any new students joining your class.')) {
      const newCode = generateClassCode();
      if (teacherConfig && onUpdateTeacherConfig) {
        onUpdateTeacherConfig({ ...teacherConfig, classCode: newCode });
      }
    }
  };

  // Reset Student PIN Modal state
  const [pinResetStudent, setPinResetStudent] = useState<StudentProfile | null>(null);
  const [newPinInput, setNewPinInput] = useState('1234');

  const handleOpenPinReset = (student: StudentProfile) => {
    setPinResetStudent(student);
    setNewPinInput('1234');
  };

  const handleConfirmResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinResetStudent) return;
    const clean = newPinInput.trim();
    if (!/^\d{4}$/.test(clean)) {
      alert('PIN must be exactly 4 numeric digits.');
      return;
    }
    if (onResetStudentPin) {
      await onResetStudentPin(pinResetStudent.id, clean);
    } else {
      await FirebaseService.resetStudentPin(pinResetStudent.id, clean);
      alert(`PIN successfully reset to ${clean} for ${pinResetStudent.fullName}`);
    }
    setPinResetStudent(null);
  };

  // Real-time live submissions from Firestore 'student_results'
  const [liveSubmissions, setLiveSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'student_results'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results: any[] = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      setLiveSubmissions(results);
    }, (error) => {
      console.error('Error listening to student_results:', error);
    });

    return () => unsubscribe();
  }, []);

  // Calculate assessment completion for a student
  const getStudentAssessmentStatus = (studentId: string) => {
    const studentAssessments = assessments
      .filter((a) => a.studentId === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const latest = studentAssessments[0];
    if (!latest) return { completedCount: 0, isFullyComplete: false, latest: null };

    let count = 0;
    if (latest.stepTest) count++;
    if (latest.plankTest) count++;
    if (latest.pushUpTest) count++;
    if (latest.zipperTest) count++;
    if (latest.sitAndReach) count++;
    if (latest.bmi) count++;

    return {
      completedCount: count,
      isFullyComplete: count === 6,
      latest,
    };
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const { isFullyComplete } = getStudentAssessmentStatus(s.id);
    const matchesGrade = gradeFilter === 'all' || s.gradeLevel === gradeFilter;
    const matchesSearch =
      search === '' ||
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.lrnOrId.toLowerCase().includes(search.toLowerCase()) ||
      s.section.toLowerCase().includes(search.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'completed') matchesStatus = isFullyComplete;
    if (statusFilter === 'pending') matchesStatus = !isFullyComplete;
    if (statusFilter === 'flagged') matchesStatus = !!s.flaggedForGuidance;

    return matchesGrade && matchesSearch && matchesStatus;
  });

  // Summary counts
  const totalCount = students.length;
  const completedAllCount = students.filter(
    (s) => getStudentAssessmentStatus(s.id).isFullyComplete
  ).length;
  const flaggedCount = students.filter((s) => s.flaggedForGuidance).length;
  const pendingCount = totalCount - completedAllCount;

  // Export class summary CSV
  const handleExportSummaryCSV = () => {
    const csv = exportClassSummaryToCSV(students, assessments, standards);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JHS_PE_Class_Summary_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Quick push-up verification toggle
  const handleTogglePushUpVerify = (studentId: string) => {
    const { latest } = getStudentAssessmentStatus(studentId);
    if (!latest || !latest.pushUpTest) return;

    const updatedRecord: AssessmentRecord = {
      ...latest,
      pushUpTest: {
        ...latest.pushUpTest,
        teacherVerified: !latest.pushUpTest.teacherVerified,
        verifierName: !latest.pushUpTest.teacherVerified ? 'Teacher Verified' : undefined,
      },
    };
    const student = students.find((s) => s.id === studentId);
    if (student) onSaveStudent({ ...student, updatedAt: new Date().toISOString() });
  };

  // Open flag modal
  const handleOpenFlagModal = (student: StudentProfile) => {
    setFlagModalStudent(student);
    setFlagReasonInput(student.guidanceReason || '');
  };

  const handleSaveFlag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagModalStudent) return;

    const isFlagged = flagReasonInput.trim().length > 0;
    const updated: StudentProfile = {
      ...flagModalStudent,
      flaggedForGuidance: isFlagged,
      guidanceReason: isFlagged ? flagReasonInput.trim() : undefined,
    };
    onSaveStudent(updated);
    setFlagModalStudent(null);
  };

  // Handle add student submit
  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentData.fullName || !newStudentData.lrnOrId) {
      alert('Please fill out student full name and LRN/ID.');
      return;
    }

    const created: StudentProfile = {
      id: `student-jhs-${Date.now()}`,
      lrnOrId: newStudentData.lrnOrId || '',
      fullName: newStudentData.fullName || '',
      age: Number(newStudentData.age) || 13,
      sex: newStudentData.sex || 'female',
      gradeLevel: (newStudentData.gradeLevel as JuniorHighGrade) || 'Grade 7',
      section: newStudentData.section || '',
      schoolName: newStudentData.schoolName || 'Mabini National High School (Junior High)',
      teacherName: newStudentData.teacherName || 'Coach R. Cruz',
      assessmentDate: newStudentData.assessmentDate || new Date().toISOString().split('T')[0],
      safetyAcknowledged: false,
      flaggedForGuidance: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveStudent(created);
    setAddStudentOpen(false);
    setNewStudentData({
      lrnOrId: '',
      fullName: '',
      age: 13,
      sex: 'female',
      gradeLevel: 'Grade 7',
      section: '',
    });
  };

  // Handle bulk CSV import
  const handleBulkImport = () => {
    if (!importCsvText.trim()) return;
    const parsed = parseClassListCSV(importCsvText);
    if (parsed.length === 0) {
      alert('Could not find valid student rows in the provided CSV text.');
      return;
    }
    onImportStudents(parsed);
    setImportOpen(false);
    setImportCsvText('');
    alert(`Successfully imported ${parsed.length} Junior High School students!`);
  };

  return (
    <div className="space-y-6">
      {/* Live Firestore Student Submissions Feed (Real-Time onSnapshot Sync) */}
      <div className="gym-card p-4 sm:p-5 space-y-3 bg-[#103d29] dark:bg-[#082115] text-white border-2 border-[#196343]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h3 className="font-heading uppercase text-sm sm:text-base font-extrabold tracking-wide text-white">
              LIVE FIRESTORE STUDENT SUBMISSIONS (REAL-TIME SYNC)
            </h3>
          </div>
          <span className="text-[11px] font-mono bg-[#082115] px-2.5 py-1 rounded-xs border border-[#196343] text-emerald-300">
            {liveSubmissions.length} Submissions Received
          </span>
        </div>

        {liveSubmissions.length === 0 ? (
          <p className="text-xs text-stone-300 font-sans italic">
            Waiting for student test submissions... Submissions will appear here instantly in real-time via Firestore onSnapshot.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {liveSubmissions.slice(0, 6).map((sub) => (
              <div
                key={sub.id}
                className="bg-[#082115] border border-[#196343] p-3 rounded-xs text-xs space-y-1 font-sans shadow-2xs"
              >
                <div className="flex items-center justify-between font-heading font-bold text-emerald-300 uppercase">
                  <span>{sub.name}</span>
                  <span className="text-[10px] font-mono text-stone-400">{sub.section || 'Class'}</span>
                </div>
                <div className="text-stone-200 font-mono text-[11px]">
                  <strong>{sub.testType}:</strong> <span className="text-amber-300">{sub.score}</span>
                </div>
                <div className="text-[9px] text-stone-400 font-mono">
                  {sub.timestamp?.toDate ? sub.timestamp.toDate().toLocaleTimeString() : 'Just now'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Header & Stats Cards - Athletic Scoreboard Frame */}
      <div className="gym-card p-6 sm:p-8 space-y-6">
        {/* Banner */}
        <div className="bg-[#0A0A0A] dark:bg-[#0A0A0A] text-[#FFFFFF] px-6 py-5 border-3 border-[#0A0A0A] dark:border-[#FFFFFF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading uppercase text-3xl sm:text-4xl font-black text-[#FFFFFF] tracking-wide flex items-center gap-2">
              <Users className="w-7 h-7 text-[#E10600]" />
              <span>CLASS ROSTER & FITNESS DASHBOARD</span>
            </h1>
            <div className="marker-underline mt-1 mb-2"></div>
            <p className="text-xs text-[#8A8A8A] mt-0.5 font-sans">
              Monitor student assessment completion, verify push-up counts, flag learners for extra health guidance, and export class summaries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportSummaryCSV}
              className="gym-button-primary !h-11 !min-h-[44px] !text-xs !px-4"
              title="Download entire class assessment summary as CSV spreadsheet"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setAddStudentOpen(true)}
              className="gym-button-primary !h-11 !min-h-[44px] !text-xs !px-4"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>+ Add Student</span>
            </button>

            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="gym-button-secondary !h-11 !min-h-[44px] !text-xs !px-4"
              title="Import student roster from CSV"
            >
              <Upload className="w-4 h-4 mr-1.5" />
              <span>Import Roster</span>
            </button>

            {onNavigateToSettings && (
              <button
                type="button"
                onClick={onNavigateToSettings}
                className="gym-button-secondary !h-11 !min-h-[44px] !text-xs !px-4"
                title="Configure Standards, Videos & PIN"
              >
                <Sliders className="w-4 h-4 mr-1.5" />
                <span>Settings</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Class Code Enrollment Hub for Students */}
          <div className="bg-[#103d29] dark:bg-[#082115] p-4 sm:p-5 rounded-xs border-2 border-[#196343] flex flex-col md:flex-row md:items-center justify-between gap-4 text-white shadow-sm">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-heading uppercase tracking-wider text-emerald-300 font-bold">
                  STUDENT CLASS ENROLLMENT CODE
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500 font-mono">
                  Active Code
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-0.5">
                <span className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-white bg-black/50 px-4 py-1.5 rounded-xs border-2 border-emerald-400 shadow-inner">
                  {currentClassCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyClassCode}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-heading uppercase tracking-wider font-extrabold text-xs rounded-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  {copiedCode ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'COPIED!' : 'COPY CODE'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleGenerateNewCode}
                  className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-heading uppercase tracking-wider font-bold text-xs rounded-xs border border-stone-600 flex items-center gap-1.5 transition-colors"
                  title="Generate a new 6-character Class Code"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Generate New Code</span>
                </button>
              </div>
              <p className="text-xs text-stone-300 font-sans pt-1">
                Share this code with your students. Students enroll themselves by selecting <strong>"Join your class"</strong> on the main screen and typing this code, their 12-digit LRN, and a 4-digit PIN.
              </p>
            </div>

            <div className="bg-black/40 border border-emerald-500/30 p-3.5 rounded-xs text-xs space-y-1.5 md:max-w-xs font-sans shrink-0">
              <div className="text-emerald-300 font-bold font-mono text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>NO PRE-TYPING REQUIRED</span>
              </div>
              <div className="text-stone-300 text-xs leading-relaxed">
                Students automatically appear in this dashboard in real time as they self-enroll and complete fitness tests.
              </div>
            </div>
          </div>

          {/* 4 Scoreboard Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#faf9f5] dark:bg-[#0e1411] p-4 rounded-xs border-2 border-stone-300 dark:border-stone-800">
              <span className="font-heading uppercase text-xs font-bold text-stone-600 dark:text-stone-400 tracking-wider block">
                TOTAL ENROLLED
              </span>
              <div className="font-scoreboard text-4xl sm:text-5xl text-stone-900 dark:text-stone-100 my-1">
                {totalCount}
              </div>
              <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">Grades 7 to 10</span>
            </div>

            <div className="bg-[#faf9f5] dark:bg-[#0e1411] p-4 rounded-xs border-2 border-[#144e34] dark:border-[#227e56]">
              <span className="font-heading uppercase text-xs font-bold text-[#144e34] dark:text-[#7fd2ad] tracking-wider block">
                6/6 TESTS COMPLETED
              </span>
              <div className="font-scoreboard text-4xl sm:text-5xl text-[#0d3221] dark:text-[#4cb988] my-1">
                {completedAllCount}
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {totalCount > 0 ? `${Math.round((completedAllCount / totalCount) * 100)}% of class` : '0%'}
              </span>
            </div>

            <div className="bg-[#faf9f5] dark:bg-[#0e1411] p-4 rounded-xs border-2 border-stone-300 dark:border-stone-800">
              <span className="font-heading uppercase text-xs font-bold text-amber-700 dark:text-amber-400 tracking-wider block">
                INCOMPLETE / PENDING
              </span>
              <div className="font-scoreboard text-4xl sm:text-5xl text-amber-800 dark:text-amber-400 my-1">
                {pendingCount}
              </div>
              <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">Needs 1+ tests</span>
            </div>

            <div className="bg-[#faf9f5] dark:bg-[#0e1411] p-4 rounded-xs border-2 border-stone-300 dark:border-stone-800">
              <span className="font-heading uppercase text-xs font-bold text-rose-700 dark:text-rose-400 tracking-wider flex items-center gap-1">
                <Flag className="w-3.5 h-3.5 text-rose-600" />
                <span>FLAGGED FOR GUIDANCE</span>
              </span>
              <div className="font-scoreboard text-4xl sm:text-5xl text-rose-800 dark:text-rose-400 my-1">
                {flaggedCount}
              </div>
              <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">Extra teacher care</span>
            </div>
          </div>

          {/* Search, Filter, and Grade Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#faf9f5] dark:bg-[#0e1411] p-3.5 rounded-xs border-2 border-stone-300 dark:border-stone-800">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by student name, LRN, section..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-xs bg-white dark:bg-[#141c18] text-stone-900 dark:text-stone-100 font-sans focus:border-[#144e34]"
                />
              </div>

              {/* Grade Filter */}
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-xs bg-white dark:bg-[#141c18] text-stone-900 dark:text-stone-100 font-heading uppercase font-bold"
              >
                <option value="all">ALL JHS GRADES</option>
                {JHS_GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g.toUpperCase()}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="px-2.5 py-1.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-xs bg-white dark:bg-[#141c18] text-stone-900 dark:text-stone-100 font-heading uppercase font-bold"
              >
                <option value="all">ALL STATUSES</option>
                <option value="completed">COMPLETED (6/6)</option>
                <option value="pending">INCOMPLETE / PENDING</option>
                <option value="flagged">FLAGGED FOR GUIDANCE</option>
              </select>
            </div>

            <div className="text-xs text-stone-500 dark:text-stone-400 font-mono self-end sm:self-auto shrink-0 font-bold">
              SHOWING {filteredStudents.length} OF {totalCount} STUDENTS
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="border-2 border-stone-300 dark:border-stone-800 rounded-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#103d29] dark:bg-[#082115] text-white font-heading uppercase tracking-wider font-bold text-xs border-b-2 border-[#196343]">
                  <tr>
                    <th className="py-3 px-3">STUDENT & LRN</th>
                    <th className="py-3 px-3">GRADE & SEC</th>
                    <th className="py-3 px-3">STATUS</th>
                    <th className="py-3 px-3">STEP TEST</th>
                    <th className="py-3 px-3">PLANK</th>
                    <th className="py-3 px-3">PUSH-UP</th>
                    <th className="py-3 px-3">SIT & REACH</th>
                    <th className="py-3 px-3">BMI</th>
                    <th className="py-3 px-3">GUIDANCE</th>
                    <th className="py-3 px-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-stone-200 dark:divide-stone-800 bg-white dark:bg-[#141c18]">
                  {filteredStudents.map((s) => {
                    const { completedCount, isFullyComplete, latest } = getStudentAssessmentStatus(s.id);

                    // Quick test rating evaluations
                    const stepEval = latest?.stepTest
                      ? evaluateTestScore(standards, 'step_test', latest.stepTest.recoveryHr, s.sex, s.age)
                      : null;
                    const plankEval = latest?.plankTest
                      ? evaluateTestScore(standards, 'plank', latest.plankTest.timeSeconds, s.sex, s.age)
                      : null;
                    const puEval = latest?.pushUpTest
                      ? evaluateTestScore(standards, 'push_up', latest.pushUpTest.count, s.sex, s.age)
                      : null;
                    const snrEval = latest?.sitAndReach
                      ? evaluateTestScore(standards, 'sit_and_reach', latest.sitAndReach.bestCm, s.sex, s.age)
                      : null;
                    const bmiEval = latest?.bmi
                      ? evaluateTestScore(standards, 'bmi', latest.bmi.bmiValue, s.sex, s.age)
                      : null;

                    return (
                      <tr key={s.id} className="hover:bg-stone-50 dark:hover:bg-[#1a2520] transition-colors">
                        {/* Name & LRN */}
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => onSelectStudent(s.id)}
                            className="text-left font-heading uppercase font-bold text-stone-900 dark:text-stone-100 hover:text-[#d95f02] block truncate max-w-[170px]"
                          >
                            {s.fullName}
                          </button>
                          <div className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                            LRN: {s.lrnOrId} · {s.age}y ({s.sex.charAt(0).toUpperCase()})
                          </div>
                        </td>

                        {/* Grade & Section */}
                        <td className="py-3 px-3">
                          <span className="font-heading uppercase font-bold text-stone-800 dark:text-stone-200 block">{s.gradeLevel}</span>
                          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">{s.section || '—'}</span>
                        </td>

                        {/* Completion Status */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-none font-heading uppercase tracking-wider text-xs font-extrabold border-2 ${
                              isFullyComplete
                                ? 'bg-[#E10600] text-white border-[#0A0A0A] dark:border-[#FFFFFF]'
                                : completedCount > 0
                                ? 'bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#FFFFFF] border-[#0A0A0A] dark:border-[#FFFFFF]'
                                : 'bg-white dark:bg-[#0A0A0A] text-[#8A8A8A] border-[#8A8A8A]'
                            }`}
                          >
                            {isFullyComplete ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                            <span>{completedCount}/6 Done</span>
                          </span>
                        </td>

                        {/* Step Test */}
                        <td className="py-3 px-3 font-mono">
                          {latest?.stepTest ? (
                            <div>
                              <div className="font-bold text-stone-900 dark:text-stone-100">{latest.stepTest.recoveryHr} bpm</div>
                              <div className="text-[10px] text-stone-500 dark:text-stone-400">{stepEval?.category || ''}</div>
                            </div>
                          ) : (
                            <span className="text-stone-400 italic text-[11px]">Pending</span>
                          )}
                        </td>

                        {/* Plank */}
                        <td className="py-3 px-3 font-mono">
                          {latest?.plankTest ? (
                            <div>
                              <div className="font-bold text-stone-900 dark:text-stone-100">{latest.plankTest.timeSeconds}s</div>
                              <div className="text-[10px] text-stone-500 dark:text-stone-400">{plankEval?.category || ''}</div>
                            </div>
                          ) : (
                            <span className="text-stone-400 italic text-[11px]">Pending</span>
                          )}
                        </td>

                        {/* Push-Up & Verification */}
                        <td className="py-3 px-3 font-mono">
                          {latest?.pushUpTest ? (
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-stone-900 dark:text-stone-100">{latest.pushUpTest.count} reps</span>
                                <button
                                  type="button"
                                  onClick={() => handleTogglePushUpVerify(s.id)}
                                  title={
                                    latest.pushUpTest.teacherVerified
                                      ? 'Teacher Verified! Click to toggle'
                                      : 'Click to verify push-up count'
                                  }
                                  className={`text-[11px] px-1.5 py-0.5 rounded-none font-mono transition-colors border-2 ${
                                    latest.pushUpTest.teacherVerified
                                      ? 'bg-[#E10600] text-white border-[#0A0A0A] dark:border-[#FFFFFF] font-bold'
                                      : 'bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#FFFFFF] border-[#0A0A0A] dark:border-[#FFFFFF] hover:bg-[#0A0A0A] hover:text-white'
                                  }`}
                                >
                                  {latest.pushUpTest.teacherVerified ? '✓ VERIFIED' : 'VERIFY?'}
                                </button>
                              </div>
                              <div className="text-[10px] text-stone-500 dark:text-stone-400">{puEval?.category || ''}</div>
                            </div>
                          ) : (
                            <span className="text-stone-400 italic text-[11px]">Pending</span>
                          )}
                        </td>

                        {/* Sit & Reach */}
                        <td className="py-3 px-3 font-mono">
                          {latest?.sitAndReach ? (
                            <div>
                              <div className="font-bold text-stone-900 dark:text-stone-100">{latest.sitAndReach.bestCm} cm</div>
                              <div className="text-[10px] text-stone-500 dark:text-stone-400">{snrEval?.category || ''}</div>
                            </div>
                          ) : (
                            <span className="text-stone-400 italic text-[11px]">Pending</span>
                          )}
                        </td>

                        {/* BMI */}
                        <td className="py-3 px-3 font-mono">
                          {latest?.bmi ? (
                            <div>
                              <div className="font-bold text-stone-900 dark:text-stone-100">{latest.bmi.bmiValue.toFixed(1)}</div>
                              <div className="text-[10px] text-stone-500 dark:text-stone-400">{bmiEval?.category || ''}</div>
                            </div>
                          ) : (
                            <span className="text-stone-400 italic text-[11px]">Pending</span>
                          )}
                        </td>

                        {/* Guidance Flag */}
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => handleOpenFlagModal(s)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-xs text-[11px] font-heading uppercase font-bold transition-colors border ${
                              s.flaggedForGuidance
                                ? 'bg-rose-100 dark:bg-rose-950/80 border-rose-400 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                                : 'bg-[#faf9f5] dark:bg-[#0e1411] border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                            }`}
                            title={s.guidanceReason || 'Click to flag student for teacher guidance'}
                          >
                            <Flag className={`w-3.5 h-3.5 ${s.flaggedForGuidance ? 'text-rose-600 fill-rose-600' : 'text-stone-400'}`} />
                            <span>{s.flaggedForGuidance ? 'FLAGGED' : 'FLAG'}</span>
                          </button>
                        </td>

                        {/* Action buttons */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onViewStudentReport(s.id)}
                              className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-[#144e34] dark:hover:text-emerald-400 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xs transition-colors"
                              title="Print / Save PDF Report"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onViewStudentProgress(s.id)}
                              className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-[#d95f02] hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xs transition-colors"
                              title="View Longitudinal Progress History"
                            >
                              <TrendingUp className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onSelectStudent(s.id)}
                              className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xs transition-colors"
                              title="Administer or edit tests"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenPinReset(s)}
                              className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-amber-600 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xs transition-colors"
                              title="Reset Student 4-digit PIN"
                            >
                              <KeyRound className="w-4 h-4 text-amber-600" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remove ${s.fullName} from this class roster?`)) {
                                  onDeleteStudent(s.id);
                                }
                              }}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xs transition-colors"
                              title="Delete student record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-10 text-center text-stone-400 font-sans italic">
                        No Junior High School students matched the filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Flag Guidance Modal */}
      {flagModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in">
          <div className="bg-white dark:bg-[#141c18] rounded-xs max-w-md w-full p-6 border-4 border-[#144e34] dark:border-[#227e56] shadow-xl text-stone-900 dark:text-stone-100">
            <div className="flex items-center justify-between border-b-2 border-stone-200 dark:border-stone-800 pb-3 mb-4">
              <h3 className="font-heading uppercase text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Flag className="w-5 h-5 text-rose-600" />
                <span>TEACHER GUIDANCE FLAG</span>
              </h3>
              <button
                type="button"
                onClick={() => setFlagModalStudent(null)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 mb-3 font-sans">
              Flag <strong>{flagModalStudent.fullName}</strong> ({flagModalStudent.gradeLevel}) for extra teacher assistance, form coaching, medical precaution, or modified test accommodation.
            </p>

            <form onSubmit={handleSaveFlag} className="space-y-4">
              <div>
                <label className="block font-heading uppercase font-bold text-xs text-stone-800 dark:text-stone-200 mb-1">
                  Reason for Guidance / Teacher Health Note:
                </label>
                <textarea
                  rows={3}
                  value={flagReasonInput}
                  onChange={(e) => setFlagReasonInput(e.target.value)}
                  placeholder="e.g. Mild knee discomfort reported during step test; requires partner support and low bench height."
                  className="w-full text-xs p-3 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-[#0e1411] text-stone-900 dark:text-stone-100 focus:border-[#144e34]"
                />
                <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 block font-mono">
                  Leave blank and click Save to clear the guidance flag.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t-2 border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setFlagModalStudent(null)}
                  className="px-3 py-2 text-xs font-heading uppercase font-bold text-stone-600 dark:text-stone-400 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d95f02] hover:bg-[#b84f00] text-white font-heading uppercase tracking-wider font-extrabold text-xs rounded-xs border border-amber-900 transition-colors shadow-xs"
                >
                  Save Guidance Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal (Junior High Only) */}
      {addStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in">
          <div className="bg-white dark:bg-[#141c18] rounded-xs max-w-lg w-full p-6 border-4 border-[#144e34] dark:border-[#227e56] shadow-xl max-h-[90vh] overflow-y-auto text-stone-900 dark:text-stone-100">
            <div className="flex items-center justify-between border-b-2 border-stone-200 dark:border-stone-800 pb-3 mb-4">
              <h3 className="font-heading uppercase text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#144e34] dark:text-[#4cb988]" />
                <span>ADD JUNIOR HIGH SCHOOL STUDENT</span>
              </h3>
              <button
                type="button"
                onClick={() => setAddStudentOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-heading uppercase font-bold text-xs text-stone-800 dark:text-stone-200 mb-1">
                    DepEd LRN or Student ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentData.lrnOrId}
                    onChange={(e) => setNewStudentData({ ...newStudentData, lrnOrId: e.target.value })}
                    placeholder="e.g. 109876543214"
                    className="w-full px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-[#0e1411] text-stone-900 dark:text-stone-100 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-heading uppercase font-bold text-xs text-stone-800 dark:text-stone-200 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentData.fullName}
                    onChange={(e) => setNewStudentData({ ...newStudentData, fullName: e.target.value })}
                    placeholder="e.g. Christine Joy Lopez"
                    className="w-full px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-[#0e1411] text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-heading uppercase font-bold text-xs text-stone-800 dark:text-stone-200 mb-1">
                    Grade Level (JHS Only) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newStudentData.gradeLevel}
                    onChange={(e) =>
                      setNewStudentData({ ...newStudentData, gradeLevel: e.target.value as JuniorHighGrade })
                    }
                    className="w-full px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-[#0e1411] text-stone-900 dark:text-stone-100 font-heading uppercase font-bold"
                  >
                    {JHS_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-heading uppercase font-bold text-xs text-stone-800 dark:text-stone-200 mb-1">Section</label>
                  <input
                    type="text"
                    value={newStudentData.section}
                    onChange={(e) => setNewStudentData({ ...newStudentData, section: e.target.value })}
                    placeholder="e.g. Diamond / Sampaguita"
                    className="w-full px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-[#0e1411] text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-heading uppercase font-bold text-xs text-stone-800 dark:text-stone-200 mb-1">
                    Age (Years: 12 to 16) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="18"
                    value={newStudentData.age}
                    onChange={(e) => setNewStudentData({ ...newStudentData, age: parseInt(e.target.value, 10) || 13 })}
                    className="w-full px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-[#0e1411] text-stone-900 dark:text-stone-100 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-heading uppercase font-bold text-xs text-stone-800 dark:text-stone-200 mb-1">
                    Biological Sex <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newStudentData.sex}
                    onChange={(e) =>
                      setNewStudentData({ ...newStudentData, sex: e.target.value as 'male' | 'female' })
                    }
                    className="w-full px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-[#0e1411] text-stone-900 dark:text-stone-100 font-heading uppercase font-bold"
                  >
                    <option value="female">FEMALE</option>
                    <option value="male">MALE</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-stone-200 dark:border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddStudentOpen(false)}
                  className="px-3 py-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 font-heading uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#144e34] hover:bg-[#0d3221] text-white font-heading uppercase tracking-wider font-extrabold text-xs rounded-xs border border-emerald-400/30"
                >
                  Save Student Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import CSV Modal */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in">
          <div className="bg-white dark:bg-[#141c18] rounded-xs max-w-lg w-full p-6 border-4 border-[#144e34] dark:border-[#227e56] shadow-xl max-h-[90vh] overflow-y-auto text-stone-900 dark:text-stone-100">
            <div className="flex items-center justify-between border-b-2 border-stone-200 dark:border-stone-800 pb-3 mb-4">
              <h3 className="font-heading uppercase text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#144e34] dark:text-[#4cb988]" />
                <span>IMPORT CLASS LIST VIA CSV</span>
              </h3>
              <button
                type="button"
                onClick={() => setImportOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 mb-2 font-sans">
              Paste CSV text formatted as: <code>LRN, Full_Name, Grade, Section, Age, Sex</code>
            </p>

            <div className="bg-[#faf9f5] dark:bg-[#0e1411] p-2.5 rounded-xs border-2 border-stone-300 dark:border-stone-800 text-[11px] font-mono text-stone-700 dark:text-stone-300 mb-3">
              109876543220, Mark Anthony Cruz, Grade 8, Sampaguita, 14, Male<br />
              109876543221, Andrea Rose Dizon, Grade 9, Molave, 15, Female
            </div>

            <textarea
              rows={6}
              value={importCsvText}
              onChange={(e) => setImportCsvText(e.target.value)}
              placeholder="Paste CSV rows here..."
              className="w-full text-xs font-mono p-3 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-[#0e1411] text-stone-900 dark:text-stone-100 focus:border-[#144e34] mb-4"
            />

            <div className="flex justify-end gap-2 border-t-2 border-stone-200 dark:border-stone-800 pt-3">
              <button
                type="button"
                onClick={() => setImportOpen(false)}
                className="px-3 py-2 text-xs font-heading uppercase font-bold text-stone-600 dark:text-stone-400 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                className="px-4 py-2 bg-[#d95f02] hover:bg-[#b84f00] text-white font-heading uppercase tracking-wider font-extrabold text-xs rounded-xs border border-amber-900 transition-colors shadow-xs"
              >
                Import Students
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Student PIN Modal */}
      {pinResetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in">
          <div className="bg-white dark:bg-[#141c18] rounded-xs max-w-sm w-full p-6 border-4 border-[#144e34] dark:border-[#227e56] shadow-xl text-stone-900 dark:text-stone-100">
            <div className="flex items-center justify-between border-b-2 border-stone-200 dark:border-stone-800 pb-3 mb-4">
              <h3 className="font-heading uppercase text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <span>RESET STUDENT PIN</span>
              </h3>
              <button
                type="button"
                onClick={() => setPinResetStudent(null)}
                className="p-1 rounded-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 mb-3 font-sans">
              Set a new 4-digit PIN for <strong>{pinResetStudent.fullName}</strong> (LRN: {pinResetStudent.lrnOrId}).
            </p>

            <form onSubmit={handleConfirmResetPin} className="space-y-4">
              <div>
                <label className="block font-heading uppercase text-xs font-bold text-stone-800 dark:text-stone-200 tracking-wider mb-1">
                  NEW 4-DIGIT PIN
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 1234"
                  className="w-full text-center tracking-widest text-2xl font-mono font-black px-3.5 py-2.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1411] focus:border-[#144e34]"
                  autoFocus
                  required
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPinResetStudent(null)}
                  className="flex-1 py-2 px-3 text-xs font-heading uppercase font-bold text-stone-600 dark:text-stone-400 hover:text-stone-900 border-2 border-stone-300 dark:border-stone-700 rounded-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-[#144e34] hover:bg-[#0d3221] text-white font-heading uppercase tracking-wider font-extrabold text-xs rounded-xs border border-emerald-400/30 transition-colors shadow-xs"
                >
                  Update PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
