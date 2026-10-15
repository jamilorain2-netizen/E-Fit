export type ThemeMode = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'studentfit_theme';

export function getStoredTheme(): ThemeMode {
  try {
    const val = localStorage.getItem(THEME_STORAGE_KEY);
    if (val === 'light' || val === 'dark' || val === 'system') {
      return val;
    }
  } catch (e) {
    // ignore
  }
  return 'system';
}

export function applyTheme(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch (e) {
    // ignore
  }

  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = mode === 'dark' || (mode === 'system' && prefersDark);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function initThemeListener(onChange: (mode: ThemeMode) => void): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    const current = getStoredTheme();
    if (current === 'system') {
      applyTheme('system');
      onChange('system');
    }
  };

  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}
