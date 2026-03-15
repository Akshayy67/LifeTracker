'use client'

import { WifiOff } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>You're Offline</CardTitle>
          <CardDescription>
            No internet connection detected
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Some features may be limited while offline. Your data will sync automatically when you're back online.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
