'use client'

import { useEffect } from 'react'

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)

          // Check for updates every hour
          setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_HABITS') {
          // Trigger sync when coming back online
          window.dispatchEvent(new CustomEvent('sync-habits'))
        }
      })
    }

    // Handle online/offline events
    const handleOnline = () => {
      console.log('App is online')
      window.dispatchEvent(new CustomEvent('app-online'))
    }

    const handleOffline = () => {
      console.log('App is offline')
      window.dispatchEvent(new CustomEvent('app-offline'))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return <>{children}</>
}
