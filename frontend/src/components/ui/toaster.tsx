'use client'

import { useNotifications } from '@/store'
import { X } from 'lucide-react'

export function Toaster() {
  const { notifications, removeNotification } = useNotifications()

  return (
    <div
      className="fixed bottom-0 right-0 z-50 w-full md:max-w-[420px] p-4 space-y-4"
      aria-live="polite"
      aria-atomic="false"
      role="region"
      aria-label="Notificações"
    >
      {notifications.map((notification) => {
        // Define o role baseado no tipo de notificação
        const role = notification.type === 'error' || notification.type === 'warning' ? 'alert' : 'status'

        return (
          <div
            key={notification.id}
            role={role}
            aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
            aria-atomic="true"
            className={`
              rounded-lg border p-4 shadow-lg transition-all
              ${notification.type === 'error' ? 'bg-destructive text-destructive-foreground' : ''}
              ${notification.type === 'success' ? 'bg-green-600 text-white' : ''}
              ${notification.type === 'warning' ? 'bg-yellow-600 text-white' : ''}
              ${notification.type === 'info' ? 'bg-blue-600 text-white' : ''}
            `}
          >
            <div className="flex items-start space-x-2">
              <div className="flex-1">
                <h4 className="font-semibold">{notification.title}</h4>
                <p className="text-sm opacity-90">{notification.message}</p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current rounded p-1"
                aria-label={`Fechar notificação: ${notification.title}`}
                title="Fechar notificação"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Fechar</span>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}