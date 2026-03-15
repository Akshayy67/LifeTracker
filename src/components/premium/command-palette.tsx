'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Wallet,
  BarChart3,
  Plus,
  Settings,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react'
import { useTheme } from 'next-themes'

export function CommandPalette() {
  const router = useRouter()
  const { setTheme, theme } = useTheme()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard'))}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/habits'))}
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            <span>Habits</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/journal'))}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Journal</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/expenses'))}
          >
            <Wallet className="mr-2 h-4 w-4" />
            <span>Expenses</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/reports'))}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Reports</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/habits'))}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>New Habit</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/journal'))}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>New Journal Entry</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/expenses'))}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>New Expense</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Settings">
          <CommandItem
            onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            <span>Toggle Theme</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/settings'))}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
