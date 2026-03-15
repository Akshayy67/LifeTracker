'use client'

import { useEffect } from 'react'

interface ShortcutConfig {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  callback: () => void
  description?: string
}

export function useKeyboardShortcut(config: ShortcutConfig | ShortcutConfig[]) {
  useEffect(() => {
    const shortcuts = Array.isArray(config) ? config : [config]

    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const {
          key,
          ctrl = false,
          meta = false,
          shift = false,
          alt = false,
          callback,
        } = shortcut

        const keyMatch = event.key.toLowerCase() === key.toLowerCase()
        const ctrlMatch = ctrl ? event.ctrlKey : !event.ctrlKey
        const metaMatch = meta ? event.metaKey : !event.metaKey
        const shiftMatch = shift ? event.shiftKey : !event.shiftKey
        const altMatch = alt ? event.altKey : !event.altKey

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          event.preventDefault()
          callback()
        }
      })
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [config])
}

// Common keyboard shortcuts
export const SHORTCUTS = {
  COMMAND_PALETTE: { key: 'k', meta: true, description: 'Open command palette' },
  NEW_HABIT: { key: 'h', meta: true, description: 'New habit' },
  NEW_JOURNAL: { key: 'j', meta: true, description: 'New journal entry' },
  NEW_EXPENSE: { key: 'e', meta: true, description: 'New expense' },
  SEARCH: { key: '/', description: 'Focus search' },
  TOGGLE_THEME: { key: 'd', meta: true, description: 'Toggle dark mode' },
}
