import React, { useState } from 'react';
import {
  ChevronRight,
  Ruler,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  StudentProfile,
  SitAndReachData,
  StandardRow,
  TeacherConfig,
  FormChecklistItem,
} from '../../types';
import { evaluateTestScore } from '../../utils/scoring';
import { TestVideoOrGuide } from '../TestVideoOrGuide';
import { TestResultView } from '../TestResultView';


interface SitAndReachProps {
  student: StudentProfile;
  standards: StandardRow[];
  teacherConfig: TeacherConfig;
  savedData?: SitAndReachData;
  onSaveData: (data: SitAndReachData) => void;
  onNextTest: () => void;
  onPrevTest: () => void;
}

const SIT_AND_REACH_FORM_CHECKLIST: FormChecklistItem[] = [
  {
    aspect: 'Knee Position',
    correct: 'Knees stay completely locked flat against the mat (partner may gently hold knees).',
    incorrect: 'Bending or lifting knees off the floor to gain extra distance.',
  },
  {
    aspect: 'Hand Placement',
    correct: 'Palms face down, one hand resting on top of the other with middle fingertips even.',
    incorrect: 'Reaching with one hand further than the other or fingertips uneven.',
  },
  {
    aspect: 'Reach Motion & Hold',
    correct: 'Smooth forward slide holding the farthest reach steadily for 2 full seconds.',
    incorrect: 'Bouncing, lunging forward, or jerking to touch a higher centimeter mark.',
  },
  {
    aspect: 'Feet Alignment',
    correct: 'Bare feet flat against vertical face of box, shoulder-width apart.',
    incorrect: 'Wearing shoes or letting soles angle off the test board.',
  },
];

export const SitAndReachComponent: React.FC<SitAndReachProps> = ({
  student,
  standards,
  teacherConfig,
  savedData,
  onSaveData,
  onNextTest,
  onPrevTest,
}) => {
  const [trials, setTrials] = useState<(number | string)[]>(
    savedData?.trials && savedData.trials.length > 0
      ? savedData.trials
      : ['', '', '']
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compute best trial automatically
  const validNumbers = trials
    .map((t) => (typeof t === 'number' ? t : parseFloat(t)))
    .filter((n) => !isNaN(n) && n >= 0);

  const bestCalculated = validNumbers.length > 0 ? Math.max(...validNumbers) : 0;

  const handleTrialChange = (index: number, val: string) => {
    setErrorMsg(null);
    const updated = [...trials];
    updated[index] = val === '' ? '' : parseFloat(val);
    setTrials(updated);
  };

  const handleAddTrial = () => {
    if (trials.length < 5) {
      setTrials([...trials, '']);
    }
  };

  const handleRemoveTrial = (index: number) => {
    if (trials.length > 1) {
      const updated = trials.filter((_, i) => i !== index);
      setTrials(updated);
    }
  };

  const handleSave = () => {
    setErrorMsg(null);
    const nums = trials
      .map((t) => (typeof t === 'number' ? t : parseFloat(t)))
      .filter((n) => !isNaN(n));

    if (nums.length === 0) {
      setErrorMsg('Please record at least one trial measurement in centimeters (cm).');
      return;
    }

    const invalid = nums.some((n) => n < 0 || n > 100);
    if (invalid) {
      setErrorMsg('Measurements must be between 0 cm and 100 cm.');
      return;
    }

    const best = Math.max(...nums);
    const payload: SitAndReachData = {
      trials: nums,
      bestCm: best,
      date: new Date().toISOString().split('T')[0],
    };

    onSaveData(payload);
  };

  const evaluatedInterpretation =
    savedData?.bestCm !== undefined
      ? evaluateTestScore(
          standards,
          'sit_and_reach',
          savedData.bestCm,
          student.sex,
          student.age
        )
      : null;

  const videoConfig = teacherConfig.videoConfigs.sit_and_reach;

  return (
    <div className="space-y-6">

      {/* Video Demonstration / Written Guide / Form Checklist */}
      <TestVideoOrGuide
        testKey="sit_and_reach"
        title="Sit-and-Reach Test"
        videoUrl={videoConfig?.url}
        videoCredit={videoConfig?.credit}
        whatItIs="A test evaluating flexibility of the lower back, hips, and hamstring muscle groups using a standardized sit-and-reach box or floor tape ruler."
        whyItMatters="Good posterior chain flexibility prevents lower back strain during long class periods, reduces hamstring pull injuries, and allows fluid running stride."
        equipment={[
          'DepEd standardized Sit-and-Reach box (or tape ruler on floor against wall)',
          'Exercise mat',
        ]}
        steps={[
          'Remove shoes and sit on the floor with legs fully extended straight forward, feet shoulder-width apart.',
          'Soles of feet must rest flat against the vertical crossboard of the sit-and-reach box.',
          'Keep knees straight and locked flat against the floor (a partner may gently hold knees down).',
          'Place hands on top of each other with palms facing down and middle fingers aligned evenly.',
          'In one continuous, smooth sliding motion, reach forward along the measuring scale.',
          'Hold the farthest reach position for 2 full seconds without bouncing or jerking.',
          'Perform 2 or 3 trials and record the farthest (best) score to the nearest 0.5 cm.',
        ]}
        tips={[
          'CRITICAL: NO BOUNCING. Bouncing triggers the muscle stretch reflex and risks muscle strain.',
          'Exhale smoothly as you reach forward.',
        ]}
        formChecklist={SIT_AND_REACH_FORM_CHECKLIST}
      />

      {/* Main Interactive Test Panel */}
      {/* Main Interactive Test Panel */}
      <div className="bg-[#ffffff] dark:bg-[#141c18] rounded-xs border-2 border-[#144e34] dark:border-[#227e56] shadow-xs overflow-hidden space-y-6">
        <div className="bg-[#103d29] dark:bg-[#082115] text-white px-6 py-4 border-b-2 border-[#196343] dark:border-[#1e4832] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading uppercase text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-2">
              <Ruler className="w-6 h-6 text-sky-400" />
              <span>SIT-AND-REACH TEST</span>
            </h2>
          </div>

          <div className="text-xs bg-[#082115] px-3 py-1.5 rounded-xs border border-[#196343] font-mono text-[#a0cbb5]">
            <span>LEARNER:</span> <strong className="text-white">{student.fullName}</strong> ({student.gradeLevel})
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6 pt-0">
          {/* Direction & Best-of-N Rules */}
          <div className="bg-[#f6f5ef] dark:bg-[#1a2520] border-l-4 border-[#144e34] dark:border-[#2d9d6d] rounded-xs p-4 text-xs text-stone-800 dark:text-stone-200 space-y-1.5">
            <span className="font-heading uppercase font-extrabold text-sm text-[#0d3221] dark:text-[#7fd2ad] block">
              PROTOCOL: BEST OF N TRIALS (SMOOTH REACH & 2-SECOND HOLD)
            </span>
            <p className="leading-relaxed font-sans">
              Record each attempt below. Hands slide forward smoothly with palms down. Knees must remain flat on the mat. The app automatically registers the highest (best) reach in centimeters.
            </p>
          </div>

          {/* Trials Input Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-stone-200 dark:border-stone-800 pb-2">
              <label className="font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider">
                RECORDED TRIALS (CENTIMETERS)
              </label>
              {trials.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddTrial}
                  className="text-xs text-[#d95f02] hover:text-[#b84f00] font-heading uppercase font-bold tracking-wider flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Trial</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {trials.map((trialVal, idx) => {
                const isBest =
                  validNumbers.length > 0 &&
                  parseFloat(String(trialVal)) === bestCalculated;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xs border-2 transition-all ${
                      isBest
                        ? 'bg-emerald-50 dark:bg-[#11241a] border-[#144e34] dark:border-emerald-600 shadow-xs'
                        : 'bg-[#faf9f5] dark:bg-[#0e1411] border-stone-300 dark:border-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-heading uppercase text-xs font-bold text-stone-700 dark:text-stone-300">
                        Trial {idx + 1}
                      </span>
                      {isBest && (
                        <span className="text-[10px] font-mono font-bold uppercase text-emerald-950 dark:text-emerald-200 bg-emerald-200/80 dark:bg-emerald-900/80 px-2 py-0.5 rounded-xs flex items-center gap-1 border border-emerald-400">
                          <Trophy className="w-3 h-3 text-emerald-700 dark:text-emerald-300" /> Best Reach
                        </span>
                      )}
                      {trials.length > 1 && !isBest && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTrial(idx)}
                          className="text-stone-400 hover:text-rose-600 p-0.5"
                          title="Remove trial"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        value={trialVal}
                        onChange={(e) => handleTrialChange(idx, e.target.value)}
                        placeholder="e.g. 28.5"
                        className="w-full px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-sm font-mono font-bold text-stone-900 dark:text-stone-100 bg-white dark:bg-[#141c18] focus:border-[#144e34]"
                      />
                      <span className="font-mono text-xs font-bold text-stone-600 dark:text-stone-300">CM</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Best Score Indicator - Scoreboard Box */}
            <div className="bg-[#082115] dark:bg-[#05110b] text-white p-4 rounded-xs flex items-center justify-between border-4 border-[#144e34] dark:border-[#1e4832] shadow-xs">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#a0cbb5] block">
                  SELECTED OFFICIAL SCORE
                </span>
                <span className="text-xs text-stone-300 font-sans">
                  Highest reach among {validNumbers.length} completed trial{validNumbers.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 font-scoreboard">
                <span className="text-4xl sm:text-5xl font-black text-white">
                  {validNumbers.length > 0 ? bestCalculated : '—'}
                </span>
                <span className="font-mono text-sm uppercase text-[#a0cbb5]">CM</span>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-100 dark:bg-rose-950/80 border-2 border-rose-500 rounded-xs text-xs text-rose-900 dark:text-rose-200 flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-[#d95f02] hover:bg-[#b84f00] text-white font-heading uppercase tracking-wider font-bold text-xs rounded-xs transition-colors border border-amber-900 shadow-xs"
            >
              Save Sit-and-Reach Result
            </button>
          </div>
        </div>
      </div>

      {/* Result Display */}
      {savedData && evaluatedInterpretation && (
        <div className="space-y-4">
          <TestResultView
            testName="Sit-and-Reach Test"
            resultValue={savedData.bestCm}
            unit="cm (Best Trial)"
            subDetails={`Trials Recorded: ${savedData.trials.join(' cm, ')} cm`}
            interpretation={evaluatedInterpretation}
            onRetest={() => setTrials(['', '', ''])}
          />

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onPrevTest}
              className="px-4 py-2.5 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-heading uppercase tracking-wider font-bold text-xs rounded-xs transition-colors border-2 border-stone-300 dark:border-stone-700"
            >
              &larr; Previous: Zipper Test
            </button>
            <button
              type="button"
              onClick={onNextTest}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#144e34] hover:bg-[#0d3221] text-white font-heading uppercase tracking-wider font-bold text-xs rounded-xs transition-colors border border-emerald-400/40"
            >
              <span>Next Test: BMI Screening</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
