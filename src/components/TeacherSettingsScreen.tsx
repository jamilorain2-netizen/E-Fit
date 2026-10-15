import React, { useState } from 'react';
import {
  Settings,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  FileCode,
  Save,
  Video,
  Sliders,
  X,
  Users,
  Flag,
  CheckSquare,
  Eye,
  Lock,
  ChevronRight,
  Printer,
} from 'lucide-react';
import {
  StandardRow,
  TeacherConfig,
  StudentProfile,
  AssessmentRecord,
  FitnessTestKey,
} from '../types';
import {
  exportStandardsToCSV,
  parseCSVToStandards,
  exportClassSummaryToCSV,
  parseClassListCSV,
} from '../utils/storage';
import { DEFAULT_STANDARDS, SAMPLE_SOURCE_TAG } from '../data/defaultStandards';
import { evaluateTestScore } from '../utils/scoring';

interface TeacherSettingsScreenProps {
  standards: StandardRow[];
  teacherConfig: TeacherConfig;
  students: StudentProfile[];
  assessments: AssessmentRecord[];
  onSaveStandards: (newStandards: StandardRow[]) => void;
  onSaveTeacherConfig: (newConfig: TeacherConfig) => void;
  onSaveStudent: (student: StudentProfile) => void;
  onDeleteStudent: (id: string) => void;
  onBulkImportStudents: (students: Partial<StudentProfile>[]) => void;
  onViewStudentReport: (student: StudentProfile) => void;
}

const TEST_OPTIONS: { value: StandardRow['test']; label: string }[] = [
  { value: 'step_test', label: '3-Minute Step Test (Recovery BPM)' },
  { value: 'plank', label: 'Basic Plank (Seconds)' },
  { value: 'push_up', label: 'Push-Up Test (Reps)' },
  { value: 'zipper_right', label: 'Zipper Test - Right (cm)' },
  { value: 'zipper_left', label: 'Zipper Test - Left (cm)' },
  { value: 'sit_and_reach', label: 'Sit-and-Reach (cm)' },
  { value: 'bmi', label: 'BMI-for-Age Screening (kg/m²)' },
];

export const TeacherSettingsScreen: React.FC<TeacherSettingsScreenProps> = ({
  standards,
  teacherConfig,
  students,
  assessments,
  onSaveStandards,
  onSaveTeacherConfig,
  onSaveStudent,
  onDeleteStudent,
  onBulkImportStudents,
  onViewStudentReport,
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'standards' | 'config' | 'videos'>('roster');

  // Search & Filters for Standards
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTest, setFilterTest] = useState<string>('all');
  const [filterSex, setFilterSex] = useState<string>('all');

  // Search & Filter for Class Roster
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterGradeFilter, setRosterGradeFilter] = useState('all');

  // Edit / Add standard modal state
  const [editingRow, setEditingRow] = useState<StandardRow | null>(null);
  const [isNewRow, setIsNewRow] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Guidance Flag Modal
  const [flagModalStudent, setFlagModalStudent] = useState<StudentProfile | null>(null);
  const [flagReasonInput, setFlagReasonInput] = useState('');

  // Config form state
  const [configState, setConfigState] = useState<TeacherConfig>({ ...teacherConfig });
  const [savedNotice, setSavedNotice] = useState(false);

  // Filtered standards
  const filteredStandards = standards.filter((row) => {
    const matchesTest = filterTest === 'all' || row.test === filterTest;
    const matchesSex = filterSex === 'all' || row.sex === filterSex || row.sex === 'all';
    const matchesSearch =
      searchQuery === '' ||
      row.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTest && matchesSex && matchesSearch;
  });

  // Filtered Roster
  const filteredStudents = students.filter((s) => {
    const matchesGrade = rosterGradeFilter === 'all' || s.gradeLevel === rosterGradeFilter;
    const matchesSearch =
      rosterSearch === '' ||
      s.fullName.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      s.lrnOrId.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      s.section.toLowerCase().includes(rosterSearch.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  // Export Class Summary CSV
  const handleExportClassCSV = () => {
    const csv = exportClassSummaryToCSV(students, assessments, standards);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JHS_Fitness_Class_Summary_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Bulk import students CSV
  const handleImportClassRoster = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const imported = parseClassListCSV(content);
        if (imported.length > 0) {
          onBulkImportStudents(imported);
          alert(`Successfully imported ${imported.length} student records into Junior High School roster.`);
        } else {
          alert('Could not parse class list. Format: LRN, Full Name, Grade, Section, Age, Sex');
        }
      } catch (err) {
        alert('Failed to parse file.');
        console.error(err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleOpenAddStandard = () => {
    setIsNewRow(true);
    setEditingRow({
      id: `std-${Date.now()}`,
      test: 'step_test',
      protocol: '3-Minute Step Test (24 steps/min)',
      sex: 'all',
      age_min: 12,
      age_max: 16,
      unit: 'bpm',
      category: 'Good',
      min: 90,
      max: 105,
      source: SAMPLE_SOURCE_TAG,
      version: '2026.1',
    });
    setModalOpen(true);
  };

  const handleOpenEditStandard = (row: StandardRow) => {
    setIsNewRow(false);
    setEditingRow({ ...row });
    setModalOpen(true);
  };

  const handleDeleteStandard = (id: string) => {
    if (confirm('Are you sure you want to delete this standard row?')) {
      const updated = standards.filter((s) => s.id !== id);
      onSaveStandards(updated);
    }
  };

  const handleSaveModalStandard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;

    let updatedList: StandardRow[];
    if (isNewRow) {
      updatedList = [...standards, editingRow];
    } else {
      updatedList = standards.map((s) => (s.id === editingRow.id ? editingRow : s));
    }

    onSaveStandards(updatedList);
    setModalOpen(false);
    setEditingRow(null);
  };

  const handleResetStandards = () => {
    if (confirm('Reset standards table to factory DepEd Junior High defaults? Any custom edits will be replaced.')) {
      onSaveStandards([...DEFAULT_STANDARDS]);
    }
  };

  const handleExportStandardsCSV = () => {
    const csv = exportStandardsToCSV(standards);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JHS_Fitness_Standards_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportStandardsJSON = () => {
    const blob = new Blob([JSON.stringify(standards, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JHS_Fitness_Standards_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportStandardsFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].test) {
            onSaveStandards(parsed);
            alert(`Imported ${parsed.length} standards from JSON.`);
          } else {
            alert('Invalid JSON standards file structure.');
          }
        } else {
          const imported = parseCSVToStandards(content);
          if (imported.length > 0) {
            onSaveStandards(imported);
            alert(`Imported ${imported.length} standards from CSV.`);
          } else {
            alert('Could not parse standards from CSV.');
          }
        }
      } catch (err) {
        alert('Failed to parse file.');
        console.error(err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTeacherConfig(configState);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleOpenFlagModal = (student: StudentProfile) => {
    setFlagModalStudent(student);
    setFlagReasonInput(student.guidanceReason || '');
  };

  const handleSaveFlag = () => {
    if (!flagModalStudent) return;
    const isFlagged = flagReasonInput.trim().length > 0;
    const updated: StudentProfile = {
      ...flagModalStudent,
      flaggedForGuidance: isFlagged,
      guidanceReason: isFlagged ? flagReasonInput.trim() : undefined,
    };
    onSaveStudent(updated);
    setFlagModalStudent(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Container */}
      <div className="bg-white dark:bg-[#141c18] rounded-xs border-2 border-[#144e34] dark:border-[#227e56] shadow-xs overflow-hidden">
        {/* Banner */}
        <div className="bg-[#103d29] dark:bg-[#082115] text-white px-6 py-5 border-b-2 border-[#196343] dark:border-[#1e4832] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading uppercase text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-2">
              <Settings className="w-7 h-7 text-[#7fd2ad]" />
              <span>TEACHER SETTINGS & STANDARDS PLAYBOOK</span>
            </h1>
            <p className="text-xs text-[#a0cbb5] mt-0.5 font-sans">
              Manage scoring standards, video guides, test cadence & intervals, teacher PIN, and class rosters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#082115] text-[#d6e8de] border border-[#196343] px-3 py-1.5 rounded-xs font-mono font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>PIN: {teacherConfig.teacherPin}</span>
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Athletic Tab Navigation */}
          <div className="flex items-center gap-2 border-b-2 border-stone-200 dark:border-stone-800 pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('roster')}
              className={`py-2 px-3 text-xs sm:text-sm font-heading uppercase tracking-wider font-extrabold transition-all border-b-4 flex items-center gap-1.5 shrink-0 ${
                activeTab === 'roster'
                  ? 'border-[#144e34] text-[#144e34] dark:border-[#4cb988] dark:text-[#7fd2ad]'
                  : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Class Roster ({students.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('standards')}
              className={`py-2 px-3 text-xs sm:text-sm font-heading uppercase tracking-wider font-extrabold transition-all border-b-4 flex items-center gap-1.5 shrink-0 ${
                activeTab === 'standards'
                  ? 'border-[#144e34] text-[#144e34] dark:border-[#4cb988] dark:text-[#7fd2ad]'
                  : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Standards Table ({standards.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('config')}
              className={`py-2 px-3 text-xs sm:text-sm font-heading uppercase tracking-wider font-extrabold transition-all border-b-4 flex items-center gap-1.5 shrink-0 ${
                activeTab === 'config'
                  ? 'border-[#144e34] text-[#144e34] dark:border-[#4cb988] dark:text-[#7fd2ad]'
                  : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Protocols & PIN</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('videos')}
              className={`py-2 px-3 text-xs sm:text-sm font-heading uppercase tracking-wider font-extrabold transition-all border-b-4 flex items-center gap-1.5 shrink-0 ${
                activeTab === 'videos'
                  ? 'border-[#144e34] text-[#144e34] dark:border-[#4cb988] dark:text-[#7fd2ad]'
                  : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Video Links</span>
            </button>
          </div>

          {/* Tab 1: Class Roster & Results */}
          {activeTab === 'roster' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#faf9f5] dark:bg-[#0e1411] p-4 rounded-xs border-2 border-stone-300 dark:border-stone-800">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <div className="relative min-w-[180px] flex-1">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={rosterSearch}
                      onChange={(e) => setRosterSearch(e.target.value)}
                      placeholder="Search by student name, LRN, section..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-xs bg-white dark:bg-[#141c18] text-stone-900 dark:text-stone-100 font-sans focus:border-[#144e34]"
                    />
                  </div>

                  <select
                    value={rosterGradeFilter}
                    onChange={(e) => setRosterGradeFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-xs bg-white dark:bg-[#141c18] text-stone-900 dark:text-stone-100 font-heading uppercase font-bold"
                  >
                    <option value="all">ALL JHS GRADES</option>
                    <option value="Grade 7">GRADE 7</option>
                    <option value="Grade 8">GRADE 8</option>
                    <option value="Grade 9">GRADE 9</option>
                    <option value="Grade 10">GRADE 10</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleExportClassCSV}
                    className="px-3.5 py-2 bg-[#d95f02] hover:bg-[#b84f00] text-white font-heading uppercase tracking-wider font-extrabold text-xs rounded-xs flex items-center gap-1.5 border border-amber-900 transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Class CSV</span>
                  </button>

                  <div className="relative">
                    <label
                      className="px-3.5 py-2 bg-white dark:bg-[#141c18] border-2 border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 font-heading uppercase tracking-wider font-extrabold text-xs rounded-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Bulk import students from CSV"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Import CSV</span>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleImportClassRoster}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Roster Table */}
              <div className="border-2 border-stone-300 dark:border-stone-800 rounded-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-[#103d29] dark:bg-[#082115] text-white font-heading uppercase tracking-wider font-bold text-xs border-b-2 border-[#196343]">
                      <tr>
                        <th className="py-2.5 px-3">STUDENT & LRN</th>
                        <th className="py-2.5 px-3">GRADE & SECTION</th>
                        <th className="py-2.5 px-3">TEST COMPLETION (6 TESTS)</th>
                        <th className="py-2.5 px-3">FLAG / GUIDANCE</th>
                        <th className="py-2.5 px-3 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-stone-200 dark:divide-stone-800 bg-white dark:bg-[#141c18]">
                      {filteredStudents.map((s) => {
                        const studentAssessments = assessments
                          .filter((a) => a.studentId === s.id)
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                        const a = studentAssessments[0];

                        const completedCount = [
                          !!a?.stepTest,
                          !!a?.plankTest,
                          !!a?.pushUpTest,
                          !!a?.zipperTest,
                          !!a?.sitAndReach,
                          !!a?.bmi,
                        ].filter(Boolean).length;

                        return (
                          <tr key={s.id} className="hover:bg-stone-50 dark:hover:bg-[#1a2520] transition-colors">
                            <td className="py-3 px-3">
                              <span className="font-heading uppercase font-bold text-stone-900 dark:text-stone-100 text-sm block">
                                {s.fullName}
                              </span>
                              <span className="font-mono text-[10px] text-stone-500 dark:text-stone-400">
                                LRN: {s.lrnOrId} · {s.age}y ({s.sex.toUpperCase()})
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <span className="font-heading uppercase font-bold text-stone-800 dark:text-stone-200 block">{s.gradeLevel}</span>
                              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">{s.section || '—'}</span>
                            </td>

                            <td className="py-3 px-3">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs font-heading uppercase tracking-wider text-[11px] font-extrabold border ${
                                  completedCount === 6
                                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-200 border-emerald-400 dark:border-emerald-700'
                                    : completedCount > 0
                                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 border-amber-400 dark:border-amber-700'
                                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-300 dark:border-stone-700'
                                }`}
                              >
                                {completedCount === 6 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                <span>{completedCount}/6 Done</span>
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <button
                                type="button"
                                onClick={() => handleOpenFlagModal(s)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-[11px] font-heading uppercase font-bold transition-colors border ${
                                  s.flaggedForGuidance
                                    ? 'bg-rose-100 dark:bg-rose-950/80 border-rose-400 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                                    : 'bg-[#faf9f5] dark:bg-[#0e1411] border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                                }`}
                              >
                                <Flag className={`w-3.5 h-3.5 ${s.flaggedForGuidance ? 'text-rose-600 fill-rose-600' : 'text-stone-400'}`} />
                                <span>{s.flaggedForGuidance ? 'Flagged' : 'Flag'}</span>
                              </button>
                            </td>

                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => onViewStudentReport(s)}
                                  className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-[#144e34] dark:hover:text-emerald-400 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xs transition-colors"
                                  title="View Printable PDF Report"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                                {students.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Remove ${s.fullName} from roster?`)) {
                                        onDeleteStudent(s.id);
                                      }
                                    }}
                                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xs transition-colors"
                                    title="Delete Student"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Standards Table */}
          {activeTab === 'standards' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#faf9f5] dark:bg-[#0e1411] p-4 rounded-xs border-2 border-stone-300 dark:border-stone-800">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <div className="relative min-w-[180px] flex-1">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search standards table..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-xs bg-white dark:bg-[#141c18] text-stone-900 dark:text-stone-100 font-sans focus:border-[#144e34]"
                    />
                  </div>

                  <select
                    value={filterTest}
                    onChange={(e) => setFilterTest(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-xs bg-white dark:bg-[#141c18] text-stone-900 dark:text-stone-100 font-heading uppercase font-bold"
                  >
                    <option value="all">ALL TESTS</option>
                    {TEST_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterSex}
                    onChange={(e) => setFilterSex(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-xs bg-white dark:bg-[#141c18] text-stone-900 dark:text-stone-100 font-heading uppercase font-bold"
                  >
                    <option value="all">ALL SEXES</option>
                    <option value="male">MALE</option>
                    <option value="female">FEMALE</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleOpenAddStandard}
                    className="px-3 py-1.5 bg-[#144e34] hover:bg-[#0d3221] text-white font-heading uppercase tracking-wider font-extrabold text-xs rounded-xs flex items-center gap-1.5 border border-emerald-400/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Standard</span>
                  </button>

                  <div className="relative">
                    <label
                      className="px-2.5 py-1.5 bg-white dark:bg-[#141c18] border-2 border-stone-300 dark:border-stone-700 hover:bg-stone-100 text-stone-700 dark:text-stone-200 font-heading uppercase font-bold text-xs rounded-xs flex items-center gap-1 cursor-pointer"
                      title="Import CSV or JSON"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Import</span>
                      <input
                        type="file"
                        accept=".csv,.json"
                        onChange={handleImportStandardsFile}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportStandardsCSV}
                    className="px-2.5 py-1.5 bg-white dark:bg-[#141c18] border-2 border-stone-300 dark:border-stone-700 hover:bg-stone-100 text-stone-700 dark:text-stone-200 font-heading uppercase font-bold text-xs rounded-xs flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportStandardsJSON}
                    className="px-2.5 py-1.5 bg-white dark:bg-[#141c18] border-2 border-stone-300 dark:border-stone-700 hover:bg-stone-100 text-stone-700 dark:text-stone-200 font-heading uppercase font-bold text-xs rounded-xs flex items-center gap-1"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetStandards}
                    className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 border-2 border-stone-300 dark:border-stone-700 rounded-xs"
                    title="Reset to sample standards"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="border-2 border-stone-300 dark:border-stone-800 rounded-xs overflow-hidden">
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-[#103d29] dark:bg-[#082115] text-white font-heading uppercase tracking-wider font-bold text-xs border-b-2 border-[#196343] sticky top-0 z-10">
                      <tr>
                        <th className="py-2.5 px-3">TEST</th>
                        <th className="py-2.5 px-3">SEX</th>
                        <th className="py-2.5 px-3">AGE BRACKET</th>
                        <th className="py-2.5 px-3">CATEGORY</th>
                        <th className="py-2.5 px-3">MIN</th>
                        <th className="py-2.5 px-3">MAX</th>
                        <th className="py-2.5 px-3">UNIT</th>
                        <th className="py-2.5 px-3">SOURCE & VERSION</th>
                        <th className="py-2.5 px-3 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-stone-200 dark:divide-stone-800 bg-white dark:bg-[#141c18]">
                      {filteredStandards.map((row) => (
                        <tr key={row.id} className="hover:bg-stone-50 dark:hover:bg-[#1a2520] transition-colors">
                          <td className="py-2.5 px-3 font-heading uppercase font-bold text-stone-900 dark:text-stone-100">
                            {row.test}
                            <div className="text-[10px] text-stone-500 dark:text-stone-400 font-sans font-normal truncate max-w-[150px]">
                              {row.protocol}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono capitalize">{row.sex}</td>
                          <td className="py-2.5 px-3 font-mono">
                            {row.age_min}–{row.age_max} yrs
                          </td>
                          <td className="py-2.5 px-3 font-heading uppercase font-bold text-stone-800 dark:text-stone-200">
                            {row.category}
                          </td>
                          <td className="py-2.5 px-3 font-scoreboard text-base text-[#0d3221] dark:text-[#4cb988]">
                            {row.min}
                          </td>
                          <td className="py-2.5 px-3 font-scoreboard text-base text-[#0d3221] dark:text-[#4cb988]">
                            {row.max}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-stone-500">{row.unit}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-stone-500 dark:text-stone-400 truncate max-w-[160px]">
                            {row.source}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditStandard(row)}
                                className="p-1 text-stone-500 hover:text-[#d95f02] rounded-xs"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStandard(row.id)}
                                className="p-1 text-stone-400 hover:text-rose-600 rounded-xs"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Protocols, Cadence & PIN */}
          {activeTab === 'config' && (
            <form onSubmit={handleSaveConfig} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Teacher PIN */}
                <div className="p-5 rounded-xs border-2 border-stone-300 dark:border-stone-800 bg-[#faf9f5] dark:bg-[#0e1411] space-y-3">
                  <label className="block font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider">
                    TEACHER SECURITY PIN
                  </label>
                  <p className="text-xs text-stone-600 dark:text-stone-400 font-sans">
                    PIN required for entering the Teacher Portal and editing standards.
                  </p>
                  <input
                    type="text"
                    maxLength={8}
                    value={configState.teacherPin}
                    onChange={(e) =>
                      setConfigState({ ...configState, teacherPin: e.target.value })
                    }
                    className="w-36 px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-sm font-mono tracking-widest font-bold bg-white dark:bg-[#141c18] text-stone-900 dark:text-stone-100 focus:border-[#144e34]"
                  />
                </div>

                {/* Step Test Cadence */}
                <div className="p-5 rounded-xs border-2 border-stone-300 dark:border-stone-800 bg-[#faf9f5] dark:bg-[#0e1411] space-y-3">
                  <label className="block font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider">
                    3-MINUTE STEP TEST CADENCE (BPM)
                  </label>
                  <p className="text-xs text-stone-600 dark:text-stone-400 font-sans">
                    Standard DepEd 12-inch bench stepping cadence is 96 beats per minute (24 cycles/min).
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="60"
                      max="140"
                      value={configState.stepTestCadence}
                      onChange={(e) =>
                        setConfigState({
                          ...configState,
                          stepTestCadence: parseInt(e.target.value, 10) || 96,
                        })
                      }
                      className="w-28 px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-sm font-mono font-bold bg-white dark:bg-[#141c18] text-stone-900 dark:text-stone-100 focus:border-[#144e34]"
                    />
                    <span className="text-xs font-mono font-bold text-stone-600 dark:text-stone-300">BPM</span>
                  </div>
                </div>

                {/* Step Recovery Interval */}
                <div className="p-5 rounded-xs border-2 border-stone-300 dark:border-stone-800 bg-[#faf9f5] dark:bg-[#0e1411] space-y-3">
                  <label className="block font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider">
                    POST-STEP RECOVERY PULSE INTERVAL (SECONDS)
                  </label>
                  <p className="text-xs text-stone-600 dark:text-stone-400 font-sans">
                    Duration for pulse-taking immediately after the 3-minute step test (standard is 60 seconds).
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="15"
                      max="120"
                      value={configState.stepRecoveryIntervalSeconds}
                      onChange={(e) =>
                        setConfigState({
                          ...configState,
                          stepRecoveryIntervalSeconds: parseInt(e.target.value, 10) || 60,
                        })
                      }
                      className="w-28 px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-sm font-mono font-bold bg-white dark:bg-[#141c18] text-stone-900 dark:text-stone-100 focus:border-[#144e34]"
                    />
                    <span className="text-xs font-mono font-bold text-stone-600 dark:text-stone-300">SECONDS COUNT</span>
                  </div>
                </div>

                {/* Zipper Convention */}
                <div className="p-5 rounded-xs border-2 border-stone-300 dark:border-stone-800 bg-[#faf9f5] dark:bg-[#0e1411] space-y-3">
                  <label className="block font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 tracking-wider">
                    ZIPPER TEST OVERLAP CONVENTION
                  </label>
                  <p className="text-xs text-stone-600 dark:text-stone-400 font-sans">
                    Standard DepEd protocol treats fingertip overlap as positive (+cm) and gap as negative (-cm).
                  </p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs text-stone-800 dark:text-stone-200 cursor-pointer font-sans">
                      <input
                        type="radio"
                        name="zipper_convention"
                        checked={configState.zipperConvention === 'overlap_positive'}
                        onChange={() =>
                          setConfigState({
                            ...configState,
                            zipperConvention: 'overlap_positive',
                          })
                        }
                        className="text-[#144e34]"
                      />
                      <span>Standard: Overlap = Positive (+), Gap = Negative (-)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-stone-800 dark:text-stone-200 cursor-pointer font-sans">
                      <input
                        type="radio"
                        name="zipper_convention"
                        checked={configState.zipperConvention === 'gap_positive'}
                        onChange={() =>
                          setConfigState({
                            ...configState,
                            zipperConvention: 'gap_positive',
                          })
                        }
                        className="text-[#144e34]"
                      />
                      <span>Inverted: Gap = Positive (+), Overlap = Negative (-)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t-2 border-stone-200 dark:border-stone-800">
                {savedNotice && (
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-heading uppercase font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> SAVED SUCCESSFULLY!
                  </span>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#d95f02] hover:bg-[#b84f00] text-white font-heading uppercase tracking-wider font-extrabold text-xs rounded-xs border border-amber-900 transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Protocols & PIN</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 4: Video Links & Credits */}
          {activeTab === 'videos' && (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <p className="text-xs text-stone-600 dark:text-stone-400 font-sans mb-2">
                Paste YouTube or video demonstration links for the 5 assessed fitness tests (3-Minute Step Test, Plank, Push-Up, Zipper, Sit & Reach). Accept normal YouTube links (watch?v=, youtu.be/, and /shorts/).
              </p>

              <div className="space-y-4">
                {(
                  [
                    { key: 'step_test', label: '3-Minute Step Test' },
                    { key: 'plank', label: 'Basic Plank Test' },
                    { key: 'push_up', label: '90-Degree Push-Up Test' },
                    { key: 'zipper', label: 'Zipper Test' },
                    { key: 'sit_and_reach', label: 'Sit-and-Reach Test' },
                  ] as { key: FitnessTestKey; label: string }[]
                ).map((item) => {
                  const currentUrl = configState.videoConfigs[item.key]?.url || '';
                  const embedPreviewUrl = (() => {
                    if (!currentUrl || !currentUrl.trim()) return null;
                    try {
                      let cleanUrl = currentUrl.trim();
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
                  })();

                  return (
                    <div
                      key={item.key}
                      className="p-4 bg-[#faf9f5] dark:bg-[#0e1411] rounded-xs border-2 border-stone-300 dark:border-stone-800 space-y-3"
                    >
                      <span className="font-heading uppercase text-xs font-bold text-stone-900 dark:text-stone-100 block">
                        {item.label}
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={currentUrl}
                            onChange={(e) =>
                              setConfigState({
                                ...configState,
                                videoConfigs: {
                                  ...configState.videoConfigs,
                                  [item.key]: {
                                    ...configState.videoConfigs[item.key],
                                    url: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="https://youtu.be/... or watch?v=..."
                            className="w-full px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-xs bg-white dark:bg-[#141c18] text-stone-900 dark:text-stone-100 font-mono focus:border-[#144e34]"
                          />
                          <input
                            type="text"
                            value={configState.videoConfigs[item.key]?.credit || ''}
                            onChange={(e) =>
                              setConfigState({
                                ...configState,
                                videoConfigs: {
                                  ...configState.videoConfigs,
                                  [item.key]: {
                                    ...configState.videoConfigs[item.key],
                                    credit: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="Creator Credit (optional)"
                            className="w-full px-3 py-1.5 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-xs bg-white dark:bg-[#141c18] text-stone-900 dark:text-stone-100 font-sans focus:border-[#144e34]"
                          />
                        </div>

                        {/* Live Video Preview */}
                        <div>
                          <span className="text-[10px] font-heading uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                            Live Video Preview:
                          </span>
                          {embedPreviewUrl ? (
                            <div className="relative aspect-video w-full rounded-xs overflow-hidden bg-black border border-stone-400 dark:border-stone-700 shadow-2xs">
                              <iframe
                                src={embedPreviewUrl}
                                title={`${item.label} Preview`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full border-0"
                              />
                            </div>
                          ) : (
                            <div className="aspect-video w-full rounded-xs border border-dashed border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-900 flex items-center justify-center p-2 text-center text-stone-400 text-xs font-mono">
                              No valid YouTube link provided
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t-2 border-stone-200 dark:border-stone-800">
                {savedNotice && (
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-heading uppercase font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> SAVED SUCCESSFULLY!
                  </span>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#d95f02] hover:bg-[#b84f00] text-white font-heading uppercase tracking-wider font-extrabold text-xs rounded-xs border border-amber-900 transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Video Configurations</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Flag / Guidance Modal */}
      {flagModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in">
          <div className="bg-white dark:bg-[#141c18] rounded-xs max-w-md w-full p-6 border-4 border-[#144e34] dark:border-[#227e56] shadow-xl text-stone-900 dark:text-stone-100">
            <div className="flex items-center justify-between border-b-2 border-stone-200 dark:border-stone-800 pb-3 mb-4">
              <h3 className="font-heading uppercase text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Flag className="w-5 h-5 text-amber-500" />
                <span>FLAG LEARNER FOR GUIDANCE</span>
              </h3>
              <button
                type="button"
                onClick={() => setFlagModalStudent(null)}
                className="p-1 rounded-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 mb-3 font-sans">
              Flag <strong>{flagModalStudent.fullName}</strong> ({flagModalStudent.gradeLevel}) for special physical education observations, health monitoring, or modified testing protocol.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block font-heading uppercase font-bold text-xs text-stone-800 dark:text-stone-200 mb-1">
                  Reason / Notes for Guidance
                </label>
                <textarea
                  rows={3}
                  value={flagReasonInput}
                  onChange={(e) => setFlagReasonInput(e.target.value)}
                  placeholder="e.g. Mild knee discomfort reported; monitor closely during step test or offer modified knee push-ups."
                  className="w-full p-3 rounded-xs border-2 border-stone-300 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1411] focus:border-[#144e34]"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t-2 border-stone-200 dark:border-stone-800">
                {flagModalStudent.flaggedForGuidance && (
                  <button
                    type="button"
                    onClick={() => {
                      setFlagReasonInput('');
                      setTimeout(handleSaveFlag, 10);
                    }}
                    className="text-xs text-rose-600 font-heading uppercase font-bold hover:underline"
                  >
                    Clear Flag
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setFlagModalStudent(null)}
                    className="px-3 py-1.5 text-stone-600 dark:text-stone-400 text-xs font-heading uppercase font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveFlag}
                    className="px-4 py-1.5 bg-[#d95f02] hover:bg-[#b84f00] text-white text-xs font-heading uppercase tracking-wider font-extrabold rounded-xs border border-amber-900 transition-colors shadow-xs"
                  >
                    Save Flag
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Standard Modal */}
      {modalOpen && editingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in">
          <div className="bg-white dark:bg-[#141c18] rounded-xs max-w-xl w-full p-6 border-4 border-[#144e34] dark:border-[#227e56] shadow-xl max-h-[90vh] overflow-y-auto text-stone-900 dark:text-stone-100">
            <div className="flex items-center justify-between border-b-2 border-stone-200 dark:border-stone-800 pb-3 mb-4">
              <h3 className="font-heading uppercase text-base font-extrabold text-stone-900 dark:text-stone-100">
                {isNewRow ? 'ADD STANDARD ROW' : 'EDIT STANDARD ROW'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModalStandard} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-heading uppercase font-bold text-stone-800 dark:text-stone-200 mb-1">Fitness Test</label>
                  <select
                    value={editingRow.test}
                    onChange={(e) =>
                      setEditingRow({
                        ...editingRow,
                        test: e.target.value as StandardRow['test'],
                      })
                    }
                    className="w-full px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-[#0e1411] text-stone-900 dark:text-stone-100 font-heading uppercase font-bold"
                  >
                    {TEST_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-heading uppercase font-bold text-stone-800 dark:text-stone-200 mb-1">Sex</label>
                  <select
                    value={editingRow.sex}
                    onChange={(e) =>
                      setEditingRow({
                        ...editingRow,
                        sex: e.target.value as StandardRow['sex'],
                      })
                    }
                    className="w-full px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-[#0e1411] text-stone-900 dark:text-stone-100 font-heading uppercase font-bold"
                  >
                    <option value="all">ALL (BOTH MALE & FEMALE)</option>
                    <option value="male">MALE</option>
                    <option value="female">FEMALE</option>
                  </select>
                </div>

                <div>
                  <label className="block font-heading uppercase font-bold text-stone-800 dark:text-stone-200 mb-1">Min Age</label>
                  <input
                    type="number"
                    value={editingRow.age_min}
                    onChange={(e) =>
                      setEditingRow({
                        ...editingRow,
                        age_min: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-[#0e1411] text-stone-900 dark:text-stone-100 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-heading uppercase font-bold text-stone-800 dark:text-stone-200 mb-1">Max Age</label>
                  <input
                    type="number"
                    value={editingRow.age_max}
                    onChange={(e) =>
                      setEditingRow({
                        ...editingRow,
                        age_max: parseInt(e.target.value, 10) || 99,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-[#0e1411] text-stone-900 dark:text-stone-100 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-heading uppercase font-bold text-stone-800 dark:text-stone-200 mb-1">Category Label</label>
                  <input
                    type="text"
                    value={editingRow.category}
                    onChange={(e) =>
                      setEditingRow({ ...editingRow, category: e.target.value })
                    }
                    placeholder="e.g. Excellent / Good / Fair / Needs Improvement"
                    className="w-full px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-[#0e1411] text-stone-900 dark:text-stone-100 font-heading uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block font-heading uppercase font-bold text-stone-800 dark:text-stone-200 mb-1">Unit</label>
                  <input
                    type="text"
                    value={editingRow.unit}
                    onChange={(e) =>
                      setEditingRow({ ...editingRow, unit: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-[#0e1411] text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-heading uppercase font-bold text-stone-800 dark:text-stone-200 mb-1">Min Value</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingRow.min}
                    onChange={(e) =>
                      setEditingRow({
                        ...editingRow,
                        min: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-[#0e1411] text-stone-900 dark:text-stone-100 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-heading uppercase font-bold text-stone-800 dark:text-stone-200 mb-1">Max Value</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingRow.max}
                    onChange={(e) =>
                      setEditingRow({
                        ...editingRow,
                        max: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-[#0e1411] text-stone-900 dark:text-stone-100 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-heading uppercase font-bold text-stone-800 dark:text-stone-200 mb-1">Source / Citation</label>
                <input
                  type="text"
                  value={editingRow.source}
                  onChange={(e) =>
                    setEditingRow({ ...editingRow, source: e.target.value })
                  }
                  placeholder="SAMPLE - REPLACE WITH DepEd VALUES"
                  className="w-full px-3 py-2 rounded-xs border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-[#0e1411] text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="pt-4 border-t-2 border-stone-200 dark:border-stone-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-stone-600 dark:text-stone-400 font-heading uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#144e34] hover:bg-[#0d3221] text-white font-heading uppercase tracking-wider font-extrabold text-xs rounded-xs border border-emerald-400/30"
                >
                  Save Standard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
