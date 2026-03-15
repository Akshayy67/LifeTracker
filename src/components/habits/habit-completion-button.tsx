'use client'

import { useState } from 'react'
import { Check, Camera, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CameraCapture } from './camera-capture'
import { useToast } from '@/hooks/use-toast'

interface HabitCompletionButtonProps {
  habitId: string
  habitName: string
  isCompleted: boolean
  isStrictMode: boolean
  onToggle: () => void
  /** Called after AI verification succeeds — used to refresh state without toggling */
  onVerified?: () => void
  disabled?: boolean
}

export function HabitCompletionButton({
  habitId,
  habitName,
  isCompleted,
  isStrictMode,
  onToggle,
  onVerified,
  disabled = false,
}: HabitCompletionButtonProps) {
  const [showCamera, setShowCamera] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [tempCompletionId, setTempCompletionId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleClick = async () => {
    if (isCompleted) {
      // If already completed, just toggle off (remove completion)
      onToggle()
      return
    }

    if (isStrictMode) {
      // For strict mode: create temporary completion, then open camera
      try {
        // Create a temporary completion
        const response = await fetch('/api/habits/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ habitId }),
        })

        if (!response.ok) throw new Error('Failed to create completion')

        const { completionId } = await response.json()
        setTempCompletionId(completionId)
        setShowCamera(true)
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to start verification',
          variant: 'destructive',
        })
      }
    } else {
      // Normal mode: just toggle completion
      onToggle()
    }
  }

  const handlePhotoCapture = async (imageBase64: string) => {
    if (!tempCompletionId) return

    setIsVerifying(true)
    setShowCamera(false)

    try {
      const response = await fetch('/api/habits/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habitId,
          completionId: tempCompletionId,
          imageBase64,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Verification failed')
      }

      if (result.verification.verified) {
        // Success! Completion already exists in DB — just refresh UI state
        const score = result.verification.score || 0
        const feedback = result.verification.feedback || 'Verified successfully!'

        toast({
          title: `✅ Habit Verified! (${score}/100)`,
          description: feedback,
        })

        // Use onVerified if provided, otherwise fall back to onToggle for a refresh
        if (onVerified) {
          onVerified()
        } else {
          onToggle()
        }
      } else {
        // Failed verification — completion was auto-deleted by the API
        const score = result.verification.score || 0
        const feedback = result.verification.feedback || 'Verification failed'
        const suggestions: string[] = result.verification.suggestions || []

        const suggestionText = suggestions.length > 0
          ? `\n💡 ${suggestions[0]}`
          : ''

        toast({
          title: `❌ Verification Failed (${score}/100)`,
          description: `${feedback}${suggestionText}`,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Verification failed',
        variant: 'destructive',
      })
    } finally {
      setIsVerifying(false)
      setTempCompletionId(null)
    }
  }

  const handleCameraCancel = async () => {
    // Delete the temporary completion
    if (tempCompletionId) {
      try {
        await fetch('/api/habits/complete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completionId: tempCompletionId }),
        })
      } catch (error) {
        console.error('Failed to delete temp completion:', error)
      }
    }

    setShowCamera(false)
    setTempCompletionId(null)
  }

  if (isVerifying) {
    return (
      <Button disabled size="icon" variant="outline">
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={disabled}
        size="icon"
        variant={isCompleted ? 'default' : 'outline'}
        className={isCompleted ? 'bg-green-600 hover:bg-green-700' : ''}
      >
        {isStrictMode && !isCompleted ? (
          <Camera className="h-4 w-4" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </Button>

      {showCamera && (
        <CameraCapture
          habitName={habitName}
          onCapture={handlePhotoCapture}
          onCancel={handleCameraCancel}
        />
      )}
    </>
  )
}
