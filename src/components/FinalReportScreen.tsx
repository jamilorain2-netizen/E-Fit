import React, { useState } from 'react';
import {
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Heart,
  Timer,
  ShieldCheck,
  ArrowRightLeft,
  Ruler,
  Scale,
  Award,
  Info,
  Calendar,
  School,
  User,
  Activity,
  FileCheck,
  TrendingUp,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Edit3,
} from 'lucide-react';
import {
  StudentProfile,
  AssessmentRecord,
  StandardRow,
  TeacherConfig,
} from '../types';
import { evaluateTestScore } from '../utils/scoring';

interface FinalReportScreenProps {
  student: StudentProfile;
  assessment: AssessmentRecord | null;
  assessmentHistory: AssessmentRecord[];
  standards: StandardRow[];
  teacherConfig: TeacherConfig;
  onNavigateToTest: (testKey: string) => void;
  onSelectHistoricalAssessment?: (record: AssessmentRecord) => void;
}

export const FinalReportScreen: React.FC<FinalReportScreenProps> = ({
  student,
  assessment,
  assessmentHistory,
  standards,
  teacherConfig,
  onNavigateToTest,
  onSelectHistoricalAssessment,
}) => {
  const [activeRecordId, setActiveRecordId] = useState<string>(
    assessment?.id || (assessmentHistory[0]?.id ?? '')
  );

  const currentRecord =
    assessmentHistory.find((a) => a.id === activeRecordId) || assessment || assessmentHistory[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const reportData = {
      app: 'Student Fit: Health-Related Fitness Assessment (Junior High School)',
      generatedAt: new Date().toISOString(),
      student,
      currentAssessment: currentRecord,
      assessmentHistory,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Fitness-Report-${student.fullName.replace(/\s+/g, '_')}-${student.lrnOrId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Evaluate current record
  const stepInterpretation = currentRecord?.stepTest
    ? evaluateTestScore(
        standards,
        'step_test',
        currentRecord.stepTest.recoveryHr,
        student.sex,
        student.age
      )
    : null;

  const plankInterpretation = currentRecord?.plankTest
    ? evaluateTestScore(
        standards,
        'plank',
        currentRecord.plankTest.timeSeconds,
        student.sex,
        student.age
      )
    : null;

  const pushUpInterpretation = currentRecord?.pushUpTest
    ? evaluateTestScore(
        standards,
        'push_up',
        currentRecord.pushUpTest.count,
        student.sex,
        student.age
      )
    : null;

  const zipperRightInterpretation = currentRecord?.zipperTest
    ? evaluateTestScore(
        standards,
        'zipper_right',
        currentRecord.zipperTest.rightCm,
        student.sex,
        student.age
      )
    : null;

  const zipperLeftInterpretation = currentRecord?.zipperTest
    ? evaluateTestScore(
        standards,
        'zipper_left',
        currentRecord.zipperTest.leftCm,
        student.sex,
        student.age
      )
    : null;

  const sitAndReachInterpretation = currentRecord?.sitAndReach
    ? evaluateTestScore(
        standards,
        'sit_and_reach',
        currentRecord.sitAndReach.bestCm,
        student.sex,
        student.age
      )
    : null;

  const bmiInterpretation = currentRecord?.bmi
    ? evaluateTestScore(
        standards,
        'bmi',
        currentRecord.bmi.bmiValue,
        student.sex,
        student.age
      )
    : null;

  const components = [
    {
      id: 'step_test',
      componentName: '1. Cardiovascular Endurance',
      testTitle: '3-Minute Step Test',
      icon: <Heart className="w-4 h-4 text-rose-500" />,
      completed: !!currentRecord?.stepTest,
      resultText: currentRecord?.stepTest
        ? `${currentRecord.stepTest.recoveryHr} BPM`
        : 'Incomplete',
      details: currentRecord?.stepTest
        ? `Resting: ${currentRecord.stepTest.restingHr} bpm · Change: ${
            currentRecord.stepTest.difference > 0 ? '+' : ''
          }${currentRecord.stepTest.difference} bpm`
        : 'Test not yet performed',
      interpretation: stepInterpretation,
    },
    {
      id: 'plank',
      componentName: '2. Muscular Endurance',
      testTitle: 'Forearm Prone Plank Test',
      icon: <Timer className="w-4 h-4 text-emerald-500" />,
      completed: !!currentRecord?.plankTest,
      resultText: currentRecord?.plankTest
        ? `${currentRecord.plankTest.timeSeconds} sec`
        : 'Incomplete',
      details: currentRecord?.plankTest
        ? `Held until form break (${Math.floor(
            currentRecord.plankTest.timeSeconds / 60
          )}m ${currentRecord.plankTest.timeSeconds % 60}s)`
        : 'Test not yet performed',
      interpretation: plankInterpretation,
    },
    {
      id: 'push_up',
      componentName: '3. Muscular Strength',
      testTitle: '90-Degree Push-Up Test',
      icon: <ShieldCheck className="w-4 h-4 text-amber-500" />,
      completed: !!currentRecord?.pushUpTest,
      resultText: currentRecord?.pushUpTest
        ? `${currentRecord.pushUpTest.count} reps`
        : 'Incomplete',
      details: currentRecord?.pushUpTest
        ? `${currentRecord.pushUpTest.variation}${
            currentRecord.pushUpTest.teacherVerified ? ' (Verified)' : ''
          }`
        : 'Test not yet performed',
      interpretation: pushUpInterpretation,
    },
    {
      id: 'zipper',
      componentName: '4A. Flexibility (Shoulder Mobility)',
      testTitle: 'Zipper Test (Upper Body)',
      icon: <ArrowRightLeft className="w-4 h-4 text-teal-400" />,
      completed: !!currentRecord?.zipperTest,
      resultText: currentRecord?.zipperTest
        ? `R: ${currentRecord.zipperTest.rightCm > 0 ? '+' : ''}${
            currentRecord.zipperTest.rightCm
          } cm / L: ${currentRecord.zipperTest.leftCm > 0 ? '+' : ''}${
            currentRecord.zipperTest.leftCm
          } cm`
        : 'Incomplete',
      details: currentRecord?.zipperTest
        ? `Right: ${zipperRightInterpretation?.category || 'N/A'} · Left: ${
            zipperLeftInterpretation?.category || 'N/A'
          }`
        : 'Test not yet performed',
      interpretation: zipperRightInterpretation,
    },
    {
      id: 'sit_and_reach',
      componentName: '4B. Flexibility (Trunk & Hamstrings)',
      testTitle: 'Sit-and-Reach Test',
      icon: <Ruler className="w-4 h-4 text-sky-400" />,
      completed: !!currentRecord?.sitAndReach,
      resultText: currentRecord?.sitAndReach
        ? `${currentRecord.sitAndReach.bestCm} cm`
        : 'Incomplete',
      details: currentRecord?.sitAndReach
        ? `Best of ${currentRecord.sitAndReach.trials.length} trials`
        : 'Test not yet performed',
      interpretation: sitAndReachInterpretation,
    },
    {
      id: 'bmi',
      componentName: '5. Body Composition Screening',
      testTitle: 'BMI-for-Age Screening (WHO Reference)',
      icon: <Scale className="w-4 h-4 text-orange-400" />,
      completed: !!currentRecord?.bmi,
      resultText: currentRecord?.bmi
        ? `${currentRecord.bmi.bmiValue.toFixed(1)} kg/m²`
        : 'Incomplete',
      details: currentRecord?.bmi
        ? `Weight: ${currentRecord.bmi.weightKg} kg · Height: ${(
            currentRecord.bmi.heightCm / 100
          ).toFixed(2)} m`
        : 'Measurement not recorded',
      interpretation: bmiInterpretation,
    },
  ];

  // Strengths and Areas to Improve
  const strengths: string[] = [];
  const areasToImprove: string[] = [];
  const incomplete: string[] = [];

  components.forEach((c) => {
    if (!c.completed) {
      incomplete.push(c.testTitle);
      return;
    }
    const status = c.interpretation?.status;
    if (status === 'optimal' || status === 'good') {
      strengths.push(`${c.componentName}: ${c.interpretation?.category || 'Good standard'}`);
    } else if (status === 'fair' || status === 'needs_improvement') {
      areasToImprove.push(
        `${c.componentName}: Focus on daily active movement and guided practice.`
      );
    } else if (status === 'screening_notice') {
      areasToImprove.push(
        `${c.componentName}: Routine health check advised with school nurse or physician.`
      );
    }
  });

  // Longitudinal comparisons
  const sortedHistory = [...assessmentHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const hasMultipleAssessments = sortedHistory.length > 1;
  const baselineRecord = sortedHistory[0];

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar */}
      <div className="bg-[#ffffff] dark:bg-[#141c18] rounded-xs border-2 border-[#144e34] dark:border-[#227e56] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="font-heading uppercase text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-wide">
            OFFICIAL PE REPORT CARD
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xs bg-[#144e34] hover:bg-[#0d3221] text-white font-heading uppercase tracking-wider font-extrabold text-xs flex items-center gap-2 transition-colors border border-emerald-400/30"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report (PDF)</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="px-4 py-2.5 rounded-xs bg-[#faf9f5] dark:bg-[#0e1411] hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-heading uppercase tracking-wider font-bold text-xs flex items-center gap-2 transition-colors border-2 border-stone-300 dark:border-stone-700"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Progress History Selector (if student has multiple assessment dates) */}
      {hasMultipleAssessments && (
        <div className="bg-[#faf9f5] dark:bg-[#141c18] border-2 border-[#144e34] dark:border-[#227e56] rounded-xs p-4 print:hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#d95f02]" />
              <span>ASSESSMENT HISTORY & PROGRESS SESSIONS ({sortedHistory.length} RECORDED)</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sortedHistory.map((rec, idx) => (
              <button
                key={rec.id}
                type="button"
                onClick={() => {
                  setActiveRecordId(rec.id);
                  if (onSelectHistoricalAssessment) onSelectHistoricalAssessment(rec);
                }}
                className={`px-3 py-1.5 rounded-xs text-xs font-mono font-bold transition-all border-2 ${
                  currentRecord?.id === rec.id
                    ? 'bg-[#144e34] text-white border-[#144e34] shadow-xs'
                    : 'bg-white dark:bg-[#0e1411] text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100'
                }`}
              >
                <span>{rec.termLabel || `Session ${idx + 1}`} ({rec.date})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Official Printable Report Card Container */}
      <div className="bg-white dark:bg-[#141c18] print:bg-white rounded-xs p-6 sm:p-10 border-4 border-[#144e34] dark:border-[#227e56] print:border-2 print:border-black shadow-xs space-y-8 print:p-4 text-stone-900 dark:text-stone-100 print:text-black">
        {/* DepEd Document Header */}
        <div className="border-b-4 border-[#144e34] dark:border-[#227e56] print:border-b-2 print:border-black pb-5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xs bg-[#082115] text-[#4cb988] flex items-center justify-center font-bold text-xl shrink-0 border-2 border-[#196343] print:border-black print:bg-white print:text-black">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-heading uppercase text-2xl sm:text-3xl font-black text-[#0d3221] dark:text-white print:text-black tracking-wide">
                HEALTH-RELATED FITNESS ASSESSMENT REPORT
              </h1>
              <span className="text-xs text-stone-600 dark:text-stone-300 print:text-stone-700 block font-sans">
                Junior High School PE Curriculum · Grades 7 to 10
              </span>
            </div>
          </div>

          <div className="text-right text-xs text-stone-600 dark:text-stone-300 print:text-black font-mono shrink-0">
            <div>Assessment Date: <strong className="text-stone-900 dark:text-white print:text-black">{currentRecord?.date || student.assessmentDate}</strong></div>
            <div>School Year: <strong className="text-stone-900 dark:text-white print:text-black">2025–2026</strong></div>
          </div>
        </div>

        {/* Student Profile Strip */}
        <div className="bg-[#faf9f5] dark:bg-[#0e1411] print:bg-white p-4 rounded-xs border-2 border-stone-300 dark:border-stone-800 print:border-black grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="font-mono text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
              LEARNER NAME
            </span>
            <span className="font-heading uppercase font-extrabold text-base text-stone-900 dark:text-stone-100 print:text-black block truncate">
              {student.fullName}
            </span>
          </div>

          <div>
            <span className="font-mono text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
              DEPED LRN / STUDENT ID
            </span>
            <span className="font-mono font-bold text-sm text-stone-900 dark:text-stone-100 print:text-black block truncate">
              {student.lrnOrId || 'N/A'}
            </span>
          </div>

          <div>
            <span className="font-mono text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
              AGE & SEX
            </span>
            <span className="font-heading uppercase font-bold text-sm text-stone-900 dark:text-stone-100 print:text-black block">
              {student.age} YRS · {student.sex}
            </span>
          </div>

          <div>
            <span className="font-mono text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
              GRADE & SECTION
            </span>
            <span className="font-heading uppercase font-bold text-sm text-stone-900 dark:text-stone-100 print:text-black block truncate">
              {student.gradeLevel} · {student.section || '—'}
            </span>
          </div>

          <div className="col-span-2">
            <span className="font-mono text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
              SCHOOL
            </span>
            <span className="font-sans font-bold text-stone-800 dark:text-stone-200 print:text-black block truncate">
              {student.schoolName || teacherConfig.defaultSchoolName}
            </span>
          </div>

          <div className="col-span-2">
            <span className="font-mono text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
              PE TEACHER / FACILITATOR
            </span>
            <span className="font-sans font-bold text-stone-800 dark:text-stone-200 print:text-black block truncate">
              {student.teacherName || teacherConfig.defaultTeacherName}
            </span>
          </div>
        </div>

        {/* 5 Core Components Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading uppercase text-base font-extrabold text-[#0d3221] dark:text-[#7fd2ad] print:text-black tracking-wide flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#d95f02]" />
              <span>ASSESSMENT BREAKDOWN (5 HEALTH-RELATED FITNESS PROTOCOLS)</span>
            </h2>
            <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 print:text-stone-600 hidden sm:inline">
              *NO combined total score is awarded in Health-Related Fitness
            </span>
          </div>

          <div className="border-2 border-stone-300 dark:border-stone-800 print:border-black rounded-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#103d29] dark:bg-[#082115] text-white print:bg-stone-200 print:text-black font-heading uppercase tracking-wider font-bold text-xs border-b-2 border-[#196343] print:border-black">
                  <th className="py-2.5 px-3">HRF COMPONENT & TEST</th>
                  <th className="py-2.5 px-3">RAW SCORE</th>
                  <th className="py-2.5 px-3">INTERPRETATION / CATEGORY</th>
                  <th className="py-2.5 px-3 hidden sm:table-cell">STANDARD SOURCE</th>
                  <th className="py-2.5 px-3 print:hidden">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-stone-200 dark:divide-stone-800 print:divide-black">
                {components.map((c) => {
                  const cat = c.interpretation?.category || (c.completed ? 'Completed' : 'Not Tested');
                  return (
                    <tr key={c.id} className="hover:bg-stone-50 dark:hover:bg-[#1a2520] print:hover:bg-transparent transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-heading uppercase font-bold text-stone-900 dark:text-stone-100 print:text-black flex items-center gap-2 text-sm">
                          <span className="shrink-0">{c.icon}</span>
                          <span>{c.componentName}</span>
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 print:text-stone-600 ml-6 font-sans">
                          {c.testTitle}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-stone-900 dark:text-stone-100 print:text-black">
                        {c.completed ? (
                          <div>
                            <div className="font-scoreboard text-lg sm:text-xl text-[#0d3221] dark:text-[#4cb988] print:text-black">
                              {c.resultText}
                            </div>
                            <div className="text-[10px] text-stone-500 dark:text-stone-400 print:text-stone-600 font-sans font-normal">
                              {c.details}
                            </div>
                          </div>
                        ) : (
                          <span className="text-stone-400 dark:text-stone-500 font-sans italic">Incomplete</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {c.completed ? (
                          <span
                            className={`inline-flex items-center gap-1.5 font-heading uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-xs text-[11px] border ${
                              c.interpretation?.status === 'optimal'
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-200 border-emerald-400 dark:border-emerald-700'
                                : c.interpretation?.status === 'good'
                                ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-950 dark:text-teal-200 border-teal-400 dark:border-teal-700'
                                : c.interpretation?.status === 'fair'
                                ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-950 dark:text-sky-200 border-sky-400 dark:border-sky-700'
                                : c.interpretation?.status === 'screening_notice'
                                ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-950 dark:text-indigo-200 border-indigo-400 dark:border-indigo-700'
                                : 'bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 border-amber-400 dark:border-amber-700'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{cat}</span>
                          </span>
                        ) : (
                          <span className="text-rose-700 dark:text-rose-300 font-heading uppercase tracking-wider font-extrabold bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-xs text-[11px] border border-rose-300 dark:border-rose-800 inline-flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Test Needed</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 hidden sm:table-cell text-[11px] text-stone-500 dark:text-stone-400 print:text-stone-600 font-mono max-w-xs truncate">
                        {c.interpretation?.source || 'SAMPLE - REPLACE WITH DepEd VALUES'}
                      </td>

                      <td className="py-3 px-3 print:hidden">
                        <button
                          type="button"
                          onClick={() => onNavigateToTest(c.id)}
                          className="text-xs text-[#d95f02] hover:text-[#b84f00] font-heading uppercase tracking-wider font-bold inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{c.completed ? 'Edit' : 'Take Test'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Progress Comparison Section (When multiple dates exist) */}
        {hasMultipleAssessments && (
          <div className="space-y-3">
            <h2 className="font-heading uppercase text-sm font-extrabold text-stone-900 dark:text-stone-100 print:text-black tracking-wide flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#144e34] dark:text-[#4cb988]" />
              <span>PROGRESS TRACKING COMPARISON (BASELINE VS. CURRENT)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Step Test Progress */}
              <div className="p-3.5 bg-[#faf9f5] dark:bg-[#0e1411] print:bg-white border-2 border-stone-300 dark:border-stone-800 print:border-black rounded-xs text-xs space-y-1">
                <span className="font-heading uppercase font-bold text-stone-900 dark:text-stone-100 print:text-black block">
                  STEP TEST RECOVERY BPM
                </span>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-stone-500 dark:text-stone-400">
                    Base: {baselineRecord.stepTest?.recoveryHr ?? 'N/A'} bpm
                  </span>
                  <span className="font-scoreboard text-base text-[#0d3221] dark:text-[#4cb988] print:text-black">
                    Now: {currentRecord?.stepTest?.recoveryHr ?? 'N/A'} bpm
                  </span>
                </div>
                {baselineRecord.stepTest && currentRecord?.stepTest && (
                  <div className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 pt-1">
                    {baselineRecord.stepTest.recoveryHr > currentRecord.stepTest.recoveryHr ? (
                      <>
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        <span>Faster recovery (-{baselineRecord.stepTest.recoveryHr - currentRecord.stepTest.recoveryHr} bpm)</span>
                      </>
                    ) : (
                      <>
                        <Minus className="w-3.5 h-3.5 text-stone-400" />
                        <span>Consistent cardio level</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Plank Progress */}
              <div className="p-3.5 bg-[#faf9f5] dark:bg-[#0e1411] print:bg-white border-2 border-stone-300 dark:border-stone-800 print:border-black rounded-xs text-xs space-y-1">
                <span className="font-heading uppercase font-bold text-stone-900 dark:text-stone-100 print:text-black block">
                  CORE PLANK HOLD (SEC)
                </span>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-stone-500 dark:text-stone-400">
                    Base: {baselineRecord.plankTest?.timeSeconds ?? 'N/A'}s
                  </span>
                  <span className="font-scoreboard text-base text-[#0d3221] dark:text-[#4cb988] print:text-black">
                    Now: {currentRecord?.plankTest?.timeSeconds ?? 'N/A'}s
                  </span>
                </div>
                {baselineRecord.plankTest && currentRecord?.plankTest && (
                  <div className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 pt-1">
                    {currentRecord.plankTest.timeSeconds > baselineRecord.plankTest.timeSeconds ? (
                      <>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Increased hold (+{currentRecord.plankTest.timeSeconds - baselineRecord.plankTest.timeSeconds}s)</span>
                      </>
                    ) : (
                      <>
                        <Minus className="w-3.5 h-3.5 text-stone-400" />
                        <span>Steady endurance</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Push-Up Progress */}
              <div className="p-3.5 bg-[#faf9f5] dark:bg-[#0e1411] print:bg-white border-2 border-stone-300 dark:border-stone-800 print:border-black rounded-xs text-xs space-y-1">
                <span className="font-heading uppercase font-bold text-stone-900 dark:text-stone-100 print:text-black block">
                  PUSH-UP REPETITIONS
                </span>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-stone-500 dark:text-stone-400">
                    Base: {baselineRecord.pushUpTest?.count ?? 'N/A'} reps
                  </span>
                  <span className="font-scoreboard text-base text-[#0d3221] dark:text-[#4cb988] print:text-black">
                    Now: {currentRecord?.pushUpTest?.count ?? 'N/A'} reps
                  </span>
                </div>
                {baselineRecord.pushUpTest && currentRecord?.pushUpTest && (
                  <div className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 pt-1">
                    {currentRecord.pushUpTest.count > baselineRecord.pushUpTest.count ? (
                      <>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Gained +{currentRecord.pushUpTest.count - baselineRecord.pushUpTest.count} reps</span>
                      </>
                    ) : (
                      <>
                        <Minus className="w-3.5 h-3.5 text-stone-400" />
                        <span>Maintained pushing strength</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Strengths & Growth Areas Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#faf9f5] dark:bg-[#0e1411] print:bg-white border-2 border-stone-300 dark:border-stone-800 print:border-black rounded-xs p-4 text-xs space-y-2">
            <h3 className="font-heading uppercase font-extrabold text-stone-900 dark:text-stone-100 print:text-black tracking-wide flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#144e34] dark:text-[#4cb988]" />
              <span>IDENTIFIED STRENGTHS ({strengths.length})</span>
            </h3>
            {strengths.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-stone-700 dark:text-stone-300 print:text-black font-sans">
                {strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            ) : (
              <p className="text-stone-500 dark:text-stone-400 italic">Complete all tests to reveal strengths.</p>
            )}
          </div>

          <div className="bg-[#faf9f5] dark:bg-[#0e1411] print:bg-white border-2 border-stone-300 dark:border-stone-800 print:border-black rounded-xs p-4 text-xs space-y-2">
            <h3 className="font-heading uppercase font-extrabold text-stone-900 dark:text-stone-100 print:text-black tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#d95f02]" />
              <span>PRIORITY GROWTH FOCUS ({areasToImprove.length})</span>
            </h3>
            {areasToImprove.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-stone-700 dark:text-stone-300 print:text-black font-sans">
                {areasToImprove.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            ) : (
              <p className="text-stone-600 dark:text-stone-400">
                All completed components are at or above age-appropriate baselines!
              </p>
            )}
          </div>

          <div className="bg-[#faf9f5] dark:bg-[#0e1411] print:bg-white border-2 border-stone-300 dark:border-stone-800 print:border-black rounded-xs p-4 text-xs space-y-2">
            <h3 className="font-heading uppercase font-extrabold text-stone-900 dark:text-stone-100 print:text-black tracking-wide flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-stone-500" />
              <span>INCOMPLETE TESTS ({incomplete.length})</span>
            </h3>
            {incomplete.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-stone-700 dark:text-stone-300 print:text-black font-sans">
                {incomplete.map((inc, i) => (
                  <li key={i}>{inc}</li>
                ))}
              </ul>
            ) : (
              <p className="text-emerald-700 dark:text-emerald-400 font-heading uppercase tracking-wide font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> ALL 6 TESTS COMPLETED!
              </p>
            )}
          </div>
        </div>

        {/* Holistic Movement & Lifestyle Plan */}
        <div className="border-2 border-stone-300 dark:border-stone-800 print:border-black rounded-xs p-5 bg-[#faf9f5] dark:bg-[#0e1411] print:bg-white space-y-3">
          <h2 className="font-heading uppercase text-sm font-extrabold text-[#0d3221] dark:text-[#7fd2ad] print:text-black tracking-wide flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d95f02]" />
            <span>HOLISTIC JUNIOR HIGH PHYSICAL ACTIVITY & MOVEMENT GUIDANCE</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-stone-700 dark:text-stone-300 print:text-black leading-relaxed font-sans">
            <div className="bg-white dark:bg-[#141c18] print:bg-white p-3 rounded-xs border border-stone-200 dark:border-stone-800 print:border-black">
              <span className="font-heading uppercase font-bold text-stone-900 dark:text-stone-100 print:text-black block mb-1">
                Active Play & Traditional Filipino Games
              </span>
              Play active games with classmates: <strong>patintero</strong>, <strong>habulan</strong>, <strong>luksong tinik</strong>, dancing, jump rope, basketball, or biking, building toward the WHO goal of an average of 60 minutes of moderate-to-vigorous physical activity daily.
            </div>

            <div className="bg-white dark:bg-[#141c18] print:bg-white p-3 rounded-xs border border-stone-200 dark:border-stone-800 print:border-black">
              <span className="font-heading uppercase font-bold text-stone-900 dark:text-stone-100 print:text-black block mb-1">
                Household Chores as Natural Movement
              </span>
              Moving through chores (sweeping the floor/yard, mopping, gardening, folding clothes, tidying bedroom) builds functional endurance and core stability with <em>no strict minutes required</em>.
            </div>

            <div className="bg-white dark:bg-[#141c18] print:bg-white p-3 rounded-xs border border-stone-200 dark:border-stone-800 print:border-black">
              <span className="font-heading uppercase font-bold text-stone-900 dark:text-stone-100 print:text-black block mb-1">
                Strength & Flexibility Routine
              </span>
              Practice gentle bodyweight movements 2–3 times a week: modified wall/knee push-ups, squats, short plank holds, shoulder towel stretches, and seated hamstring reaches without bouncing.
            </div>

            <div className="bg-white dark:bg-[#141c18] print:bg-white p-3 rounded-xs border border-stone-200 dark:border-stone-800 print:border-black">
              <span className="font-heading uppercase font-bold text-stone-900 dark:text-stone-100 print:text-black block mb-1">
                Nourishment, Hydration & Sleep
              </span>
              Fuel teenage bodies with colorful, balanced local foods (rice, fish, mongo, vegetables, fruit). Drink clean water before, during, and after physical play. Ensure 8 to 10 hours of restful sleep every night for tissue recovery and brain development. <strong>Zero dieting or restriction.</strong>
            </div>
          </div>
        </div>

        {/* Signatures & Certification */}
        <div className="pt-6 border-t-2 border-stone-300 dark:border-stone-800 print:border-black grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-center">
          <div>
            <div className="h-10 border-b-2 border-stone-400 dark:border-stone-600 print:border-black mb-1 flex items-end justify-center font-heading uppercase font-bold text-stone-800 dark:text-stone-200 print:text-black">
              {student.fullName}
            </div>
            <span className="font-mono text-[11px] text-stone-500 dark:text-stone-400 print:text-stone-600 block">LEARNER SIGNATURE</span>
          </div>

          <div>
            <div className="h-10 border-b-2 border-stone-400 dark:border-stone-600 print:border-black mb-1 flex items-end justify-center font-heading uppercase font-bold text-stone-800 dark:text-stone-200 print:text-black">
              {student.teacherName || teacherConfig.defaultTeacherName}
            </div>
            <span className="font-mono text-[11px] text-stone-500 dark:text-stone-400 print:text-stone-600 block">PE TEACHER / FACILITATOR</span>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <div className="h-10 border-b-2 border-stone-400 dark:border-stone-600 print:border-black mb-1 flex items-end justify-center font-mono text-stone-800 dark:text-stone-200 print:text-black">
              {currentRecord?.date || student.assessmentDate}
            </div>
            <span className="font-mono text-[11px] text-stone-500 dark:text-stone-400 print:text-stone-600 block">DATE OF CERTIFICATION</span>
          </div>
        </div>

        {/* Educational Disclaimer */}
        <div className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 print:text-stone-600 text-center border-t border-stone-200 dark:border-stone-800 print:border-black pt-3 font-sans">
          <strong>Educational Physical Education Disclaimer:</strong> This assessment is administered for school physical education curriculum purposes under the Philippine DepEd physical fitness program. Scores and BMI screenings are educational screening tools and do not represent clinical or medical diagnoses.
        </div>
      </div>
    </div>
  );
};
