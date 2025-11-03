import { useNotifications } from '@/store'

export interface ToastProps {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const { addNotification } = useNotifications()

  const toast = ({ title, description, variant = 'default' }: ToastProps) => {
    const type = variant === 'destructive' ? 'error' : 'success'
    addNotification({
      title,
      message: description || '',
      type,
    })
  }

  return { toast }
}
