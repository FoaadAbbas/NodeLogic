import React from 'react';
import { X, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const icon = { warning: AlertTriangle, error: AlertCircle, info: Info };
const cls  = {
  warning: 'border-yellow-500 bg-yellow-500/10',
  error:   'border-red-500 bg-red-500/10',
  info:    'border-blue-500 bg-blue-500/10',
};

export default function Toast({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(t => {
        const Icon = icon[t.type] || Info;
        return (
          <div key={t.id}
               className={`toast-enter flex items-start gap-3 p-4 rounded-lg border ${cls[t.type] || cls.info} backdrop-blur-sm shadow-lg`}>
            <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-nl-text flex-1">{t.message}</p>
            <button onClick={() => onDismiss(t.id)} className="text-nl-muted hover:text-nl-text">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
