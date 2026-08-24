
import axios, { AxiosError } from 'axios';
import axiosInstance from '../api/axios';
import { User, UserRole } from '../context/AuthContext';

// ============================================================
// DTO TypeScript alignés 1:1 avec le backend Spring Boot
// ============================================================

/**
 * Correspond à com.oseor.daba.auth.dto.LoginRequest
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Correspond à com.oseor.daba.auth.dto.RegisterRequest
 */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

/**
 * Correspond à com.oseor.daba.auth.dto.UserAuthResponse
 * (renvoyé par UserMapper.toAuthResponse())
 */
export interface UserAuthResponseDTO {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  roles: UserRole[];
  permissions: string[];
}

/**
 * Correspond à com.oseor.daba.auth.dto.AuthResponse
 */
export interface AuthResponseDTO {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserAuthResponseDTO;
}

/**
 * Correspond à com.oseor.daba.common.dto.ApiResponse<AuthResponse>
 * (enveloppe retournée par AuthController)
 */
export interface ApiResponseDTO<T> {
  timestamp?: string;
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Correspond à com.oseor.daba.common.dto.ErrorResponse
 * (enveloppe retournée par GlobalExceptionHandler)
 */
export interface ErrorResponseDTO {
  timestamp?: string;
  status: number;
  error?: string;
  message?: string;
  details?: string[];
  path?: string;
}

// ============================================================
// HELPERS
// ============================================================
export function extractBackendErrorMessage(err: unknown): string {
  const defaultMsg = 'Une erreur est survenue. Veuillez réessayer.';
  if (!err) return defaultMsg;
  if (axios.isAxiosError(err)) {
    const axErr = err as AxiosError<ErrorResponseDTO | ApiResponseDTO<unknown>>;
    const body = axErr.response?.data;
    if (body) {
      const anyBody = body as unknown as {
        success?: boolean;
        message?: string;
        details?: string[];
      };
      if (typeof anyBody.success === 'boolean' && !anyBody.success && anyBody.message) {
        return anyBody.message;
      }
      if (anyBody.message) {
        if (Array.isArray(anyBody.details) && anyBody.details.length > 0) {
          return `${anyBody.message} : ${anyBody.details.join(', ')}`;
        }
        return anyBody.message;
      }
    }
    if (axErr.code === 'ERR_NETWORK') {
      return 'Serveur indisponible. Vérifiez votre connexion ou réessayez plus tard.';
    }
    if (axErr.code === 'ECONNABORTED') {
      return 'Le serveur a mis trop de temps à répondre. Réessayez.';
    }
    if (axErr.message) return axErr.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return defaultMsg;
}

// ============================================================
// MAPPING DTO -> Modèle (User AuthContext)
// ============================================================
function mapAuthResponseToUser(auth: AuthResponseDTO): User {
  return {
    id: String(auth.user.id),
    email: auth.user.email,
    firstName: auth.user.firstName,
    lastName: auth.user.lastName,
    name: `${auth.user.firstName} ${auth.user.lastName}`,
    phone: auth.user.phone ?? null,
    roles: auth.user.roles ?? [],
    permissions: auth.user.permissions ?? [],
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    tokenType: auth.tokenType ?? 'Bearer',
    expiresIn: auth.expiresIn ?? 86400000,
    tokenIssuedAt: Date.now(),
  };
}

// ============================================================
// SERVICE
// ============================================================

/**
 * Promise partagée pour dédupliquer les appels /auth/refresh concurrents.
 * Si N requêtes obtiennent un 401 en même temps, une seule est envoyée au backend.
 * (Le refresh token est rotatif : sans dédup, les N-1 suivantes liraient un token
 * déjà révoqué par la rotation côté serveur.)
 */
let refreshInFlight: Promise<User | null> | null = null;

export const authService = {
  /**
   * POST /api/auth/login
   * Correspond à AuthController.login()
   * @throws {AxiosError} Propagation native pour récupérer message backend côté UI
   */
  async login(loginRequest: LoginRequest): Promise<User> {
    return axiosInstance
      .post<ApiResponseDTO<AuthResponseDTO>>('/auth/login', loginRequest)
      .then((response) => {
        const payload = response.data;
        if (!payload?.success || !payload.data) {
          const err = new Error(payload?.message ?? 'Erreur de connexion');
          throw err;
        }
        return mapAuthResponseToUser(payload.data);
      });
  },

  /**
   * POST /api/auth/register
   * Correspond à AuthController.register()
   * Rôle par défaut côté backend : EMPLOYE
   */
  async register(registerRequest: RegisterRequest): Promise<User> {
    return axiosInstance
      .post<ApiResponseDTO<AuthResponseDTO>>('/auth/register', registerRequest)
      .then((response) => {
        const payload = response.data;
        if (!payload?.success || !payload.data) {
          const err = new Error(payload?.message ?? "Erreur d'inscription");
          throw err;
        }
        return mapAuthResponseToUser(payload.data);
      });
  },

  /**
   * Invoqué par l'intercepteur Axios lors de l'expiration du access token.
   * Les appels concurrents sont dédupliqués via `refreshInFlight`.
   */
  async refreshToken(): Promise<User | null> {
    if (refreshInFlight) {
      return refreshInFlight;
    }

    refreshInFlight = (async () => {
      try {
        const stored = localStorage.getItem('daba_user');
        if (!stored) return null;
        const currentUser = JSON.parse(stored) as User;
        if (!currentUser?.refreshToken) return null;

        const response = await axiosInstance.post<ApiResponseDTO<AuthResponseDTO>>(
          '/auth/refresh',
          { refreshToken: currentUser.refreshToken },
          { skipAuthRefresh: true } as any,
        );

        const payload = response.data;
        if (!payload?.success || !payload.data) return null;

        const refreshedUser = mapAuthResponseToUser(payload.data);
        localStorage.setItem('daba_user', JSON.stringify(refreshedUser));
        return refreshedUser;
      } catch {
        return null;
      } finally {
        // Réinitialiser APRÈS que tous les appelants aient reçu la réponse.
        // Le microtask suivant garantit que les N-1 awaits en attente ont convergé.
        queueMicrotask(() => {
          refreshInFlight = null;
        });
      }
    })();

    return refreshInFlight;
  },

  async logout(): Promise<void> {
    // Envoie l'access + refresh token au backend pour révocation (blacklist).
    // On lit localStorage directement car le contexte peut avoir été vidé
    // (ex: plusieurs onglets). On tolère l'échec réseau : l'important est
    // de vider le state local.
    try {
      const stored = localStorage.getItem('daba_user');
      if (stored) {
        const u = JSON.parse(stored) as User;
        if (u?.accessToken || u?.refreshToken) {
          await axiosInstance.post(
            '/auth/logout',
            { accessToken: u.accessToken, refreshToken: u.refreshToken },
            { skipAuthRefresh: true } as any,
          );
        }
      }
    } catch {
      // Le backend a peut-être rejeté (token déjà expiré, etc.) : on continue
      // le nettoyage local de toute façon. La sécurité reste assurée.
    } finally {
      localStorage.removeItem('daba_user');
    }
  },
};
