import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  HeartPulse,
  Footprints,
  Droplets,
  CheckCircle,
  ArrowRight,
  Flame,
  Info,
} from 'lucide-react';
import { StudentProfile } from '../types';

interface SafetyScreenProps {
  student: StudentProfile;
  onAcknowledgeSafety: () => void;
  onProceedToTests: () => void;
}

export const SafetyScreen: React.FC<SafetyScreenProps> = ({
  student,
  onAcknowledgeSafety,
  onProceedToTests,
}) => {
  const [hasAcknowledged, setHasAcknowledged] = useState(student.safetyAcknowledged);
  const [checkedItems, setCheckedItems] = useState({
    noFever: true,
    noChestPain: true,
    properShoes: true,
    warmedUp: false,
    waterReady: true,
  });

  const handleCheckboxChange = (key: keyof typeof checkedItems) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleMainAcknowledgment = (checked: boolean) => {
    setHasAcknowledged(checked);
    if (checked) {
      onAcknowledgeSafety();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[#ffffff] dark:bg-[#141c18] rounded-xs border-2 border-[#144e34] dark:border-[#227e56] shadow-xs overflow-hidden">
        {/* Section Top Band */}
        <div className="bg-[#103d29] dark:bg-[#082115] text-white px-6 py-4 border-b-2 border-[#196343] dark:border-[#1e4832] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xs bg-[#196343] border border-amber-400/40 flex items-center justify-center text-amber-300">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading uppercase text-2xl sm:text-3xl font-black tracking-wide text-white leading-none">
                SAFETY RULES & HEALTH SCREENING
              </h1>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Primary Safety Warning Callout - Scoreboard Alert Stripe */}
          <div className="bg-rose-100 dark:bg-rose-950/60 border-l-4 border-rose-600 dark:border-rose-500 rounded-xs p-5 text-rose-950 dark:text-rose-200 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h2 className="font-heading uppercase text-lg sm:text-xl font-black text-rose-900 dark:text-rose-300 mb-1 tracking-wide">
                  CRITICAL RULE: STOP IMMEDIATELY IF UNWELL
                </h2>
                <p className="text-sm font-bold leading-relaxed text-rose-900 dark:text-rose-200 font-sans">
                  &ldquo;Stop if you feel pain, dizziness, chest discomfort, or unusual shortness of breath.&rdquo;
                </p>
                <p className="text-xs text-rose-800 dark:text-rose-300 mt-2 font-sans">
                  A high-visibility <strong>Stop Test</strong> button is accessible during every timed test. Student health and safety always comes first before any test score.
                </p>
              </div>
            </div>
          </div>

          {/* PAR-Q / Readiness Questions */}
          <div className="space-y-4">
            <div className="border-b-2 border-stone-200 dark:border-stone-800 pb-2">
              <h2 className="font-heading uppercase text-base font-extrabold text-stone-900 dark:text-white tracking-wider flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-[#144e34] dark:text-[#4cb988]" />
                <span>PRE-ASSESSMENT READINESS CHECKLIST (PAR-Q ALIGNED)</span>
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 font-sans">
                Review and confirm the physical readiness requirements before taking physical tests today:
              </p>
            </div>

            <div className="space-y-2.5">
              <label className="flex items-start gap-3 p-3.5 rounded-xs border-2 border-stone-200 dark:border-stone-800 hover:bg-[#faf9f5] dark:hover:bg-[#19231e] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={checkedItems.noFever}
                  onChange={() => handleCheckboxChange('noFever')}
                  className="mt-0.5 w-4 h-4 text-[#144e34] rounded-xs border-stone-400 focus:ring-amber-500"
                />
                <div className="text-xs text-stone-800 dark:text-stone-200 font-sans">
                  <span className="font-heading uppercase font-bold block text-sm text-stone-900 dark:text-white tracking-wide">
                    Feeling healthy and energized today
                  </span>
                  Free from fever, flu, asthma flare-up, diarrhea, or acute illnesses within the last 48 hours.
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xs border-2 border-stone-200 dark:border-stone-800 hover:bg-[#faf9f5] dark:hover:bg-[#19231e] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={checkedItems.noChestPain}
                  onChange={() => handleCheckboxChange('noChestPain')}
                  className="mt-0.5 w-4 h-4 text-[#144e34] rounded-xs border-stone-400 focus:ring-amber-500"
                />
                <div className="text-xs text-stone-800 dark:text-stone-200 font-sans">
                  <span className="font-heading uppercase font-bold block text-sm text-stone-900 dark:text-white tracking-wide">
                    No chest pain or joint sprains
                  </span>
                  No doctor has restricted you from performing vigorous physical activities, and you have no recent bone or joint sprain.
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xs border-2 border-stone-200 dark:border-stone-800 hover:bg-[#faf9f5] dark:hover:bg-[#19231e] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={checkedItems.properShoes}
                  onChange={() => handleCheckboxChange('properShoes')}
                  className="mt-0.5 w-4 h-4 text-[#144e34] rounded-xs border-stone-400 focus:ring-amber-500"
                />
                <div className="text-xs text-stone-800 dark:text-stone-200 font-sans">
                  <span className="font-heading uppercase font-bold block text-sm text-stone-900 dark:text-white tracking-wide">
                    Proper PE attire & rubber shoes
                  </span>
                  Wearing clean non-slip rubber shoes and comfortable, breathable PE attire suitable for stepping and floor exercises.
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xs border-2 border-stone-200 dark:border-stone-800 hover:bg-[#faf9f5] dark:hover:bg-[#19231e] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={checkedItems.waterReady}
                  onChange={() => handleCheckboxChange('waterReady')}
                  className="mt-0.5 w-4 h-4 text-[#144e34] rounded-xs border-stone-400 focus:ring-amber-500"
                />
                <div className="text-xs text-stone-800 dark:text-stone-200 font-sans">
                  <span className="font-heading uppercase font-bold block text-sm text-stone-900 dark:text-white tracking-wide">
                    Water tumbler available for hydration
                  </span>
                  Drinking clean water before and after physical tests prevents dehydration and heat fatigue in warm Philippine climates.
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xs border-2 border-stone-200 dark:border-stone-800 hover:bg-[#faf9f5] dark:hover:bg-[#19231e] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={checkedItems.warmedUp}
                  onChange={() => handleCheckboxChange('warmedUp')}
                  className="mt-0.5 w-4 h-4 text-[#144e34] rounded-xs border-stone-400 focus:ring-amber-500"
                />
                <div className="text-xs text-stone-800 dark:text-stone-200 font-sans">
                  <span className="font-heading uppercase font-bold block text-sm text-stone-900 dark:text-white tracking-wide">
                    5 to 10-Minute Dynamic Warm-Up Performed
                  </span>
                  Completed light arm circles, high knees, marching in place, and gentle hip rotations to prepare muscles and elevate heart rate safely.
                </div>
              </label>
            </div>
          </div>

          {/* Warm-Up Advice Box */}
          <div className="bg-[#f6f5ef] dark:bg-[#1a2520] border-l-4 border-[#144e34] dark:border-[#2d9d6d] rounded-xs p-4 text-xs text-stone-800 dark:text-stone-200 space-y-1.5">
            <div className="font-heading uppercase tracking-wide font-extrabold flex items-center gap-1.5 text-[#0d3221] dark:text-[#7fd2ad] text-sm">
              <Flame className="w-4 h-4 text-[#d95f02]" />
              <span>Recommended DepEd Warm-Up Routine:</span>
            </div>
            <p className="leading-relaxed font-sans">
              March in place (1 min) &rarr; Arm circles (15 reps forward, 15 back) &rarr; Torso twists (15 reps) &rarr; Heel raises & gentle ankle rolls &rarr; Light knee bends. Never begin maximal testing with cold muscles.
            </p>
          </div>

          {/* Mandatory Acknowledgment Checkbox */}
          <div className="pt-2 border-t-2 border-stone-200 dark:border-stone-800">
            <label className="flex items-start gap-3.5 p-4 rounded-xs bg-[#082115] dark:bg-[#06150e] border-2 border-[#196343] text-white cursor-pointer select-none transition-all">
              <input
                type="checkbox"
                checked={hasAcknowledged}
                onChange={(e) => handleMainAcknowledgment(e.target.checked)}
                className="mt-1 w-5 h-5 text-emerald-500 bg-[#0d3221] border-[#196343] rounded-xs focus:ring-emerald-400"
              />
              <div className="text-xs leading-relaxed font-sans">
                <span className="font-heading uppercase font-bold text-sm block text-emerald-300 mb-0.5 tracking-wider">
                  Mandatory Safety Acknowledgment
                </span>
                I confirm that I am feeling physically well today, understand all safety instructions, and agree to{' '}
                <strong className="text-white underline">
                  stop immediately if I experience pain, dizziness, nausea, or shortness of breath.
                </strong>
              </div>
            </label>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5 font-mono">
              <Info className="w-4 h-4 text-stone-400 shrink-0" />
              <span>Student: {student.fullName} ({student.gradeLevel})</span>
            </div>

            {/* Key Action Warm Accent Button */}
            <button
              type="button"
              disabled={!hasAcknowledged}
              onClick={onProceedToTests}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xs font-heading uppercase tracking-wider text-sm font-bold transition-all border ${
                hasAcknowledged
                  ? 'bg-[#d95f02] hover:bg-[#b84f00] text-white border-amber-900 cursor-pointer shadow-xs focus-visible:outline-2 focus-visible:outline-[#d95f02]'
                  : 'bg-stone-300 dark:bg-stone-800 text-stone-500 dark:text-stone-500 border-transparent cursor-not-allowed'
              }`}
            >
              <span>Proceed to Fitness Tests</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
