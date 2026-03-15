'use client'

import { useState, useCallback, DragEvent } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUploadJournalImage, useDeleteJournalImage, useJournalImageUrl } from '@/hooks/use-journal'
import { JournalImage } from '@/types/journal'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  entryId: string
  images: JournalImage[]
  onUploadComplete?: () => void
  maxImages?: number
}

export function ImageUpload({ entryId, images, onUploadComplete, maxImages = 5 }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const uploadMutation = useUploadJournalImage()
  const deleteMutation = useDeleteJournalImage()

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files).filter(file =>
        file.type.startsWith('image/')
      )

      for (const file of files.slice(0, maxImages - images.length)) {
        await uploadMutation.mutateAsync({ file, entryId })
      }

      onUploadComplete?.()
    },
    [entryId, images.length, maxImages, uploadMutation, onUploadComplete]
  )

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file =>
      file.type.startsWith('image/')
    )

    for (const file of files.slice(0, maxImages - images.length)) {
      await uploadMutation.mutateAsync({ file, entryId })
    }

    onUploadComplete?.()
    e.target.value = ''
  }

  const handleDelete = async (imageId: string) => {
    if (confirm('Delete this image?')) {
      await deleteMutation.mutateAsync(imageId)
    }
  }

  const canUploadMore = images.length < maxImages

  return (
    <div className="space-y-4">
      {canUploadMore && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          )}
        >
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploadMutation.isPending}
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            {uploadMutation.isPending ? (
              <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
            ) : (
              <Upload className="h-10 w-10 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">
                {uploadMutation.isPending ? 'Uploading...' : 'Drop images here or click to upload'}
              </p>
              <p className="text-sm text-muted-foreground">
                {images.length}/{maxImages} images • PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </label>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <ImagePreview
              key={image.id}
              image={image}
              onDelete={() => handleDelete(image.id)}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ImagePreview({
  image,
  onDelete,
  isDeleting,
}: {
  image: JournalImage
  onDelete: () => void
  isDeleting: boolean
}) {
  const { data: imageUrl } = useJournalImageUrl(image.storage_path)

  return (
    <div className="relative group aspect-square rounded-lg overflow-hidden bg-accent">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={image.file_name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Button
          variant="destructive"
          size="icon"
          onClick={onDelete}
          disabled={isDeleting}
          className="h-8 w-8"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
        <p className="text-xs text-white truncate">{image.file_name}</p>
      </div>
    </div>
  )
}
