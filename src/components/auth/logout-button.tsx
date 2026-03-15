'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useState } from 'react'

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showIcon?: boolean
  showText?: boolean
  className?: string
}

export function LogoutButton({ 
  variant = 'ghost', 
  size = 'default',
  showIcon = true,
  showText = true,
  className 
}: LogoutButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={loading}
      className={className}
    >
      {showIcon && <LogOut className={showText ? 'mr-2 h-4 w-4' : 'h-4 w-4'} />}
      {showText && (loading ? 'Signing out...' : 'Sign Out')}
    </Button>
  )
}
