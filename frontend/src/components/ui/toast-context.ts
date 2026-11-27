import { createContext, useContext } from "react";

export type ToastTone = "success" | "error";

export const ToastContext = createContext<((message: string, tone?: ToastTone) => void) | null>(null);

export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("useToast must be used within ToastProvider");
  return toast;
}
