export type NotifyType = 'success' | 'error';

export function notify(message: string, type: NotifyType = 'success'): void {
  const div = document.createElement('div');
  div.className = `fixed top-4 right-4 z-[9999] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold transition-all ${
    type === 'success' ? 'bg-brand-green' : 'bg-red-600'
  }`;
  div.textContent = message;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3500);
}

