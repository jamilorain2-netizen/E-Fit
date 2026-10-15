import React, { useState } from 'react';
import { AlertTriangle, XCircle, ShieldAlert, HeartPulse } from 'lucide-react';

interface EmergencyStopBannerProps {
  onStopTest?: () => void;
  isTestActive?: boolean;
}

export const EmergencyStopBanner: React.FC<EmergencyStopBannerProps> = ({
  onStopTest,
  isTestActive = false,
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleTriggerStop = () => {
    if (onStopTest) {
      onStopTest();
    }
    setShowModal(true);
  };

  return (
    <>
      <div className="bg-amber-100 dark:bg-amber-950/70 border-l-4 border-amber-600 dark:border-amber-500 p-3.5 rounded-xs flex items-center justify-between gap-3 text-amber-950 dark:text-amber-200 text-xs sm:text-sm">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-heading uppercase tracking-wide font-bold text-amber-900 dark:text-amber-300">
              Safety Reminder:
            </span>{' '}
            Stop immediately if you feel pain, dizziness, chest discomfort, or unusual shortness of breath.
          </div>
        </div>

        {isTestActive && onStopTest && (
          <button
            type="button"
            onClick={handleTriggerStop}
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white font-heading uppercase tracking-wider font-bold text-xs rounded-xs border border-rose-900 transition-colors focus-visible:outline-2 focus-visible:outline-rose-500"
            aria-label="Emergency Stop Test"
          >
            <XCircle className="w-4 h-4" />
            <span>Stop Test</span>
          </button>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in">
          <div className="bg-[#ffffff] dark:bg-[#141c18] rounded-xs max-w-md w-full p-6 border-4 border-rose-700 shadow-2xl">
            <div className="w-12 h-12 rounded-xs bg-rose-100 dark:bg-rose-950/80 border-2 border-rose-700 flex items-center justify-center text-rose-700 dark:text-rose-300 mb-4 mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="font-heading uppercase font-black text-xl text-stone-900 dark:text-white text-center mb-2 tracking-wide">
              TEST STOPPED FOR SAFETY
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 text-center mb-4 leading-relaxed font-sans">
              You chose to stop. That was the smart, responsible decision. Your safety always comes first before any PE score.
            </p>

            <div className="bg-[#f6f5ef] dark:bg-[#0e1411] rounded-xs p-3.5 text-xs text-stone-800 dark:text-stone-200 space-y-2 mb-5 border-2 border-stone-300 dark:border-stone-800">
              <div className="font-heading uppercase tracking-wide font-extrabold text-stone-900 dark:text-emerald-400 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Immediate Safety Steps:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 font-sans">
                <li>Sit down comfortably and take slow, deep breaths.</li>
                <li>Sip a small amount of cool water.</li>
                <li>Inform your PE teacher or facilitator immediately if chest tightness or dizziness persists.</li>
                <li>Do not rush to resume. Rest completely for today.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 px-4 bg-[#144e34] hover:bg-[#0d3221] text-white font-heading uppercase tracking-wider font-bold text-xs rounded-xs transition-colors border border-[#227e56]"
            >
              I Understand & Am Resting Now
            </button>
          </div>
        </div>
      )}
    </>
  );
};
