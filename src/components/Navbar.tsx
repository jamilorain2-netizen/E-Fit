import React, { useState, useEffect } from 'react';
import {
  Activity,
  User,
  ShieldCheck,
  ClipboardList,
  FileText,
  TrendingUp,
  CalendarCheck,
  Target,
  Settings,
  Sun,
  Moon,
  Laptop,
  ChevronDown,
} from 'lucide-react';
import { StudentProfile, FitnessTestKey, UserRole } from '../types';
import { ThemeMode, getStoredTheme, applyTheme, initThemeListener } from '../utils/theme';

export type NavTab =
  | 'profile'
  | 'safety'
  | 'tests'
  | 'report'
  | 'progress'
  | 'habits'
  | 'goalPlan'
  | 'dashboard'
  | 'teacher';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activeTestKey: FitnessTestKey;
  setActiveTestKey: (key: FitnessTestKey) => void;
  student: StudentProfile | null;
  profiles: StudentProfile[];
  currentRole: UserRole;
  onRequestTeacherMode: () => void;
  onSwitchToStudentMode: () => void;
  onSelectProfile: (id: string) => void;
  onNewProfile: () => void;
  onStudentLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  onRequestTeacherMode,
  onSwitchToStudentMode,
}) => {
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(getStoredTheme());

  useEffect(() => {
    applyTheme(currentTheme);
    const cleanup = initThemeListener((newMode) => {
      setCurrentTheme(newMode);
    });
    return cleanup;
  }, []);

  const handleSelectTheme = (mode: ThemeMode) => {
    setCurrentTheme(mode);
    applyTheme(mode);
    setThemeDropdownOpen(false);
  };

  const navItems: { tab: NavTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { tab: 'safety', label: 'Safety', icon: <ShieldCheck className="w-4 h-4" /> },
    { tab: 'tests', label: 'Tests', icon: <ClipboardList className="w-4 h-4" /> },
    { tab: 'report', label: 'Report', icon: <FileText className="w-4 h-4" /> },
    { tab: 'progress', label: 'Progress', icon: <TrendingUp className="w-4 h-4" /> },
    { tab: 'habits', label: 'Habits', icon: <CalendarCheck className="w-4 h-4" /> },
    { tab: 'goalPlan', label: 'Goal Plan', icon: <Target className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="bg-[#FFFFFF] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#FFFFFF] border-b-3 border-[#0A0A0A] dark:border-[#FFFFFF] sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Wordmark */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab(currentRole === 'teacher' ? 'dashboard' : 'profile')}
                className="flex items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E10600] rounded-xs transition-transform active:translate-y-px"
              >
                <span className="font-heading text-2xl sm:text-4xl tracking-wide uppercase text-[#0A0A0A] dark:text-[#FFFFFF]">
                  STUDENT FIT
                </span>
              </button>

              {/* Desktop Nav Tabs */}
              <nav className="hidden md:flex items-center gap-1 ml-6">
                {navItems.map((item) => {
                  const isActive = activeTab === item.tab;
                  return (
                    <button
                      key={item.tab}
                      onClick={() => setActiveTab(item.tab)}
                      className={`px-3 py-1.5 rounded-xs font-heading uppercase tracking-wider text-sm flex items-center gap-1.5 transition-colors border-2 ${
                        isActive
                          ? 'bg-[#E10600] text-[#FFFFFF] border-[#0A0A0A] dark:border-[#FFFFFF]'
                          : 'bg-transparent text-[#0A0A0A] dark:text-[#FFFFFF] border-transparent hover:border-[#0A0A0A] dark:hover:border-[#FFFFFF]'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right: Theme Toggle & Role Switcher */}
            <div className="flex items-center gap-3">
              {currentRole === 'student' ? (
                <button
                  onClick={onRequestTeacherMode}
                  className="hidden sm:inline-flex px-3 py-1.5 gym-button-secondary text-xs uppercase font-bold"
                >
                  Teacher Mode
                </button>
              ) : (
                <button
                  onClick={onSwitchToStudentMode}
                  className="hidden sm:inline-flex px-3 py-1.5 gym-button-primary text-xs uppercase font-bold"
                >
                  Student Mode
                </button>
              )}

              {/* Theme Toggle Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                  className="px-3 py-2 gym-button-secondary flex items-center gap-2 text-xs uppercase font-bold"
                  aria-label="Toggle theme"
                >
                  {currentTheme === 'dark' ? (
                    <Moon className="w-4 h-4 text-[#E10600]" />
                  ) : currentTheme === 'light' ? (
                    <Sun className="w-4 h-4 text-[#E10600]" />
                  ) : (
                    <Laptop className="w-4 h-4 text-[#E10600]" />
                  )}
                  <span className="hidden sm:inline capitalize">{currentTheme}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {themeDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-36 gym-card py-1 z-50">
                    <button
                      onClick={() => handleSelectTheme('light')}
                      className={`w-full text-left px-3 py-2 text-xs font-heading uppercase flex items-center gap-2 hover:bg-[#E10600] hover:text-[#FFFFFF] ${
                        currentTheme === 'light' ? 'bg-[#E10600] text-[#FFFFFF]' : ''
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>Light</span>
                    </button>
                    <button
                      onClick={() => handleSelectTheme('dark')}
                      className={`w-full text-left px-3 py-2 text-xs font-heading uppercase flex items-center gap-2 hover:bg-[#E10600] hover:text-[#FFFFFF] ${
                        currentTheme === 'dark' ? 'bg-[#E10600] text-[#FFFFFF]' : ''
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>Dark</span>
                    </button>
                    <button
                      onClick={() => handleSelectTheme('system')}
                      className={`w-full text-left px-3 py-2 text-xs font-heading uppercase flex items-center gap-2 hover:bg-[#E10600] hover:text-[#FFFFFF] ${
                        currentTheme === 'system' ? 'bg-[#E10600] text-[#FFFFFF]' : ''
                      }`}
                    >
                      <Laptop className="w-3.5 h-3.5" />
                      <span>System</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FFFFFF] dark:bg-[#0A0A0A] border-t-3 border-[#0A0A0A] dark:border-[#FFFFFF] z-40 print:hidden flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xs font-heading uppercase text-[10px] tracking-wider transition-colors ${
                isActive
                  ? 'text-[#E10600] font-bold'
                  : 'text-[#8A8A8A] hover:text-[#0A0A0A] dark:hover:text-[#FFFFFF]'
              }`}
            >
              <div className={isActive ? 'text-[#E10600]' : 'text-[#8A8A8A]'}>{item.icon}</div>
              <span className="mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
