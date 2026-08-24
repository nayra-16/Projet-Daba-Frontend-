import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

// ============================================================
// TYPES
// ============================================================

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  /** Mode courant ('light' | 'dark') */
  theme: ThemeMode;
  /** True si le thème sombre est actif (raccourci) */
  isDark: boolean;
  /** Bascule light <-> dark */
  toggleTheme: () => void;
  /** Force un thème précis */
  setTheme: (mode: ThemeMode) => void;
}

// ============================================================
// CONSTANTES
// ============================================================

const STORAGE_KEY = 'daba_theme';
const HTML_CLASS = 'dark';

// ============================================================
// HELPERS
// ============================================================

function readThemeFromStorage(): ThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark') return raw;
  } catch {
    /* localStorage indisponible (ex: SSR / navigation privée) */
  }
  // Détection préférence système en fallback
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  }
  return 'light';
}

function writeThemeToStorage(mode: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* silencieux */
  }
}

function applyThemeToDocument(mode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (mode === 'dark') {
    root.classList.add(HTML_CLASS);
  } else {
    root.classList.remove(HTML_CLASS);
  }
}

// ============================================================
// CONTEXT
// ============================================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ============================================================
// PROVIDER
// ============================================================

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialisation paresseuse : on lit localStorage au 1er render
  const [theme, setThemeState] = useState<ThemeMode>(() => readThemeFromStorage());

  // Application immédiate du thème sur <html> à chaque changement
  useEffect(() => {
    applyThemeToDocument(theme);
    writeThemeToStorage(theme);
  }, [theme]);

  // Synchronisation multi-onglets : si un autre onglet change le thème,
  // on suit le mouvement sans rechargement.
  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        const next = readThemeFromStorage();
        setThemeState(next);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo<ThemeContextType>(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme,
      setTheme,
    }),
    [theme, toggleTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// ============================================================
// HOOK
// ============================================================

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
