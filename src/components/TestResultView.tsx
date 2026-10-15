import React from 'react';
import {
  Award,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { InterpretationResult } from '../types';

interface TestResultViewProps {
  testName: string;
  resultValue: string | number;
  unit: string;
  subDetails?: string;
  interpretation: InterpretationResult;
  onRetest?: () => void;
}

export const TestResultView: React.FC<TestResultViewProps> = ({
  testName,
  resultValue,
  unit,
  subDetails,
  interpretation,
  onRetest,
}) => {
  const { category, status, meaning, recommendation, retestGuidance, source } =
  interpretation;

  // Shape and text status mapping (never color alone, includes distinct geometric shapes & icons)
  const getStatusBadge = () => {
    switch (status) {
      case 'optimal':
        return {
          icon: (
            <div className="w-6 h-6 bg-[#E10600] text-white flex items-center justify-center font-heading font-black text-xs border-2 border-[#0A0A0A] dark:border-white">
              ★
            </div>
          ),
          label: 'Optimal / Excellent Range',
          indicator: 'Level: High Mastery',
        };
      case 'good':
        return {
          icon: (
            <div className="w-6 h-6 bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center font-heading font-black text-xs border-2 border-[#0A0A0A] dark:border-white">
              ■
            </div>
          ),
          label: 'Good / Age Appropriate',
          indicator: 'Level: Healthy Standard',
        };
      case 'fair':
        return {
          icon: (
            <div className="w-6 h-6 bg-[#8A8A8A] text-white flex items-center justify-center font-heading font-black text-xs border-2 border-[#0A0A0A] dark:border-white rounded-full">
              ●
            </div>
          ),
          label: 'Fair / Developing Baseline',
          indicator: 'Level: Developing',
        };
      case 'needs_improvement':
        return {
          icon: (
            <div className="w-6 h-6 bg-[#E10600] text-white flex items-center justify-center font-heading font-black text-xs border-2 border-[#0A0A0A] dark:border-white rotate-45">
              ◆
            </div>
          ),
          label: 'Needs Improvement / Room for Growth',
          indicator: 'Level: Focus Area',
        };
      case 'screening_notice':
        return {
          icon: (
            <div className="w-6 h-6 bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center font-heading font-black text-xs border-2 border-[#0A0A0A] dark:border-white">
              ▲
            </div>
          ),
          label: 'Educational Screening Category',
          indicator: 'Screening Indicator',
        };
      case 'unconfigured':
      default:
        return {
          icon: (
            <div className="w-6 h-6 bg-[#8A8A8A] text-white flex items-center justify-center font-heading font-black text-xs border-2 border-[#0A0A0A] dark:border-white">
              ?
            </div>
          ),
          label: 'Standard Unconfigured',
          indicator: 'Status: Pending Teacher Norms',
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="gym-card overflow-hidden animate-in fade-in">
      {/* Top Header */}
      <div className="bg-[#0A0A0A] dark:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#0A0A0A] px-5 py-4 border-b-3 border-[#0A0A0A] dark:border-[#FFFFFF] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-heading uppercase font-bold text-base tracking-wider">
            {testName} · OFFICIAL SCOREBOARD RESULT
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Score Display Stat Board with HUGE score (100px or larger on desktop) */}
        <div className="gym-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="font-heading text-6xl sm:text-8xl lg:text-[100px] text-[#0A0A0A] dark:text-white tracking-tight leading-none">
                {resultValue}
              </span>
              <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#8A8A8A] uppercase">
                {unit}
              </span>
            </div>
            {subDetails && (
              <p className="font-mono text-xs text-[#8A8A8A] mt-2 font-semibold">{subDetails}</p>
            )}
          </div>

          {/* High-Contrast Category Pill with Text + Shape */}
          <div className="flex flex-col items-start md:items-end">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8A8A8A] mb-2 font-bold">
              STANDARDIZED EVALUATION:
            </span>
            <div className="gym-card p-4 flex items-center gap-3">
              {badge.icon}
              <div>
                <div className="font-heading uppercase text-xl sm:text-2xl font-black leading-none tracking-wide text-[#0A0A0A] dark:text-white">
                  {category}
                </div>
                <div className="text-xs font-mono uppercase font-bold text-[#8A8A8A] mt-1">
                  {badge.label}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thick Divider */}
        <div className="thick-divider" />

        {/* Meaning & Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="gym-card p-5 space-y-2">
            <h4 className="font-heading font-extrabold text-lg uppercase tracking-wider text-[#0A0A0A] dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E10600]" />
              <span>WHAT THIS MEANS</span>
            </h4>
            <p className="text-sm text-[#0A0A0A] dark:text-white leading-relaxed font-sans">{meaning}</p>
          </div>

          <div className="gym-card p-5 space-y-2">
            <h4 className="font-heading font-extrabold text-lg uppercase tracking-wider text-[#0A0A0A] dark:text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-[#E10600]" />
              <span>RECOMMENDATION FOR GROWTH</span>
            </h4>
            <p className="text-sm text-[#0A0A0A] dark:text-white leading-relaxed font-sans">{recommendation}</p>
          </div>
        </div>

        {retestGuidance && (
          <div className="gym-card p-4 bg-[#FAFAFA] dark:bg-[#171717] text-xs font-mono text-[#0A0A0A] dark:text-white flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#E10600] shrink-0 mt-0.5" />
            <div>
              <strong className="font-heading uppercase tracking-wider block text-sm mb-0.5">FACILITATOR RETEST GUIDANCE:</strong>
              <span>{retestGuidance}</span>
            </div>
          </div>
        )}

        {onRetest && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onRetest}
              className="gym-button-secondary text-sm flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retest / Update Score</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
