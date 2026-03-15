'use client'

import { useState } from 'react'
import { format, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { JournalCalendar } from '@/components/journal/journal-calendar'
import { useJournalEntries } from '@/hooks/use-journal'
import { useRouter } from 'next/navigation'
import { getMoodIcon } from '@/components/journal/mood-picker'

export default function JournalPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const { data: entries = [], isLoading } = useJournalEntries()

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleNewEntry = () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    router.push(`/journal/${today}`)
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
          <p className="text-muted-foreground">
            Capture your thoughts and memories
          </p>
        </div>
        <Button onClick={handleNewEntry}>
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <JournalCalendar currentDate={currentDate} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No journal entries yet. Start writing!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.slice(0, 10).map((entry) => {
                const MoodIcon = getMoodIcon(entry.mood)
                return (
                  <button
                    key={entry.id}
                    onClick={() => router.push(`/journal/${entry.entry_date}`)}
                    className="w-full text-left p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">
                            {format(new Date(entry.entry_date), 'MMMM d, yyyy')}
                          </span>
                          {entry.mood && (
                            <MoodIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        {entry.title && (
                          <h3 className="font-medium mb-1">{entry.title}</h3>
                        )}
                        <div
                          className="text-sm text-muted-foreground line-clamp-2 prose prose-sm"
                          dangerouslySetInnerHTML={{ __html: entry.content }}
                        />
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {entry.tags.map((tag: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {entry.is_favorite && (
                        <span className="text-yellow-500">★</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
