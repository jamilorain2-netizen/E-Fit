import React, { useState } from 'react';
import {
  Scale,
  HeartPulse,
  Info,
  AlertCircle,
  FileText,
  ShieldAlert,
  Apple,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import {
  StudentProfile,
  BmiData,
  StandardRow,
  TeacherConfig,
  FormChecklistItem,
} from '../../types';
import { evaluateTestScore } from '../../utils/scoring';
import { TestResultView } from '../TestResultView';


interface BmiComponentProps {
  student: StudentProfile;
  standards: StandardRow[];
  teacherConfig: TeacherConfig;
  savedData?: BmiData;
  onSaveData: (data: BmiData) => void;
  onGoToReport: () => void;
  onPrevTest: () => void;
}

const BMI_FORM_CHECKLIST: FormChecklistItem[] = [
  {
    aspect: 'Height Posture',
    correct: 'Bare feet, heels together, head in horizontal eye-ear plane, gentle inhalation.',
    incorrect: 'Wearing shoes, tilting chin up, or slouching heels away from stadiometer.',
  },
  {
    aspect: 'Weight Measurement',
    correct: 'Pockets emptied, heavy jackets removed, standing still at center of scale.',
    incorrect: 'Weighing with heavy backpack, holding onto desk, or leaning on wall.',
  },
  {
    aspect: 'Screening Distinction',
    correct: 'Interpreted as an educational screening ratio (kg/m²) compared to WHO teen references.',
    incorrect: 'Treating BMI as a direct measure of body fat, athletic strength, or medical health.',
  },
  {
    aspect: 'Nutritional Focus',
    correct: 'Focus on varied, colorful Philippine foods, daily hydration, and 8–10h sleep.',
    incorrect: 'Prescribing weight-loss diets, skipping meals, or restrictive eating.',
  },
];

export const BmiComponent: React.FC<BmiComponentProps> = ({
  student,
  standards,
  teacherConfig,
  savedData,
  onSaveData,
  onGoToReport,
  onPrevTest,
}) => {
  const [weightKg, setWeightKg] = useState<number | string>(
    savedData?.weightKg !== undefined ? savedData.weightKg : ''
  );
  const [heightCm, setHeightCm] = useState<number | string>(
    savedData?.heightCm !== undefined ? savedData.heightCm : ''
  );
  const [heightUnit, setHeightUnit] = useState<'cm' | 'm'>('cm');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calculate live BMI
  const parsedWeight =
    typeof weightKg === 'number' ? weightKg : parseFloat(weightKg);
  let parsedHeightCm =
    typeof heightCm === 'number' ? heightCm : parseFloat(heightCm);

  if (heightUnit === 'm' && !isNaN(parsedHeightCm)) {
    parsedHeightCm = parsedHeightCm * 100;
  }

  let liveBmi: number | null = null;
  if (
    !isNaN(parsedWeight) &&
    !isNaN(parsedHeightCm) &&
    parsedWeight > 0 &&
    parsedHeightCm > 0
  ) {
    const heightMeters = parsedHeightCm / 100;
    const calc = parsedWeight / (heightMeters * heightMeters);
    liveBmi = Math.round(calc * 10) / 10;
  }

  const handleSave = () => {
    setErrorMsg(null);
    if (isNaN(parsedWeight) || parsedWeight < 15 || parsedWeight > 220) {
      setErrorMsg('Please enter a valid weight between 15 kg and 220 kg.');
      return;
    }
    if (isNaN(parsedHeightCm) || parsedHeightCm < 80 || parsedHeightCm > 230) {
      setErrorMsg('Please enter a valid height between 80 cm and 230 cm (or 0.80 m - 2.30 m).');
      return;
    }
    if (!liveBmi || liveBmi < 8 || liveBmi > 65) {
      setErrorMsg('Calculated BMI is outside realistic boundaries. Please recheck height and weight inputs.');
      return;
    }

    const payload: BmiData = {
      weightKg: parsedWeight,
      heightCm: parsedHeightCm,
      bmiValue: liveBmi,
      date: new Date().toISOString().split('T')[0],
    };

    onSaveData(payload);
  };

  const evaluatedInterpretation =
    savedData?.bmiValue !== undefined
      ? evaluateTestScore(
          standards,
          'bmi',
          savedData.bmiValue,
          student.sex,
          student.age
        )
      : null;

  const videoConfig = teacherConfig.videoConfigs.bmi;

  return (
    <div className="space-y-6">


      {/* Written Instructions for Height & Weight Measurement (No video section for BMI) */}
      <div className="bg-[#ffffff] dark:bg-[#141c18] border-2 border-[#144e34] dark:border-[#227e56] rounded-xs overflow-hidden mb-6 shadow-xs p-6 space-y-5">
        <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
          <h3 className="font-heading uppercase text-lg font-extrabold text-stone-900 dark:text-white tracking-wide flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>WRITTEN INSTRUCTIONS: HEIGHT & WEIGHT MEASUREMENT</span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-sans mt-1">
            A general population health screening tool comparing height and weight against age-and-sex specific growth reference percentiles for Junior High School youth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#f6f5ef] dark:bg-[#1a2520] border-l-4 border-[#144e34] dark:border-[#2d9d6d] p-4 rounded-xs">
            <h4 className="font-heading uppercase text-xs font-bold text-[#0d3221] dark:text-[#7fd2ad] tracking-wide mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#144e34] dark:text-[#4cb988]" />
              <span>WHAT IT IS</span>
            </h4>
            <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed font-sans">
              A general population health screening tool comparing height and weight against age-and-sex specific growth reference percentiles for Junior High School youth.
            </p>
          </div>

          <div className="bg-[#f6f5ef] dark:bg-[#1a2520] border-l-4 border-[#d95f02] p-4 rounded-xs">
            <h4 className="font-heading uppercase text-xs font-bold text-[#d95f02] dark:text-orange-400 tracking-wide mb-1 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#d95f02]" />
              <span>WHY IT MATTERS FOR TEENS</span>
            </h4>
            <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed font-sans">
              BMI provides an educational snapshot of overall physical growth during teenage growth spurts.
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-heading uppercase text-xs font-bold text-stone-900 dark:text-white tracking-wider mb-2">
            EQUIPMENT & VENUE SPECIFICATIONS
          </h4>
          <div className="flex flex-wrap gap-2">
            {[
              'Calibrated weighing scale (placed on flat, even floor)',
              'Stadiometer or wall-mounted height measuring tape',
            ].map((item, idx) => (
              <span
                key={idx}
                className="text-xs bg-[#faf9f5] dark:bg-[#0e1411] text-stone-800 dark:text-stone-200 px-3 py-1 rounded-xs border border-stone-300 dark:border-stone-800 font-mono font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-heading uppercase text-xs font-bold text-stone-900 dark:text-white tracking-wider mb-2">
            STEP-BY-STEP PROTOCOL INSTRUCTIONS
          </h4>
          <ol className="space-y-2 list-decimal list-inside text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
            <li className="pl-1">
              <span className="font-medium text-stone-900 dark:text-stone-100">Weight: Remove heavy shoes, jackets, and empty pockets. Step gently onto center of scale with weight distributed evenly on both feet.</span>
            </li>
            <li className="pl-1">
              <span className="font-medium text-stone-900 dark:text-stone-100">Height: Stand bare-foot on flat floor with heels together, buttocks, upper back, and head touching the stadiometer/wall board.</span>
            </li>
            <li className="pl-1">
              <span className="font-medium text-stone-900 dark:text-stone-100">Look straight ahead with head in the horizontal plane. Take a deep breath and stand tall.</span>
            </li>
            <li className="pl-1">
              <span className="font-medium text-stone-900 dark:text-stone-100">Lower measuring headpiece smoothly to touch top of crown, compressing hair gently.</span>
            </li>
            <li className="pl-1">
              <span className="font-medium text-stone-900 dark:text-stone-100">Record height to the nearest 0.1 cm and weight to the nearest 0.1 kg.</span>
            </li>
          </ol>
        </div>

        <div className="bg-amber-100 dark:bg-amber-950/60 border-l-4 border-amber-600 rounded-xs p-3.5 text-xs text-amber-950 dark:text-amber-200">
          <span className="font-heading uppercase font-bold text-sm block text-amber-900 dark:text-amber-300 mb-1">
            FACILITATOR & FORM ADVICE:
          </span>
          <ul className="list-disc list-inside space-y-1 font-sans">
            <li>Always calibrate the scale with a known weight before testing.</li>
            <li>Conduct measurements respectfully and privately to preserve student dignity.</li>
          </ul>
        </div>
      </div>

      {/* Critical Educational Ethics Banner */}
      <div className="bg-[#f6f5ef] dark:bg-[#1a2520] border-l-4 border-[#144e34] dark:border-[#2d9d6d] p-4 rounded-xs text-stone-900 dark:text-stone-100 shadow-xs space-y-1">
        <div className="flex items-center gap-2 font-heading uppercase text-sm font-extrabold text-[#0d3221] dark:text-[#7fd2ad] tracking-wide">
          <Info className="w-4 h-4 text-[#d95f02] shrink-0" />
          <span>EDUCATIONAL CONTEXT & BODY RESPECT PRINCIPLES</span>
        </div>
        <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
          BMI is purely an educational screening ratio (kg/m²), <strong>not a direct measure of body fat, muscle mass, or physical fitness</strong>. A high or low BMI never determines whether a student is healthy or unhealthy. We celebrate all student bodies, encourage enjoyable daily movement, and never prescribe restrictive diets or weight loss.
        </p>
      </div>

      {/* Interactive BMI Calculator */}
      <div className="bg-[#ffffff] dark:bg-[#141c18] rounded-xs border-2 border-[#144e34] dark:border-[#227e56] shadow-xs overflow-hidden space-y-6">
        <div className="bg-[#103d29] dark:bg-[#082115] text-white px-6 py-4 border-b-2 border-[#196343] dark:border-[#1e4832] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading uppercase text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-2">
              <Scale className="w-6 h-6 text-orange-400" />
              <span>BMI-FOR-AGE SCREENING (WHO/DEPED REFERENCE)</span>
            </h2>
          </div>

          <div className="text-xs bg-[#082115] px-3 py-1.5 rounded-xs border border-[#196343] font-mono text-[#a0cbb5]">
            <span>LEARNER:</span> <strong className="text-white">{student.fullName}</strong> ({student.gradeLevel})
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6 pt-0">
          {/* Height and Weight Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weight */}
            <div className="p-5 rounded-xs border-2 border-stone-300 dark:border-stone-800 bg-[#faf9f5] dark:bg-[#0e1411] space-y-3">
              <label className="block font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider">
                1. BODY WEIGHT (KG) <span className="text-rose-500">*</span>
              </label>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                Measured without shoes and heavy outerwear.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="15"
                  max="220"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="e.g. 48.5"
                  className="w-full px-3.5 py-2.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-sm font-mono font-bold text-stone-900 dark:text-stone-100 bg-white dark:bg-[#141c18] focus:border-[#144e34]"
                />
                <span className="font-mono text-xs font-bold text-stone-600 dark:text-stone-300">KG</span>
              </div>
            </div>

            {/* Height */}
            <div className="p-5 rounded-xs border-2 border-stone-300 dark:border-stone-800 bg-[#faf9f5] dark:bg-[#0e1411] space-y-3">
              <div className="flex items-center justify-between">
                <label className="block font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider">
                  2. STANDING HEIGHT <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1 bg-white dark:bg-[#141c18] border-2 border-stone-300 dark:border-stone-700 rounded-xs p-0.5 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setHeightUnit('cm')}
                    className={`px-2.5 py-0.5 rounded-xs text-[11px] font-bold uppercase transition-colors ${
                      heightUnit === 'cm'
                        ? 'bg-[#144e34] text-white'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    cm
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeightUnit('m')}
                    className={`px-2.5 py-0.5 rounded-xs text-[11px] font-bold uppercase transition-colors ${
                      heightUnit === 'm'
                        ? 'bg-[#144e34] text-white'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    meters
                  </button>
                </div>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                Measured standing straight against stadiometer.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min={heightUnit === 'cm' ? 80 : 0.8}
                  max={heightUnit === 'cm' ? 230 : 2.3}
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder={heightUnit === 'cm' ? 'e.g. 156.0' : 'e.g. 1.56'}
                  className="w-full px-3.5 py-2.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-sm font-mono font-bold text-stone-900 dark:text-stone-100 bg-white dark:bg-[#141c18] focus:border-[#144e34]"
                />
                <span className="font-mono text-xs font-bold text-stone-600 dark:text-stone-300 uppercase">
                  {heightUnit}
                </span>
              </div>
            </div>
          </div>

          {/* Live BMI Calculation Display - Scoreboard Frame */}
          <div className="bg-[#082115] dark:bg-[#05110b] text-white rounded-xs p-6 sm:p-8 flex flex-col items-center justify-center text-center border-4 border-[#144e34] dark:border-[#1e4832] shadow-xs">
            <div className="font-scoreboard text-6xl sm:text-7xl tracking-tight text-white my-2">
              {liveBmi !== null ? liveBmi.toFixed(1) : '—'}
            </div>

            <div className="text-xs text-stone-300 font-mono mt-1">
              Formula: {parsedWeight ? `${parsedWeight} kg` : 'Weight'} &divide; (
              {parsedHeightCm ? `${(parsedHeightCm / 100).toFixed(2)} m` : 'Height'}
              )&sup2;
            </div>

            <div className="text-xs text-[#a0cbb5] mt-3 max-w-md font-sans">
              Scored using WHO Child Growth Reference norms for {student.age}-year-old {student.sex}s (Grades 7–10).
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
              Save BMI Screening
            </button>
          </div>
        </div>
      </div>

      {/* Result Display */}
      {savedData && evaluatedInterpretation && (
        <div className="space-y-4">
          <TestResultView
            testName="BMI-for-Age Screening"
            resultValue={savedData.bmiValue.toFixed(1)}
            unit="kg/m²"
            subDetails={`Weight: ${savedData.weightKg} kg · Height: ${(
              savedData.heightCm / 100
            ).toFixed(2)} m (${savedData.heightCm} cm)`}
            interpretation={evaluatedInterpretation}
            onRetest={() => {
              setWeightKg('');
              setHeightCm('');
            }}
          />

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onPrevTest}
              className="px-4 py-2.5 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-heading uppercase tracking-wider font-bold text-xs rounded-xs transition-colors border-2 border-stone-300 dark:border-stone-700"
            >
              &larr; Previous: Sit-and-Reach
            </button>
            <button
              type="button"
              onClick={onGoToReport}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#d95f02] hover:bg-[#b84f00] text-white font-heading uppercase tracking-wider font-bold text-xs rounded-xs transition-colors border border-amber-900 shadow-xs"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Printable Final Report</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
