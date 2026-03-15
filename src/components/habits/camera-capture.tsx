'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, X, Check, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface CameraCaptureProps {
  onCapture: (imageData: string) => void
  onCancel: () => void
  habitName: string
}

export function CameraCapture({ onCapture, onCancel, habitName }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      })

      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error('Camera error:', err)
      setError('Unable to access camera. Please grant camera permissions.')
    }
  }, [facingMode, stream])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedImage(imageData)
    stopCamera()
  }, [stopCamera])

  const retake = useCallback(() => {
    setCapturedImage(null)
    startCamera()
  }, [startCamera])

  const confirm = useCallback(() => {
    if (capturedImage) {
      // Extract base64 data without the data:image/jpeg;base64, prefix
      const base64Data = capturedImage.split(',')[1]
      onCapture(base64Data)
    }
  }, [capturedImage, onCapture])

  const toggleCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    if (stream) {
      stopCamera()
      setTimeout(startCamera, 100)
    }
  }, [stream, stopCamera, startCamera])

  // Start camera on mount
  useState(() => {
    startCamera()
    return () => stopCamera()
  })

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="w-full h-full max-w-4xl flex flex-col">
        {/* Header */}
        <div className="bg-black/80 p-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">Verify: {habitName}</h3>
            <p className="text-white/70 text-sm">Take a photo showing completion</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              stopCamera()
              onCancel()
            }}
            className="text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Camera/Preview */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
          {error ? (
            <Card className="p-6 m-4">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={startCamera}>Try Again</Button>
            </Card>
          ) : capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-w-full max-h-full object-contain"
            />
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* Camera grid overlay */}
          {!capturedImage && !error && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="border border-white/20" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-black/80 p-6 flex items-center justify-center gap-4">
          {capturedImage ? (
            <>
              <Button
                size="lg"
                variant="outline"
                onClick={retake}
                className="gap-2"
              >
                <RotateCw className="h-5 w-5" />
                Retake
              </Button>
              <Button
                size="lg"
                onClick={confirm}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-5 w-5" />
                Verify with AI
              </Button>
            </>
          ) : (
            <>
              <Button
                size="icon"
                variant="outline"
                onClick={toggleCamera}
                className="h-12 w-12"
                disabled={!stream}
              >
                <RotateCw className="h-6 w-6" />
              </Button>
              <Button
                size="lg"
                onClick={capturePhoto}
                disabled={!stream}
                className="h-16 w-16 rounded-full bg-white hover:bg-white/90"
              >
                <Camera className="h-8 w-8 text-black" />
              </Button>
              <div className="h-12 w-12" /> {/* Spacer for symmetry */}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
