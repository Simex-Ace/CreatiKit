'use client'
// 简化版Toast实现
import { useCallback, useState } from "react";

type ToastProps = {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  duration?: number;
};

export function useToast() {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);
  const [toastId, setToastId] = useState(0);

  const toast = useCallback(({ title, description, variant = "default", duration = 3000 }: ToastProps) => {
    const id = toastId;
    setToastId(prev => prev + 1);

    setToasts(prev => [...prev, { id, title, description, variant }]);

    // 自动关闭
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  }, [toastId]);

  const dismiss = useCallback((id?: number) => {
    if (id) {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    } else {
      setToasts([]);
    }
  }, []);

  return { toast, dismiss, toasts };
}

// 创建toast函数的直接导出
export const toast = (props: ToastProps) => {
  const { toast: createToast } = useToast();
  createToast(props);
};

// ToastProvider组件
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return children;
}

// 默认导出useToast
export default useToast;