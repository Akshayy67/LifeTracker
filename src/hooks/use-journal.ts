'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import { JournalEntry, JournalEntryInsert, JournalEntryUpdate, JournalImage } from '@/types/journal'
import { format } from 'date-fns'

export function useJournalEntries() {
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  const query = useQuery({
    queryKey: ['journal-entries', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('journal_entries')
        .select(`
          *,
          images:journal_images(*)
        `)
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  return { ...query, isLoading: authLoading || query.isLoading }
}

export function useJournalEntry(date: string) {
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  const query = useQuery({
    queryKey: ['journal-entry', date, user?.id],
    queryFn: async () => {
      if (!user) return null

      const { data, error } = await supabase
        .from('journal_entries')
        .select(`
          *,
          images:journal_images(*)
        `)
        .eq('user_id', user.id)
        .eq('entry_date', date)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!user && !!date,
  })

  return { ...query, isLoading: authLoading || query.isLoading }
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (entry: JournalEntryInsert) => {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert(entry)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
    },
  })
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: JournalEntryUpdate }) => {
      const { data, error } = await supabase
        .from('journal_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
      queryClient.invalidateQueries({ queryKey: ['journal-entry', data.entry_date] })
    },
  })
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      // 1. First delete all associated images from storage and database
      const { data: images } = await supabase
        .from('journal_images')
        .select('id, storage_path')
        .eq('journal_entry_id', id)

      if (images && images.length > 0) {
        const paths = images.map(img => img.storage_path)
        
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('journal-images')
          .remove(paths)
        
        if (storageError) {
          console.error('Storage deletion error:', storageError)
          throw storageError
        }

        // Delete from database
        const { error: dbError } = await supabase
          .from('journal_images')
          .delete()
          .eq('journal_entry_id', id)
        
        if (dbError) {
          console.error('Database image deletion error:', dbError)
          throw dbError
        }
      }

      // 2. Delete the journal entry
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Journal entry deletion error:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
    },
  })
}

export function useUploadJournalImage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      file,
      entryId
    }: {
      file: File
      entryId: string
    }) => {
      if (!user) throw new Error('Not authenticated')

      // Generate unique file path
      const timestamp = Date.now()
      const fileName = `${timestamp}_${file.name}`
      const filePath = `${user.id}/${entryId}/${fileName}`

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('journal-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Create database record
      const { data, error: dbError } = await supabase
        .from('journal_images')
        .insert({
          journal_entry_id: entryId,
          user_id: user.id,
          storage_path: filePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
        })
        .select()
        .single()

      if (dbError) throw dbError

      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['journal-entry'] })
    },
  })
}

export function useDeleteJournalImage() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (imageId: string) => {
      // Get image details first
      const { data: image, error: fetchError } = await supabase
        .from('journal_images')
        .select('storage_path')
        .eq('id', imageId)
        .single()

      if (fetchError) throw fetchError

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('journal-images')
        .remove([image.storage_path])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('journal_images')
        .delete()
        .eq('id', imageId)

      if (dbError) throw dbError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entry'] })
    },
  })
}

export function useJournalImageUrl(storagePath: string | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['journal-image-url', storagePath],
    queryFn: async () => {
      if (!storagePath) return null

      const { data } = supabase.storage
        .from('journal-images')
        .getPublicUrl(storagePath)

      return data.publicUrl
    },
    enabled: !!storagePath,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}
