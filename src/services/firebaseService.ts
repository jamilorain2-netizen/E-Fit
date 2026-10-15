/**
 * Firebase Firestore Service Layer
 * Manages real-time subscriptions, self-enrollment, score updates, and teacher roster synchronization.
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  addDoc,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { StudentProfile, AssessmentRecord, FitnessTestKey } from '../types';
import { hashPin } from '../utils/auth';

export const FirebaseService = {
  /**
   * Enrolls a student directly into Firestore
   */
  async enrollStudent(student: StudentProfile): Promise<void> {
    try {
      const studentDocRef = doc(db, 'students', student.id);
      await setDoc(studentDocRef, {
        id: student.id,
        lrn: student.lrnOrId.trim(),
        lrnOrId: student.lrnOrId.trim(),
        classCode: (student.classCode || '').trim().toUpperCase(),
        pinHash: student.pinHash || '',
        fullName: student.fullName.trim(),
        age: Number(student.age),
        sex: student.sex,
        gradeLevel: student.gradeLevel,
        section: student.section.trim(),
        schoolName: student.schoolName,
        teacherName: student.teacherName,
        assessmentDate: student.assessmentDate,
        safetyAcknowledged: !!student.safetyAcknowledged,
        safetyAcknowledgedDate: student.safetyAcknowledgedDate || null,
        flaggedForGuidance: !!student.flaggedForGuidance,
        guidanceReason: student.guidanceReason || '',
        createdAt: student.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error enrolling student in Firestore:', err);
      throw err;
    }
  },

  /**
   * Checks if an LRN already exists under a given class code
   */
  async findStudentByLrnAndClass(lrn: string, classCode: string): Promise<StudentProfile | null> {
    try {
      const cleanLrn = lrn.trim();
      const cleanCode = classCode.trim().toUpperCase();
      const q = query(
        collection(db, 'students'),
        where('lrn', '==', cleanLrn),
        where('classCode', '==', cleanCode)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs[0].data() as StudentProfile;
      }
      return null;
    } catch (err) {
      console.warn('Firestore findStudentByLrnAndClass failed, fallback to local check', err);
      return null;
    }
  },

  /**
   * Finds a student by their 12-digit LRN across all records
   */
  async findStudentByLrn(lrn: string): Promise<StudentProfile | null> {
    try {
      const cleanLrn = lrn.trim();
      const q = query(collection(db, 'students'), where('lrn', '==', cleanLrn));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs[0].data() as StudentProfile;
      }
      return null;
    } catch (err) {
      console.warn('Firestore findStudentByLrn failed:', err);
      return null;
    }
  },

  /**
   * Verifies student login using their 12-digit LRN and 4-digit PIN
   */
  async verifyStudentLogin(lrn: string, pin: string): Promise<{ success: boolean; student?: StudentProfile; message?: string }> {
    try {
      const cleanLrn = lrn.trim();
      const expectedHash = await hashPin(pin);
      const student = await this.findStudentByLrn(cleanLrn);

      if (!student) {
        return {
          success: false,
          message: 'LRN not found. Please join your class with your teacher\'s Class Code first.',
        };
      }

      if (student.pinHash && student.pinHash !== expectedHash) {
        return {
          success: false,
          message: 'Incorrect 4-digit PIN. Please re-enter or ask your PE teacher to reset your PIN.',
        };
      }

      return { success: true, student };
    } catch (err) {
      console.error('Error during student verification:', err);
      return { success: false, message: 'Authentication error. Please try again.' };
    }
  },

  /**
   * Resets a student's 4-digit PIN (initiated by PE teacher)
   */
  async resetStudentPin(studentId: string, newPin: string): Promise<void> {
    try {
      const newHash = await hashPin(newPin);
      const studentDocRef = doc(db, 'students', studentId);
      await updateDoc(studentDocRef, {
        pinHash: newHash,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error resetting student PIN in Firestore:', err);
      throw err;
    }
  },

  /**
   * Updates an existing student's details
   */
  async updateStudent(student: StudentProfile): Promise<void> {
    try {
      const studentDocRef = doc(db, 'students', student.id);
      await setDoc(studentDocRef, {
        ...student,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.error('Error updating student in Firestore:', err);
      throw err;
    }
  },

  /**
   * Removes a student from Firestore
   */
  async deleteStudent(studentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'students', studentId));
    } catch (err) {
      console.error('Error deleting student in Firestore:', err);
      throw err;
    }
  },

  /**
   * Saves an assessment record to Firestore under both 'assessments' and 'student_results'
   */
  async saveAssessment(record: AssessmentRecord, student: StudentProfile): Promise<void> {
    try {
      // 1. Save full assessment record
      const assessDocRef = doc(db, 'assessments', record.id);
      await setDoc(assessDocRef, {
        ...record,
        classCode: (student.classCode || '').toUpperCase(),
        lrn: student.lrnOrId,
        studentName: student.fullName,
        section: student.section,
        updatedAt: new Date().toISOString(),
      });

      // 2. Also record in student_results for the live activity feed
      const testEntries = [
        { type: '3-Minute Step Test', data: record.stepTest },
        { type: 'Basic Plank Test', data: record.plankTest },
        { type: '90-Degree Push-Up Test', data: record.pushUpTest },
        { type: 'Zipper Test', data: record.zipperTest },
        { type: 'Sit-and-Reach Test', data: record.sitAndReach },
        { type: 'BMI-for-Age Screening', data: record.bmi },
      ];

      for (const entry of testEntries) {
        if (entry.data) {
          let scoreStr = '';
          if (entry.type === '3-Minute Step Test' && 'recoveryHr' in entry.data) {
            scoreStr = `${entry.data.recoveryHr} bpm recovery`;
          } else if (entry.type === 'Basic Plank Test' && 'timeSeconds' in entry.data) {
            scoreStr = `${entry.data.timeSeconds} seconds`;
          } else if (entry.type === '90-Degree Push-Up Test' && 'count' in entry.data) {
            scoreStr = `${entry.data.count} reps`;
          } else if (entry.type === 'Zipper Test' && 'rightCm' in entry.data) {
            scoreStr = `R: ${entry.data.rightCm}cm / L: ${entry.data.leftCm}cm`;
          } else if (entry.type === 'Sit-and-Reach Test' && 'bestCm' in entry.data) {
            scoreStr = `${entry.data.bestCm} cm`;
          } else if (entry.type === 'BMI-for-Age Screening' && 'bmiValue' in entry.data) {
            scoreStr = `${entry.data.bmiValue.toFixed(1)} kg/m²`;
          }

          if (scoreStr) {
            await addDoc(collection(db, 'student_results'), {
              studentId: student.id,
              name: student.fullName,
              section: student.section || 'Unassigned',
              classCode: (student.classCode || '').toUpperCase(),
              testType: entry.type,
              score: scoreStr,
              timestamp: serverTimestamp(),
            });
          }
        }
      }
    } catch (err) {
      console.error('Error saving assessment to Firestore:', err);
    }
  },

  /**
   * Fetches assessments for a given student
   */
  async getStudentAssessments(studentId: string): Promise<AssessmentRecord[]> {
    try {
      const q = query(collection(db, 'assessments'), where('studentId', '==', studentId));
      const snapshot = await getDocs(q);
      const list: AssessmentRecord[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as AssessmentRecord);
      });
      return list;
    } catch (err) {
      console.warn('Error fetching student assessments from Firestore:', err);
      return [];
    }
  },

  /**
   * Real-time listener for students in a teacher's class
   */
  subscribeClassStudents(classCode: string, callback: (students: StudentProfile[]) => void): () => void {
    const cleanCode = classCode.trim().toUpperCase();
    const q = cleanCode
      ? query(collection(db, 'students'), where('classCode', '==', cleanCode))
      : query(collection(db, 'students'));

    return onSnapshot(
      q,
      (snapshot) => {
        const students: StudentProfile[] = [];
        snapshot.forEach((d) => {
          students.push(d.data() as StudentProfile);
        });
        callback(students);
      },
      (error) => {
        console.warn('Firestore subscribeClassStudents listener error:', error);
      }
    );
  },

  /**
   * Real-time listener for assessments in a teacher's class
   */
  subscribeClassAssessments(classCode: string, callback: (assessments: AssessmentRecord[]) => void): () => void {
    const cleanCode = classCode.trim().toUpperCase();
    const q = cleanCode
      ? query(collection(db, 'assessments'), where('classCode', '==', cleanCode))
      : query(collection(db, 'assessments'));

    return onSnapshot(
      q,
      (snapshot) => {
        const assessments: AssessmentRecord[] = [];
        snapshot.forEach((d) => {
          assessments.push(d.data() as AssessmentRecord);
        });
        callback(assessments);
      },
      (error) => {
        console.warn('Firestore subscribeClassAssessments listener error:', error);
      }
    );
  },
};
