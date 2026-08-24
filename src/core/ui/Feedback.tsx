import React, { useState, useEffect, useCallback, useMemo } from 'react';

// ============================================================
// TOAST — notifications globales
// ============================================================

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

type Listener = (toasts: Toast[]) => void;

class ToastManager {
  private toasts: Toast[] = [];
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.toasts));
  }

  show(type: ToastType, title: string, message?: string, duration = 4000) {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const toast: Toast = { id, type, title, message };
    this.toasts = [...this.toasts, toast];
    this.notify();
    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== id);
      this.notify();
    }, duration);
  }

  success(title: string, message?: string) {
    this.show('success', title, message);
  }
  error(title: string, message?: string) {
    this.show('error', title, message, 6000);
  }
  info(title: string, message?: string) {
    this.show('info', title, message);
  }
  warning(title: string, message?: string) {
    this.show('warning', title, message);
  }
}

export const toast = new ToastManager();

const typeStyles: Record<ToastType, { bg: string; border: string; icon: string; iconChar: string }> = {
  success: { bg: 'bg-brand-green', border: 'border-brand-green', icon: 'text-white', iconChar: '✓' },
  error: { bg: 'bg-brand-red', border: 'border-brand-red', icon: 'text-white', iconChar: '✕' },
  info: { bg: 'bg-brand-blue', border: 'border-brand-blue', icon: 'text-white', iconChar: 'ⓘ' },
  warning: { bg: 'bg-orange-500', border: 'border-orange-500', icon: 'text-white', iconChar: '⚠' },
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => toast.subscribe(setToasts), []);

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-md">
      {toasts.map((t) => {
        const s = typeStyles[t.type];
        return (
          <div
            key={t.id}
            className={`${s.bg} ${s.border} text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-right-4 border-l-4`}
          >
            <span className={`${s.icon} text-xl font-bold flex-shrink-0`}>
              {s.iconChar}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-bold">{t.title}</p>
              {t.message && <p className="text-sm text-white/90 mt-0.5">{t.message}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// MODAL — modal réutilisable
// ============================================================

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, size = 'md', footer }) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h3 className="text-xl font-bold text-slate-100">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Fermer"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="p-4 border-t border-slate-800 bg-slate-800/50 rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  );
};

// ============================================================
// CONFIRM — modal de confirmation
// ============================================================

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  danger: boolean;
  resolve?: (v: boolean) => void;
}

type ConfirmListener = (state: ConfirmState) => void;

class ConfirmManager {
  private state: ConfirmState = {
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirmer',
    cancelLabel: 'Annuler',
    danger: false,
  };
  private listeners: Set<ConfirmListener> = new Set();

  getState(): ConfirmState {
    return this.state;
  }

  subscribe(l: ConfirmListener) {
    this.listeners.add(l);
    l(this.state);
    return () => {
      this.listeners.delete(l);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.state));
  }

  ask(options: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
  }): Promise<boolean> {
    return new Promise((resolve) => {
      this.state = {
        open: true,
        title: options.title,
        message: options.message,
        confirmLabel: options.confirmLabel ?? 'Confirmer',
        cancelLabel: options.cancelLabel ?? 'Annuler',
        danger: options.danger ?? false,
        resolve,
      };
      this.notify();
    });
  }

  private close(v: boolean) {
    if (this.state.resolve) this.state.resolve(v);
    this.state = { ...this.state, open: false, resolve: undefined };
    this.notify();
  }

  get confirm() {
    return (v: boolean) => this.close(v);
  }
}

export const confirmDialog = new ConfirmManager();

export const ConfirmContainer: React.FC = () => {
  const [state, setState] = useState<ConfirmState>(confirmDialog.getState());

  useEffect(() => confirmDialog.subscribe(setState), []);

  return (
    <Modal
      open={state.open}
      onClose={() => confirmDialog.confirm(false)}
      title={state.title}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => confirmDialog.confirm(false)}
            className="px-4 py-2 rounded-xl font-bold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            {state.cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => confirmDialog.confirm(true)}
            className={`px-4 py-2 rounded-xl font-bold text-white shadow-md transition-colors ${
              state.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#42B649] hover:opacity-90'
            }`}
          >
            {state.confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-slate-300 leading-relaxed">{state.message}</p>
    </Modal>
  );
};

// ============================================================
// EXPORT HOOKS UTILITAIRES
// ============================================================

export const useToast = () => {
  return useMemo(() => ({
    success: (title: string, msg?: string) => toast.success(title, msg),
    error: (title: string, msg?: string) => toast.error(title, msg),
    info: (title: string, msg?: string) => toast.info(title, msg),
    warning: (title: string, msg?: string) => toast.warning(title, msg),
  }), []);
};

export const useConfirm = () => {
  const ask = useCallback(
    (options: {
      title: string;
      message: string;
      confirmLabel?: string;
      cancelLabel?: string;
      danger?: boolean;
    }) => confirmDialog.ask(options),
    []
  );
  const fn: any = ask;
  fn.ask = ask;
  return fn as ((options: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
  }) => Promise<boolean>) & {
    ask: (options: {
      title: string;
      message: string;
      confirmLabel?: string;
      cancelLabel?: string;
      danger?: boolean;
    }) => Promise<boolean>;
  };
};
