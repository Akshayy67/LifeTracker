import { Database } from './database.types'

export type JournalEntry = Database['public']['Tables']['journal_entries']['Row']
export type JournalEntryInsert = Database['public']['Tables']['journal_entries']['Insert']
export type JournalEntryUpdate = Database['public']['Tables']['journal_entries']['Update']

export type JournalImage = Database['public']['Tables']['journal_images']['Row']
export type JournalImageInsert = Database['public']['Tables']['journal_images']['Insert']

export type Mood = 'great' | 'good' | 'okay' | 'bad' | 'terrible'

export interface JournalEntryWithImages extends JournalEntry {
  images: JournalImage[]
}

export interface ImageUploadProgress {
  file: File
  progress: number
  url?: string
  error?: string
}
