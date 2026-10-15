import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Heart,
  Timer,
  CheckCircle2,
  ChevronRight,
  Info,
  Footprints,
} from 'lucide-react';
import {
  StudentProfile,
  StepTestData,
  StandardRow,
  TeacherConfig,
  FormChecklistItem,
} from '../../types';
import { playBeatSound, playCompletionChime } from '../../utils/audio';
import { evaluateTestScore } from '../../utils/scoring';
import { EmergencyStopBanner } from '../EmergencyStopBanner';
import { TestVideoOrGuide } from '../TestVideoOrGuide';
import { TestResultView } from '../TestResultView';


interface StepTestProps {
  student: StudentProfile;
  standards: StandardRow[];
  teacherConfig: TeacherConfig;
  savedData?: StepTestData;
  onSaveData: (data: StepTestData) => void;
  onNextTest: () => void;
}

const STEP_SEQUENCE = [
  { label: 'Step UP (Right)', color: 'bg-emerald-600 text-white', beat: 1 },
  { label: 'Step UP (Left)', color: 'bg-emerald-500 text-white', beat: 2 },
  { label: 'Step DOWN (Right)', color: 'bg-slate-600 text-white', beat: 3 },
  { label: 'Step DOWN (Left)', color: 'bg-slate-500 text-white', beat: 4 },
];

const STEP_FORM_CHECKLIST: FormChecklistItem[] = [
  {
    aspect: 'Knee Extension',
    correct: 'Legs straighten fully at the top of the step bench on each cycle.',
    incorrect: 'Keeping knees bent or crouched upon stepping onto the platform.',
  },
  {
    aspect: 'Torso Alignment',
    correct: 'Chest held high, shoulders back, eyes looking straight forward.',
    incorrect: 'Slouching forward, resting hands on knees, or holding wall/table.',
  },
  {
    aspect: 'Cadence Rhythm',
    correct: 'Stepping in sync with the 4-beat audio metronome (Up-Up-Down-Down).',
    incorrect: 'Rushing ahead or lagging behind cadence by more than 3 beats.',
  },
  {
    aspect: 'Recovery Heart Rate',
    correct: 'Sit down immediately at the 3:00 chime and count pulse for configured interval.',
    incorrect: 'Walking around, talking, or drinking iced drinks before pulse is recorded.',
  },
];

export const StepTestComponent: React.FC<StepTestProps> = ({
  student,
  standards,
  teacherConfig,
  savedData,
  onSaveData,
  onNextTest,
}) => {
  // Inputs
  const [restingHr, setRestingHr] = useState<number | string>(
    savedData?.restingHr || ''
  );
  const [recoveryHr, setRecoveryHr] = useState<number | string>(
    savedData?.recoveryHr || ''
  );

  // Recovery interval in seconds (configurable in teacher settings, default 60s)
  const recoveryIntervalSeconds = teacherConfig.stepRecoveryIntervalSeconds || 60;

  // Timer states (180s = 3 minutes)
  const TOTAL_TEST_SECONDS = 180;
  const [timeLeft, setTimeLeft] = useState(savedData ? 0 : TOTAL_TEST_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Recovery countdown helper
  const [recoveryTimer, setRecoveryTimer] = useState(recoveryIntervalSeconds);
  const [isRecoveryCounting, setIsRecoveryCounting] = useState(false);

  // Cadence config (default 96 bpm)
  const cadenceBpm = teacherConfig.stepTestCadence || 96;
  const beatIntervalMs = (60 / cadenceBpm) * 1000;

  const timerRef = useRef<number | null>(null);
  const beatRef = useRef<number | null>(null);

  // Stop test handler
  const handleStopTest = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (beatRef.current) clearInterval(beatRef.current);
  };

  // Metronome beat interval
  useEffect(() => {
    if (isRunning) {
      beatRef.current = window.setInterval(() => {
        setCurrentBeatIndex((prev) => {
          const next = (prev + 1) % 4;
          playBeatSound(next, isMuted);
          return next;
        });
      }, beatIntervalMs);
    } else {
      if (beatRef.current) clearInterval(beatRef.current);
    }
    return () => {
      if (beatRef.current) clearInterval(beatRef.current);
    };
  }, [isRunning, beatIntervalMs, isMuted]);

  // Main 3-minute timer interval
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playCompletionChime();
            setIsRecoveryCounting(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Recovery pulse countdown timer
  useEffect(() => {
    let recTimer: number | null = null;
    if (isRecoveryCounting && recoveryTimer > 0) {
      recTimer = window.setInterval(() => {
        setRecoveryTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (recTimer) clearInterval(recTimer);
    };
  }, [isRecoveryCounting, recoveryTimer]);

  const handleStartTimer = () => {
    if (typeof restingHr === 'string' && restingHr === '') {
      alert('Please enter the student’s Resting Heart Rate (bpm) before starting the test.');
      return;
    }
    setIsRunning(true);
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
  };

  const handleResetTimer = () => {
    handleStopTest();
    setTimeLeft(TOTAL_TEST_SECONDS);
    setCurrentBeatIndex(0);
    setRecoveryTimer(recoveryIntervalSeconds);
    setIsRecoveryCounting(false);
  };

  // Format mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Submit/Save results
  const handleSaveResult = () => {
    const restNum = typeof restingHr === 'number' ? restingHr : parseFloat(restingHr);
    const recNum = typeof recoveryHr === 'number' ? recoveryHr : parseFloat(recoveryHr);

    if (isNaN(restNum) || restNum < 40 || restNum > 160) {
      alert('Please enter a valid Resting Heart Rate (between 40 and 160 bpm).');
      return;
    }

    if (isNaN(recNum) || recNum < 40 || recNum > 220) {
      alert('Please enter a valid Recovery Heart Rate (between 40 and 220 bpm).');
      return;
    }

    const payload: StepTestData = {
      restingHr: restNum,
      recoveryHr: recNum,
      durationSeconds: TOTAL_TEST_SECONDS - timeLeft,
      cadenceBpm,
      recoveryIntervalSeconds,
      completed: timeLeft === 0,
      difference: recNum - restNum,
      date: new Date().toISOString().split('T')[0],
    };

    onSaveData(payload);
  };

  const evaluatedInterpretation =
    savedData?.recoveryHr !== undefined
      ? evaluateTestScore(
          standards,
          'step_test',
          savedData.recoveryHr,
          student.sex,
          student.age
        )
      : null;

  const videoConfig = teacherConfig.videoConfigs.step_test;

  return (
    <div className="space-y-6">

      {/* Video Demonstration / Written Guide / Form Checklist */}
      <TestVideoOrGuide
        testKey="step_test"
        title="3-Minute Step Test"
        videoUrl={videoConfig?.url}
        videoCredit={videoConfig?.credit}
        whatItIs="A standardized cardiovascular endurance test measuring how efficiently your heart and lungs deliver oxygen during sustained rhythmic stepping and how quickly your heart returns to resting rhythm."
        whyItMatters="Cardiovascular endurance supports running, PE sports, active play, stamina during school days, and lifelong cardiovascular health."
        equipment={[
          '12-inch sturdy step bench or bleacher step',
          'Metronome (96 beats/min)',
          'Stopwatch / timer',
          'Heart rate monitor or pulse counter',
        ]}
        steps={[
          'Measure and record resting heart rate after 5 minutes of seated rest.',
          'Stand facing the step bench.',
          'On "Go", step up with the right foot, up with the left foot, down with the right foot, and down with the left foot.',
          'Maintain a steady 4-beat cadence (96 bpm = 24 step cycles per minute) for 3 full minutes.',
          'Immediately upon completion, sit down quietly on the bench.',
          `Take pulse for ${recoveryIntervalSeconds} seconds to record post-exercise Recovery Heart Rate.`,
        ]}
        tips={[
          'Straighten knees completely when stepping onto the bench.',
          'Do not hold onto railings or lean hands on knees.',
          'Stop immediately if feeling lightheaded, dizzy, or breathless.',
        ]}
        formChecklist={STEP_FORM_CHECKLIST}
      />

      {/* Safety Notice during test */}
      <EmergencyStopBanner isTestActive={isRunning} onStopTest={handleStopTest} />

      {/* Interactive Test Panel */}
      <div className="bg-[#ffffff] dark:bg-[#141c18] rounded-xs border-2 border-[#144e34] dark:border-[#227e56] shadow-xs overflow-hidden space-y-6">
        <div className="bg-[#103d29] dark:bg-[#082115] text-white px-6 py-4 border-b-2 border-[#196343] dark:border-[#1e4832] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading uppercase text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-400" />
              <span>3-MINUTE STEP TEST</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs bg-[#082115] px-3 py-1.5 rounded-xs border border-[#196343] font-mono text-[#a0cbb5]">
            <span>TARGET CADENCE:</span>
            <strong className="text-white font-bold">{cadenceBpm} BPM</strong>
            <span className="text-[#78a990]">· 24 cycles/min</span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6 pt-0">
          {/* Resting Heart Rate Input (Pre-test) */}
          <div className="bg-[#faf9f5] dark:bg-[#0e1411] p-4 rounded-xs border-2 border-stone-300 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="block font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider">
                STEP 1: BASELINE RESTING HEART RATE (BPM)
              </label>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-sans">
                Take pulse while seated quietly for 5 minutes prior to stepping.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="40"
                max="160"
                value={restingHr}
                onChange={(e) => setRestingHr(e.target.value)}
                placeholder="e.g. 74"
                className="w-28 px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-sm font-mono font-bold text-stone-900 dark:text-stone-100 bg-white dark:bg-[#141c18] focus:border-[#144e34]"
              />
              <span className="text-xs font-mono font-bold text-stone-600 dark:text-stone-300">BPM</span>
            </div>
          </div>

          {/* Metronome & 3:00 Timer Card - Scoreboard Display */}
          <div className="bg-[#082115] dark:bg-[#05110b] text-white rounded-xs p-6 sm:p-8 flex flex-col items-center justify-center text-center border-4 border-[#144e34] dark:border-[#1e4832] relative overflow-hidden">
            {/* Audio Mute button */}
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="absolute top-4 right-4 p-2 rounded-xs bg-[#103d29] text-[#d6e8de] hover:text-white hover:bg-[#196343] transition-colors text-xs flex items-center gap-1.5 border border-[#196343]"
              title="Toggle metronome audio"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span className="hidden sm:inline font-mono">{isMuted ? 'MUTED' : 'AUDIO ON'}</span>
            </button>

            <span className="font-mono text-xs uppercase tracking-widest text-[#a0cbb5] mb-1 flex items-center gap-1.5">
              <Timer className="w-4 h-4" />
              <span>STEP COUNTDOWN TIMER</span>
            </span>

            {/* Big Scoreboard Digital Timer */}
            <div className="font-scoreboard text-6xl sm:text-8xl tracking-tight text-white my-3">
              {formatTime(timeLeft)}
            </div>

            {/* Visual 4-Step Metronome Cue */}
            <div className="w-full max-w-md my-4">
              <div className="grid grid-cols-4 gap-2">
                {STEP_SEQUENCE.map((item, idx) => {
                  const isActive = isRunning && currentBeatIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={`py-3 px-1 rounded-xs text-center text-xs font-heading uppercase tracking-wider font-bold transition-all duration-75 border-2 ${
                        isActive
                          ? 'bg-[#d95f02] text-white border-amber-300 shadow-md scale-105'
                          : 'bg-[#103d29] text-[#78a990] border-[#196343]'
                      }`}
                    >
                      <div className="text-[10px] font-mono opacity-80">BEAT {item.beat}</div>
                      <div className="leading-tight mt-0.5">{item.label}</div>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-[#a0cbb5] mt-2.5 flex items-center justify-center gap-1.5 font-mono">
                <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                <span>Stepping sequence: Up (R), Up (L), Down (R), Down (L)</span>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-3 mt-4">
              {!isRunning ? (
                <button
                  type="button"
                  onClick={handleStartTimer}
                  className="px-6 py-3 rounded-xs bg-[#d95f02] hover:bg-[#b84f00] text-white font-heading uppercase tracking-wider font-extrabold text-sm flex items-center gap-2 border border-amber-900 transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{timeLeft < TOTAL_TEST_SECONDS && timeLeft > 0 ? 'Resume Stepping' : 'Start 3-Min Test'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePauseTimer}
                  className="px-6 py-3 rounded-xs bg-amber-500 hover:bg-amber-600 text-stone-950 font-heading uppercase tracking-wider font-extrabold text-sm flex items-center gap-2"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResetTimer}
                className="px-4 py-3 rounded-xs bg-[#103d29] hover:bg-[#196343] text-[#d6e8de] text-sm font-heading uppercase tracking-wider font-bold flex items-center gap-1.5 border border-[#196343] transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Recovery Heart Rate Input Prompt */}
          <div className="bg-[#f6f5ef] dark:bg-[#1a2520] border-2 border-[#144e34] dark:border-[#227e56] rounded-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-heading uppercase text-xs sm:text-sm font-extrabold text-[#0d3221] dark:text-[#7fd2ad] tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#144e34] dark:text-[#4cb988]" />
                  <span>STEP 2: RECOVERY HEART RATE ({recoveryIntervalSeconds}s PROTOCOL)</span>
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 font-sans">
                  Sit down immediately upon test completion. Count pulse for {recoveryIntervalSeconds} seconds to record recovery BPM.
                </p>
              </div>

              {/* Recovery countdown timer helper */}
              <div className="shrink-0 flex items-center gap-2 bg-white dark:bg-[#141c18] px-3 py-1.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 font-bold">
                <span className="font-mono">PULSE TIMER:</span>
                <span className="font-scoreboard text-lg text-[#144e34] dark:text-[#4cb988]">{recoveryTimer}s</span>
                {!isRecoveryCounting && (
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryTimer(recoveryIntervalSeconds);
                      setIsRecoveryCounting(true);
                    }}
                    className="ml-1 text-[11px] underline text-[#d95f02] hover:text-[#b84f00] font-bold"
                  >
                    Start Count
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block font-heading uppercase font-bold text-xs tracking-wider text-stone-800 dark:text-stone-200 mb-1">
                  Recovery Heart Rate (bpm) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="40"
                    max="220"
                    value={recoveryHr}
                    onChange={(e) => setRecoveryHr(e.target.value)}
                    placeholder="e.g. 96"
                    className="w-full px-3.5 py-2.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-sm font-mono font-bold text-stone-900 dark:text-stone-100 bg-white dark:bg-[#141c18] focus:border-[#144e34]"
                  />
                  <span className="text-xs font-mono font-bold text-stone-600 dark:text-stone-300">BPM</span>
                </div>
              </div>

              {/* Calculated Heart Rate Difference */}
              <div className="bg-white dark:bg-[#141c18] rounded-xs p-3.5 border-2 border-stone-300 dark:border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                    RECOVERY DIFFERENCE
                  </span>
                  <span className="text-xs text-stone-600 dark:text-stone-300 font-mono">
                    Recovery ({recoveryHr || 0}) − Resting ({restingHr || 0})
                  </span>
                </div>
                <div className="font-scoreboard text-2xl text-[#0d3221] dark:text-[#4cb988]">
                  {typeof recoveryHr === 'number' && typeof restingHr === 'number'
                    ? `${recoveryHr - restingHr > 0 ? '+' : ''}${recoveryHr - restingHr} bpm`
                    : typeof recoveryHr === 'string' &&
                      recoveryHr !== '' &&
                      typeof restingHr === 'string' &&
                      restingHr !== ''
                    ? `${parseFloat(recoveryHr) - parseFloat(restingHr) > 0 ? '+' : ''}${
                        parseFloat(recoveryHr) - parseFloat(restingHr)
                      } bpm`
                    : '—'}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveResult}
                className="px-6 py-2.5 bg-[#d95f02] hover:bg-[#b84f00] text-white font-heading uppercase tracking-wider font-bold text-xs rounded-xs transition-colors border border-amber-900 shadow-xs"
              >
                Save Step Test Result
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Result & Interpretation Screen */}
      {savedData && evaluatedInterpretation && (
        <div className="space-y-4">
          <TestResultView
            testName="3-Minute Step Test"
            resultValue={savedData.recoveryHr}
            unit="BPM (Recovery)"
            subDetails={`Resting: ${savedData.restingHr} bpm · Change: ${
              savedData.difference > 0 ? '+' : ''
            }${savedData.difference} bpm · Duration: ${formatTime(
              savedData.durationSeconds
            )}`}
            interpretation={evaluatedInterpretation}
            onRetest={handleResetTimer}
          />

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onNextTest}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#144e34] hover:bg-[#0d3221] text-white font-heading uppercase tracking-wider font-bold text-xs rounded-xs transition-colors border border-emerald-400/30"
            >
              <span>Next Test: Basic Plank</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
