import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'warning'
            ? AlertCircle
            : toast.type === 'error'
            ? XCircle
            : Info;

        const borderClass =
          toast.type === 'success'
            ? 'border-emerald-500/40 bg-slate-900/95 text-emerald-400'
            : toast.type === 'warning'
            ? 'border-amber-500/40 bg-slate-900/95 text-amber-400'
            : toast.type === 'error'
            ? 'border-rose-500/40 bg-slate-900/95 text-rose-400'
            : 'border-indigo-500/40 bg-slate-900/95 text-indigo-400';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-xl backdrop-blur-md flex items-start space-x-3 transition-all transform animate-slideIn ${borderClass}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <div className="font-semibold text-slate-100">{toast.title}</div>
              {toast.description && <div className="text-slate-400 mt-0.5 leading-relaxed">{toast.description}</div>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition p-0.5 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
