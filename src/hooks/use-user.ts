'use client'

import { useAuth } from '@/providers/auth-provider'

export function useUser() {
  const { user, loading } = useAuth()
  return { user, loading }
}
