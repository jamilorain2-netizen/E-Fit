import {
  StudentProfile,
  AssessmentRecord,
  StandardRow,
  DailyHabit,
} from '../types';
import { evaluateTestScore } from './scoring';

export const DEFAULT_HABITS: DailyHabit[] = [
  {
    id: 'habit-water',
    title: 'Hydrate Regularly',
    description: 'Drank clean water throughout the day, especially before and during active play.',
    category: 'hydration',
    icon: 'Droplets',
    completed: false,
  },
  {
    id: 'habit-chores',
    title: 'Movement via Chores',
    description: 'Helped at home (sweeping floors, mopping, gardening, folding clothes, or tidying) with no strict minutes.',
    category: 'chores',
    icon: 'Home',
    completed: false,
  },
  {
    id: 'habit-play',
    title: 'Active Play / Games',
    description: 'Played games (patintero, habulan, jump rope, biking, dancing) aiming for 60 min of daily movement.',
    category: 'activity',
    icon: 'Sparkles',
    completed: false,
  },
  {
    id: 'habit-stretch',
    title: 'Gentle Mobility & Stretches',
    description: 'Did shoulder rolls, toe touches, or stretches during study breaks.',
    category: 'stretch',
    icon: 'Activity',
    completed: false,
  },
  {
    id: 'habit-nutrition',
    title: 'Balanced Nourishment',
    description: 'Fueled my body with varied colorful food (vegetables, protein, rice, fruit) with no restrictive diets.',
    category: 'nutrition',
    icon: 'Apple',
    completed: false,
  },
  {
    id: 'habit-sleep',
    title: 'Restful Sleep (8–10 hrs)',
    description: 'Gave growing muscles and mind adequate sleep for recovery and brain focus.',
    category: 'sleep',
    icon: 'Moon',
    completed: false,
  },
];

// CSV export/import for standards table
export function exportStandardsToCSV(standards: StandardRow[]): string {
  const headers = [
    'id',
    'test',
    'protocol',
    'sex',
    'age_min',
    'age_max',
    'unit',
    'category',
    'min',
    'max',
    'source',
    'version',
  ];

  const rows = standards.map((s) => [
    `"${s.id}"`,
    `"${s.test}"`,
    `"${s.protocol.replace(/"/g, '""')}"`,
    `"${s.sex}"`,
    s.age_min,
    s.age_max,
    `"${s.unit}"`,
    `"${s.category.replace(/"/g, '""')}"`,
    s.min,
    s.max,
    `"${s.source.replace(/"/g, '""')}"`,
    `"${s.version.replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function parseCSVToStandards(csvContent: string): StandardRow[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length <= 1) return [];

  const results: StandardRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cells: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        if (inQuotes && line[c + 1] === '"') {
          cur += '"';
          c++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(cur);
        cur = '';
      } else {
        cur += char;
      }
    }
    cells.push(cur);

    if (cells.length >= 10) {
      results.push({
        id: cells[0] || `std-${Date.now()}-${i}`,
        test: (cells[1] || 'step_test') as StandardRow['test'],
        protocol: cells[2] || '',
        sex: (cells[3] || 'all') as StandardRow['sex'],
        age_min: parseFloat(cells[4]) || 12,
        age_max: parseFloat(cells[5]) || 16,
        unit: cells[6] || '',
        category: cells[7] || 'Standard',
        min: parseFloat(cells[8]) || 0,
        max: parseFloat(cells[9]) || 999,
        source: cells[10] || 'SAMPLE - REPLACE WITH DepEd VALUES',
        version: cells[11] || '2026.1',
      });
    }
  }

  return results;
}

// Class Summary CSV Export for Teachers
export function exportClassSummaryToCSV(
  students: StudentProfile[],
  assessments: AssessmentRecord[],
  standards: StandardRow[]
): string {
  const headers = [
    'LRN_or_ID',
    'Full_Name',
    'Grade_Level',
    'Section',
    'Age',
    'Sex',
    'Assessment_Date',
    'Step_Test_Recovery_BPM',
    'Step_Test_Rating',
    'Plank_Seconds',
    'Plank_Rating',
    'Push_Up_Count',
    'Push_Up_Verified',
    'Push_Up_Rating',
    'Zipper_Right_cm',
    'Zipper_Left_cm',
    'Sit_And_Reach_Best_cm',
    'Sit_And_Reach_Rating',
    'Weight_kg',
    'Height_cm',
    'BMI_Value',
    'BMI_Screening_Category',
    'Flagged_For_Guidance',
    'Guidance_Reason',
  ];

  const rows = students.map((s) => {
    // Find latest assessment for student
    const studentAssessments = assessments
      .filter((a) => a.studentId === s.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const a = studentAssessments[0];

    // Ratings
    const stepRating = a?.stepTest
      ? evaluateTestScore(standards, 'step_test', a.stepTest.recoveryHr, s.sex, s.age).category
      : 'Incomplete';
    const plankRating = a?.plankTest
      ? evaluateTestScore(standards, 'plank', a.plankTest.timeSeconds, s.sex, s.age).category
      : 'Incomplete';
    const pushUpRating = a?.pushUpTest
      ? evaluateTestScore(standards, 'push_up', a.pushUpTest.count, s.sex, s.age).category
      : 'Incomplete';
    const snrRating = a?.sitAndReach
      ? evaluateTestScore(standards, 'sit_and_reach', a.sitAndReach.bestCm, s.sex, s.age).category
      : 'Incomplete';
    const bmiRating = a?.bmi
      ? evaluateTestScore(standards, 'bmi', a.bmi.bmiValue, s.sex, s.age).category
      : 'Incomplete';

    return [
      `"${s.lrnOrId}"`,
      `"${s.fullName.replace(/"/g, '""')}"`,
      `"${s.gradeLevel}"`,
      `"${s.section.replace(/"/g, '""')}"`,
      s.age,
      `"${s.sex}"`,
      `"${a?.date || s.assessmentDate}"`,
      a?.stepTest?.recoveryHr ?? 'N/A',
      `"${stepRating}"`,
      a?.plankTest?.timeSeconds ?? 'N/A',
      `"${plankRating}"`,
      a?.pushUpTest?.count ?? 'N/A',
      a?.pushUpTest?.teacherVerified ? 'Yes' : 'No',
      `"${pushUpRating}"`,
      a?.zipperTest?.rightCm ?? 'N/A',
      a?.zipperTest?.leftCm ?? 'N/A',
      a?.sitAndReach?.bestCm ?? 'N/A',
      `"${snrRating}"`,
      a?.bmi?.weightKg ?? 'N/A',
      a?.bmi?.heightCm ?? 'N/A',
      a?.bmi?.bmiValue ?? 'N/A',
      `"${bmiRating}"`,
      s.flaggedForGuidance ? 'FLAGGED' : 'No',
      `"${(s.guidanceReason || '').replace(/"/g, '""')}"`,
    ];
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

// Bulk Class List CSV Import parser
export function parseClassListCSV(csvContent: string): Partial<StudentProfile>[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length <= 1) return [];

  const students: Partial<StudentProfile>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
    if (parts.length >= 2) {
      const lrn = parts[0];
      const fullName = parts[1];
      const grade = parts[2] || 'Grade 7';
      const section = parts[3] || '';
      const age = parseInt(parts[4], 10) || 13;
      const sex = parts[5]?.toLowerCase().startsWith('m') ? 'male' : 'female';

      // Validate Junior High Grade
      let validGrade: StudentProfile['gradeLevel'] = 'Grade 7';
      if (grade.includes('8')) validGrade = 'Grade 8';
      else if (grade.includes('9')) validGrade = 'Grade 9';
      else if (grade.includes('10')) validGrade = 'Grade 10';

      students.push({
        lrnOrId: lrn,
        fullName,
        gradeLevel: validGrade,
        section,
        age: Math.max(12, Math.min(18, age)),
        sex,
      });
    }
  }

  return students;
}
