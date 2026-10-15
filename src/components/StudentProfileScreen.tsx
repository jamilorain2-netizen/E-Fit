import React, { useState } from 'react';
import {
  User,
  Calendar,
  School,
  GraduationCap,
  ArrowRight,
  ShieldAlert,
  Save,
  Trash2,
  PlusCircle,
  Clock,
  CheckCircle2,
  Flag,
  AlertTriangle,
} from 'lucide-react';
import { StudentProfile, Sex, JuniorHighGrade, UserRole } from '../types';

interface StudentProfileScreenProps {
  currentStudent: StudentProfile;
  profiles: StudentProfile[];
  currentRole: UserRole;
  onSaveProfile: (profile: StudentProfile) => void;
  onSelectProfile: (id: string) => void;
  onNewProfile: () => void;
  onDeleteProfile: (id: string) => void;
  onProceedToSafety: () => void;
}

// Strictly restricted to Junior High School (Grades 7 to 10)
const JUNIOR_HIGH_GRADES: JuniorHighGrade[] = [
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
];

export const StudentProfileScreen: React.FC<StudentProfileScreenProps> = ({
  currentStudent,
  profiles,
  currentRole,
  onSaveProfile,
  onSelectProfile,
  onNewProfile,
  onDeleteProfile,
  onProceedToSafety,
}) => {
  const [formData, setFormData] = useState<StudentProfile>({ ...currentStudent });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedNotice, setSavedNotice] = useState(false);

  // Sync if currentStudent prop changes externally
  React.useEffect(() => {
    setFormData({ ...currentStudent });
  }, [currentStudent.id]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) {
      errs.fullName = 'Please enter the Student Full Name.';
    }
    if (!formData.lrnOrId.trim()) {
      errs.lrnOrId = 'Please enter the 12-digit DepEd LRN or Student ID.';
    }
    if (formData.age < 11 || formData.age > 19 || isNaN(formData.age)) {
      errs.age = 'Age for Junior High School is typically between 12 and 16 (allowed 11-19).';
    }
    if (!formData.assessmentDate) {
      errs.assessmentDate = 'Please select the assessment date.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const updated: StudentProfile = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      onSaveProfile(updated);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    }
  };

  const handleProceed = () => {
    if (validate()) {
      const updated: StudentProfile = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      onSaveProfile(updated);
      onProceedToSafety();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="gym-card overflow-hidden">
        {/* Section Top Band */}
        <div className="bg-[#0A0A0A] dark:bg-[#0A0A0A] text-white px-6 py-5 border-b-3 border-[#0A0A0A] dark:border-[#FFFFFF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-heading uppercase text-2xl sm:text-3xl font-black tracking-wide text-white leading-none">
              STUDENT PROFILE & CALIBRATION
            </h1>
            <div className="marker-underline mt-1 mb-2"></div>
          </div>

          {currentRole === 'teacher' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onNewProfile}
                className="gym-button-primary !h-10 !min-h-[40px] !text-xs !px-4"
              >
                <PlusCircle className="w-4 h-4 mr-1.5 text-white" />
                <span>+ Add JHS Student</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
            Junior High School fitness testing calibration strictly for <strong>Grades 7, 8, 9, and 10</strong> (ages 12–16). Measurements are calibrated against Philippine DepEd Physical Fitness Norms and WHO reference charts.
          </p>

          {/* Flagged Alert Banner if student is flagged for guidance */}
          {formData.flaggedForGuidance && (
            <div className="p-4 bg-amber-100 dark:bg-amber-950/60 border-l-4 border-amber-600 rounded-xs text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-heading uppercase text-sm font-bold text-amber-900 dark:text-amber-300">
                  FLAGGED FOR SPECIAL PE GUIDANCE / HEALTH MONITORING
                </strong>
                <p className="mt-0.5 leading-relaxed font-sans">
                  {formData.guidanceReason || 'Teacher flagged this learner for extra form guidance or modified fitness testing.'}
                </p>
              </div>
            </div>
          )}

          {/* Profile Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* LRN / Student ID */}
              <div>
                <label className="block font-heading uppercase font-bold text-xs tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                  DepEd 12-Digit LRN or Student ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lrnOrId}
                  onChange={(e) =>
                    setFormData({ ...formData, lrnOrId: e.target.value })
                  }
                  placeholder="e.g. 109876543210"
                  className={`w-full px-3.5 py-2.5 rounded-none border-2 text-stone-900 dark:text-stone-100 bg-[#faf9f5] dark:bg-[#0A0A0A] text-sm font-mono placeholder-stone-400 ${
                    errors.lrnOrId
                      ? 'border-rose-500'
                      : 'border-[#0A0A0A] dark:border-[#FFFFFF] focus:border-[#E10600]'
                  }`}
                />
                {errors.lrnOrId && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">{errors.lrnOrId}</p>
                )}
              </div>

              {/* Student Full Name */}
              <div>
                <label className="block font-heading uppercase font-bold text-xs tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="e.g. Maria Elena Santos"
                  className={`w-full px-3.5 py-2.5 rounded-none border-2 text-stone-900 dark:text-stone-100 bg-[#faf9f5] dark:bg-[#0A0A0A] text-sm placeholder-stone-400 ${
                    errors.fullName
                      ? 'border-rose-500'
                      : 'border-[#0A0A0A] dark:border-[#FFFFFF] focus:border-[#E10600]'
                  }`}
                />
                {errors.fullName && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">{errors.fullName}</p>
                )}
              </div>

              {/* Sex (Crucial for fitness standards) */}
              <div>
                <label className="block font-heading uppercase font-bold text-xs tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                  Biological Sex <span className="text-rose-500">*</span>
                  <span className="font-sans normal-case text-[11px] text-stone-500 dark:text-stone-400 font-normal ml-1">
                    (Required for norm lookup)
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, sex: 'female' })}
                    className={`py-2.5 px-4 rounded-none border-2 text-sm font-heading uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      formData.sex === 'female'
                        ? 'border-[#0A0A0A] dark:border-[#FFFFFF] bg-[#E10600] text-white font-extrabold shadow-xs'
                        : 'border-[#0A0A0A] dark:border-[#FFFFFF] bg-white dark:bg-[#0A0A0A] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900'
                    }`}
                  >
                    <span>Female</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, sex: 'male' })}
                    className={`py-2.5 px-4 rounded-none border-2 text-sm font-heading uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      formData.sex === 'male'
                        ? 'border-[#0A0A0A] dark:border-[#FFFFFF] bg-[#E10600] text-white font-extrabold shadow-xs'
                        : 'border-[#0A0A0A] dark:border-[#FFFFFF] bg-white dark:bg-[#0A0A0A] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900'
                    }`}
                  >
                    <span>Male</span>
                  </button>
                </div>
              </div>

              {/* Age (12 to 16 for Junior High) */}
              <div>
                <label className="block font-heading uppercase font-bold text-xs tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                  Age (years) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="11"
                    max="19"
                    step="1"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: parseInt(e.target.value, 10) || 0 })
                    }
                    className={`w-28 px-3.5 py-2.5 rounded-xs border-2 text-stone-900 dark:text-stone-100 bg-[#faf9f5] dark:bg-[#0e1411] text-sm font-mono font-bold ${
                      errors.age
                        ? 'border-rose-500'
                        : 'border-stone-300 dark:border-stone-700 focus:border-[#144e34] dark:focus:border-emerald-500'
                    }`}
                  />
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                    Target JHS range: 12–16 years old.
                  </span>
                </div>
                {errors.age && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">{errors.age}</p>
                )}
              </div>

              {/* Grade Level (ONLY Grades 7, 8, 9, 10) */}
              <div>
                <label className="block font-heading uppercase font-bold text-xs tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                  Junior High Grade Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.gradeLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gradeLevel: e.target.value as JuniorHighGrade,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-[#faf9f5] dark:bg-[#0e1411] text-stone-900 dark:text-stone-100 text-sm font-heading uppercase font-semibold"
                >
                  {JUNIOR_HIGH_GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 block font-sans">
                  Restricted to Junior High School (Grades 7, 8, 9, 10).
                </span>
              </div>

              {/* Section */}
              <div>
                <label className="block font-heading uppercase font-bold text-xs tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                  Section
                </label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) =>
                    setFormData({ ...formData, section: e.target.value })
                  }
                  placeholder="e.g. Sampaguita / Molave / Rizal"
                  className="w-full px-3.5 py-2.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-[#faf9f5] dark:bg-[#0e1411] text-stone-900 dark:text-stone-100 text-sm placeholder-stone-400"
                />
              </div>

              {/* Assessment Date */}
              <div>
                <label className="block font-heading uppercase font-bold text-xs tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                  Assessment Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.assessmentDate}
                  onChange={(e) =>
                    setFormData({ ...formData, assessmentDate: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-[#faf9f5] dark:bg-[#0e1411] text-stone-900 dark:text-stone-100 text-sm"
                />
              </div>

              {/* PE Teacher Name */}
              <div>
                <label className="block font-heading uppercase font-bold text-xs tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                  PE & Health Teacher / Assessor
                </label>
                <input
                  type="text"
                  value={formData.teacherName}
                  onChange={(e) =>
                    setFormData({ ...formData, teacherName: e.target.value })
                  }
                  placeholder="e.g. Coach R. Cruz"
                  className="w-full px-3.5 py-2.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-[#faf9f5] dark:bg-[#0e1411] text-stone-900 dark:text-stone-100 text-sm placeholder-stone-400"
                />
              </div>

              {/* School Name */}
              <div className="md:col-span-2">
                <label className="block font-heading uppercase font-bold text-xs tracking-wider text-stone-800 dark:text-stone-200 mb-1.5">
                  School Name
                </label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolName: e.target.value })
                  }
                  placeholder="e.g. Mabini National High School (Junior High)"
                  className="w-full px-3.5 py-2.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-[#faf9f5] dark:bg-[#0e1411] text-stone-900 dark:text-stone-100 text-sm placeholder-stone-400"
                />
              </div>

              {/* Teacher Guidance Flag Toggle */}
              {currentRole === 'teacher' && (
                <div className="md:col-span-2 p-4 bg-[#f6f5ef] dark:bg-[#1a2520] border-2 border-amber-300 dark:border-amber-800 rounded-xs space-y-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.flaggedForGuidance || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          flaggedForGuidance: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-amber-600 rounded-xs border-stone-400 focus:ring-amber-500"
                    />
                    <span className="font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <Flag className="w-4 h-4 text-amber-600" />
                      <span>Flag this student for extra PE guidance / medical observation</span>
                    </span>
                  </label>

                  {formData.flaggedForGuidance && (
                    <div>
                      <label className="block font-mono text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                        Guidance Notes / Observations
                      </label>
                      <input
                        type="text"
                        value={formData.guidanceReason || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            guidanceReason: e.target.value,
                          })
                        }
                        placeholder="e.g. Needs modified push-ups due to previous sprain / asthma inhaler on standby"
                        className="w-full px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1411]"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t-2 border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-heading uppercase tracking-wider text-xs font-bold rounded-xs transition-colors border-2 border-stone-400 dark:border-stone-600"
                >
                  <Save className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                  <span>Save Profile</span>
                </button>
                {savedNotice && (
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold font-heading uppercase flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Saved!
                  </span>
                )}
              </div>

              {/* Key Action Warm Accent Button */}
              <button
                type="button"
                onClick={handleProceed}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#d95f02] hover:bg-[#b84f00] text-white font-heading uppercase tracking-wider text-sm font-bold rounded-xs shadow-xs transition-all border border-amber-900 focus-visible:outline-2 focus-visible:outline-[#d95f02]"
              >
                <span>Continue to Safety Screen</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Teacher-Only: Class Records Switcher */}
      {currentRole === 'teacher' && profiles.length > 1 && (
        <div className="bg-[#ffffff] dark:bg-[#141c18] rounded-xs p-5 border-2 border-stone-300 dark:border-stone-800">
          <div className="flex items-center justify-between mb-3 border-b-2 border-stone-200 dark:border-stone-800 pb-2">
            <h3 className="font-heading uppercase text-xs font-bold text-stone-700 dark:text-stone-300 tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-stone-500" />
              <span>Registered JHS Students ({profiles.length})</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {profiles.map((p) => (
              <div
                key={p.id}
                className={`p-3 rounded-xs border-2 text-xs flex items-center justify-between transition-colors ${
                  currentStudent.id === p.id
                    ? 'bg-emerald-50 dark:bg-[#11241a] border-[#144e34] dark:border-emerald-600 text-stone-900 dark:text-stone-100 font-medium'
                    : 'bg-[#faf9f5] dark:bg-[#0e1411] border-stone-300 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectProfile(p.id)}
                  className="text-left truncate flex-1 mr-2"
                >
                  <div className="font-heading uppercase font-bold truncate text-sm text-stone-900 dark:text-white">{p.fullName || 'Unnamed'}</div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate font-mono">
                    LRN: {p.lrnOrId} · {p.gradeLevel} ({p.section})
                  </div>
                  {p.flaggedForGuidance && (
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1 mt-0.5 font-mono">
                      <Flag className="w-3 h-3 text-amber-600" /> Flagged
                    </span>
                  )}
                </button>
                {profiles.length > 1 && currentStudent.id !== p.id && (
                  <button
                    type="button"
                    onClick={() => onDeleteProfile(p.id)}
                    className="p-1 text-stone-400 hover:text-rose-600 rounded-xs transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
