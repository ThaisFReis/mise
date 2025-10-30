'use client'

import { useNotifications } from '@/store'

export function Toaster() {
  const { notifications, removeNotification } = useNotifications()

  return (
    <div className="fixed bottom-0 right-0 z-50 w-full md:max-w-[420px] p-4 space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
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
              className="text-sm opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}