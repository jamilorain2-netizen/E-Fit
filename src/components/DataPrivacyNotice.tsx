import React, { useState } from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface DataPrivacyNoticeProps {
  onAccept: () => void;
}

export const DataPrivacyNotice: React.FC<DataPrivacyNoticeProps> = ({ onAccept }) => {
  const [parentConsent, setParentConsent] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);

  const handleProceed = () => {
    if (!parentConsent || !dataConsent) {
      setErrorMsg(true);
      return;
    }
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in">
      <div className="bg-white dark:bg-[#141c18] rounded-xs max-w-xl w-full p-6 sm:p-8 shadow-2xl border-4 border-[#144e34] dark:border-[#227e56] max-h-[90vh] overflow-y-auto text-stone-900 dark:text-stone-100">
        <div className="flex items-center gap-3 mb-4 border-b-2 border-stone-200 dark:border-stone-800 pb-4">
          <div className="w-12 h-12 rounded-xs bg-[#082115] text-[#4cb988] flex items-center justify-center shrink-0 border-2 border-[#196343]">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-heading uppercase text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-wide">
              DATA PRIVACY ACT OF 2012 NOTICE
            </h2>
          </div>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-4 font-sans">
          Welcome to <strong>Student Fit: Health-Related Fitness Assessment</strong>. In compliance with the 
          <strong> Philippine Data Privacy Act of 2012 (RA 10173)</strong> and Department of Education (DepEd) 
          learner welfare policies, please review the following data handling safeguards:
        </p>

        <div className="space-y-3 bg-[#faf9f5] dark:bg-[#0e1411] p-4 rounded-xs border-2 border-stone-300 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 mb-5 font-sans">
          <div className="flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#144e34] dark:text-[#4cb988] shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 dark:text-stone-100 block mb-0.5 font-heading uppercase text-xs tracking-wider">
                Local Browser Storage & Privacy:
              </strong>
              Student records, Learner Reference Numbers (LRN), and fitness assessment scores are stored 
              <strong> securely inside your browser's local storage</strong> on this device. No health data is sold or shared with third-party advertisers.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-[#144e34] dark:text-[#4cb988] shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 dark:text-stone-100 block mb-0.5 font-heading uppercase text-xs tracking-wider">
                Educational Physical Education Purpose:
              </strong>
              All measurements (3-min step test, plank, push-ups, zipper, sit-and-reach, BMI-for-age) are utilized 
              exclusively for Junior High School PE curriculum tracking and personal fitness planning.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#d95f02] shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 dark:text-stone-100 block mb-0.5 font-heading uppercase text-xs tracking-wider">
                Parental / Guardian Consent for Minors:
              </strong>
              For students enrolled in Junior High School (Grades 7 to 10, typically ages 12–16), parent/guardian 
              awareness is acknowledged for educational fitness testing and health screening.
            </div>
          </div>
        </div>

        {/* Checkbox Consents */}
        <div className="space-y-3 mb-6 font-sans">
          <label className="flex items-start gap-3 p-3 rounded-xs border-2 border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-[#1a2520] cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={parentConsent}
              onChange={(e) => {
                setParentConsent(e.target.checked);
                setErrorMsg(false);
              }}
              className="mt-0.5 w-4 h-4 text-[#144e34] rounded-xs border-stone-400 focus:ring-[#144e34]"
            />
            <span className="text-stone-800 dark:text-stone-200 leading-tight">
              <strong>Parent / Guardian Consent:</strong> As a student or PE teacher, I confirm that parental or guardian consent/awareness has been obtained for school fitness assessment activities.
            </span>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xs border-2 border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-[#1a2520] cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={dataConsent}
              onChange={(e) => {
                setDataConsent(e.target.checked);
                setErrorMsg(false);
              }}
              className="mt-0.5 w-4 h-4 text-[#144e34] rounded-xs border-stone-400 focus:ring-[#144e34]"
            />
            <span className="text-stone-800 dark:text-stone-200 leading-tight">
              <strong>Data Privacy Agreement:</strong> I understand that fitness records are stored locally for educational report generation under RA 10173 standards.
            </span>
          </label>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-400 rounded-xs text-xs text-rose-900 dark:text-rose-200 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Please check both checkboxes to confirm privacy compliance before proceeding.</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleProceed}
          className="w-full py-3 px-4 bg-[#144e34] hover:bg-[#0d3221] active:bg-[#082115] text-white font-heading uppercase tracking-wider font-extrabold text-sm rounded-xs transition-colors border border-emerald-400/30 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Accept & Enter Student Fit</span>
        </button>
      </div>
    </div>
  );
};
