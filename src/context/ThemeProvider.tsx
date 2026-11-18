import React, { useEffect, useState } from 'react';
import { ThemeContext } from './ThemeContext';
import type { Theme } from './ThemeTypes';

const STORAGE_KEY = 'vg_theme';

function getInitialTheme(): { theme: Theme; isSystem: boolean } {
  if (typeof window === 'undefined') {
    return { theme: 'dark', isSystem: true };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return { theme: stored, isSystem: false };
    }

    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return { theme: systemPrefersDark ? 'dark' : 'light', isSystem: true };
  } catch {
    return { theme: 'dark', isSystem: true };
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeState, setThemeState] = useState<{ theme: Theme; isSystem: boolean }>(getInitialTheme);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', themeState.theme);
    root.style.colorScheme = themeState.theme;
  }, [themeState.theme]);

  // Synchronize with OS theme changes if user hasn't set an explicit preference
  useEffect(() => {
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          setThemeState({
            theme: e.matches ? 'dark' : 'light',
            isSystem: true,
          });
        }
      } catch {
        // storage access blocked or unavailable
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  // Listen to storage events from other tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
        setThemeState({ theme: e.newValue, isSystem: false });
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // storage access blocked or unavailable
    }
    setThemeState({ theme: newTheme, isSystem: false });
  };

  const toggleTheme = () => {
    const nextTheme = themeState.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: themeState.theme,
        toggleTheme,
        setTheme,
        isSystemTheme: themeState.isSystem,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
