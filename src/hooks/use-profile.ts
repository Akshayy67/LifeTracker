'use client'

import { useAuth } from '@/providers/auth-provider'

export function useProfile() {
  const { profile, loading, refreshProfile } = useAuth()
  return { profile, loading, refreshProfile }
}
