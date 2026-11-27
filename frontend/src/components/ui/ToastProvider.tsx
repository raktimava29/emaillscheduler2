import { useCallback, useRef, useState } from "react";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { ToastContext, type ToastTone } from "./toast-context";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const show = useCallback((message: string, tone: ToastTone = "success") => {
    const id = nextId.current++;
    setToasts((list) => [...list.filter((t) => t.message !== message), { id, message, tone }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 4500);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div role="status" className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-center gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="flex max-w-md animate-rise items-center gap-3 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white shadow-xl">
            {t.tone === "error"
              ? <FiAlertCircle className="shrink-0 text-sun" size={18} aria-hidden />
              : <FiCheckCircle className="shrink-0 text-sun" size={18} aria-hidden />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
