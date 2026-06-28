import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

export interface Toast {
  id: number;
  text: string;
  level: "info" | "warn" | "error";
}

export interface ToastContextValue {
  toasts: Toast[];
  showToast: (text: string, level?: Toast["level"]) => void;
}

const ToastContext = createContext<ToastContextValue>({ toasts: [], showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastsRef = useRef<Toast[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const scheduleDismiss = useCallback((id: number) => {
    const previous = timers.current.get(id);
    if (previous) clearTimeout(previous);
    const timer = setTimeout(() => {
      setToasts((prev) => {
        const next = prev.filter((t) => t.id !== id);
        toastsRef.current = next;
        return next;
      });
      timers.current.delete(id);
    }, 2500);
    timers.current.set(id, timer);
  }, []);

  const showToast = useCallback((text: string, level: Toast["level"] = "info") => {
    const existing = toastsRef.current.find((toast) => toast.text === text && toast.level === level);
    if (existing) {
      scheduleDismiss(existing.id);
      return;
    }
    const id = nextId++;
    const next = [...toastsRef.current, { id, text, level }];
    toastsRef.current = next;
    setToasts(next);
    scheduleDismiss(id);
  }, [scheduleDismiss]);

  const dismissToast = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((prev) => {
      const next = prev.filter((t) => t.id !== id);
      toastsRef.current = next;
      return next;
    });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast }}>
      {children}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.level}`} onClick={() => dismissToast(t.id)}>
            {t.level === "warn" && <span className="toast__icon">⚠️</span>}
            {t.level === "error" && <span className="toast__icon">❌</span>}
            <span className="toast__text">{t.text}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
