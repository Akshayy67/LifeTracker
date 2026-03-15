'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft, Save, Trash2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { JournalEditor } from '@/components/journal/journal-editor'
import { MoodPicker } from '@/components/journal/mood-picker'
import { TagInput } from '@/components/journal/tag-input'
import { ImageUpload } from '@/components/journal/image-upload'
import {
  useJournalEntry,
  useCreateJournalEntry,
  useUpdateJournalEntry,
  useDeleteJournalEntry
} from '@/hooks/use-journal'
import { useAuth } from '@/providers/auth-provider'
import { Mood } from '@/types/journal'

export default function JournalEntryPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const { data: entry, isLoading } = useJournalEntry(date)
  const createMutation = useCreateJournalEntry()
  const updateMutation = useUpdateJournalEntry()
  const deleteMutation = useDeleteJournalEntry()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<Mood | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '')
      setContent(entry.content || '')
      setMood(entry.mood)
      setTags(entry.tags || [])
      setIsFavorite(entry.is_favorite)
    }
  }, [entry])

  const isContentEmpty = (html: string) => {
    const text = html.replace(/<[^>]*>/g, '').trim()
    return text.length === 0
  }

  const handleSave = async () => {
    if (!user || isContentEmpty(content)) return

    setIsSaving(true)
    try {
      if (entry) {
        await updateMutation.mutateAsync({
          id: entry.id,
          updates: {
            title: title || null,
            content,
            mood,
            tags,
            is_favorite: isFavorite,
          },
        })
      } else {
        await createMutation.mutateAsync({
          user_id: user.id,
          entry_date: date,
          title: title || null,
          content,
          mood,
          tags,
          is_favorite: isFavorite,
        })
      }
    } catch (err: any) {
      console.error('Save failed:', err?.message ?? err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!entry) return

    if (confirm('Delete this journal entry? This action cannot be undone.')) {
      await deleteMutation.mutateAsync(entry.id)
      router.push('/journal')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-accent animate-pulse rounded" />
        <div className="h-96 bg-accent animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/journal')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {format(new Date(date), 'MMMM d, yyyy')}
            </h1>
            <p className="text-muted-foreground">
              {format(new Date(date), 'EEEE')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFavorite(!isFavorite)}
            className={isFavorite ? 'text-yellow-500' : ''}
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
          {entry && (
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving || isContentEmpty(content)}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How are you feeling?</CardTitle>
        </CardHeader>
        <CardContent>
          <MoodPicker value={mood} onChange={setMood} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your entry a title..."
            />
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <JournalEditor
              content={content}
              onChange={setContent}
              placeholder="What's on your mind today?"
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput value={tags} onChange={setTags} />
          </div>
        </CardContent>
      </Card>

      {entry && (
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              entryId={entry.id}
              images={entry.images || []}
            />
          </CardContent>
        </Card>
      )}

      {!entry && content.trim() && (
        <div className="bg-muted/50 border border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground">
          Save your entry first to upload images
        </div>
      )}
    </div>
  )
}
