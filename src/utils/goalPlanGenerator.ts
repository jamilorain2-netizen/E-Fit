import {
  StudentProfile,
  AssessmentRecord,
  StandardRow,
  GoalCategory,
  FitnessPlanLevel,
  StudentGoalPlan,
  WeekPlan,
  DayRoutine,
  RoutineExerciseDetail,
  FitnessTestKey,
  GoalPlanTemplateData,
} from '../types';
import { evaluateTestScore } from './scoring';

export interface WeakestAreaDetection {
  isComplete: boolean;
  testKey?: FitnessTestKey;
  testName?: string;
  category?: string;
  reason?: string;
}

/**
 * Evaluates student assessment to identify weakest test area.
 * If results are incomplete (less than 2 completed tests), flags incomplete.
 */
export function detectWeakestArea(
  assessment: AssessmentRecord | null,
  standards: StandardRow[],
  student: StudentProfile
): WeakestAreaDetection {
  if (!assessment) {
    return {
      isComplete: false,
      reason:
        'No assessment record found yet. Please complete your fitness tests first, or choose one of the other 4 goals.',
    };
  }

  const completedTests: {
    key: FitnessTestKey;
    name: string;
    scoreRank: number; // 1 = worst (needs_improvement), 4 = best (optimal)
    category: string;
  }[] = [];

  // 1. Step Test
  if (assessment.stepTest && assessment.stepTest.recoveryHr) {
    const res = evaluateTestScore(
      standards,
      'step_test',
      assessment.stepTest.recoveryHr,
      student.sex,
      student.age
    );
    const rank =
      res.status === 'needs_improvement'
        ? 1
        : res.status === 'fair'
        ? 2
        : res.status === 'good'
        ? 3
        : 4;
    completedTests.push({
      key: 'step_test',
      name: '3-Minute Step Test (Cardiovascular Endurance)',
      scoreRank: rank,
      category: res.category,
    });
  }

  // 2. Plank Test
  if (assessment.plankTest && assessment.plankTest.timeSeconds) {
    const res = evaluateTestScore(
      standards,
      'plank',
      assessment.plankTest.timeSeconds,
      student.sex,
      student.age
    );
    const rank =
      res.status === 'needs_improvement'
        ? 1
        : res.status === 'fair'
        ? 2
        : res.status === 'good'
        ? 3
        : 4;
    completedTests.push({
      key: 'plank',
      name: 'Basic Plank (Core Muscular Endurance)',
      scoreRank: rank,
      category: res.category,
    });
  }

  // 3. Push-Up Test
  if (assessment.pushUpTest && typeof assessment.pushUpTest.count === 'number') {
    const res = evaluateTestScore(
      standards,
      'push_up',
      assessment.pushUpTest.count,
      student.sex,
      student.age
    );
    const rank =
      res.status === 'needs_improvement'
        ? 1
        : res.status === 'fair'
        ? 2
        : res.status === 'good'
        ? 3
        : 4;
    completedTests.push({
      key: 'push_up',
      name: '90-Degree Push-Up (Upper Body Strength)',
      scoreRank: rank,
      category: res.category,
    });
  }

  // 4. Zipper Test
  if (assessment.zipperTest) {
    const rRes = evaluateTestScore(
      standards,
      'zipper_right',
      assessment.zipperTest.rightCm,
      student.sex,
      student.age
    );
    const lRes = evaluateTestScore(
      standards,
      'zipper_left',
      assessment.zipperTest.leftCm,
      student.sex,
      student.age
    );
    const worstStatus =
      rRes.status === 'needs_improvement' || lRes.status === 'needs_improvement'
        ? 1
        : rRes.status === 'fair' || lRes.status === 'fair'
        ? 2
        : 3;
    completedTests.push({
      key: 'zipper',
      name: 'Zipper Test (Upper Body Flexibility)',
      scoreRank: worstStatus,
      category: rRes.category || lRes.category,
    });
  }

  // 5. Sit-and-Reach
  if (assessment.sitAndReach && typeof assessment.sitAndReach.bestCm === 'number') {
    const res = evaluateTestScore(
      standards,
      'sit_and_reach',
      assessment.sitAndReach.bestCm,
      student.sex,
      student.age
    );
    const rank =
      res.status === 'needs_improvement'
        ? 1
        : res.status === 'fair'
        ? 2
        : res.status === 'good'
        ? 3
        : 4;
    completedTests.push({
      key: 'sit_and_reach',
      name: 'Sit-and-Reach (Hamstring & Lower Back Flexibility)',
      scoreRank: rank,
      category: res.category,
    });
  }

  // Must have at least 2 tests to accurately determine a weakest area
  if (completedTests.length < 2) {
    return {
      isComplete: false,
      reason: `Only ${completedTests.length} of 5 physical tests recorded. Please take more tests to pinpoint your weakest area, or choose one of the other 4 goals below.`,
    };
  }

  // Sort ascending by scoreRank (lowest rank = highest priority for improvement)
  completedTests.sort((a, b) => a.scoreRank - b.scoreRank);
  const weakest = completedTests[0];

  return {
    isComplete: true,
    testKey: weakest.key,
    testName: weakest.name,
    category: weakest.category,
    reason: `Your ${weakest.name} was rated "${weakest.category}", giving you the greatest opportunity for rapid breakthrough progress!`,
  };
}

/**
 * Suggests default fitness plan level from assessment results.
 */
export function suggestDefaultLevel(
  assessment: AssessmentRecord | null,
  standards: StandardRow[],
  student: StudentProfile
): FitnessPlanLevel {
  if (!assessment) return 'Beginner';

  const ratings: number[] = []; // 1 = needs_improvement, 2 = fair, 3 = good, 4 = optimal

  if (assessment.stepTest?.recoveryHr) {
    const r = evaluateTestScore(standards, 'step_test', assessment.stepTest.recoveryHr, student.sex, student.age);
    ratings.push(r.status === 'needs_improvement' ? 1 : r.status === 'fair' ? 2 : r.status === 'good' ? 3 : 4);
  }
  if (assessment.plankTest?.timeSeconds) {
    const r = evaluateTestScore(standards, 'plank', assessment.plankTest.timeSeconds, student.sex, student.age);
    ratings.push(r.status === 'needs_improvement' ? 1 : r.status === 'fair' ? 2 : r.status === 'good' ? 3 : 4);
  }
  if (typeof assessment.pushUpTest?.count === 'number') {
    const r = evaluateTestScore(standards, 'push_up', assessment.pushUpTest.count, student.sex, student.age);
    ratings.push(r.status === 'needs_improvement' ? 1 : r.status === 'fair' ? 2 : r.status === 'good' ? 3 : 4);
  }
  if (typeof assessment.sitAndReach?.bestCm === 'number') {
    const r = evaluateTestScore(standards, 'sit_and_reach', assessment.sitAndReach.bestCm, student.sex, student.age);
    ratings.push(r.status === 'needs_improvement' ? 1 : r.status === 'fair' ? 2 : r.status === 'good' ? 3 : 4);
  }

  if (ratings.length === 0) return 'Beginner';

  const avg = ratings.reduce((sum, n) => sum + n, 0) / ratings.length;
  if (avg <= 1.8) return 'Beginner';
  if (avg <= 2.8) return 'Building';
  return 'Active';
}

/**
 * Generates the full 4-week rule-based student plan based on user choices.
 */
export function generateStudentGoalPlan(
  student: StudentProfile,
  goalId: GoalCategory,
  daysPerWeek: number, // 3 to 7
  minutesPerDay: number, // 20, 30, 45, 60
  level: FitnessPlanLevel,
  assessment: AssessmentRecord | null,
  standards: StandardRow[],
  templateData: GoalPlanTemplateData
): StudentGoalPlan {
  const weakestDetection = detectWeakestArea(assessment, standards, student);
  const resolvedWeakest = goalId === 'weakest_area' ? weakestDetection.testKey : undefined;

  const suggestedLvl = suggestDefaultLevel(assessment, standards, student);
  const goalMeta = templateData.goalMetadata[goalId];

  // Schedule days distribution based on daysPerWeek (3 to 7)
  const daysOfWeek: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  // Map which days of the week are active vs rest/recovery
  const getActiveDayIndices = (count: number): number[] => {
    switch (count) {
      case 3:
        return [0, 2, 4]; // Mon, Wed, Fri
      case 4:
        return [0, 1, 3, 5]; // Mon, Tue, Thu, Sat
      case 5:
        return [0, 1, 2, 4, 5]; // Mon, Tue, Wed, Fri, Sat
      case 6:
        return [0, 1, 2, 3, 4, 5]; // Mon-Sat
      case 7:
      default:
        return [0, 1, 2, 3, 4, 5, 6]; // All days
    }
  };

  const activeIndices = getActiveDayIndices(daysPerWeek);
  const mainDuration = Math.max(10, minutesPerDay - 10); // 5m warm-up + 5m cool-down

  const choreNames = templateData.chores.map((c) => `${c.tagalogName} (${c.name})`);

  // Build 4 weeks
  const weekThemes = [
    {
      weekNumber: 1,
      themeTitle: 'Week 1: Foundation & Postural Form',
      progressionFocus:
        'Focus on controlled technique, steady breathing, and building a regular movement habit without rushing.',
    },
    {
      weekNumber: 2,
      themeTitle: 'Week 2: Rhythm & Steady Consistency',
      progressionFocus:
        'Add 1 extra repetition or extend intervals by 15 seconds. Keep your movement schedule regular.',
    },
    {
      weekNumber: 3,
      themeTitle: 'Week 3: Capacity & Confident Power',
      progressionFocus:
        'Test your progression with slightly shorter rest breaks or stepping up to the harder movement option.',
    },
    {
      weekNumber: 4,
      themeTitle: 'Week 4: Peak & Lifelong Habit',
      progressionFocus:
        'Celebrate your consistency! Execute with full control and prepare to sustain these habits for school PE and life.',
    },
  ];

  const weeks: WeekPlan[] = weekThemes.map((theme) => {
    const days: DayRoutine[] = daysOfWeek.map((dayName, dayIdx) => {
      const isActive = activeIndices.includes(dayIdx);

      if (!isActive) {
        // Rest / Light Activity Day
        return {
          dayName,
          isRestDay: true,
          title: 'Active Recovery & Rest',
          focusType: 'rest',
          warmUpMin: 3,
          warmUpExercises: ['Gentle shoulder rolls', 'Deep diaphragmatic breathing'],
          mainMin: 0,
          mainActivityTitle: 'Full Rest & Light Household Chores',
          mainExercises: [
            {
              name: 'Mindful Recovery & Hydration',
              instruction:
                'Allow your muscles to repair and rebuild. Drink water, read, review schoolwork, or take a peaceful walk.',
              easier: 'Light sitting stretches and quiet rest.',
              harder: '15-minute relaxed family stroll around the neighborhood.',
              setsReps: 'Full day rest',
            },
          ],
          coolDownMin: 2,
          coolDownExercises: ['Gentle neck rolls and relaxed stretches'],
          chores: [choreNames[dayIdx % choreNames.length]],
          whoTip:
            'WHO Guideline reminder: Rest days allow muscles to adapt and grow stronger. Even gentle household chores count as bonus light movement!',
        };
      }

      // Active Day - Determine Focus
      // About 3 days strengthening per week, aerobic on most days, flexibility included
      const activeOrder = activeIndices.indexOf(dayIdx);
      let dayFocus: 'aerobic' | 'strength' | 'flexibility' | 'mixed' = 'mixed';

      if (goalId === 'strength') {
        dayFocus = activeOrder % 2 === 0 ? 'strength' : 'mixed';
      } else if (goalId === 'endurance') {
        dayFocus = activeOrder % 2 === 0 ? 'aerobic' : 'mixed';
      } else if (goalId === 'flexibility') {
        dayFocus = activeOrder % 2 === 0 ? 'flexibility' : 'mixed';
      } else if (goalId === 'weakest_area') {
        if (resolvedWeakest === 'step_test') {
          dayFocus = activeOrder % 2 === 0 ? 'aerobic' : 'mixed';
        } else if (resolvedWeakest === 'push_up' || resolvedWeakest === 'plank') {
          dayFocus = activeOrder % 2 === 0 ? 'strength' : 'mixed';
        } else {
          dayFocus = activeOrder % 2 === 0 ? 'flexibility' : 'mixed';
        }
      } else {
        // active_energy
        dayFocus = activeOrder === 0 ? 'aerobic' : activeOrder === 1 ? 'strength' : 'mixed';
      }

      // Generate exercises tailored to focus, level, and week
      const exercises = getDayExercises(
        dayFocus,
        goalId,
        level,
        theme.weekNumber,
        templateData,
        resolvedWeakest
      );

      const assignedChores = [
        choreNames[dayIdx % choreNames.length],
        choreNames[(dayIdx + 2) % choreNames.length],
      ];

      return {
        dayName,
        isRestDay: false,
        title: getDayTitle(dayFocus, goalId),
        focusType: dayFocus,
        warmUpMin: 5,
        warmUpExercises: [
          'Arm swings & shoulder rolls (1 min)',
          'High knee marching & gentle torso twists (2 min)',
          'Light half-squats & ankle circles (2 min)',
        ],
        mainMin: mainDuration,
        mainActivityTitle: `${mainDuration}-Minute Main Conditioning Circuit`,
        mainExercises: exercises,
        coolDownMin: 5,
        coolDownExercises: [
          'Standing or seated hamstring stretch (20s each side)',
          'Quad and hip flexor stretch with support (20s each side)',
          'Shoulder reach & calm deep breathing (2 min)',
        ],
        chores: assignedChores,
        whoTip:
          'WHO Guideline: Adolescents aim for an average of at least 60 minutes/day of moderate-to-vigorous activity. This session plus everyday chores gets you right on track!',
      };
    });

    return {
      weekNumber: theme.weekNumber,
      themeTitle: theme.themeTitle,
      progressionFocus: theme.progressionFocus,
      days,
    };
  });

  return {
    id: `plan-${student.id}-${Date.now()}`,
    studentId: student.id,
    goalId,
    goalTitle: goalMeta.title,
    resolvedWeakestTest: resolvedWeakest,
    daysPerWeek,
    minutesPerDay,
    level,
    suggestedLevel: suggestedLvl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    weeks,
    completedDays: {},
    reflections: {},
  };
}

function getDayTitle(focus: string, goal: GoalCategory): string {
  if (focus === 'aerobic') return 'Aerobic Stamina & Dynamic Movement';
  if (focus === 'strength') return 'Bodyweight Strength & Postural Stability';
  if (focus === 'flexibility') return 'Total Body Mobility & Range of Motion';
  return 'Mixed Movement & Functional Fitness';
}

function getDayExercises(
  focus: string,
  goal: GoalCategory,
  level: FitnessPlanLevel,
  week: number,
  templateData: GoalPlanTemplateData,
  weakestKey?: FitnessTestKey
): RoutineExerciseDetail[] {
  const exMap = new Map(templateData.exercises.map((e) => [e.id, e]));

  // Scale sets/reps by level and week
  const repMultiplier = level === 'Beginner' ? 1 : level === 'Building' ? 1.3 : 1.6;
  const weekBonus = (week - 1) * 2;

  const formatReps = (baseReps: number, isSeconds = false): string => {
    const total = Math.round(baseReps * repMultiplier) + weekBonus;
    return isSeconds ? `${total} seconds` : `${total} repetitions`;
  };

  const details: RoutineExerciseDetail[] = [];

  const add = (id: string, repsText: string) => {
    const item = exMap.get(id);
    if (item) {
      details.push({
        name: item.name,
        instruction: item.instruction,
        easier: item.easier,
        harder: item.harder,
        setsReps: repsText,
      });
    }
  };

  if (focus === 'aerobic' || goal === 'endurance') {
    add('ex-brisk-walk', `Warm-up transition: ${formatReps(3, true)} brisk pacing`);
    add('ex-jog-intervals', `3–4 sets of ${formatReps(45, true)} jog / walk intervals`);
    add('ex-jump-rope', `3 rounds of ${formatReps(30, true)} continuous skip`);
    add('ex-patintero', `3 sets of ${formatReps(30, true)} active agility shuffles`);
  } else if (focus === 'strength' || goal === 'strength') {
    add('ex-modified-pushups', `3 sets of ${formatReps(8)}`);
    add('ex-squats', `3 sets of ${formatReps(10)}`);
    add('ex-lunges', `2 sets of ${formatReps(8)} per leg`);
    add('ex-plank-variations', `3 sets of ${formatReps(25, true)} hold`);
    add('ex-glute-bridges', `3 sets of ${formatReps(12)}`);
  } else if (focus === 'flexibility' || goal === 'flexibility') {
    add('ex-shoulder-stretches', `3 sets of ${formatReps(20, true)} hold each side`);
    add('ex-hamstring-stretch', `3 sets of ${formatReps(25, true)} hold each leg`);
    add('ex-hip-stretches', `3 sets of ${formatReps(25, true)} hold`);
    add('ex-dance', `5 minutes of fluid rhythmic movement`);
  } else {
    // Mixed
    add('ex-squats', `2 sets of ${formatReps(10)}`);
    add('ex-modified-pushups', `2 sets of ${formatReps(8)}`);
    add('ex-dance', `3–5 minutes of continuous rhythm`);
    add('ex-plank-variations', `2 sets of ${formatReps(20, true)} hold`);
    add('ex-hamstring-stretch', `2 sets of ${formatReps(20, true)} gentle hold`);
  }

  // If weakest_area is active, emphasize the targeted exercise first
  if (weakestKey === 'step_test') {
    add('ex-jog-intervals', `Targeted focus: 4 sets of interval jogging`);
  } else if (weakestKey === 'push_up') {
    add('ex-modified-pushups', `Targeted focus: 3 sets with strict 90-degree form`);
  } else if (weakestKey === 'plank') {
    add('ex-plank-variations', `Targeted focus: 3 sets with hollow body core brace`);
  } else if (weakestKey === 'zipper') {
    add('ex-shoulder-stretches', `Targeted focus: Shoulder reach with towel clasp`);
  } else if (weakestKey === 'sit_and_reach') {
    add('ex-hamstring-stretch', `Targeted focus: Seated flat-back hamstring stretch`);
  }

  return details;
}
