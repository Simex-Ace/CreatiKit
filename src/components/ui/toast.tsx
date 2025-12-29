'use client';

import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex items-center gap-2.5 rounded-md border bg-background/95 backdrop-blur-sm px-3.5 py-2.5 shadow-sm min-w-[240px] max-w-[360px]',
            'animate-in slide-in-from-bottom-1 fade-in-0 duration-200',
            toast.variant === 'destructive' && 'border-red-200/50 bg-red-50/80 dark:bg-red-950/20',
            toast.variant === 'success' && 'border-green-200/50 bg-green-50/80 dark:bg-green-950/20',
            toast.variant === 'warning' && 'border-yellow-200/50 bg-yellow-50/80 dark:bg-yellow-950/20',
            toast.variant === 'info' && 'border-blue-200/50 bg-blue-50/80 dark:bg-blue-950/20',
            toast.variant === 'default' && 'border-border/50'
          )}
        >
          {toast.variant === 'success' && (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-500 flex-shrink-0" />
          )}
          {toast.variant === 'destructive' && (
            <AlertCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-500 flex-shrink-0" />
          )}
          {toast.variant === 'warning' && (
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
          )}
          {(toast.variant === 'info' || toast.variant === 'default') && (
            <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500 flex-shrink-0" />
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium leading-tight text-foreground">{toast.title}</p>
            {toast.description && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {toast.description}
              </p>
            )}
          </div>
          
          <button
            onClick={() => dismiss(toast.id)}
            className="text-muted-foreground/50 hover:text-muted-foreground transition-colors flex-shrink-0"
            aria-label="关闭"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

