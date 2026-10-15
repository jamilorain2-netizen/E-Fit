import React from 'react';
import {
  TrendingUp,
  Calendar,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  Clock,
  Heart,
  Timer,
  ShieldCheck,
  Ruler,
  Scale,
  ArrowRightLeft,
  ChevronRight,
} from 'lucide-react';
import { StudentProfile, AssessmentRecord, StandardRow } from '../types';
import { evaluateTestScore } from '../utils/scoring';

interface ProgressHistoryViewProps {
  student: StudentProfile;
  assessments: AssessmentRecord[];
  standards: StandardRow[];
  onSelectAssessment?: (assessmentId: string) => void;
}

export const ProgressHistoryView: React.FC<ProgressHistoryViewProps> = ({
  student,
  assessments,
  standards,
  onSelectAssessment,
}) => {
  // Sort assessments chronologically
  const sorted = [...assessments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="bg-white dark:bg-[#141c18] rounded-xs p-8 border-2 border-[#144e34] dark:border-[#227e56] text-center space-y-3">
        <Clock className="w-10 h-10 text-stone-400 dark:text-stone-500 mx-auto" />
        <h3 className="font-heading uppercase text-lg font-extrabold text-stone-900 dark:text-stone-100 tracking-wide">
          NO ASSESSMENT RECORDS RECORDED YET
        </h3>
        <p className="text-xs text-stone-600 dark:text-stone-400 max-w-md mx-auto font-sans">
          Complete the six health-related fitness tests to establish your first baseline record. Subsequent quarters will track your stamina and strength gains!
        </p>
      </div>
    );
  }

  // Calculate deltas if 2 or more assessments exist
  const first = sorted[0];
  const latest = sorted[sorted.length - 1];

  const calculateDelta = (curr?: number, prev?: number) => {
    if (curr === undefined || prev === undefined) return null;
    return curr - prev;
  };

  const stepDelta = calculateDelta(latest.stepTest?.recoveryHr, first.stepTest?.recoveryHr);
  const plankDelta = calculateDelta(latest.plankTest?.timeSeconds, first.plankTest?.timeSeconds);
  const pushUpDelta = calculateDelta(latest.pushUpTest?.count, first.pushUpTest?.count);
  const snrDelta = calculateDelta(latest.sitAndReach?.bestCm, first.sitAndReach?.bestCm);
  const bmiDelta = calculateDelta(latest.bmi?.bmiValue, first.bmi?.bmiValue);

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-white dark:bg-[#141c18] rounded-xs border-2 border-[#144e34] dark:border-[#227e56] shadow-xs overflow-hidden">
        <div className="bg-[#103d29] dark:bg-[#082115] text-white px-6 py-4 border-b-2 border-[#196343] dark:border-[#1e4832] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading uppercase text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              <span>PROGRESS HISTORY: {student.fullName}</span>
            </h2>
          </div>

          <div className="text-xs bg-[#082115] px-3 py-1.5 rounded-xs border border-[#196343] font-mono text-[#a0cbb5]">
            <span>DEPED LRN:</span> <strong className="text-white">{student.lrnOrId}</strong>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <p className="text-xs text-stone-600 dark:text-stone-300 font-sans">
            Tracking physical progression across {sorted.length} recorded assessment session{sorted.length === 1 ? '' : 's'} across junior high school terms.
          </p>

          {/* Comparison Summary Cards if multiple tests exist */}
          {sorted.length >= 2 && (
            <div className="space-y-3">
              <div className="border-b-2 border-stone-200 dark:border-stone-800 pb-2 flex items-center justify-between">
                <h3 className="font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#d95f02]" />
                  <span>OVERALL DELTAS: BASELINE ({first.date}) VS. LATEST ({latest.date})</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* Step recovery */}
                <div className="bg-[#faf9f5] dark:bg-[#0e1411] p-3.5 rounded-xs border-2 border-stone-300 dark:border-stone-800 text-xs">
                  <div className="flex items-center gap-1 text-stone-600 dark:text-stone-400 font-heading uppercase font-bold text-xs mb-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>Cardio Recovery</span>
                  </div>
                  <div className="font-scoreboard text-2xl text-[#0d3221] dark:text-[#4cb988]">
                    {latest.stepTest?.recoveryHr ?? '—'} <span className="text-xs font-mono">BPM</span>
                  </div>
                  {stepDelta !== null && (
                    <div
                      className={`text-[11px] font-mono font-bold mt-1 flex items-center gap-0.5 ${
                        stepDelta <= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      {stepDelta < 0 ? (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      ) : stepDelta > 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <Minus className="w-3.5 h-3.5" />
                      )}
                      <span>{stepDelta < 0 ? `${Math.abs(stepDelta)} bpm faster` : `${stepDelta} bpm diff`}</span>
                    </div>
                  )}
                </div>

                {/* Plank hold */}
                <div className="bg-[#faf9f5] dark:bg-[#0e1411] p-3.5 rounded-xs border-2 border-stone-300 dark:border-stone-800 text-xs">
                  <div className="flex items-center gap-1 text-stone-600 dark:text-stone-400 font-heading uppercase font-bold text-xs mb-1">
                    <Timer className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Plank Core</span>
                  </div>
                  <div className="font-scoreboard text-2xl text-[#0d3221] dark:text-[#4cb988]">
                    {latest.plankTest?.timeSeconds ?? '—'} <span className="text-xs font-mono">SEC</span>
                  </div>
                  {plankDelta !== null && (
                    <div
                      className={`text-[11px] font-mono font-bold mt-1 flex items-center gap-0.5 ${
                        plankDelta >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {plankDelta > 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : plankDelta < 0 ? (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      ) : (
                        <Minus className="w-3.5 h-3.5" />
                      )}
                      <span>{plankDelta > 0 ? `+${plankDelta}s longer` : `${plankDelta}s change`}</span>
                    </div>
                  )}
                </div>

                {/* Push up */}
                <div className="bg-[#faf9f5] dark:bg-[#0e1411] p-3.5 rounded-xs border-2 border-stone-300 dark:border-stone-800 text-xs">
                  <div className="flex items-center gap-1 text-stone-600 dark:text-stone-400 font-heading uppercase font-bold text-xs mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    <span>Push-Up Reps</span>
                  </div>
                  <div className="font-scoreboard text-2xl text-[#0d3221] dark:text-[#4cb988]">
                    {latest.pushUpTest?.count ?? '—'} <span className="text-xs font-mono">REPS</span>
                  </div>
                  {pushUpDelta !== null && (
                    <div
                      className={`text-[11px] font-mono font-bold mt-1 flex items-center gap-0.5 ${
                        pushUpDelta >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {pushUpDelta > 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : pushUpDelta < 0 ? (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      ) : (
                        <Minus className="w-3.5 h-3.5" />
                      )}
                      <span>{pushUpDelta > 0 ? `+${pushUpDelta} reps` : `${pushUpDelta} reps`}</span>
                    </div>
                  )}
                </div>

                {/* Sit and reach */}
                <div className="bg-[#faf9f5] dark:bg-[#0e1411] p-3.5 rounded-xs border-2 border-stone-300 dark:border-stone-800 text-xs">
                  <div className="flex items-center gap-1 text-stone-600 dark:text-stone-400 font-heading uppercase font-bold text-xs mb-1">
                    <Ruler className="w-3.5 h-3.5 text-sky-400" />
                    <span>Sit & Reach</span>
                  </div>
                  <div className="font-scoreboard text-2xl text-[#0d3221] dark:text-[#4cb988]">
                    {latest.sitAndReach?.bestCm ?? '—'} <span className="text-xs font-mono">CM</span>
                  </div>
                  {snrDelta !== null && (
                    <div
                      className={`text-[11px] font-mono font-bold mt-1 flex items-center gap-0.5 ${
                        snrDelta >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {snrDelta > 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : snrDelta < 0 ? (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      ) : (
                        <Minus className="w-3.5 h-3.5" />
                      )}
                      <span>{snrDelta > 0 ? `+${snrDelta} cm farther` : `${snrDelta} cm`}</span>
                    </div>
                  )}
                </div>

                {/* BMI */}
                <div className="bg-[#faf9f5] dark:bg-[#0e1411] p-3.5 rounded-xs border-2 border-stone-300 dark:border-stone-800 text-xs">
                  <div className="flex items-center gap-1 text-stone-600 dark:text-stone-400 font-heading uppercase font-bold text-xs mb-1">
                    <Scale className="w-3.5 h-3.5 text-orange-400" />
                    <span>BMI Screening</span>
                  </div>
                  <div className="font-scoreboard text-2xl text-[#0d3221] dark:text-[#4cb988]">
                    {latest.bmi?.bmiValue ? latest.bmi.bmiValue.toFixed(1) : '—'}{' '}
                    <span className="text-xs font-mono">KG/M²</span>
                  </div>
                  {bmiDelta !== null && (
                    <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-1">
                      {bmiDelta === 0 ? 'Stable ratio' : `${bmiDelta > 0 ? '+' : ''}${bmiDelta.toFixed(1)} change`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Detailed Timeline Table */}
          <div className="space-y-3">
            <h3 className="font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider flex items-center gap-1.5 border-b-2 border-stone-200 dark:border-stone-800 pb-2">
              <Calendar className="w-4 h-4 text-[#144e34] dark:text-[#4cb988]" />
              <span>RECORDED SESSIONS TIMELINE</span>
            </h3>

            <div className="border-2 border-stone-300 dark:border-stone-800 rounded-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#103d29] dark:bg-[#082115] text-white font-heading uppercase tracking-wider font-bold text-xs border-b-2 border-[#196343]">
                    <tr>
                      <th className="py-2.5 px-3">DATE & SESSION</th>
                      <th className="py-2.5 px-3">STEP TEST (REC. HR)</th>
                      <th className="py-2.5 px-3">PLANK (SEC)</th>
                      <th className="py-2.5 px-3">PUSH-UP (REPS)</th>
                      <th className="py-2.5 px-3">ZIPPER (R / L)</th>
                      <th className="py-2.5 px-3">SIT & REACH (CM)</th>
                      <th className="py-2.5 px-3">BMI (KG/M²)</th>
                      <th className="py-2.5 px-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-stone-200 dark:divide-stone-800 bg-white dark:bg-[#141c18]">
                    {sorted.map((record) => {
                      const stepEval = record.stepTest
                        ? evaluateTestScore(standards, 'step_test', record.stepTest.recoveryHr, student.sex, student.age)
                        : null;
                      const plankEval = record.plankTest
                        ? evaluateTestScore(standards, 'plank', record.plankTest.timeSeconds, student.sex, student.age)
                        : null;
                      const puEval = record.pushUpTest
                        ? evaluateTestScore(standards, 'push_up', record.pushUpTest.count, student.sex, student.age)
                        : null;
                      const snrEval = record.sitAndReach
                        ? evaluateTestScore(standards, 'sit_and_reach', record.sitAndReach.bestCm, student.sex, student.age)
                        : null;
                      const bmiEval = record.bmi
                        ? evaluateTestScore(standards, 'bmi', record.bmi.bmiValue, student.sex, student.age)
                        : null;

                      return (
                        <tr key={record.id} className="hover:bg-stone-50 dark:hover:bg-[#1a2520] transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-heading uppercase font-bold text-stone-900 dark:text-stone-100">{record.date}</div>
                            <div className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">{record.termLabel || 'PE Assessment'}</div>
                          </td>

                          <td className="py-3 px-3 font-mono">
                            {record.stepTest ? (
                              <div>
                                <span className="font-bold text-stone-900 dark:text-stone-100">{record.stepTest.recoveryHr} bpm</span>
                                <div className="text-[10px] text-stone-500 dark:text-stone-400">{stepEval?.category || ''}</div>
                              </div>
                            ) : (
                              <span className="text-stone-400 italic">Incomplete</span>
                            )}
                          </td>

                          <td className="py-3 px-3 font-mono">
                            {record.plankTest ? (
                              <div>
                                <span className="font-bold text-stone-900 dark:text-stone-100">{record.plankTest.timeSeconds}s</span>
                                <div className="text-[10px] text-stone-500 dark:text-stone-400">{plankEval?.category || ''}</div>
                              </div>
                            ) : (
                              <span className="text-stone-400 italic">Incomplete</span>
                            )}
                          </td>

                          <td className="py-3 px-3 font-mono">
                            {record.pushUpTest ? (
                              <div>
                                <span className="font-bold text-stone-900 dark:text-stone-100">{record.pushUpTest.count}</span>
                                <div className="text-[10px] text-stone-500 dark:text-stone-400">
                                  {puEval?.category || ''}
                                  {record.pushUpTest.teacherVerified ? ' ✓' : ''}
                                </div>
                              </div>
                            ) : (
                              <span className="text-stone-400 italic">Incomplete</span>
                            )}
                          </td>

                          <td className="py-3 px-3 font-mono">
                            {record.zipperTest ? (
                              <div className="text-stone-900 dark:text-stone-100">
                                <span>
                                  {record.zipperTest.rightCm > 0 ? `+${record.zipperTest.rightCm}` : record.zipperTest.rightCm} /{' '}
                                  {record.zipperTest.leftCm > 0 ? `+${record.zipperTest.leftCm}` : record.zipperTest.leftCm} cm
                                </span>
                              </div>
                            ) : (
                              <span className="text-stone-400 italic">Incomplete</span>
                            )}
                          </td>

                          <td className="py-3 px-3 font-mono">
                            {record.sitAndReach ? (
                              <div>
                                <span className="font-bold text-stone-900 dark:text-stone-100">{record.sitAndReach.bestCm} cm</span>
                                <div className="text-[10px] text-stone-500 dark:text-stone-400">{snrEval?.category || ''}</div>
                              </div>
                            ) : (
                              <span className="text-stone-400 italic">Incomplete</span>
                            )}
                          </td>

                          <td className="py-3 px-3 font-mono">
                            {record.bmi ? (
                              <div>
                                <span className="font-bold text-stone-900 dark:text-stone-100">{record.bmi.bmiValue.toFixed(1)}</span>
                                <div className="text-[10px] text-stone-500 dark:text-stone-400">{bmiEval?.category || ''}</div>
                              </div>
                            ) : (
                              <span className="text-stone-400 italic">Incomplete</span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            {onSelectAssessment && (
                              <button
                                type="button"
                                onClick={() => onSelectAssessment(record.id)}
                                className="text-xs text-[#d95f02] hover:text-[#b84f00] font-heading uppercase tracking-wider font-bold inline-flex items-center gap-1"
                              >
                                <span>View Report</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
