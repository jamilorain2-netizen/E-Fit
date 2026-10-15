import React, { useState } from 'react';
import {
  Play,
  BookOpen,
  ExternalLink,
  Video,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import { FormChecklistItem } from '../types';
import { StorageService } from '../services/storageService';

interface TestVideoOrGuideProps {
  title: string;
  videoUrl?: string;
  videoCredit?: string;
  whatItIs: string;
  whyItMatters: string;
  equipment: string[];
  steps: string[];
  tips: string[];
  formChecklist: FormChecklistItem[];
  testKey?: 'bmi' | 'push_up' | 'plank' | 'zipper' | 'sit_and_reach' | 'step_test';
}

export const TestVideoOrGuide: React.FC<TestVideoOrGuideProps> = ({
  title,
  videoUrl = '',
  videoCredit = '',
  whatItIs,
  whyItMatters,
  equipment,
  steps,
  tips,
  formChecklist,
  testKey,
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'guide' | 'checklist'>(videoUrl ? 'video' : 'guide');
  const isTeacher = StorageService.getCurrentRole() === 'teacher';

  // Convert YouTube URL to embed format (supports watch?v=, youtu.be/, /shorts/, embed/)
  const getEmbedUrl = (url: string): string | null => {
    if (!url || !url.trim()) return null;
    try {
      let cleanUrl = url.trim();
      if (cleanUrl.includes('youtu.be/')) {
        const videoId = cleanUrl.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }
      if (cleanUrl.includes('watch?v=')) {
        const videoId = cleanUrl.split('v=')[1]?.split('&')[0]?.split('?')[0];
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }
      if (cleanUrl.includes('/shorts/')) {
        const videoId = cleanUrl.split('/shorts/')[1]?.split('?')[0]?.split('&')[0];
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }
      if (cleanUrl.includes('youtube.com/embed/')) {
        const videoId = cleanUrl.split('youtube.com/embed/')[1]?.split('?')[0]?.split('&')[0];
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }
      return null;
    } catch {
      return null;
    }
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="bg-[#ffffff] dark:bg-[#141c18] border-2 border-[#144e34] dark:border-[#227e56] rounded-xs overflow-hidden mb-6 shadow-xs">
      {/* Tab Switcher - Athletic Playbook Bar */}
      <div className="flex items-center justify-between border-b-2 border-[#144e34] dark:border-[#227e56] bg-[#0d3221] dark:bg-[#082115] px-3 sm:px-4 py-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {embedUrl && (
            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={`px-3 py-1.5 text-xs font-heading uppercase tracking-wider font-bold rounded-xs transition-colors flex items-center gap-1.5 border ${
                activeTab === 'video'
                  ? 'bg-white dark:bg-[#19231e] text-[#0d3221] dark:text-emerald-300 border-white dark:border-emerald-500 shadow-xs'
                  : 'text-[#d6e8de] hover:text-white hover:bg-[#144e34] border-transparent'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-rose-400" />
              <span>Video Demonstration</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 text-xs font-heading uppercase tracking-wider font-bold rounded-xs transition-colors flex items-center gap-1.5 border ${
              activeTab === 'guide'
                ? 'bg-white dark:bg-[#19231e] text-[#0d3221] dark:text-emerald-300 border-white dark:border-emerald-500 shadow-xs'
                : 'text-[#d6e8de] hover:text-white hover:bg-[#144e34] border-transparent'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Playbook & Steps</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 text-xs font-heading uppercase tracking-wider font-bold rounded-xs transition-colors flex items-center gap-1.5 border ${
              activeTab === 'checklist'
                ? 'bg-white dark:bg-[#19231e] text-[#0d3221] dark:text-emerald-300 border-white dark:border-emerald-500 shadow-xs'
                : 'text-[#d6e8de] hover:text-white hover:bg-[#144e34] border-transparent'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Form Standards Checklist</span>
          </button>
        </div>
      </div>

      {/* 1. Video Tab Content */}
      {activeTab === 'video' && embedUrl && (
        <div className="p-4 sm:p-6 bg-white dark:bg-[#141c18] space-y-4">
          <div className="space-y-3">
            <div className="relative aspect-video w-full max-w-2xl mx-auto rounded-xs overflow-hidden bg-black border-2 border-stone-800 shadow-xs">
              <iframe
                src={embedUrl}
                title={`${title} Instructional Demonstration`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>

            {/* Video Credit Line & Open on YouTube */}
            <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 max-w-2xl mx-auto pt-1 font-mono">
              {videoCredit ? (
                <span>
                  Demonstration source: <strong className="text-stone-800 dark:text-stone-200">{videoCredit}</strong>
                </span>
              ) : (
                <span>DepEd Physical Education Demonstration</span>
              )}

              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[#E10600] hover:underline font-bold"
              >
                <span>Open in YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 2. Written Guide Tab Content */}
      {activeTab === 'guide' && (
        <div className="p-4 sm:p-6 bg-white dark:bg-[#141c18] space-y-5">
          {isTeacher && !embedUrl && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 px-3 py-2 rounded-xs text-xs font-mono">
              Video not added yet
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#f6f5ef] dark:bg-[#1a2520] border-l-4 border-[#144e34] dark:border-[#2d9d6d] p-4 rounded-xs">
              <h4 className="font-heading uppercase text-xs font-bold text-[#0d3221] dark:text-[#7fd2ad] tracking-wide mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#144e34] dark:text-[#4cb988]" />
                <span>WHAT IT IS</span>
              </h4>
              <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed font-sans">{whatItIs}</p>
            </div>

            <div className="bg-[#f6f5ef] dark:bg-[#1a2520] border-l-4 border-[#d95f02] p-4 rounded-xs">
              <h4 className="font-heading uppercase text-xs font-bold text-[#d95f02] dark:text-orange-400 tracking-wide mb-1 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#d95f02]" />
                <span>WHY IT MATTERS FOR TEENS</span>
              </h4>
              <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed font-sans">{whyItMatters}</p>
            </div>
          </div>

          <div>
            <h4 className="font-heading uppercase text-xs font-bold text-stone-900 dark:text-white tracking-wider mb-2">
              EQUIPMENT & VENUE SPECIFICATIONS
            </h4>
            <div className="flex flex-wrap gap-2">
              {equipment.map((item, idx) => (
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
              {steps.map((st, idx) => (
                <li key={idx} className="pl-1">
                  <span className="font-medium text-stone-900 dark:text-stone-100">{st}</span>
                </li>
              ))}
            </ol>
          </div>

          {tips.length > 0 && (
            <div className="bg-amber-100 dark:bg-amber-950/60 border-l-4 border-amber-600 rounded-xs p-3.5 text-xs text-amber-950 dark:text-amber-200">
              <span className="font-heading uppercase font-bold text-sm block text-amber-900 dark:text-amber-300 mb-1">
                FACILITATOR & FORM ADVICE:
              </span>
              <ul className="list-disc list-inside space-y-1 font-sans">
                {tips.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {videoUrl && (
            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-mono">Having trouble playing video?</span>
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[#E10600] font-bold hover:underline"
              >
                <span>Open in YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* 3. Form Standards Checklist */}
      {activeTab === 'checklist' && (
        <div className="p-4 sm:p-6 bg-white dark:bg-[#141c18] space-y-4">
          <div>
            <h4 className="font-heading uppercase text-sm sm:text-base font-black text-stone-900 dark:text-white tracking-wider">
              CORRECT VS. INCORRECT FORM CHECKLIST
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-sans">
              Review proper biomechanical alignment before recording the official score.
            </p>
          </div>

          <div className="border-2 border-stone-300 dark:border-stone-800 rounded-xs overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#144e34] dark:bg-[#082115] text-white font-heading uppercase tracking-wider font-bold">
                  <th className="p-3 border-r border-[#196343]">Aspect / Criteria</th>
                  <th className="p-3 border-r border-[#196343] text-emerald-300">Correct Form (Pass)</th>
                  <th className="p-3 text-rose-300">Incorrect Form (Retry)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800 font-sans text-stone-800 dark:text-stone-200">
                {formChecklist.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#faf9f5] dark:hover:bg-[#101714] transition-colors">
                    <td className="p-3 font-heading font-bold text-stone-900 dark:text-stone-100 border-r border-stone-200 dark:border-stone-800">
                      {item.aspect}
                    </td>
                    <td className="p-3 border-r border-stone-200 dark:border-stone-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200">
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item.correct}</span>
                      </div>
                    </td>
                    <td className="p-3 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200">
                      <div className="flex items-start gap-1.5">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{item.incorrect}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
