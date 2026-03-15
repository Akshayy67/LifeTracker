'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { LogoutButton } from '@/components/auth/logout-button'
import { User, Bell, Palette, Shield, Clock } from 'lucide-react'

const TIMEZONES = [
    'Asia/Kolkata',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Singapore',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Sao_Paulo',
    'Australia/Sydney',
    'Pacific/Auckland',
    'UTC',
]

export default function SettingsPage() {
    const { user, profile, refreshProfile } = useAuth()
    const supabase = createClient()

    const [fullName, setFullName] = useState('')
    const [timezone, setTimezone] = useState('Asia/Kolkata')
    const [saving, setSaving] = useState(false)
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name ?? '')
            setTimezone(profile.timezone ?? 'Asia/Kolkata')
        }
    }, [profile])

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setSaving(true)
        setSaveStatus('idle')

        const { error } = await supabase
            .from('profiles')
            .update({ full_name: fullName, timezone })
            .eq('id', user.id)

        if (error) {
            console.error('Error updating profile:', error)
            setSaveStatus('error')
        } else {
            setSaveStatus('success')
            await refreshProfile()
            setTimeout(() => setSaveStatus('idle'), 3000)
        }

        setSaving(false)
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>

            {/* Profile */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Profile</CardTitle>
                    </div>
                    <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={user?.email ?? ''}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Your name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                disabled={saving}
                            />
                        </div>
                        {saveStatus === 'success' && (
                            <p className="text-sm text-green-600 dark:text-green-400">Profile updated successfully!</p>
                        )}
                        {saveStatus === 'error' && (
                            <p className="text-sm text-destructive">Failed to update profile. Please try again.</p>
                        )}
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Timezone */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Timezone</CardTitle>
                    </div>
                    <CardDescription>Used for habit tracking and journal entries</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <select
                                id="timezone"
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                disabled={saving}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {TIMEZONES.map((tz) => (
                                    <option key={tz} value={tz}>{tz}</option>
                                ))}
                            </select>
                        </div>
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Timezone'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Appearance</CardTitle>
                    </div>
                    <CardDescription>Customize how Life Tracker looks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Theme</p>
                            <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
                        </div>
                        <ThemeToggle />
                    </div>
                </CardContent>
            </Card>

            {/* Account */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Account</CardTitle>
                    </div>
                    <CardDescription>Manage your account access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Sign Out</p>
                            <p className="text-xs text-muted-foreground">Sign out of your account on this device</p>
                        </div>
                        <LogoutButton variant="outline" showText={true} />
                    </div>
                    <Separator />
                    <div className="pt-1">
                        <p className="text-xs text-muted-foreground">
                            Member since {profile?.created_at
                                ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                                : '—'}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
