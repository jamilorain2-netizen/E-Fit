import React, { useState, useEffect } from 'react';
import {
  Target,
  Flame,
  Dumbbell,
  Compass,
  Activity,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Heart,
  Droplets,
  Moon,
  Home,
  Utensils,
  ChevronRight,
  ChevronDown,
  Printer,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  Zap,
} from 'lucide-react';
import {
  StudentProfile,
  AssessmentRecord,
  StandardRow,
  GoalCategory,
  FitnessPlanLevel,
  StudentGoalPlan,
  GoalPlanTemplateData,
} from '../types';
import { StorageService } from '../services/storageService';
import {
  detectWeakestArea,
  suggestDefaultLevel,
  generateStudentGoalPlan,
} from '../utils/goalPlanGenerator';

interface FitnessGoalPlanScreenProps {
  student: StudentProfile;
  assessment: AssessmentRecord | null;
  standards: StandardRow[];
  onNavigateToReport?: () => void;
}

export const FitnessGoalPlanScreen: React.FC<FitnessGoalPlanScreenProps> = ({
  student,
  assessment,
  standards,
  onNavigateToReport,
}) => {
  const [templateData, setTemplateData] = useState<GoalPlanTemplateData>(
    StorageService.getGoalPlanTemplates()
  );
  const [currentPlan, setCurrentPlan] = useState<StudentGoalPlan | null>(null);

  // Form Configuration State
  const [selectedGoal, setSelectedGoal] = useState<GoalCategory>('endurance');
  const [selectedDays, setSelectedDays] = useState<number>(4);
  const [selectedMinutes, setSelectedMinutes] = useState<number>(30);
  const [selectedLevel, setSelectedLevel] = useState<FitnessPlanLevel>('Building');
  const [isConfiguring, setIsConfiguring] = useState<boolean>(false);

  // Active view states
  const [activeWeekIndex, setActiveWeekIndex] = useState<number>(0);
  const [expandedDay, setExpandedDay] = useState<string>('Monday');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  // Reflection Inputs
  const [reflectionGood, setReflectionGood] = useState<string>('');
  const [reflectionHard, setReflectionHard] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Weakest area auto-detection
  const weakestResult = detectWeakestArea(assessment, standards, student);
  const suggestedLevel = suggestDefaultLevel(assessment, standards, student);

  // Load student plan on mount or when student changes
  useEffect(() => {
    const loaded = StorageService.getStudentGoalPlan(student.id);
    if (loaded) {
      setCurrentPlan(loaded);
      setSelectedGoal(loaded.goalId);
      setSelectedDays(loaded.daysPerWeek);
      setSelectedMinutes(loaded.minutesPerDay);
      setSelectedLevel(loaded.level);
      setIsConfiguring(false);

      // Load active week's reflection
      const currentRef = loaded.reflections[1] || { feltGood: '', wasHard: '' };
      setReflectionGood(currentRef.feltGood || '');
      setReflectionHard(currentRef.wasHard || '');
    } else {
      // Suggest default configuration
      setSelectedLevel(suggestedLevel);
      if (weakestResult.isComplete) {
        setSelectedGoal('weakest_area');
      } else {
        setSelectedGoal('endurance');
      }
      setIsConfiguring(true);
    }
  }, [student.id]);

  // Update reflection when changing week tab
  const handleSelectWeek = (weekIdx: number) => {
    setActiveWeekIndex(weekIdx);
    const weekNum = weekIdx + 1;
    if (currentPlan && currentPlan.reflections[weekNum]) {
      setReflectionGood(currentPlan.reflections[weekNum].feltGood || '');
      setReflectionHard(currentPlan.reflections[weekNum].wasHard || '');
    } else {
      setReflectionGood('');
      setReflectionHard('');
    }
  };

  // Generate / Save new plan
  const handleGeneratePlan = () => {
    // If student selected weakest_area but results are incomplete, prevent generation
    if (selectedGoal === 'weakest_area' && !weakestResult.isComplete) {
      return;
    }

    const newPlan = generateStudentGoalPlan(
      student,
      selectedGoal,
      selectedDays,
      selectedMinutes,
      selectedLevel,
      assessment,
      standards,
      templateData
    );

    StorageService.saveStudentGoalPlan(newPlan);
    setCurrentPlan(newPlan);
    setIsConfiguring(false);
    setActiveWeekIndex(0);
    setExpandedDay('Monday');
    setSaveStatus('Plan generated and saved to your school PE record!');
    setTimeout(() => setSaveStatus(''), 4000);
  };

  // Toggle Day Completion Checkbox
  const handleToggleDayComplete = (weekNum: number, dayName: string) => {
    if (!currentPlan) return;
    const key = `w${weekNum}-${dayName}`;
    const nextCompleted = {
      ...currentPlan.completedDays,
      [key]: !currentPlan.completedDays[key],
    };

    const updatedPlan: StudentGoalPlan = {
      ...currentPlan,
      completedDays: nextCompleted,
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveStudentGoalPlan(updatedPlan);
    setCurrentPlan(updatedPlan);
  };

  // Save Reflection
  const handleSaveReflection = () => {
    if (!currentPlan) return;
    const weekNum = activeWeekIndex + 1;
    const nextReflections = {
      ...currentPlan.reflections,
      [weekNum]: {
        feltGood: reflectionGood,
        wasHard: reflectionHard,
        updatedAt: new Date().toISOString(),
      },
    };

    const updatedPlan: StudentGoalPlan = {
      ...currentPlan,
      reflections: nextReflections,
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveStudentGoalPlan(updatedPlan);
    setCurrentPlan(updatedPlan);
    setSaveStatus(`Week ${weekNum} reflection saved!`);
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const currentWeekPlan = currentPlan?.weeks[activeWeekIndex];
  const nutritionGuide = templateData.nutritionGuides[currentPlan ? currentPlan.goalId : selectedGoal];

  // Calculate completed days for the active week
  const activeWeekNum = activeWeekIndex + 1;
  const completedInActiveWeek = currentWeekPlan
    ? currentWeekPlan.days.filter(
        (d) => !d.isRestDay && currentPlan?.completedDays[`w${activeWeekNum}-${d.dayName}`]
      ).length
    : 0;

  const totalActiveDaysInWeek = currentWeekPlan
    ? currentWeekPlan.days.filter((d) => !d.isRestDay).length
    : selectedDays;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* SCOREBOARD HEADER */}
      <div className="bg-[#0d3221] text-[#f6f9f7] border-4 border-[#144e34] dark:border-[#227e56] p-5 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-[#e65c00] text-white flex items-center justify-center shrink-0 border-2 border-black/20">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-heading uppercase tracking-wider bg-[#103d29] text-[#b6dbc7] px-2 py-0.5 border border-[#1b583c]">
                  Physical Education & Health (Grades 7–10)
                </span>
                <span className="text-xs font-mono bg-[#144e34] text-[#d6e8de] px-2 py-0.5">
                  LRN: {student.lrnOrId}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-heading font-extrabold uppercase tracking-tight text-white mt-1">
                My Fitness Goal Plan
              </h1>
              <p className="text-xs md:text-sm text-[#b6dbc7] mt-0.5">
                Personalized 4-Week Activity, Filipino Nutrition, & Movement Progression for{' '}
                <strong className="text-white">{student.fullName}</strong> ({student.gradeLevel} - {student.section})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {currentPlan && !isConfiguring && (
              <button
                type="button"
                onClick={() => setIsConfiguring(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#103d29] hover:bg-[#164e35] text-white text-xs font-heading font-bold uppercase tracking-wider border border-[#1b583c] focus:outline-none focus:ring-2 focus:ring-[#e65c00]"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#e65c00]" />
                Change Goal / Schedule
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#e65c00] hover:bg-[#cf5300] text-white text-xs font-heading font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-white"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Plan
            </button>
          </div>
        </div>
      </div>

      {/* SAFETY & HEALTH NOTICE (Mandatory) */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-4 text-amber-900 dark:text-amber-200">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs md:text-sm leading-relaxed">
            <strong className="font-heading uppercase tracking-wide block text-amber-950 dark:text-amber-100 mb-0.5">
              Health & Safety Notice:
            </strong>
            {templateData.safetyNotice}
          </div>
        </div>
      </div>

      {saveStatus && (
        <div className="bg-[#144e34] text-white p-3 border-2 border-[#1f724d] text-xs md:text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#84d9af]" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* =========================================================================
          GOAL PLAN GENERATOR / SETUP FORM
      ========================================================================= */}
      {(!currentPlan || isConfiguring) && (
        <div className="bg-white dark:bg-neutral-900 border-2 border-[#144e34] dark:border-[#227e56] p-5 md:p-7 space-y-6">
          <div className="border-b-2 border-neutral-200 dark:border-neutral-800 pb-3">
            <h2 className="text-xl md:text-2xl font-heading font-extrabold uppercase text-[#144e34] dark:text-[#84d9af] flex items-center gap-2">
              <Target className="w-5 h-5 text-[#e65c00]" />
              Step 1: Pick Your Main Fitness Goal
            </h2>
            <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Choose one primary direction for your next 4-week fitness cycle. Positive progress and regular energy come first!
            </p>
          </div>

          {/* Goal 5 Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Goal 1: Endurance */}
            <button
              type="button"
              onClick={() => setSelectedGoal('endurance')}
              className={`text-left p-4 border-2 transition-colors relative focus:outline-none focus:ring-2 focus:ring-[#e65c00] ${
                selectedGoal === 'endurance'
                  ? 'border-[#144e34] bg-[#edf6f1] dark:bg-[#113824] dark:border-[#4ade80]'
                  : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 hover:border-neutral-400'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-300 dark:border-rose-800">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold uppercase text-neutral-900 dark:text-neutral-100 text-base">
                    1. Build Endurance (Stamina)
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                    Keep your heart strong, jog longer without getting winded, and have stamina for school sports and active games.
                  </p>
                </div>
              </div>
            </button>

            {/* Goal 2: Strength */}
            <button
              type="button"
              onClick={() => setSelectedGoal('strength')}
              className={`text-left p-4 border-2 transition-colors relative focus:outline-none focus:ring-2 focus:ring-[#e65c00] ${
                selectedGoal === 'strength'
                  ? 'border-[#144e34] bg-[#edf6f1] dark:bg-[#113824] dark:border-[#4ade80]'
                  : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 hover:border-neutral-400'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-300 dark:border-amber-800">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold uppercase text-neutral-900 dark:text-neutral-100 text-base">
                    2. Get Stronger
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                    Build upper body and leg strength, core stability, and posture using equipment-free bodyweight movements.
                  </p>
                </div>
              </div>
            </button>

            {/* Goal 3: Flexibility */}
            <button
              type="button"
              onClick={() => setSelectedGoal('flexibility')}
              className={`text-left p-4 border-2 transition-colors relative focus:outline-none focus:ring-2 focus:ring-[#e65c00] ${
                selectedGoal === 'flexibility'
                  ? 'border-[#144e34] bg-[#edf6f1] dark:bg-[#113824] dark:border-[#4ade80]'
                  : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 hover:border-neutral-400'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-300 dark:border-sky-800">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold uppercase text-neutral-900 dark:text-neutral-100 text-base">
                    3. Improve Flexibility
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                    Loosen tight shoulder and hamstring muscles, improve joint reach, and move freely without stiffness.
                  </p>
                </div>
              </div>
            </button>

            {/* Goal 4: Active & Energy */}
            <button
              type="button"
              onClick={() => setSelectedGoal('active_energy')}
              className={`text-left p-4 border-2 transition-colors relative focus:outline-none focus:ring-2 focus:ring-[#e65c00] ${
                selectedGoal === 'active_energy'
                  ? 'border-[#144e34] bg-[#edf6f1] dark:bg-[#113824] dark:border-[#4ade80]'
                  : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 hover:border-neutral-400'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-300 dark:border-emerald-800">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold uppercase text-neutral-900 dark:text-neutral-100 text-base">
                    4. Be More Active & Have More Energy
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                    Accumulate fun daily movement with Filipino street games, dance, household chores, and walk breaks.
                  </p>
                </div>
              </div>
            </button>

            {/* Goal 5: Weakest Area (Auto-Detected) */}
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => {
                  if (weakestResult.isComplete) {
                    setSelectedGoal('weakest_area');
                  }
                }}
                disabled={!weakestResult.isComplete}
                className={`w-full text-left p-4 border-2 transition-colors relative focus:outline-none focus:ring-2 focus:ring-[#e65c00] ${
                  !weakestResult.isComplete
                    ? 'border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-800/30 opacity-80 cursor-not-allowed'
                    : selectedGoal === 'weakest_area'
                    ? 'border-[#144e34] bg-[#edf6f1] dark:bg-[#113824] dark:border-[#4ade80]'
                    : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 hover:border-neutral-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-[#e65c00]/10 text-[#e65c00] flex items-center justify-center shrink-0 border border-[#e65c00]/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-bold uppercase text-neutral-900 dark:text-neutral-100 text-base">
                        5. Improve My Weakest Test Area (Auto-Detected)
                      </h3>
                      {weakestResult.isComplete ? (
                        <span className="text-[11px] font-heading uppercase px-2 py-0.5 bg-[#e65c00] text-white">
                          Detected: {weakestResult.testName}
                        </span>
                      ) : (
                        <span className="text-[11px] font-heading uppercase px-2 py-0.5 bg-neutral-400 text-white">
                          Results Incomplete
                        </span>
                      )}
                    </div>

                    {weakestResult.isComplete ? (
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1">
                        {weakestResult.reason}
                      </p>
                    ) : (
                      <div className="mt-1 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 font-medium">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{weakestResult.reason}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Schedule & Level Options */}
          <div className="border-t-2 border-neutral-200 dark:border-neutral-800 pt-5 space-y-5">
            <h2 className="text-xl md:text-2xl font-heading font-extrabold uppercase text-[#144e34] dark:text-[#84d9af] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#e65c00]" />
              Step 2: Choose Your Availability & Level
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Days Per Week (3 to 7) */}
              <div>
                <label className="block text-xs font-heading font-bold uppercase text-neutral-700 dark:text-neutral-300 mb-2">
                  Days Available Per Week (3–7 Days)
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[3, 4, 5, 6, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSelectedDays(num)}
                      className={`py-2 text-center font-heading font-extrabold text-sm border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#e65c00] ${
                        selectedDays === num
                          ? 'border-[#144e34] bg-[#144e34] text-white dark:border-[#4ade80]'
                          : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {num}d
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                  Remaining {7 - selectedDays} days will be designated as active rest & recovery.
                </p>
              </div>

              {/* Minutes Per Day (20, 30, 45, 60) */}
              <div>
                <label className="block text-xs font-heading font-bold uppercase text-neutral-700 dark:text-neutral-300 mb-2">
                  Minutes Available Per Day
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[20, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setSelectedMinutes(mins)}
                      className={`py-2 text-center font-heading font-extrabold text-sm border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#e65c00] ${
                        selectedMinutes === mins
                          ? 'border-[#144e34] bg-[#144e34] text-white dark:border-[#4ade80]'
                          : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                  Includes 5m warm-up + {selectedMinutes - 10}m main circuit + 5m cool-down.
                </p>
              </div>

              {/* Level (Beginner, Building, Active) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-heading font-bold uppercase text-neutral-700 dark:text-neutral-300">
                    Fitness Level
                  </label>
                  <span className="text-[10px] font-mono text-[#144e34] dark:text-[#84d9af] font-semibold">
                    Suggested: {suggestedLevel}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Beginner', 'Building', 'Active'] as FitnessPlanLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelectedLevel(lvl)}
                      className={`py-2 text-center font-heading font-extrabold text-xs uppercase border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#e65c00] ${
                        selectedLevel === lvl
                          ? 'border-[#144e34] bg-[#144e34] text-white dark:border-[#4ade80]'
                          : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                  Adjusts rep counts, hold times, and interval intensities.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="border-t-2 border-neutral-200 dark:border-neutral-800 pt-5 flex items-center justify-between gap-3 flex-wrap">
            {currentPlan && (
              <button
                type="button"
                onClick={() => setIsConfiguring(false)}
                className="px-4 py-2.5 border-2 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-heading font-bold uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel & Keep Current Plan
              </button>
            )}

            <button
              type="button"
              onClick={handleGeneratePlan}
              disabled={selectedGoal === 'weakest_area' && !weakestResult.isComplete}
              className="ml-auto inline-flex items-center gap-2 px-6 py-3 bg-[#144e34] hover:bg-[#103d29] disabled:bg-neutral-400 text-white font-heading font-extrabold text-sm uppercase tracking-wider border-2 border-black/20 focus:outline-none focus:ring-2 focus:ring-[#e65c00]"
            >
              <Zap className="w-4 h-4 text-[#e65c00]" />
              Generate My 4-Week Fitness Plan
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          ACTIVE GOAL PLAN DASHBOARD
      ========================================================================= */}
      {currentPlan && !isConfiguring && currentWeekPlan && (
        <div className="space-y-6">
          {/* STATS & SUMMARY STRIP */}
          <div className="bg-[#103d29] text-[#f6f9f7] border-2 border-[#144e34] p-4 md:p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-[11px] font-heading uppercase tracking-wider text-[#b6dbc7]">
                  Main Goal
                </div>
                <div className="text-base md:text-lg font-heading font-extrabold text-white mt-0.5">
                  {currentPlan.goalTitle}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-heading uppercase tracking-wider text-[#b6dbc7]">
                  Commitment
                </div>
                <div className="text-base md:text-lg font-heading font-extrabold text-white mt-0.5">
                  {currentPlan.daysPerWeek} Days • {currentPlan.minutesPerDay} Mins/Day
                </div>
              </div>

              <div>
                <div className="text-[11px] font-heading uppercase tracking-wider text-[#b6dbc7]">
                  Current Level
                </div>
                <div className="text-base md:text-lg font-heading font-extrabold text-white mt-0.5">
                  {currentPlan.level}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-heading uppercase tracking-wider text-[#b6dbc7]">
                  Week Progress
                </div>
                <div className="text-base md:text-lg font-heading font-extrabold text-[#84d9af] mt-0.5">
                  {completedInActiveWeek} of {totalActiveDaysInWeek} Days Checked
                </div>
              </div>
            </div>
          </div>

          {/* WHO GUIDELINE CALLOUT */}
          <div className="bg-sky-50 dark:bg-sky-950/30 border-l-4 border-sky-600 p-3.5 text-sky-950 dark:text-sky-200 text-xs md:text-sm">
            <div className="flex items-start gap-2.5">
              <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-heading uppercase tracking-wide">WHO Adolescent Physical Activity Guideline:</strong>{' '}
                Students aged 12–17 should work toward an average of at least <strong>60 minutes per day</strong> of moderate-to-vigorous physical activity across the week. Build up gradually, never force it, and celebrate every active moment!
              </div>
            </div>
          </div>

          {/* 4-WEEK PROGRESSION TABS */}
          <div className="border-b-2 border-neutral-300 dark:border-neutral-800 flex items-center gap-1.5 overflow-x-auto pb-1">
            {currentPlan.weeks.map((w, idx) => (
              <button
                key={w.weekNumber}
                type="button"
                onClick={() => handleSelectWeek(idx)}
                className={`px-4 py-2.5 font-heading font-bold text-xs md:text-sm uppercase tracking-wide whitespace-nowrap transition-colors border-b-4 focus:outline-none focus:ring-2 focus:ring-[#e65c00] ${
                  activeWeekIndex === idx
                    ? 'border-[#144e34] text-[#144e34] dark:border-[#4ade80] dark:text-[#84d9af] bg-white dark:bg-neutral-900 font-extrabold'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Week {w.weekNumber}
              </button>
            ))}
          </div>

          {/* WEEK THEME BANNER */}
          <div className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-heading font-extrabold uppercase text-[#144e34] dark:text-[#84d9af]">
                  {currentWeekPlan.themeTitle}
                </h3>
                <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-300 mt-0.5">
                  {currentWeekPlan.progressionFocus}
                </p>
              </div>
              <div className="shrink-0 text-xs font-mono bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 border border-neutral-300 dark:border-neutral-700">
                Week {activeWeekNum} of 4
              </div>
            </div>
          </div>

          {/* =========================================================================
              WEEKLY SCHEDULE (Monday to Sunday)
          ========================================================================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading font-extrabold uppercase text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#144e34] dark:text-[#84d9af]" />
                Weekly Schedule (Monday to Sunday)
              </h3>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Click any day to view complete warm-up, main conditioning, and cool-down
              </span>
            </div>

            <div className="space-y-3">
              {currentWeekPlan.days.map((day) => {
                const dayKey = `w${activeWeekNum}-${day.dayName}`;
                const isCompleted = !!currentPlan.completedDays[dayKey];
                const isExpanded = expandedDay === day.dayName;

                return (
                  <div
                    key={day.dayName}
                    className={`border-2 transition-all ${
                      day.isRestDay
                        ? 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60'
                        : isCompleted
                        ? 'border-[#144e34] bg-emerald-50/40 dark:bg-[#0c2e1c]/40'
                        : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900'
                    }`}
                  >
                    {/* Day Header Row */}
                    <div className="p-3.5 md:p-4 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        {/* Checkbox button */}
                        {!day.isRestDay ? (
                          <button
                            type="button"
                            onClick={() => handleToggleDayComplete(activeWeekNum, day.dayName)}
                            className={`w-6 h-6 border-2 flex items-center justify-center shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#e65c00] ${
                              isCompleted
                                ? 'bg-[#144e34] border-[#144e34] text-white'
                                : 'border-neutral-400 bg-white dark:bg-neutral-800 hover:border-[#144e34]'
                            }`}
                            title="Mark day completed"
                          >
                            {isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </button>
                        ) : (
                          <div className="w-6 h-6 border-2 border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 text-neutral-400">
                            <Moon className="w-3.5 h-3.5" />
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-heading font-extrabold text-base md:text-lg uppercase text-neutral-900 dark:text-neutral-100">
                              {day.dayName}
                            </span>
                            <span
                              className={`text-[10px] font-heading font-bold uppercase px-2 py-0.5 border ${
                                day.isRestDay
                                  ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300'
                                  : day.focusType === 'strength'
                                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300'
                                  : day.focusType === 'aerobic'
                                  ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300'
                                  : day.focusType === 'flexibility'
                                  ? 'bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border-sky-300'
                                  : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                              }`}
                            >
                              {day.isRestDay ? 'Rest & Recovery' : day.focusType}
                            </span>
                            {isCompleted && (
                              <span className="text-[10px] font-heading font-bold uppercase px-2 py-0.5 bg-[#144e34] text-white">
                                Completed
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-600 dark:text-neutral-400">
                            {day.title} • {!day.isRestDay ? `${currentPlan.minutesPerDay} min total` : 'Active Rest'}
                          </div>
                        </div>
                      </div>

                      {/* Expand / Collapse Button */}
                      <button
                        type="button"
                        onClick={() => setExpandedDay(isExpanded ? '' : day.dayName)}
                        className="inline-flex items-center gap-1 text-xs font-heading font-bold uppercase text-[#144e34] dark:text-[#84d9af] hover:underline focus:outline-none"
                      >
                        <span>{isExpanded ? 'Hide Routine' : 'View Routine'}</span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Expanded Day Routine Details */}
                    {isExpanded && (
                      <div className="border-t-2 border-neutral-200 dark:border-neutral-800 p-4 space-y-4 bg-neutral-50/50 dark:bg-neutral-900/40">
                        {/* 1. Warm-up (5 min) */}
                        <div className="bg-white dark:bg-neutral-800 p-3.5 border-l-4 border-amber-500 shadow-xs">
                          <div className="flex items-center justify-between">
                            <h4 className="font-heading font-bold uppercase text-xs md:text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                              <Flame className="w-4 h-4 text-amber-500" />
                              Warm-Up ({day.warmUpMin} Minutes)
                            </h4>
                            <span className="text-[11px] text-neutral-500 font-mono">Dynamic Prep</span>
                          </div>
                          <ul className="mt-2 space-y-1 text-xs text-neutral-700 dark:text-neutral-300 list-disc list-inside">
                            {day.warmUpExercises.map((wEx, i) => (
                              <li key={i}>{wEx}</li>
                            ))}
                          </ul>
                        </div>

                        {/* 2. Main Activity Circuit */}
                        {!day.isRestDay && (
                          <div className="bg-white dark:bg-neutral-800 p-3.5 border-l-4 border-[#144e34] dark:border-[#4ade80] shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-heading font-bold uppercase text-xs md:text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-[#e65c00]" />
                                Main Activity ({day.mainMin} Minutes) — {day.mainActivityTitle}
                              </h4>
                              <span className="text-[11px] font-mono text-[#144e34] dark:text-[#84d9af] font-semibold">
                                {currentPlan.level} Level
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              {day.mainExercises.map((ex, exIdx) => {
                                const isExOpen = expandedExerciseId === `${day.dayName}-${exIdx}`;
                                return (
                                  <div
                                    key={exIdx}
                                    className="p-3 border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 rounded-none text-xs"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="font-heading font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                                        {ex.name}
                                      </div>
                                      {ex.setsReps && (
                                        <span className="font-mono text-[10px] bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 text-neutral-800 dark:text-neutral-200">
                                          {ex.setsReps}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                                      {ex.instruction}
                                    </p>

                                    {/* Easier / Harder Variations Toggle */}
                                    <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setExpandedExerciseId(isExOpen ? null : `${day.dayName}-${exIdx}`)
                                        }
                                        className="text-[11px] font-heading uppercase font-semibold text-[#144e34] dark:text-[#84d9af] hover:underline inline-flex items-center gap-1"
                                      >
                                        <span>{isExOpen ? 'Hide Variations' : 'Show Easier / Harder Option'}</span>
                                        <ChevronDown className={`w-3 h-3 transition-transform ${isExOpen ? 'rotate-180' : ''}`} />
                                      </button>

                                      {isExOpen && (
                                        <div className="mt-2 space-y-1 text-[11px] bg-white dark:bg-neutral-900 p-2 border border-neutral-200 dark:border-neutral-700">
                                          <div className="text-emerald-700 dark:text-emerald-400">
                                            <strong>Easier:</strong> {ex.easier}
                                          </div>
                                          <div className="text-amber-700 dark:text-amber-400">
                                            <strong>Harder:</strong> {ex.harder}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* 3. Cool-Down (5 min) */}
                        <div className="bg-white dark:bg-neutral-800 p-3.5 border-l-4 border-sky-500 shadow-xs">
                          <div className="flex items-center justify-between">
                            <h4 className="font-heading font-bold uppercase text-xs md:text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                              <Activity className="w-4 h-4 text-sky-500" />
                              Cool-Down & Stretch ({day.coolDownMin} Minutes)
                            </h4>
                            <span className="text-[11px] text-neutral-500 font-mono">Recovery</span>
                          </div>
                          <ul className="mt-2 space-y-1 text-xs text-neutral-700 dark:text-neutral-300 list-disc list-inside">
                            {day.coolDownExercises.map((cEx, i) => (
                              <li key={i}>{cEx}</li>
                            ))}
                          </ul>
                        </div>

                        {/* 4. Bonus Household Chores */}
                        <div className="bg-neutral-100 dark:bg-neutral-800/60 p-3 border border-neutral-300 dark:border-neutral-700">
                          <div className="flex items-center gap-2 text-xs font-heading font-bold uppercase text-neutral-800 dark:text-neutral-200">
                            <Home className="w-3.5 h-3.5 text-[#e65c00]" />
                            Bonus Household Chores Movement (No Fixed Minutes)
                          </div>
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                            Help around your home today! These functional chores count toward your total daily activity:
                          </p>
                          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                            {day.chores.map((chore, cIdx) => (
                              <span
                                key={cIdx}
                                className="inline-block text-[11px] font-medium bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 px-2 py-0.5 text-neutral-700 dark:text-neutral-300"
                              >
                                {chore}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* WHO note */}
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 italic">
                          {day.whoTip}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* =========================================================================
              WEEKLY CHECK-OFF TRACKER & REFLECTION
          ========================================================================= */}
          <div className="bg-white dark:bg-neutral-900 border-2 border-[#144e34] dark:border-[#227e56] p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-neutral-200 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="font-heading font-extrabold text-lg uppercase text-[#144e34] dark:text-[#84d9af] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#e65c00]" />
                  Week {activeWeekNum} Check-Off & Reflection Tracker
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Track completed sessions and reflect on your physical feeling. No pressure, just progress!
                </p>
              </div>
              <div className="text-right">
                <span className="font-heading font-extrabold text-xl text-[#144e34] dark:text-[#84d9af]">
                  {completedInActiveWeek} / {totalActiveDaysInWeek}
                </span>
                <span className="text-xs text-neutral-500 block">Days Finished</span>
              </div>
            </div>

            {/* Reflection Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-heading font-bold uppercase text-neutral-800 dark:text-neutral-200 mb-1">
                  1. What felt good this week? (e.g. exercises that felt easier, more energy in class)
                </label>
                <textarea
                  value={reflectionGood}
                  onChange={(e) => setReflectionGood(e.target.value)}
                  placeholder="I felt energetic during jogging intervals and my push-up form felt much smoother..."
                  rows={3}
                  className="w-full text-xs p-2.5 border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#e65c00]"
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-bold uppercase text-neutral-800 dark:text-neutral-200 mb-1">
                  2. What was challenging or hard? (e.g. tired muscles, fitting in chores, stretching)
                </label>
                <textarea
                  value={reflectionHard}
                  onChange={(e) => setReflectionHard(e.target.value)}
                  placeholder="The plank holds felt tough on Day 3, so I used the knee plank modification..."
                  rows={3}
                  className="w-full text-xs p-2.5 border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#e65c00]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveReflection}
                className="px-5 py-2.5 bg-[#144e34] hover:bg-[#103d29] text-white text-xs font-heading font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#e65c00]"
              >
                Save Week {activeWeekNum} Reflection
              </button>
            </div>
          </div>

          {/* =========================================================================
              WHAT TO EAT TO SUPPORT THIS GOAL (Filipino-Friendly, No Dieting)
          ========================================================================= */}
          <div className="bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-700 p-5 md:p-6 space-y-5">
            <div className="border-b-2 border-neutral-200 dark:border-neutral-800 pb-3 flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-xl font-heading font-extrabold uppercase text-[#144e34] dark:text-[#84d9af] flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-[#e65c00]" />
                  What to Eat to Support This Goal (Pinggang Pinoy Plate Guide)
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                  Balanced Filipino meals to fuel stamina and recovery. Strictly <strong>no dieting</strong>, no calorie counting, and no food restrictions.
                </p>
              </div>
              <span className="text-[11px] font-heading font-bold uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 border border-emerald-300 dark:border-emerald-800">
                Nourish • Fuel • Grow
              </span>
            </div>

            {/* The Plate Guide */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/30">
                <div className="font-heading font-extrabold uppercase text-xs text-emerald-900 dark:text-emerald-300">
                  Glow Foods (1/2 Plate)
                </div>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1 leading-relaxed">
                  {nutritionGuide.plateGuide.glow}
                </p>
              </div>

              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500/30">
                <div className="font-heading font-extrabold uppercase text-xs text-amber-900 dark:text-amber-300">
                  Grow Foods (1/4 Plate)
                </div>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1 leading-relaxed">
                  {nutritionGuide.plateGuide.grow}
                </p>
              </div>

              <div className="p-3.5 bg-orange-50 dark:bg-orange-950/40 border-2 border-orange-500/30">
                <div className="font-heading font-extrabold uppercase text-xs text-orange-900 dark:text-orange-300">
                  Go Foods (1/4 Plate)
                </div>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1 leading-relaxed">
                  {nutritionGuide.plateGuide.go}
                </p>
              </div>

              <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 border-2 border-sky-500/30">
                <div className="font-heading font-extrabold uppercase text-xs text-sky-900 dark:text-sky-300">
                  Bone Builders
                </div>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1 leading-relaxed">
                  {nutritionGuide.plateGuide.calcium}
                </p>
              </div>
            </div>

            {/* Sample Day of Meals */}
            <div className="bg-neutral-50 dark:bg-neutral-800/60 p-4 border border-neutral-300 dark:border-neutral-700 space-y-2.5">
              <h4 className="font-heading font-bold uppercase text-xs md:text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#e65c00]" />
                Sample Day of Balanced Filipino Meals & Snacks
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                <div className="bg-white dark:bg-neutral-900 p-2.5 border border-neutral-200 dark:border-neutral-700">
                  <strong className="font-heading uppercase text-neutral-900 dark:text-neutral-100 block mb-0.5">
                    Breakfast (Always eat breakfast!):
                  </strong>
                  {nutritionGuide.sampleDay.breakfast}
                </div>
                <div className="bg-white dark:bg-neutral-900 p-2.5 border border-neutral-200 dark:border-neutral-700">
                  <strong className="font-heading uppercase text-neutral-900 dark:text-neutral-100 block mb-0.5">
                    Lunch:
                  </strong>
                  {nutritionGuide.sampleDay.lunch}
                </div>
                <div className="bg-white dark:bg-neutral-900 p-2.5 border border-neutral-200 dark:border-neutral-700">
                  <strong className="font-heading uppercase text-neutral-900 dark:text-neutral-100 block mb-0.5">
                    Dinner:
                  </strong>
                  {nutritionGuide.sampleDay.dinner}
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-900 p-2.5 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-700 dark:text-neutral-300">
                <strong className="font-heading uppercase text-neutral-900 dark:text-neutral-100 block mb-0.5">
                  Healthy Philippine Afternoon Snack:
                </strong>
                {nutritionGuide.sampleDay.afternoonSnack}
              </div>
            </div>

            {/* Water & Goal-Specific Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-800 text-xs text-neutral-800 dark:text-neutral-200">
                <div className="flex items-center gap-2 font-heading font-bold uppercase text-blue-900 dark:text-blue-300 mb-1">
                  <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Water Through the Day
                </div>
                <p className="leading-relaxed">{nutritionGuide.hydrationGuideline}</p>
              </div>

              <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-xs text-neutral-800 dark:text-neutral-200">
                <div className="flex items-center gap-2 font-heading font-bold uppercase text-emerald-900 dark:text-emerald-300 mb-1">
                  <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Tips for {currentPlan.goalTitle}
                </div>
                <ul className="space-y-1 list-disc list-inside">
                  {nutritionGuide.goalSpecificTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* =========================================================================
              SLEEP & RECOVERY GUIDANCE
          ========================================================================= */}
          <div className="bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-700 p-5 space-y-3">
            <h3 className="text-lg font-heading font-extrabold uppercase text-[#144e34] dark:text-[#84d9af] flex items-center gap-2">
              <Moon className="w-5 h-5 text-[#e65c00]" />
              Sleep & Body Recovery (8–10 Hours)
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Teenage muscles and brains recover during rest. Training without sleep leads to burnout and injury.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-neutral-700 dark:text-neutral-300 pt-1">
              {templateData.sleepGuidelines.tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-3 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#144e34] dark:text-[#84d9af] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
