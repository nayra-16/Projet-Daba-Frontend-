export function getApiErrorMessage(err: unknown, fallback: string): string {
  const anyErr: any = err as any;

  const apiMessage =
    anyErr?.response?.data?.message ??
    anyErr?.response?.data?.error ??
    anyErr?.response?.data?.title ??
    anyErr?.message;

  if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage;

  const status = anyErr?.response?.status;
  if (typeof status === 'number') {
    if (status === 401) return 'Session expirée. Veuillez vous reconnecter.';
    if (status === 403) return 'Accès refusé. Vous n’avez pas les droits nécessaires.';
    if (status >= 500) return 'Erreur serveur. Veuillez réessayer plus tard.';
  }

  return fallback;
}

