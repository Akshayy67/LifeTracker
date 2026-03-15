'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Habit, HabitFrequency } from '@/types/habits'
import { useAuth } from '@/providers/auth-provider'
import {
  Circle, Star, Heart, Zap, Target, Award, BookOpen, Dumbbell,
  Sun, Moon, Coffee, Droplets, Flame, Music, Bike, Brain, Image as ImageIcon, Loader2,
  Camera, type LucideIcon
} from 'lucide-react'
import { searchUnsplashImages, getHabitImageQuery, UnsplashImage, triggerUnsplashDownload } from '@/lib/unsplash'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

const habitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  target_count: z.number().min(1).max(100),
  color: z.string(),
  icon: z.string(),
  background_image: z.string().optional(),
  strict_mode: z.boolean().default(false),
  verification_prompt: z.string().max(500).optional(),
})

type HabitFormData = z.infer<typeof habitSchema>

interface HabitFormProps {
  habit?: Habit
  onSubmit: (data: HabitFormData) => Promise<void>
  onCancel?: () => void
}

const COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
]

const ICON_MAP: Record<string, LucideIcon> = {
  circle: Circle,
  star: Star,
  heart: Heart,
  zap: Zap,
  target: Target,
  award: Award,
  book: BookOpen,
  dumbbell: Dumbbell,
  sun: Sun,
  moon: Moon,
  coffee: Coffee,
  droplets: Droplets,
  flame: Flame,
  music: Music,
  bike: Bike,
  brain: Brain,
}

const ICONS = [
  { name: 'Circle', value: 'circle' },
  { name: 'Star', value: 'star' },
  { name: 'Heart', value: 'heart' },
  { name: 'Zap', value: 'zap' },
  { name: 'Target', value: 'target' },
  { name: 'Award', value: 'award' },
  { name: 'Book', value: 'book' },
  { name: 'Dumbbell', value: 'dumbbell' },
  { name: 'Sun', value: 'sun' },
  { name: 'Moon', value: 'moon' },
  { name: 'Coffee', value: 'coffee' },
  { name: 'Water', value: 'droplets' },
  { name: 'Flame', value: 'flame' },
  { name: 'Music', value: 'music' },
  { name: 'Bike', value: 'bike' },
  { name: 'Brain', value: 'brain' },
]

export function HabitForm({ habit, onSubmit, onCancel }: HabitFormProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [unsplashImages, setUnsplashImages] = useState<UnsplashImage[]>([])
  const [loadingImages, setLoadingImages] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: habit?.name || '',
      description: habit?.description || '',
      frequency: habit?.frequency || 'daily',
      target_count: habit?.target_count || 1,
      color: habit?.color || '#3b82f6',
      icon: habit?.icon || 'circle',
      background_image: habit?.background_image || '',
      strict_mode: habit?.strict_mode || false,
      verification_prompt: habit?.verification_prompt || '',
    },
  })

  const selectedColor = watch('color')
  const selectedIcon = watch('icon')
  const frequency = watch('frequency')
  const habitName = watch('name')
  const backgroundImage = watch('background_image')
  const strictMode = watch('strict_mode')

  const fetchImages = async () => {
    if (!habitName) return
    
    setLoadingImages(true)
    const query = getHabitImageQuery(habitName)
    const images = await searchUnsplashImages(query, 6)
    setUnsplashImages(images)
    setLoadingImages(false)
  }

  const selectImage = (image: UnsplashImage) => {
    setValue('background_image', image.urls.regular)
    triggerUnsplashDownload(image.links.download_location)
    setShowImagePicker(false)
  }

  const handleFormSubmit = async (data: HabitFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{habit ? 'Edit Habit' : 'Create New Habit'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              placeholder="e.g., Morning Exercise"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="What does this habit involve?"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['daily', 'weekly', 'monthly'] as HabitFrequency[]).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setValue('frequency', freq)}
                  className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${frequency === freq
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-accent border-input'
                    }`}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_count">Target Count</Label>
            <Input
              id="target_count"
              type="number"
              min="1"
              max="100"
              {...register('target_count', { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">
              How many times per {frequency} period?
            </p>
            {errors.target_count && (
              <p className="text-sm text-destructive">{errors.target_count.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setValue('color', color.value)}
                  className={`h-10 rounded-md border-2 transition-all ${selectedColor === color.value
                      ? 'border-foreground scale-110'
                      : 'border-transparent hover:scale-105'
                    }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-8 gap-2">
              {ICONS.map((icon) => {
                const IconComponent = ICON_MAP[icon.value]
                return (
                  <button
                    key={icon.value}
                    type="button"
                    onClick={() => setValue('icon', icon.value)}
                    title={icon.name}
                    className={`flex items-center justify-center h-10 w-10 rounded-md border transition-colors ${selectedIcon === icon.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-accent border-input'
                      }`}
                  >
                    {IconComponent && <IconComponent className="h-5 w-5" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  <Label htmlFor="strict_mode" className="text-base font-semibold cursor-pointer">
                    Strict Mode
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Require photo verification with AI validation before marking complete
                </p>
              </div>
              <Switch
                id="strict_mode"
                checked={strictMode}
                onCheckedChange={(checked) => setValue('strict_mode', checked)}
              />
            </div>
          </div>

          {strictMode && (
            <div className="space-y-2 pl-4 border-l-2 border-primary">
              <Label htmlFor="verification_prompt">Verification Instructions (Optional)</Label>
              <Textarea
                id="verification_prompt"
                placeholder="e.g., Look for: gym equipment in use, workout clothes, active exercise. The photo should show genuine workout activity, not just gym arrival."
                {...register('verification_prompt')}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Tell the AI what to look for in verification photos. Leave empty for auto-generated prompts based on habit name.
              </p>
              {errors.verification_prompt && (
                <p className="text-sm text-destructive">{errors.verification_prompt.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Background Image (Optional)</Label>
            <div className="space-y-3">
              {backgroundImage ? (
                <div className="relative aspect-video rounded-lg overflow-hidden border">
                  <img
                    src={backgroundImage}
                    alt="Selected background"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setValue('background_image', '')}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-3 py-1 rounded-md text-sm hover:bg-destructive/90"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowImagePicker(!showImagePicker)
                    if (!showImagePicker && unsplashImages.length === 0) {
                      fetchImages()
                    }
                  }}
                  className="w-full"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {showImagePicker ? 'Hide Image Picker' : 'Add Background Image'}
                </Button>
              )}

              {showImagePicker && (
                <div className="space-y-3">
                  {loadingImages ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : unsplashImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {unsplashImages.map((image) => (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() => selectImage(image)}
                          className="relative aspect-video rounded-md overflow-hidden border hover:border-primary transition-colors group"
                        >
                          <img
                            src={image.urls.small}
                            alt={image.alt_description || 'Unsplash image'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Enter a habit name to see suggested images
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Photos from{' '}
                    <a
                      href="https://unsplash.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-foreground"
                    >
                      Unsplash
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : habit ? 'Update Habit' : 'Create Habit'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
