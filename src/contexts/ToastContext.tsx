'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

interface Toast {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (props: { title: string; description?: string; variant?: ToastVariant; duration?: number }) => void;
  dismiss: (id?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastId, setToastId] = useState(0);

  const toast = useCallback(({ 
    title, 
    description, 
    variant = 'default', 
    duration = 2000 
  }: { 
    title: string; 
    description?: string; 
    variant?: ToastVariant; 
    duration?: number 
  }) => {
    const id = toastId;
    setToastId(prev => prev + 1);

    setToasts(prev => [...prev, { id, title, description, variant }]);

    // 自动关闭
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  }, [toastId]);

  const dismiss = useCallback((id?: number) => {
    if (id !== undefined) {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    } else {
      setToasts([]);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

