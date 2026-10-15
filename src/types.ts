export type Sex = 'male' | 'female';

export type UserRole = 'student' | 'teacher';

export type JuniorHighGrade = 'Grade 7' | 'Grade 8' | 'Grade 9' | 'Grade 10';

export type FitnessTestKey =
  | 'step_test'
  | 'plank'
  | 'push_up'
  | 'zipper'
  | 'sit_and_reach'
  | 'bmi';

export interface FormChecklistItem {
  aspect: string;
  correct: string;
  incorrect: string;
}

export interface StudentProfile {
  id: string;
  lrnOrId: string; // 12-digit DepEd LRN or ID
  classCode?: string; // 6-character Teacher Class Code
  pinHash?: string; // SHA-256 hashed 4-digit PIN
  fullName: string;
  age: number; // roughly 12 to 16 for Junior High School
  sex: Sex;
  gradeLevel: JuniorHighGrade; // Only Grades 7, 8, 9, 10
  section: string;
  schoolName: string;
  teacherName: string;
  assessmentDate: string; // YYYY-MM-DD
  safetyAcknowledged: boolean;
  safetyAcknowledgedDate?: string;
  flaggedForGuidance?: boolean;
  guidanceReason?: string;
  fitnessGoalSummary?: {
    goalId: GoalCategory;
    goalTitle: string;
    level: FitnessPlanLevel;
    daysPerWeek: number;
    minutesPerDay: number;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StepTestData {
  restingHr: number; // bpm
  recoveryHr: number; // bpm
  durationSeconds: number; // default 180s (3:00)
  cadenceBpm: number; // e.g. 96
  recoveryIntervalSeconds: number; // e.g. 60s
  completed: boolean;
  difference: number; // recovery - resting
  date: string;
  notes?: string;
}

export interface PlankTestData {
  timeSeconds: number; // e.g. 75s
  stoppedDueToForm: boolean;
  date: string;
  notes?: string;
}

export interface PushUpTestData {
  count: number;
  variation: string; // "90-Degree Standard" | "Modified / Kneeling" | etc.
  teacherVerified: boolean;
  verifierName?: string;
  date: string;
  notes?: string;
}

export interface ZipperTestData {
  rightCm: number; // positive = overlap, negative = gap
  leftCm: number;
  convention: 'overlap_positive' | 'gap_positive';
  date: string;
  notes?: string;
}

export interface SitAndReachData {
  trials: number[]; // e.g. [25, 27, 28]
  bestCm: number;
  date: string;
  notes?: string;
}

export interface BmiData {
  weightKg: number;
  heightCm: number;
  bmiValue: number;
  date: string;
  notes?: string;
}

export interface AssessmentRecord {
  id: string;
  studentId: string;
  date: string;
  termLabel?: string; // e.g. "Pre-Test (Q1)", "Mid-Year", "Post-Test (Q4)"
  stepTest?: StepTestData;
  plankTest?: PlankTestData;
  pushUpTest?: PushUpTestData;
  zipperTest?: ZipperTestData;
  sitAndReach?: SitAndReachData;
  bmi?: BmiData;
}

export interface StandardRow {
  id: string;
  test: 'step_test' | 'plank' | 'push_up' | 'zipper_right' | 'zipper_left' | 'sit_and_reach' | 'bmi';
  protocol: string;
  sex: 'male' | 'female' | 'all';
  age_min: number;
  age_max: number;
  unit: string;
  category: string;
  min: number;
  max: number;
  source: string;
  version: string;
}

export interface InterpretationResult {
  category: string;
  status: 'optimal' | 'good' | 'fair' | 'needs_improvement' | 'unconfigured' | 'screening_notice';
  meaning: string;
  recommendation: string;
  retestGuidance: string;
  source: string;
  isConfigured: boolean;
}

export interface VideoConfigItem {
  url: string;
  credit?: string; // Optional "Video by [channel]" credit line
}

export interface TeacherConfig {
  classCode?: string; // Short 6-character Class Code for students to join
  teacherPin: string; // Default '1234'
  stepTestCadence: number; // default 96 bpm
  stepRecoveryIntervalSeconds: number; // default 60s
  zipperConvention: 'overlap_positive' | 'gap_positive';
  pushUpVariations: string[];
  videoConfigs: Record<FitnessTestKey, VideoConfigItem>;
  defaultSchoolName: string;
  defaultTeacherName: string;
}

export interface DailyHabit {
  id: string;
  title: string;
  description: string;
  category: 'activity' | 'chores' | 'nutrition' | 'hydration' | 'sleep' | 'stretch';
  icon: string;
  completed: boolean;
}

// ---------------------------------------------
// FITNESS GOAL PLAN TYPES
// ---------------------------------------------

export type GoalCategory =
  | 'endurance'
  | 'strength'
  | 'flexibility'
  | 'active_energy'
  | 'weakest_area';

export type FitnessPlanLevel = 'Beginner' | 'Building' | 'Active';

export interface ExerciseItem {
  id: string;
  name: string;
  category: 'aerobic' | 'strength' | 'flexibility' | 'warmup' | 'cooldown';
  instruction: string;
  easier: string;
  harder: string;
}

export interface ChoreItem {
  id: string;
  name: string;
  tagalogName: string;
  description: string;
  benefit: string;
}

export interface GoalNutritionGuide {
  goalId: GoalCategory;
  plateGuide: {
    glow: string;
    grow: string;
    go: string;
    calcium: string;
  };
  sampleDay: {
    breakfast: string;
    morningSnack: string;
    lunch: string;
    afternoonSnack: string;
    dinner: string;
  };
  hydrationGuideline: string;
  goalSpecificTips: string[];
}

export interface RoutineExerciseDetail {
  name: string;
  instruction: string;
  easier: string;
  harder: string;
  setsReps?: string;
}

export interface DayRoutine {
  dayName: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isRestDay: boolean;
  title: string;
  focusType: 'aerobic' | 'strength' | 'flexibility' | 'mixed' | 'active_recovery' | 'rest';
  warmUpMin: number;
  warmUpExercises: string[];
  mainMin: number;
  mainActivityTitle: string;
  mainExercises: RoutineExerciseDetail[];
  coolDownMin: number;
  coolDownExercises: string[];
  chores: string[];
  whoTip: string;
}

export interface WeekPlan {
  weekNumber: number;
  themeTitle: string;
  progressionFocus: string;
  days: DayRoutine[];
}

export interface StudentGoalPlan {
  id: string;
  studentId: string;
  goalId: GoalCategory;
  goalTitle: string;
  resolvedWeakestTest?: FitnessTestKey;
  daysPerWeek: number; // 3 to 7
  minutesPerDay: number; // 20, 30, 45, 60
  level: FitnessPlanLevel;
  suggestedLevel: FitnessPlanLevel;
  createdAt: string;
  updatedAt: string;
  weeks: WeekPlan[]; // 4 weeks
  completedDays: Record<string, boolean>; // e.g. "w1-Monday": true
  reflections: Record<number, { feltGood: string; wasHard: string; updatedAt: string }>;
}

export interface GoalPlanTemplateData {
  version: string;
  safetyNotice: string;
  exercises: ExerciseItem[];
  chores: ChoreItem[];
  nutritionGuides: Record<GoalCategory, GoalNutritionGuide>;
  sleepGuidelines: {
    recommendedHours: string;
    tips: string[];
  };
  goalMetadata: Record<
    GoalCategory,
    {
      title: string;
      tagline: string;
      description: string;
      targetFocus: string;
    }
  >;
}
