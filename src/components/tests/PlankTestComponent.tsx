import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Timer,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import {
  StudentProfile,
  PlankTestData,
  StandardRow,
  TeacherConfig,
  FormChecklistItem,
} from '../../types';
import { evaluateTestScore } from '../../utils/scoring';
import { EmergencyStopBanner } from '../EmergencyStopBanner';
import { TestVideoOrGuide } from '../TestVideoOrGuide';
import { TestResultView } from '../TestResultView';


interface PlankTestProps {
  student: StudentProfile;
  standards: StandardRow[];
  teacherConfig: TeacherConfig;
  savedData?: PlankTestData;
  onSaveData: (data: PlankTestData) => void;
  onNextTest: () => void;
  onPrevTest: () => void;
}

const PLANK_FORM_CHECKLIST: FormChecklistItem[] = [
  {
    aspect: 'Hip & Spine Alignment',
    correct: 'Straight line from ears, shoulders, hips, to heels. Glutes and core braced.',
    incorrect: 'Hips sagging toward floor (hyperextending lower back) or hips piked into a tent.',
  },
  {
    aspect: 'Elbow & Shoulder Position',
    correct: 'Elbows placed directly beneath shoulders at a 90-degree angle.',
    incorrect: 'Elbows placed too far in front or winged out wide, straining shoulders.',
  },
  {
    aspect: 'Head & Neck',
    correct: 'Neutral neck, eyes focused gently on the mat directly below hands.',
    incorrect: 'Craning neck up to watch clock or dropping head down onto chest.',
  },
  {
    aspect: 'Test Termination Rule',
    correct: 'Timer stops the second student can no longer hold alignment or knee touches mat.',
    incorrect: 'Continuing to let timer run while hips have collapsed.',
  },
];

export const PlankTestComponent: React.FC<PlankTestProps> = ({
  student,
  standards,
  teacherConfig,
  savedData,
  onSaveData,
  onNextTest,
  onPrevTest,
}) => {
  const [seconds, setSeconds] = useState(savedData?.timeSeconds || 0);
  const [isRunning, setIsRunning] = useState(false);
  const [manualSeconds, setManualSeconds] = useState<number | string>(
    savedData?.timeSeconds || ''
  );
  const [stoppedDueToForm, setStoppedDueToForm] = useState(true);

  const timerRef = useRef<number | null>(null);

  // Stopwatch ticking
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStopAndSave = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const finalSecs = seconds;
    const payload: PlankTestData = {
      timeSeconds: finalSecs,
      stoppedDueToForm: true,
      date: new Date().toISOString().split('T')[0],
    };
    onSaveData(payload);
    setManualSeconds(finalSecs);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setSeconds(0);
  };

  const handleManualSave = () => {
    const val = typeof manualSeconds === 'number' ? manualSeconds : parseInt(manualSeconds, 10);
    if (isNaN(val) || val < 0 || val > 600) {
      alert('Please enter a valid plank duration (0 to 600 seconds).');
      return;
    }
    const payload: PlankTestData = {
      timeSeconds: val,
      stoppedDueToForm,
      date: new Date().toISOString().split('T')[0],
    };
    onSaveData(payload);
    setSeconds(val);
  };

  const formatMMSS = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const evaluatedInterpretation =
    savedData?.timeSeconds !== undefined
      ? evaluateTestScore(
          standards,
          'plank',
          savedData.timeSeconds,
          student.sex,
          student.age
        )
      : null;

  const videoConfig = teacherConfig.videoConfigs.plank;

  return (
    <div className="space-y-6">


      {/* Video Demonstration / Written Guide / Form Checklist */}
      <TestVideoOrGuide
        testKey="plank"
        title="Basic Plank Test"
        videoUrl={videoConfig?.url}
        videoCredit={videoConfig?.credit}
        whatItIs="A test of core muscular endurance measuring how long a Junior High School student can maintain a static prone forearm plank with neutral spine alignment."
        whyItMatters="A strong abdominal and spinal core protects your back when carrying heavy backpacks, improves sitting posture in class, and enhances athletic agility."
        equipment={[
          'Exercise or yoga mat',
          'Flat, non-slippery surface',
          'Stopwatch or timer',
        ]}
        steps={[
          'Assume a prone position on the mat with elbows directly under shoulders, forearms resting flat on the ground.',
          'Extend legs straight back, tuck toes under, and lift torso and thighs off the mat.',
          'Create a straight line from ears, shoulders, hips, knees, to ankles. Tighten abdominals and glutes.',
          'Breathe rhythmically. Do not hold your breath.',
          'The partner or teacher starts the stopwatch when the student is in correct form.',
          'Stop the timer immediately when the student drops their hips, hikes hips upward, or when knees touch the floor after one verbal correction.',
        ]}
        tips={[
          'The test MUST end when form breaks down. Holding a broken plank strains the lumbar spine.',
          'Give only ONE verbal prompt ("Straighten hips"). If form breaks again, stop the timer immediately.',
        ]}
        formChecklist={PLANK_FORM_CHECKLIST}
      />

      <EmergencyStopBanner isTestActive={isRunning} onStopTest={handleStopAndSave} />

      {/* Main Interactive Plank Stopwatch Panel */}
      <div className="bg-[#ffffff] dark:bg-[#141c18] rounded-xs border-2 border-[#144e34] dark:border-[#227e56] shadow-xs overflow-hidden space-y-6">
        <div className="bg-[#103d29] dark:bg-[#082115] text-white px-6 py-4 border-b-2 border-[#196343] dark:border-[#1e4832] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading uppercase text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-2">
              <Timer className="w-6 h-6 text-emerald-400" />
              <span>FOREARM PRONE PLANK TEST</span>
            </h2>
          </div>

          <div className="text-xs bg-[#082115] px-3 py-1.5 rounded-xs border border-[#196343] font-mono text-[#a0cbb5]">
            <span>LEARNER:</span> <strong className="text-white">{student.fullName}</strong> ({student.gradeLevel})
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6 pt-0">
          {/* Form Break Critical Reminder */}
          <div className="bg-amber-100 dark:bg-amber-950/60 border-l-4 border-amber-600 rounded-xs p-4 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-heading uppercase text-sm font-bold block mb-0.5 text-amber-900 dark:text-amber-300">
                CRUCIAL RULE: TEST ENDS ON FORM BREAKDOWN
              </span>
              <span className="font-sans">
                The stopwatch must be stopped the moment the student can no longer keep a straight body line (hips sagging toward mat, hips piked high, or knees touching floor). Quality posture is the sole criterion.
              </span>
            </div>
          </div>

          {/* Stopwatch Display Box - Scoreboard Frame */}
          <div className="bg-[#082115] dark:bg-[#05110b] text-white rounded-xs p-6 sm:p-8 flex flex-col items-center justify-center text-center border-4 border-[#144e34] dark:border-[#1e4832] shadow-xs">
            <span className="font-mono text-xs uppercase tracking-widest text-[#a0cbb5] mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>CORE HOLD STOPWATCH (MM:SS)</span>
            </span>

            <div className="font-scoreboard text-6xl sm:text-8xl tracking-tight text-white my-3">
              {formatMMSS(seconds)}
            </div>
            <span className="font-mono text-xs text-[#a0cbb5]">({seconds} SECONDS TOTAL)</span>

            {/* Stopwatch Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              {!isRunning ? (
                <button
                  type="button"
                  onClick={handleStart}
                  className="px-6 py-3 rounded-xs bg-[#d95f02] hover:bg-[#b84f00] text-white font-heading uppercase tracking-wider font-extrabold text-sm flex items-center gap-2 border border-amber-900 transition-colors shadow-xs"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{seconds > 0 ? 'Resume Plank' : 'Start Plank'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  className="px-6 py-3 rounded-xs bg-amber-500 hover:bg-amber-600 text-stone-950 font-heading uppercase tracking-wider font-extrabold text-sm flex items-center gap-2"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </button>
              )}

              {/* Stop & Save button */}
              <button
                type="button"
                disabled={seconds === 0}
                onClick={handleStopAndSave}
                className={`px-5 py-3 rounded-xs font-heading uppercase tracking-wider font-bold text-sm flex items-center gap-2 transition-all border ${
                  seconds > 0
                    ? 'bg-rose-700 hover:bg-rose-800 text-white border-rose-900 cursor-pointer shadow-xs'
                    : 'bg-[#103d29] text-[#78a990] border-[#196343] cursor-not-allowed opacity-60'
                }`}
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop & Save Form Time</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-3 rounded-xs bg-[#103d29] hover:bg-[#196343] text-[#d6e8de] text-sm font-heading uppercase tracking-wider font-bold flex items-center gap-1.5 border border-[#196343] transition-colors"
                title="Reset timer to 00:00"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Manual Time Entry */}
          <div className="bg-[#faf9f5] dark:bg-[#0e1411] p-4 rounded-xs border-2 border-stone-300 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="block font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider">
                ALTERNATIVE: ENTER STOPWATCH TIME MANUALLY
              </label>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-sans">
                If teacher timed using a whistle or physical stopwatch, input seconds directly.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="600"
                value={manualSeconds}
                onChange={(e) => setManualSeconds(e.target.value)}
                placeholder="e.g. 65"
                className="w-28 px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-sm font-mono font-bold text-stone-900 dark:text-stone-100 bg-white dark:bg-[#141c18] focus:border-[#144e34]"
              />
              <span className="text-xs font-mono font-bold text-stone-600 dark:text-stone-300">SEC</span>
              <button
                type="button"
                onClick={handleManualSave}
                className="px-4 py-2 bg-[#144e34] hover:bg-[#0d3221] text-white text-xs font-heading uppercase tracking-wider font-bold rounded-xs transition-colors border border-emerald-400/40"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Result Display */}
      {savedData && evaluatedInterpretation && (
        <div className="space-y-4">
          <TestResultView
            testName="Forearm Prone Plank Test"
            resultValue={savedData.timeSeconds}
            unit="seconds"
            subDetails={`Formatted Time: ${formatMMSS(
              savedData.timeSeconds
            )} · Form Break Auto-Saved: ${savedData.stoppedDueToForm ? 'Yes' : 'No'}`}
            interpretation={evaluatedInterpretation}
            onRetest={handleReset}
          />

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onPrevTest}
              className="px-4 py-2.5 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-heading uppercase tracking-wider font-bold text-xs rounded-xs transition-colors border-2 border-stone-300 dark:border-stone-700"
            >
              &larr; Previous: 3-Min Step Test
            </button>
            <button
              type="button"
              onClick={onNextTest}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#144e34] hover:bg-[#0d3221] text-white font-heading uppercase tracking-wider font-bold text-xs rounded-xs transition-colors border border-emerald-400/40"
            >
              <span>Next Test: Push-Up Test</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
