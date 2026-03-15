const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY

export interface UnsplashImage {
  id: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  alt_description: string | null
  user: {
    name: string
    username: string
  }
  links: {
    html: string
    download_location: string
  }
}

export async function searchUnsplashImages(
  query: string,
  perPage: number = 6
): Promise<UnsplashImage[]> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('Unsplash API key not configured')
    return []
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error fetching Unsplash images:', error)
    return []
  }
}

export function getHabitImageQuery(habitName: string): string {
  const lowerName = habitName.toLowerCase()
  
  const queryMap: Record<string, string> = {
    exercise: 'fitness workout',
    workout: 'gym fitness',
    meditation: 'meditation zen',
    reading: 'books reading',
    water: 'water glass',
    sleep: 'sleep bed',
    yoga: 'yoga',
    running: 'running trail',
    cycling: 'cycling bike',
    walking: 'nature walk',
    journaling: 'journal writing',
    cooking: 'cooking kitchen',
    music: 'music instruments',
    study: 'study desk',
    coffee: 'coffee morning',
    breakfast: 'healthy breakfast',
  }

  for (const [key, value] of Object.entries(queryMap)) {
    if (lowerName.includes(key)) {
      return value
    }
  }

  return habitName || 'minimal aesthetic'
}

export function triggerUnsplashDownload(downloadUrl: string) {
  if (!UNSPLASH_ACCESS_KEY) return

  fetch(downloadUrl, {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
    },
  }).catch((error) => {
    console.error('Error triggering Unsplash download:', error)
  })
}
