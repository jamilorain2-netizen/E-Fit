import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Plus,
  Minus,
  Sparkles,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import {
  StudentProfile,
  PushUpTestData,
  StandardRow,
  TeacherConfig,
  FormChecklistItem,
} from '../../types';
import { evaluateTestScore } from '../../utils/scoring';
import { TestVideoOrGuide } from '../TestVideoOrGuide';
import { TestResultView } from '../TestResultView';


interface PushUpTestProps {
  student: StudentProfile;
  standards: StandardRow[];
  teacherConfig: TeacherConfig;
  savedData?: PushUpTestData;
  onSaveData: (data: PushUpTestData) => void;
  onNextTest: () => void;
  onPrevTest: () => void;
}

const PUSH_UP_FORM_CHECKLIST: FormChecklistItem[] = [
  {
    aspect: 'Elbow Depth (90°)',
    correct: 'Elbows flex to full 90 degrees; upper arms become parallel to floor.',
    incorrect: 'Shallow dips (only bending 20°–45°) or only nodding head toward floor.',
  },
  {
    aspect: 'Body Plank Line',
    correct: 'Back remains flat and rigid throughout descent and ascent.',
    incorrect: 'Hips dipping low toward floor or buttocks sticking up in the air.',
  },
  {
    aspect: 'Cadence & Pausing',
    correct: 'Continuous rhythm without resting on the floor.',
    incorrect: 'Resting stomach on mat for more than 2 seconds between reps.',
  },
  {
    aspect: 'Hand Placement',
    correct: 'Hands placed shoulder-width apart, fingers pointing straight forward.',
    incorrect: 'Hands placed excessively wide or turned completely inward/outward.',
  },
];

export const PushUpTestComponent: React.FC<PushUpTestProps> = ({
  student,
  standards,
  teacherConfig,
  savedData,
  onSaveData,
  onNextTest,
  onPrevTest,
}) => {
  const [count, setCount] = useState<number | string>(
    savedData?.count !== undefined ? savedData.count : ''
  );
  const [variation, setVariation] = useState<string>(
    savedData?.variation || teacherConfig.pushUpVariations[0] || 'Standard 90-Degree Push-Up (Full plank)'
  );
  const [teacherVerified, setTeacherVerified] = useState(
    savedData?.teacherVerified || false
  );
  const [verifierName, setVerifierName] = useState(
    savedData?.verifierName || student.teacherName || ''
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAdjustCount = (delta: number) => {
    setValidationError(null);
    const cur = typeof count === 'number' ? count : parseInt(count, 10) || 0;
    const next = Math.max(0, cur + delta);
    setCount(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    const raw = e.target.value;
    if (raw === '') {
      setCount('');
      return;
    }
    // Strict whole number rejection of decimals or negatives
    if (raw.includes('.') || raw.includes('-') || raw.includes(',')) {
      setValidationError('Push-up count must be a positive whole number (no decimals or negatives allowed).');
      return;
    }
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed) || parsed < 0) {
      setValidationError('Please enter a valid non-negative whole number.');
      return;
    }
    if (parsed > 150) {
      setValidationError('Please enter a realistic count (maximum 150 repetitions).');
      return;
    }
    setCount(parsed);
  };

  const handleSave = () => {
    setValidationError(null);
    const num = typeof count === 'number' ? count : parseInt(count, 10);

    if (count === '' || isNaN(num) || num < 0) {
      setValidationError('Please record the completed push-up repetitions (0 or higher).');
      return;
    }

    if (num % 1 !== 0) {
      setValidationError('Decimal values are not allowed. Only complete whole-repetition push-ups are counted.');
      return;
    }

    const payload: PushUpTestData = {
      count: num,
      variation,
      teacherVerified,
      verifierName: teacherVerified ? verifierName : undefined,
      date: new Date().toISOString().split('T')[0],
    };

    onSaveData(payload);
  };

  const evaluatedInterpretation =
    savedData?.count !== undefined
      ? evaluateTestScore(
          standards,
          'push_up',
          savedData.count,
          student.sex,
          student.age
        )
      : null;

  const videoConfig = teacherConfig.videoConfigs.push_up;

  return (
    <div className="space-y-6">

      {/* Video Demonstration / Written Guide / Form Checklist */}
      <TestVideoOrGuide
        testKey="push_up"
        title="90-Degree Push-Up Test"
        videoUrl={videoConfig?.url}
        videoCredit={videoConfig?.credit}
        whatItIs="A test of upper body muscular strength and endurance measuring how many continuous repetitions of 90-degree push-ups the student can execute with strict form."
        whyItMatters="Upper body pushing strength helps in volleyball spikes, basketball passes, gymnastics routines, lifting school materials safely, and building upper body bone density."
        equipment={[
          'Exercise mat or flat clean floor',
          'Foam block or 90-degree elbow guide (optional)',
          'Cadence audio or partner counter',
        ]}
        steps={[
          'Start in a prone push-up position: hands shoulder-width apart, fingers pointed forward, legs straight, toes tucked under.',
          'Lower body smoothly until elbows reach an exact 90-degree angle (upper arms parallel to the floor).',
          'Push back up into the starting plank without locking elbows harshly.',
          'Keep neck neutral and back flat without letting the hips dip or sway.',
          'Perform repetitions continuously without resting on the floor.',
          'Stop counting when the student rests for more than 2 seconds, cannot achieve 90 degrees twice, or form fails completely.',
        ]}
        tips={[
          'Only repetitions reaching a full 90-degree elbow bend count toward the official score.',
          'Use the configured modified variation (knees on mat) if student is rehabilitating an injury or starting upper body development.',
        ]}
        formChecklist={PUSH_UP_FORM_CHECKLIST}
      />

      {/* Main Push-Up Test Input Panel */}
      <div className="bg-[#ffffff] dark:bg-[#141c18] rounded-xs border-2 border-[#144e34] dark:border-[#227e56] shadow-xs overflow-hidden space-y-6">
        <div className="bg-[#103d29] dark:bg-[#082115] text-white px-6 py-4 border-b-2 border-[#196343] dark:border-[#1e4832] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading uppercase text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <span>PUSH-UP TEST (90-DEGREE REPETITIONS)</span>
            </h2>
          </div>

          <div className="text-xs bg-[#082115] px-3 py-1.5 rounded-xs border border-[#196343] font-mono text-[#a0cbb5]">
            <span>LEARNER:</span> <strong className="text-white">{student.fullName}</strong> ({student.gradeLevel})
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6 pt-0">
          {/* Configurable Variation Selector */}
          <div className="bg-[#faf9f5] dark:bg-[#0e1411] p-4 rounded-xs border-2 border-stone-300 dark:border-stone-800 space-y-2">
            <label className="block font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider">
              TEST PROTOCOL VARIATION
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {teacherConfig.pushUpVariations.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVariation(v)}
                  className={`p-3 rounded-xs border-2 text-xs text-left font-heading uppercase tracking-wide transition-all ${
                    variation === v
                      ? 'border-[#144e34] dark:border-emerald-500 bg-[#144e34] text-white font-extrabold shadow-xs'
                      : 'border-stone-300 dark:border-stone-800 bg-white dark:bg-[#141c18] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <span>{v}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Counter Stepper & Direct Keypad Input - Scoreboard Box */}
          <div className="bg-[#082115] dark:bg-[#05110b] text-white rounded-xs p-6 sm:p-8 flex flex-col items-center justify-center text-center border-4 border-[#144e34] dark:border-[#1e4832] shadow-xs">
            <span className="font-mono text-xs uppercase tracking-widest text-[#a0cbb5] mb-1">
              COMPLETED 90° REPETITIONS (WHOLE REPS)
            </span>

            <div className="flex items-center justify-center gap-4 my-4">
              <button
                type="button"
                onClick={() => handleAdjustCount(-1)}
                className="w-12 h-12 rounded-xs bg-[#103d29] hover:bg-[#196343] active:bg-[#0d3221] flex items-center justify-center text-white border border-[#196343] transition-colors"
                aria-label="Decrease by 1"
              >
                <Minus className="w-6 h-6" />
              </button>

              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={count}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-40 text-center font-scoreboard text-6xl sm:text-8xl tracking-tight bg-transparent text-white border-b-4 border-amber-500 focus:outline-hidden focus:border-amber-400"
                />
                <span className="block font-mono uppercase text-xs text-[#a0cbb5] mt-1 font-bold">REPETITIONS</span>
              </div>

              <button
                type="button"
                onClick={() => handleAdjustCount(1)}
                className="w-12 h-12 rounded-xs bg-[#d95f02] hover:bg-[#b84f00] active:bg-[#923f00] flex items-center justify-center text-white border border-amber-900 transition-colors"
                aria-label="Increase by 1"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Add Steppers */}
            <div className="flex items-center gap-2 mt-2">
              {[1, 5, 10].map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => handleAdjustCount(step)}
                  className="px-3.5 py-1.5 bg-[#103d29] hover:bg-[#196343] text-white text-xs font-mono font-bold rounded-xs border border-[#196343] transition-colors"
                >
                  +{step}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCount(0)}
                className="px-3.5 py-1.5 bg-[#103d29] hover:bg-rose-950/80 text-stone-300 hover:text-rose-200 text-xs font-mono font-bold rounded-xs border border-[#196343] ml-2 transition-colors"
              >
                CLEAR (0)
              </button>
            </div>

            {validationError && (
              <div className="mt-4 p-2.5 bg-rose-950/80 border-2 border-rose-500 text-rose-200 rounded-xs text-xs flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* Teacher / Partner Verification Box */}
          <div className="bg-[#faf9f5] dark:bg-[#0e1411] p-4 rounded-xs border-2 border-stone-300 dark:border-stone-800 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={teacherVerified}
                onChange={(e) => setTeacherVerified(e.target.checked)}
                className="w-4 h-4 text-[#144e34] rounded-xs border-stone-400 focus:ring-amber-500"
              />
              <span className="font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 tracking-wide">
                <UserCheck className="w-4 h-4 text-[#144e34] dark:text-[#4cb988]" />
                <span>OFFICIAL TEACHER OR PEER PARTNER VERIFIED</span>
              </span>
            </label>

            {teacherVerified && (
              <div className="pl-6.5">
                <label className="block font-mono text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Verifier Name / Teacher Signature Reference
                </label>
                <input
                  type="text"
                  value={verifierName}
                  onChange={(e) => setVerifierName(e.target.value)}
                  placeholder="e.g. Coach Cruz / Partner: Juan D."
                  className="w-full max-w-sm px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-[#141c18] text-xs text-stone-900 dark:text-stone-100 focus:border-[#144e34]"
                />
              </div>
            )}
          </div>

          {/* Save Result Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-[#d95f02] hover:bg-[#b84f00] text-white font-heading uppercase tracking-wider font-bold text-xs rounded-xs transition-colors border border-amber-900 shadow-xs"
            >
              Save Push-Up Count
            </button>
          </div>
        </div>
      </div>

      {/* Result Display */}
      {savedData && evaluatedInterpretation && (
        <div className="space-y-4">
          <TestResultView
            testName="Push-Up Test"
            resultValue={savedData.count}
            unit="repetitions"
            subDetails={`Variation: ${savedData.variation} · Teacher Verified: ${
              savedData.teacherVerified ? `Yes (${savedData.verifierName || 'Verified'})` : 'Self-Reported'
            }`}
            interpretation={evaluatedInterpretation}
            onRetest={() => setCount('')}
          />

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onPrevTest}
              className="px-4 py-2.5 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-heading uppercase tracking-wider font-bold text-xs rounded-xs transition-colors border-2 border-stone-300 dark:border-stone-700"
            >
              &larr; Previous: Basic Plank
            </button>
            <button
              type="button"
              onClick={onNextTest}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#144e34] hover:bg-[#0d3221] text-white font-heading uppercase tracking-wider font-bold text-xs rounded-xs transition-colors border border-emerald-400/40"
            >
              <span>Next Test: Zipper Test</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
