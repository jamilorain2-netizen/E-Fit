import React, { useState } from 'react';
import {
  ChevronRight,
  Sparkles,
  ArrowRightLeft,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  StudentProfile,
  ZipperTestData,
  StandardRow,
  TeacherConfig,
  FormChecklistItem,
} from '../../types';
import { evaluateTestScore } from '../../utils/scoring';
import { TestVideoOrGuide } from '../TestVideoOrGuide';
import { TestResultView } from '../TestResultView';


interface ZipperTestProps {
  student: StudentProfile;
  standards: StandardRow[];
  teacherConfig: TeacherConfig;
  savedData?: ZipperTestData;
  onSaveData: (data: ZipperTestData) => void;
  onNextTest: () => void;
  onPrevTest: () => void;
}

const ZIPPER_FORM_CHECKLIST: FormChecklistItem[] = [
  {
    aspect: 'Upper Arm Positioning',
    correct: 'Upper elbow points straight toward ceiling; palm rests against back of neck.',
    incorrect: 'Upper elbow flared wide out to side or pushing head severely forward.',
  },
  {
    aspect: 'Lower Arm Reach',
    correct: 'Lower arm reaches up along spine with back of hand resting on back.',
    incorrect: 'Lower arm twisting or pulling on clothing to pull fingers closer.',
  },
  {
    aspect: 'Spine & Head Posture',
    correct: 'Spine erect, chest open, eyes looking forward at eye level.',
    incorrect: 'Hunching shoulders forward or tucking chin into chest to force reach.',
  },
  {
    aspect: 'Measurement Accuracy',
    correct: 'Ruler measures distance between middle fingertips: Overlap = (+), Gap = (-).',
    incorrect: 'Hooking fingers together or guessing without placing metric ruler.',
  },
];

export const ZipperTestComponent: React.FC<ZipperTestProps> = ({
  student,
  standards,
  teacherConfig,
  savedData,
  onSaveData,
  onNextTest,
  onPrevTest,
}) => {
  const [rightCm, setRightCm] = useState<number | string>(
    savedData?.rightCm !== undefined ? savedData.rightCm : ''
  );
  const [leftCm, setLeftCm] = useState<number | string>(
    savedData?.leftCm !== undefined ? savedData.leftCm : ''
  );
  const [convention, setConvention] = useState<'overlap_positive' | 'gap_positive'>(
    savedData?.convention || teacherConfig.zipperConvention || 'overlap_positive'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = () => {
    setErrorMsg(null);
    const rVal = typeof rightCm === 'number' ? rightCm : parseFloat(rightCm);
    const lVal = typeof leftCm === 'number' ? leftCm : parseFloat(leftCm);

    if (isNaN(rVal) || isNaN(lVal)) {
      setErrorMsg('Please record measurement values in cm for both Right and Left arm.');
      return;
    }

    if (rVal < -50 || rVal > 50 || lVal < -50 || lVal > 50) {
      setErrorMsg('Values must be between -50 cm and +50 cm.');
      return;
    }

    const payload: ZipperTestData = {
      rightCm: rVal,
      leftCm: lVal,
      convention,
      date: new Date().toISOString().split('T')[0],
    };

    onSaveData(payload);
  };

  const evaluatedRight =
    savedData?.rightCm !== undefined
      ? evaluateTestScore(
          standards,
          'zipper_right',
          savedData.rightCm,
          student.sex,
          student.age
        )
      : null;

  const evaluatedLeft =
    savedData?.leftCm !== undefined
      ? evaluateTestScore(
          standards,
          'zipper_left',
          savedData.leftCm,
          student.sex,
          student.age
        )
      : null;

  const videoConfig = teacherConfig.videoConfigs.zipper;

  return (
    <div className="space-y-6">

      {/* Video Demonstration / Written Guide / Form Checklist */}
      <TestVideoOrGuide
        testKey="zipper"
        title="Zipper Test (Shoulder Flexibility)"
        videoUrl={videoConfig?.url}
        videoCredit={videoConfig?.credit}
        whatItIs="A test of shoulder and upper arm flexibility measuring how closely or far apart your fingertips can reach behind your back."
        whyItMatters="Shoulder mobility helps in throwing, volleyball serves, swimming, carrying backpacks comfortably without slouching, and daily functional movements."
        equipment={['Centimeter ruler or measuring tape', 'Partner or teacher assistant']}
        steps={[
          'Stand tall with feet shoulder-width apart.',
          'Right Arm Over: Raise your right arm straight up, bend at the elbow, and reach down across your back behind your neck with fingers extended and palm facing inward.',
          'Bring your left arm down and around behind your back, elbow bent, reaching upward with back of hand resting against your spine.',
          'Attempt to touch or overlap the middle fingers of both hands.',
          'A partner or teacher places a ruler to measure the distance in centimeters: Overlap is POSITIVE (+cm), Gap between fingertips is NEGATIVE (-cm), touching is ZERO (0 cm).',
          'Repeat the procedure reversing the arms: Left arm over, right arm under.',
        ]}
        tips={[
          'Do not yank or jerk arms to force fingers together.',
          'Keep your head upright; do not tuck chin onto chest.',
        ]}
        formChecklist={ZIPPER_FORM_CHECKLIST}
      />

      {/* Main Zipper Test Panel */}
      {/* Main Interactive Zipper Test Panel */}
      <div className="bg-[#ffffff] dark:bg-[#141c18] rounded-xs border-2 border-[#144e34] dark:border-[#227e56] shadow-xs overflow-hidden space-y-6">
        <div className="bg-[#103d29] dark:bg-[#082115] text-white px-6 py-4 border-b-2 border-[#196343] dark:border-[#1e4832] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading uppercase text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-2">
              <ArrowRightLeft className="w-6 h-6 text-teal-400" />
              <span>ZIPPER TEST (SHOULDER MOBILITY)</span>
            </h2>
          </div>

          <div className="text-xs bg-[#082115] px-3 py-1.5 rounded-xs border border-[#196343] font-mono text-[#a0cbb5]">
            <span>LEARNER:</span> <strong className="text-white">{student.fullName}</strong> ({student.gradeLevel})
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6 pt-0">
          {/* Overlap vs. Gap Convention Explainer Callout */}
          <div className="bg-[#f6f5ef] dark:bg-[#1a2520] border-2 border-stone-300 dark:border-stone-800 rounded-xs p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-stone-200 dark:border-stone-800 pb-2">
              <span className="font-heading uppercase tracking-wide font-extrabold flex items-center gap-1.5 text-sm text-stone-900 dark:text-stone-100">
                <Info className="w-4 h-4 text-[#d95f02]" />
                <span>MEASUREMENT CONVENTION GUIDE</span>
              </span>

              {/* Convention Toggle */}
              <div className="flex items-center gap-2 bg-white dark:bg-[#0e1411] px-3 py-1 rounded-xs border-2 border-stone-300 dark:border-stone-700">
                <span className="text-[11px] font-mono font-bold text-stone-600 dark:text-stone-300">RULE:</span>
                <button
                  type="button"
                  onClick={() =>
                    setConvention(
                      convention === 'overlap_positive' ? 'gap_positive' : 'overlap_positive'
                    )
                  }
                  className="text-xs font-mono font-bold text-[#d95f02] hover:underline"
                >
                  {convention === 'overlap_positive' ? 'STANDARD (+ OVERLAP, - GAP)' : 'INVERTED (+ GAP)'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-white dark:bg-[#0e1411] p-3 rounded-xs border-2 border-stone-300 dark:border-stone-800">
                <span className="font-heading uppercase font-extrabold text-[#144e34] dark:text-[#4cb988] text-base block">+ OVERLAP (CM)</span>
                <span className="text-[11px] text-stone-600 dark:text-stone-400 font-sans">Fingers cross over each other (e.g. +3.5 cm)</span>
              </div>
              <div className="bg-white dark:bg-[#0e1411] p-3 rounded-xs border-2 border-stone-300 dark:border-stone-800">
                <span className="font-heading uppercase font-extrabold text-stone-900 dark:text-white text-base block">0 CM (TOUCHING)</span>
                <span className="text-[11px] text-stone-600 dark:text-stone-400 font-sans">Fingertips exactly meet tip-to-tip</span>
              </div>
              <div className="bg-white dark:bg-[#0e1411] p-3 rounded-xs border-2 border-stone-300 dark:border-stone-800">
                <span className="font-heading uppercase font-extrabold text-amber-700 dark:text-amber-400 text-base block">- GAP (CM)</span>
                <span className="text-[11px] text-stone-600 dark:text-stone-400 font-sans">Distance separating fingertips (e.g. -2.0 cm)</span>
              </div>
            </div>
          </div>

          {/* Right & Left Arm Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Right Arm Over */}
            <div className="p-5 rounded-xs border-2 border-stone-300 dark:border-stone-800 bg-[#faf9f5] dark:bg-[#0e1411] space-y-3">
              <div className="flex items-center justify-between border-b-2 border-stone-200 dark:border-stone-800 pb-2">
                <span className="font-heading uppercase text-sm font-bold text-stone-900 dark:text-stone-100 tracking-wide">
                  1. RIGHT ARM OVER (LEFT UNDER)
                </span>
                <span className="text-[10px] font-mono font-bold uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded-xs border border-emerald-300 dark:border-emerald-700">
                  RIGHT SHOULDER
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 font-sans">
                Right elbow raised over shoulder, reaching downward along spine.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="-50"
                  max="50"
                  value={rightCm}
                  onChange={(e) => setRightCm(e.target.value)}
                  placeholder="+2 or -3"
                  className="w-full px-3.5 py-2.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-base font-scoreboard text-stone-900 dark:text-stone-100 bg-white dark:bg-[#141c18] focus:border-[#144e34]"
                />
                <span className="font-mono text-xs font-bold text-stone-600 dark:text-stone-300">CM</span>
              </div>
              <div className="flex gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => setRightCm((prev) => (typeof prev === 'number' ? prev + 1 : 1))}
                  className="px-2.5 py-1 text-xs bg-white dark:bg-[#141c18] border-2 border-stone-300 dark:border-stone-700 rounded-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                >
                  +1 cm
                </button>
                <button
                  type="button"
                  onClick={() => setRightCm(0)}
                  className="px-2.5 py-1 text-xs bg-white dark:bg-[#141c18] border-2 border-stone-300 dark:border-stone-700 rounded-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                >
                  0 cm (Touch)
                </button>
                <button
                  type="button"
                  onClick={() => setRightCm((prev) => (typeof prev === 'number' ? prev - 1 : -1))}
                  className="px-2.5 py-1 text-xs bg-white dark:bg-[#141c18] border-2 border-stone-300 dark:border-stone-700 rounded-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                >
                  -1 cm
                </button>
              </div>
            </div>

            {/* Left Arm Over */}
            <div className="p-5 rounded-xs border-2 border-stone-300 dark:border-stone-800 bg-[#faf9f5] dark:bg-[#0e1411] space-y-3">
              <div className="flex items-center justify-between border-b-2 border-stone-200 dark:border-stone-800 pb-2">
                <span className="font-heading uppercase text-sm font-bold text-stone-900 dark:text-stone-100 tracking-wide">
                  2. LEFT ARM OVER (RIGHT UNDER)
                </span>
                <span className="text-[10px] font-mono font-bold uppercase bg-teal-100 dark:bg-teal-950/80 text-teal-900 dark:text-teal-200 px-2 py-0.5 rounded-xs border border-teal-300 dark:border-teal-700">
                  LEFT SHOULDER
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 font-sans">
                Left elbow raised over shoulder, reaching downward along spine.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="-50"
                  max="50"
                  value={leftCm}
                  onChange={(e) => setLeftCm(e.target.value)}
                  placeholder="+1 or -2.5"
                  className="w-full px-3.5 py-2.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-base font-scoreboard text-stone-900 dark:text-stone-100 bg-white dark:bg-[#141c18] focus:border-[#144e34]"
                />
                <span className="font-mono text-xs font-bold text-stone-600 dark:text-stone-300">CM</span>
              </div>
              <div className="flex gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => setLeftCm((prev) => (typeof prev === 'number' ? prev + 1 : 1))}
                  className="px-2.5 py-1 text-xs bg-white dark:bg-[#141c18] border-2 border-stone-300 dark:border-stone-700 rounded-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                >
                  +1 cm
                </button>
                <button
                  type="button"
                  onClick={() => setLeftCm(0)}
                  className="px-2.5 py-1 text-xs bg-white dark:bg-[#141c18] border-2 border-stone-300 dark:border-stone-700 rounded-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                >
                  0 cm (Touch)
                </button>
                <button
                  type="button"
                  onClick={() => setLeftCm((prev) => (typeof prev === 'number' ? prev - 1 : -1))}
                  className="px-2.5 py-1 text-xs bg-white dark:bg-[#141c18] border-2 border-stone-300 dark:border-stone-700 rounded-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                >
                  -1 cm
                </button>
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
              Save Zipper Measurements
            </button>
          </div>
        </div>
      </div>

      {/* Result Display for Both Sides */}
      {savedData && evaluatedRight && evaluatedLeft && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TestResultView
              testName="Zipper Test (Right Arm Over)"
              resultValue={savedData.rightCm > 0 ? `+${savedData.rightCm}` : savedData.rightCm}
              unit="cm"
              subDetails="Right arm reached from above"
              interpretation={evaluatedRight}
              onRetest={() => setRightCm('')}
            />
            <TestResultView
              testName="Zipper Test (Left Arm Over)"
              resultValue={savedData.leftCm > 0 ? `+${savedData.leftCm}` : savedData.leftCm}
              unit="cm"
              subDetails="Left arm reached from above"
              interpretation={evaluatedLeft}
              onRetest={() => setLeftCm('')}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onPrevTest}
              className="px-4 py-2.5 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-heading uppercase tracking-wider font-bold text-xs rounded-xs transition-colors border-2 border-stone-300 dark:border-stone-700"
            >
              &larr; Previous: Push-Up Test
            </button>
            <button
              type="button"
              onClick={onNextTest}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#144e34] hover:bg-[#0d3221] text-white font-heading uppercase tracking-wider font-bold text-xs rounded-xs transition-colors border border-emerald-400/40"
            >
              <span>Next Test: Sit-and-Reach</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
