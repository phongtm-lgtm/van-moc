import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { CircleCheck, X } from 'lucide-react'
import './ToastContext.css'

const ToastContext = createContext<(message: string) => void>(() => {})

function Toast({ message, dismiss }: { message: string; dismiss: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(dismiss, 5000)
    return () => window.clearTimeout(timer)
  }, [dismiss])

  return <div className="admin-toast" role="status"><CircleCheck size={22} aria-hidden="true" /><span>{message}</span><button type="button" onClick={dismiss} aria-label="Đóng thông báo"><X size={18} /></button></div>
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null)
  const showToast = useCallback((message: string) => setToast(current => ({ id: (current?.id ?? 0) + 1, message })), [])
  const dismiss = useCallback(() => setToast(null), [])

  return <ToastContext.Provider value={showToast}>{children}<div className="admin-toast-region">{toast && <Toast key={toast.id} message={toast.message} dismiss={dismiss} />}</div></ToastContext.Provider>
}

export const useToast = () => useContext(ToastContext)
