/**
 * Storage Service Layer
 * Abstracts data access so local storage can seamlessly be swapped with Firebase Firestore or Cloud SQL later.
 */

import {
  StudentProfile,
  AssessmentRecord,
  StandardRow,
  TeacherConfig,
  DailyHabit,
  UserRole,
  StudentGoalPlan,
  GoalPlanTemplateData,
} from '../types';
import {
  DEFAULT_STANDARDS,
  DEFAULT_TEACHER_CONFIG,
} from '../data/defaultStandards';
import { DEFAULT_GOAL_PLAN_TEMPLATE_DATA } from '../data/defaultGoalPlans';

const STORAGE_KEYS = {
  STUDENTS: 'studentfit_jhs_students_v3',
  ACTIVE_STUDENT_ID: 'studentfit_active_student_id_v3',
  CURRENT_ROLE: 'studentfit_current_role_v3',
  ASSESSMENTS: 'studentfit_jhs_assessments_v3',
  STANDARDS: 'studentfit_jhs_standards_v2',
  TEACHER_CONFIG: 'studentfit_jhs_teacher_config_v2',
  DAILY_HABITS: 'studentfit_jhs_daily_habits_v2',
  DATA_PRIVACY_ACK: 'studentfit_data_privacy_acknowledged_v2',
  GOAL_PLAN_TEMPLATES: 'studentfit_jhs_goal_templates_v2',
  STUDENT_GOAL_PLANS: 'studentfit_jhs_student_goal_plans_v2',
};



// Roster and assessment records start 100% empty by default.
// Populated in real time via student self-enrollment and Firestore onSnapshot.

export const StorageService = {
  // Students
  getStudents(): StudentProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error fetching students', e);
    }
    this.saveStudents([]);
    return [];
  },

  saveStudents(students: StudentProfile[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error('Error saving students', e);
    }
  },

  getStudentById(id: string): StudentProfile | null {
    const list = this.getStudents();
    return list.find((s) => s.id === id) || null;
  },

  getStudentByLrn(lrn: string): StudentProfile | null {
    const clean = lrn.trim().toLowerCase();
    const list = this.getStudents();
    return list.find((s) => s.lrnOrId.trim().toLowerCase() === clean) || null;
  },

  saveStudent(student: StudentProfile): StudentProfile {
    const list = this.getStudents();
    const index = list.findIndex((s) => s.id === student.id);
    let updated: StudentProfile[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...student, updatedAt: new Date().toISOString() };
    } else {
      updated = [...list, { ...student, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
    }
    this.saveStudents(updated);
    return student;
  },

  deleteStudent(id: string): void {
    const list = this.getStudents();
    const updated = list.filter((s) => s.id !== id);
    this.saveStudents(updated);

    // Also remove their assessment records
    const assessments = this.getAllAssessments();
    const filteredAssessments = assessments.filter((a) => a.studentId !== id);
    this.saveAllAssessments(filteredAssessments);
  },

  // Active Session & Access
  getActiveStudentId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_STUDENT_ID);
  },

  setActiveStudentId(id: string | null): void {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_STUDENT_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_STUDENT_ID);
    }
  },

  getCurrentRole(): UserRole {
    const role = localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE);
    return (role as UserRole) || 'student';
  },

  setCurrentRole(role: UserRole): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, role);
  },

  // Data Privacy Act
  getDataPrivacyAcknowledged(): boolean {
    return localStorage.getItem(STORAGE_KEYS.DATA_PRIVACY_ACK) === 'true';
  },

  setDataPrivacyAcknowledged(value: boolean): void {
    localStorage.setItem(STORAGE_KEYS.DATA_PRIVACY_ACK, value ? 'true' : 'false');
  },

  // Assessments (Multi-record history support)
  getAllAssessments(): AssessmentRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error fetching assessments', e);
    }
    this.saveAllAssessments([]);
    return [];
  },

  saveAllAssessments(records: AssessmentRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(records));
    } catch (e) {
      console.error('Error saving assessments', e);
    }
  },

  getStudentAssessments(studentId: string): AssessmentRecord[] {
    const all = this.getAllAssessments();
    return all
      .filter((a) => a.studentId === studentId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  getLatestStudentAssessment(studentId: string): AssessmentRecord | null {
    const records = this.getStudentAssessments(studentId);
    if (records.length === 0) return null;
    return records[records.length - 1];
  },

  saveAssessment(record: AssessmentRecord): AssessmentRecord {
    const all = this.getAllAssessments();
    const index = all.findIndex((a) => a.id === record.id);
    let updated: AssessmentRecord[];
    if (index >= 0) {
      updated = [...all];
      updated[index] = record;
    } else {
      updated = [...all, record];
    }
    this.saveAllAssessments(updated);
    return record;
  },

  // Standards Table
  getStandards(): StandardRow[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STANDARDS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error fetching standards', e);
    }
    this.saveStandards(DEFAULT_STANDARDS);
    return DEFAULT_STANDARDS;
  },

  saveStandards(standards: StandardRow[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STANDARDS, JSON.stringify(standards));
    } catch (e) {
      console.error('Error saving standards', e);
    }
  },

  // Teacher Configuration
  getTeacherConfig(): TeacherConfig {
    const startingVideoConfigs = {
      step_test: { url: 'https://youtu.be/ePttoUZHMk4?si=ayRFn83kwQF9aLLm', credit: 'DepEd PE & Sports Bureau' },
      plank: { url: 'https://youtu.be/pSHjTRCQxIw?si=7meAgJm5rcT7Ttl7', credit: 'Physical Fitness Demonstration Channel' },
      push_up: { url: 'https://youtu.be/IODxDxX7oi4?si=gacP3vatHcQP9sP4', credit: 'DepEd Fitness Testing Team' },
      zipper: { url: 'https://youtu.be/wk3Pv_OnFno?si=hU4bYUvPaIAQmsUE', credit: 'Health-Related Fitness Tutorials' },
      sit_and_reach: { url: 'https://youtu.be/SIK1TL_ARAw?si=7j-K8eptob9rs6xp', credit: 'Philippine Physical Education Network' },
      bmi: { url: '', credit: '' },
    };

    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEACHER_CONFIG);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_TEACHER_CONFIG,
          classCode: parsed.classCode || 'JH7X9K',
          ...parsed,
          videoConfigs: {
            ...startingVideoConfigs,
            ...DEFAULT_TEACHER_CONFIG.videoConfigs,
            ...(parsed.videoConfigs || {}),
          },
        };
      }
    } catch (e) {
      console.error('Error fetching teacher config', e);
    }
    const defaultConfig: TeacherConfig = {
      ...DEFAULT_TEACHER_CONFIG,
      classCode: 'JH7X9K',
      videoConfigs: startingVideoConfigs,
    };
    this.saveTeacherConfig(defaultConfig);
    return defaultConfig;
  },

  saveTeacherConfig(config: TeacherConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TEACHER_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Error saving teacher config', e);
    }
  },

  // Daily Habits
  getDailyHabits(): DailyHabit[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAILY_HABITS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error fetching daily habits', e);
    }
    return [];
  },

  saveDailyHabits(habits: DailyHabit[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_HABITS, JSON.stringify(habits));
    } catch (e) {
      console.error('Error saving daily habits', e);
    }
  },

  // Goal Plan Templates (Editable by Teacher)
  getGoalPlanTemplates(): GoalPlanTemplateData {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GOAL_PLAN_TEMPLATES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading goal plan templates', e);
    }
    this.saveGoalPlanTemplates(DEFAULT_GOAL_PLAN_TEMPLATE_DATA);
    return DEFAULT_GOAL_PLAN_TEMPLATE_DATA;
  },

  saveGoalPlanTemplates(templates: GoalPlanTemplateData): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GOAL_PLAN_TEMPLATES, JSON.stringify(templates));
    } catch (e) {
      console.error('Error saving goal plan templates', e);
    }
  },

  resetGoalPlanTemplates(): GoalPlanTemplateData {
    this.saveGoalPlanTemplates(DEFAULT_GOAL_PLAN_TEMPLATE_DATA);
    return DEFAULT_GOAL_PLAN_TEMPLATE_DATA;
  },

  // Student Goal Plans
  getAllStudentGoalPlans(): Record<string, StudentGoalPlan> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENT_GOAL_PLANS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading student goal plans', e);
    }
    return {};
  },

  getStudentGoalPlan(studentId: string): StudentGoalPlan | null {
    const plans = this.getAllStudentGoalPlans();
    return plans[studentId] || null;
  },

  saveStudentGoalPlan(plan: StudentGoalPlan): void {
    try {
      const plans = this.getAllStudentGoalPlans();
      plans[plan.studentId] = plan;
      localStorage.setItem(STORAGE_KEYS.STUDENT_GOAL_PLANS, JSON.stringify(plans));

      // Also update student profile's summary for quick teacher dashboard display
      const students = this.getStudents();
      const stIdx = students.findIndex((s) => s.id === plan.studentId);
      if (stIdx >= 0) {
        students[stIdx].fitnessGoalSummary = {
          goalId: plan.goalId,
          goalTitle: plan.goalTitle,
          level: plan.level,
          daysPerWeek: plan.daysPerWeek,
          minutesPerDay: plan.minutesPerDay,
          updatedAt: plan.updatedAt,
        };
        this.saveStudents(students);
      }
    } catch (e) {
      console.error('Error saving student goal plan', e);
    }
  },
};
