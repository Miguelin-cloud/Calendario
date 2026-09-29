import React from 'react';
import { X, Bell, Heart, Calendar } from 'lucide-react';

export interface ToastNotification {
  id: string;
  title: string;
  body: string;
  type?: 'event' | 'message' | 'plan';
}

interface NotificationToastProps {
  toast: ToastNotification | null;
  onDismiss: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  return (
    <aside
      aria-label="Alerta en tiempo real"
      className="fixed top-4 right-4 z-50 max-w-sm w-full bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-2xl shadow-2xl p-3.5 flex items-start gap-3 animate-in slide-in-from-top-3 fade-in duration-200 backdrop-blur-md"
    >
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
        {toast.type === 'message' ? (
          <Heart className="w-4 h-4 fill-white text-white" />
        ) : (
          <Calendar className="w-4 h-4 text-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate">
          {toast.title}
        </h4>
        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
          {toast.body}
        </p>
      </div>

      <button
        onClick={onDismiss}
        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1"
        aria-label="Cerrar notificación"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};
