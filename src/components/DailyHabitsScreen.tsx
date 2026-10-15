import React from 'react';
import {
  CalendarCheck,
  Droplets,
  Home,
  Sparkles,
  Activity,
  Apple,
  Moon,
  CheckCircle2,
  HeartHandshake,
  RotateCcw,
} from 'lucide-react';
import { DailyHabit, StudentProfile } from '../types';

interface DailyHabitsScreenProps {
  student: StudentProfile;
  habits: DailyHabit[];
  onToggleHabit: (id: string) => void;
  onResetHabits: () => void;
}

export const DailyHabitsScreen: React.FC<DailyHabitsScreenProps> = ({
  student,
  habits,
  onToggleHabit,
  onResetHabits,
}) => {
  const completedCount = habits.filter((h) => h.completed).length;
  const progressPercent = Math.round((completedCount / habits.length) * 100);

  const getHabitIcon = (category: DailyHabit['category']) => {
    switch (category) {
      case 'hydration':
        return <Droplets className="w-5 h-5 text-sky-500" />;
      case 'chores':
        return <Home className="w-5 h-5 text-amber-500" />;
      case 'activity':
        return <Sparkles className="w-5 h-5 text-emerald-500" />;
      case 'stretch':
        return <Activity className="w-5 h-5 text-teal-500" />;
      case 'nutrition':
        return <Apple className="w-5 h-5 text-rose-500" />;
      case 'sleep':
        return <Moon className="w-5 h-5 text-indigo-500" />;
      default:
        return <HeartHandshake className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Container */}
      <div className="bg-white dark:bg-[#141c18] rounded-xs border-2 border-[#144e34] dark:border-[#227e56] shadow-xs overflow-hidden">
        {/* Banner */}
        <div className="bg-[#103d29] dark:bg-[#082115] text-white px-6 py-5 border-b-2 border-[#196343] dark:border-[#1e4832] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading uppercase text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-2">
              <CalendarCheck className="w-7 h-7 text-[#7fd2ad]" />
              <span>DAILY HEALTHY HABIT GOALS</span>
            </h1>
            <p className="text-xs text-[#a0cbb5] mt-0.5 font-sans">
              Encouraging, supportive daily habits for {student.fullName} — not rigid tests or pass/fail requirements!
            </p>
          </div>

          <button
            type="button"
            onClick={onResetHabits}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082115] hover:bg-[#103d29] text-[#d6e8de] text-xs font-heading uppercase tracking-wider font-bold rounded-xs border border-[#196343] transition-colors self-start sm:self-center"
            title="Reset today's checks"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Today</span>
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Progress Bar & Encouragement - Scoreboard Metric Card */}
          <div className="bg-[#faf9f5] dark:bg-[#0e1411] border-2 border-[#144e34] dark:border-[#227e56] rounded-xs p-5">
            <div className="flex items-center justify-between text-xs font-heading uppercase font-extrabold tracking-wider text-stone-900 dark:text-stone-100 mb-2">
              <span>TODAY'S HEALTHY RHYTHMS: {completedCount} OF {habits.length} COMPLETE</span>
              <span className="font-scoreboard text-lg text-[#0d3221] dark:text-[#4cb988]">{progressPercent}%</span>
            </div>
            <div className="w-full bg-stone-200 dark:bg-stone-800 h-3 rounded-xs overflow-hidden border border-stone-300 dark:border-stone-700">
              <div
                className="bg-[#144e34] dark:bg-[#227e56] h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-300 mt-2.5 font-sans">
              {progressPercent === 100
                ? 'Mabuhay! You completed all healthy goals today! Keep taking wonderful care of your growing body.'
                : progressPercent >= 50
                ? 'Great momentum today! Every single moment of movement, water, and rest counts.'
                : 'Small consistent habits build lifelong strength and vitality.'}
            </p>
          </div>

          {/* Habits Checklist */}
          <div className="space-y-3">
            {habits.map((habit) => (
              <div
                key={habit.id}
                onClick={() => onToggleHabit(habit.id)}
                className={`p-4 rounded-xs border-2 transition-all cursor-pointer select-none flex items-start gap-3.5 ${
                  habit.completed
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-[#144e34] dark:border-[#227e56]'
                    : 'bg-white dark:bg-[#141c18] border-stone-300 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-[#1a2520]'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={habit.completed}
                    onChange={() => {}} // Controlled via card click
                    className="w-5 h-5 text-[#144e34] rounded-xs border-stone-400 focus:ring-[#144e34] cursor-pointer"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0">{getHabitIcon(habit.category)}</span>
                    <span
                      className={`font-heading uppercase font-bold text-sm tracking-wide ${
                        habit.completed
                          ? 'text-emerald-900 dark:text-emerald-200 line-through opacity-85'
                          : 'text-stone-900 dark:text-stone-100'
                      }`}
                    >
                      {habit.title}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed font-sans">
                    {habit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* WHO Guideline Note */}
          <div className="pt-4 border-t-2 border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 space-y-1.5 font-sans">
            <div className="font-heading uppercase font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#d95f02]" />
              <span>WHO PHYSICAL ACTIVITY GUIDELINE FOR YOUTH (AGES 5–17)</span>
            </div>
            <p className="leading-relaxed">
              Children and adolescents should do an <strong>average of 60 minutes per day</strong> of moderate-to-vigorous physical activity across the week, mostly aerobic. This can be built up gradually throughout the day through fun active play, walking, games, and active chores.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
