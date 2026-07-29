import { useEffect } from 'react'
import { useNetworkStatus } from '@/hooks/use-network-status'
import { WifiOff } from 'lucide-react'
import { toast } from '@/lib/toast'

export function NetworkStatusBanner() {
  const { isOnline, wasOffline } = useNetworkStatus()

  useEffect(() => {
    if (!isOnline) {
      toast.error('Connection issue detected. Check your internet connection and try again.')
    }
  }, [isOnline])

  useEffect(() => {
    if (wasOffline && isOnline) {
      toast.success('Connection restored')
    }
  }, [wasOffline, isOnline])

  if (!isOnline) {
    return (
      <div className="flex items-center justify-center gap-2 bg-destructive/10 px-4 py-2 text-sm text-destructive">
        <WifiOff className="size-4" />
        <span>You are offline. Some features may be unavailable.</span>
      </div>
    )
  }

  return null
}
