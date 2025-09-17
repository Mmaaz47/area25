import { useEffect } from 'react'
import { FiCheck, FiX, FiInfo } from 'react-icons/fi'

type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
  duration?: number
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const colors = {
    success: { bg: '#10b981', icon: FiCheck },
    error: { bg: '#ef4444', icon: FiX },
    info: { bg: '#3b82f6', icon: FiInfo }
  }

  const { bg, icon: Icon } = colors[type]

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        background: bg,
        color: 'white',
        padding: '12px 20px',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minWidth: 250,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        animation: 'slideUp 0.3s ease-out',
        zIndex: 1000
      }}
    >
      <Icon size={20} />
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: 4
        }}
      >
        <FiX size={18} />
      </button>
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

// Toast manager singleton
let toastCallback: ((props: Omit<ToastProps, 'onClose'>) => void) | null = null

export function setToastCallback(callback: typeof toastCallback) {
  toastCallback = callback
}

export function showToast(message: string, type: ToastType = 'info') {
  if (toastCallback) {
    toastCallback({ message, type })
  }
}