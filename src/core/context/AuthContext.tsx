
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '../services/authService';

// ============================================================
// TYPES
// ============================================================

/**
 * Liste des rôles réellement présents dans le backend Spring Boot
 * (cf. SecurityDataInitializer.java).
 */
export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'DIRECTEUR'
  | 'RESPONSABLE_ELEVAGE'
  | 'RESPONSABLE_PRODUCTION'
  | 'RESPONSABLE_STOCK'
  | 'RESPONSABLE_COMMERCIAL'
  | 'RESPONSABLE_ACHATS'
  | 'RESPONSABLE_RH'
  | 'RESPONSABLE_FINANCES'
  | 'RESPONSABLE_ABATTAGE'
  | 'RESPONSABLE_DECOUPE'
  | 'RESPONSABLE_TRANSFORMATION'
  | 'RESPONSABLE_CONDITIONNEMENT'
  | 'RESPONSABLE_QUALITE'
  | 'EMPLOYE'
  | 'CUSTOMER';

/**
 * Modèle utilisateur AuthContext.
 * Aligné 1:1 avec com.oseor.daba.auth.dto.AuthResponse + UserAuthResponse.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  roles: UserRole[];
  permissions: string[];
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  /** Epoch (ms) de l'émission du token (calculé à la connexion ou au refresh) */
  tokenIssuedAt: number;
}

// ============================================================
// SOURCE UNIQUE DE L'ÉTAT D'AUTHENTIFICATION
// ============================================================

export interface AuthContextType {
  // --- ÉTAT ---
  /** Utilisateur courant (null si non connecté) */
  user: User | null;
  /** True si un utilisateur est authentifié */
  isAuthenticated: boolean;
  /**
   * True une fois que la tentative de restauration depuis localStorage
   * est terminée (succès ou échec). Permet de distinguer "chargement
   * en cours" de "non authentifié" dans l'UI (ProtectedRoute, splash).
   */
  isInitialized: boolean;
  /** True pendant un appel login() en cours */
  isAuthenticating: boolean;
  /** True pendant un appel refreshSession() en cours */
  isRefreshing: boolean;

  // --- TOKENS (accès direct pour intercepteurs) ---
  accessToken: string | null;
  refreshToken: string | null;

  // --- ACTIONS ---
  /** Enregistre l'authentification (utilisé par authService.login → mapping) */
  login: (user: User) => void;
  /** Met à jour l'objet User complet (utile pour les refresh) */
  updateUser: (user: User) => void;
  /** Met à jour uniquement les tokens (utilisé par refreshSession) */
  updateTokens: (tokens: { accessToken: string; refreshToken: string; expiresIn?: number }) => void;
  /** Déconnecte l'utilisateur et nettoie toute trace */
  logout: () => Promise<void>;
  /** Tente de restaurer la session depuis localStorage. Renvoie l'utilisateur ou null. */
  restoreSession: () => User | null;
  /** Appelle /api/auth/refresh et met à jour l'état. Renvoie le User ou null. */
  refreshSession: () => Promise<User | null>;

  // --- HELPERS ---
  hasRole: (roles: UserRole[]) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasAllRoles: (roles: UserRole[]) => boolean;
  hasPermission: (permissions: string[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  getPrimaryRole: () => UserRole | null;
  isTokenExpired: () => boolean;
  hasAnyRoleOrPermission: (roles: UserRole[], permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'daba_user';
const STORAGE_EVENT = 'storage';

// ============================================================
// HELPERS INTERNES
// ============================================================

function readUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User;
    if (!parsed?.accessToken || !parsed?.refreshToken) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function writeUserToStorage(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// ============================================================
// PROVIDER
// ============================================================

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // === ÉTAT RÉACTIF ===
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Garde-fou contre les appels refresh concurrents
  const refreshPromiseRef = useRef<Promise<User | null> | null>(null);

  // === DÉRIVÉS ===
  const isAuthenticated = user !== null;

  // === PERSISTANCE AUTOMATIQUE ===
  // Toute modification de `user` est synchronisée avec localStorage.
  useEffect(() => {
    writeUserToStorage(user);
  }, [user]);

  // === RESTAURATION AU MONTAGE ===
  const restoreSession = useCallback((): User | null => {
    const restored = readUserFromStorage();
    setUser(restored);
    setIsInitialized(true);
    return restored;
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // === SYNCHRO MULTI-ONGLETS ===
  // Si l'utilisateur se déconnecte dans un autre onglet, on synchronise.
  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        const fresh = readUserFromStorage();
        setUser(fresh);
      }
    };
    window.addEventListener(STORAGE_EVENT, handler);
    return () => window.removeEventListener(STORAGE_EVENT, handler);
  }, []);

  // === ACTIONS ===

  const login = useCallback((newUser: User) => {
    setUser(newUser);
  }, []);

  const updateUser = useCallback((next: User) => {
    setUser(next);
  }, []);

  const updateTokens = useCallback(
    (tokens: { accessToken: string; refreshToken: string; expiresIn?: number }) => {
      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn ?? prev.expiresIn,
          tokenIssuedAt: Date.now(),
        };
      });
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<User | null> => {
    // Si un refresh est déjà en cours, on s'y attache (déduplication)
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    setIsRefreshing(true);
    const promise = (async () => {
      try {
        const refreshed = await authService.refreshToken();
        if (refreshed) {
          setUser(refreshed);
          return refreshed;
        }
        // Refresh échoué → forcer logout
        setUser(null);
        return null;
      } catch {
        setUser(null);
        return null;
      } finally {
        setIsRefreshing(false);
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = promise;
    return promise;
  }, []);

  // === HELPERS DE RÔLES / PERMISSIONS ===

  const hasRole = useCallback(
    (roles: UserRole[]) => Array.isArray(roles) && user?.roles?.some((r) => roles.includes(r)) === true,
    [user],
  );
  const hasAnyRole = useCallback((roles: UserRole[]) => hasRole(roles), [hasRole]);
  const hasAllRoles = useCallback(
    (roles: UserRole[]) => {
      if (!user) return false;
      if (!Array.isArray(roles) || roles.length === 0) return true;
      return roles.every((r) => user.roles.includes(r));
    },
    [user],
  );

  const hasPermission = useCallback(
    (permissions: string[]) =>
      Array.isArray(permissions) && user?.permissions?.some((p) => permissions.includes(p)) === true,
    [user],
  );
  const hasAnyPermission = useCallback((p: string[]) => hasPermission(p), [hasPermission]);
  const hasAllPermissions = useCallback(
    (permissions: string[]) => {
      if (!user) return false;
      if (!Array.isArray(permissions) || permissions.length === 0) return true;
      return permissions.every((p) => user.permissions.includes(p));
    },
    [user],
  );

  const hasAnyRoleOrPermission = useCallback(
    (roles: UserRole[], permissions: string[]) => hasAnyRole(roles) || hasAnyPermission(permissions),
    [hasAnyRole, hasAnyPermission],
  );

  const getPrimaryRole = useCallback((): UserRole | null => {
    if (!user?.roles || user.roles.length === 0) return null;
    // Ordre de priorité : ADMIN > DIRECTEUR > RESPONSABLE_* > EMPLOYE > CUSTOMER
    const priority: UserRole[] = [
      'SUPER_ADMIN',
      'ADMIN',
      'DIRECTEUR',
      'RESPONSABLE_ELEVAGE',
      'RESPONSABLE_PRODUCTION',
      'RESPONSABLE_STOCK',
      'RESPONSABLE_COMMERCIAL',
      'RESPONSABLE_ACHATS',
      'RESPONSABLE_RH',
      'RESPONSABLE_FINANCES',
      'RESPONSABLE_ABATTAGE',
      'RESPONSABLE_DECOUPE',
      'RESPONSABLE_TRANSFORMATION',
      'RESPONSABLE_CONDITIONNEMENT',
      'RESPONSABLE_QUALITE',
      'EMPLOYE',
      'CUSTOMER',
    ];
    for (const r of priority) {
      if (user.roles.includes(r)) return r;
    }
    return user.roles[0] ?? null;
  }, [user]);

  const isTokenExpired = useCallback((): boolean => {
    if (!user) return true;
    const issued = user.tokenIssuedAt ?? 0;
    const lifetime = user.expiresIn ?? 0;
    if (lifetime <= 0) return false;
    return Date.now() >= issued + lifetime;
  }, [user]);

  // === VALUE CONTEXT (mémorisée pour éviter re-renders inutiles) ===
  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated,
      isInitialized,
      isAuthenticating,
      isRefreshing,
      accessToken: user?.accessToken ?? null,
      refreshToken: user?.refreshToken ?? null,
      login,
      updateUser,
      updateTokens,
      logout,
      restoreSession,
      refreshSession,
      hasRole,
      hasAnyRole,
      hasAllRoles,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasAnyRoleOrPermission,
      getPrimaryRole,
      isTokenExpired,
    }),
    [
      user,
      isAuthenticated,
      isInitialized,
      isAuthenticating,
      isRefreshing,
      login,
      updateUser,
      updateTokens,
      logout,
      restoreSession,
      refreshSession,
      hasRole,
      hasAnyRole,
      hasAllRoles,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasAnyRoleOrPermission,
      getPrimaryRole,
      isTokenExpired,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================================
// HOOK
// ============================================================
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
