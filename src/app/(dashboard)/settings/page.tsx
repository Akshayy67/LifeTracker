'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { ThemeToggle } from '@/components/theme-toggle'
import { LogoutButton } from '@/components/auth/logout-button'
import { User, Bell, Palette, Shield, Clock, Mail, Sparkles } from 'lucide-react'

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
    
    // Email notification preferences
    const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false)
    const [morningEmailEnabled, setMorningEmailEnabled] = useState(false)
    const [morningEmailTime, setMorningEmailTime] = useState('07:00')
    const [eodEmailEnabled, setEodEmailEnabled] = useState(false)
    const [eodEmailTime, setEodEmailTime] = useState('20:00')
    const [motivationalQuotesEnabled, setMotivationalQuotesEnabled] = useState(true)
    const [aiPersonalizationEnabled, setAiPersonalizationEnabled] = useState(true)
    const [sendingTestEmail, setSendingTestEmail] = useState(false)
    const [testEmailStatus, setTestEmailStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [testEmailMessage, setTestEmailMessage] = useState('')

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name ?? '')
            setTimezone(profile.timezone ?? 'Asia/Kolkata')
            setEmailNotificationsEnabled(profile.email_notifications_enabled ?? false)
            setMorningEmailEnabled(profile.morning_email_enabled ?? false)
            setMorningEmailTime(profile.morning_email_time?.substring(0, 5) ?? '07:00')
            setEodEmailEnabled(profile.eod_email_enabled ?? false)
            setEodEmailTime(profile.eod_email_time?.substring(0, 5) ?? '20:00')
            setMotivationalQuotesEnabled(profile.motivational_quotes_enabled ?? true)
            setAiPersonalizationEnabled(profile.ai_personalization_enabled ?? true)
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

    const handleSaveEmailPreferences = async () => {
        if (!user) return

        setSaving(true)
        setSaveStatus('idle')

        const { error } = await supabase
            .from('profiles')
            .update({
                email_notifications_enabled: emailNotificationsEnabled,
                morning_email_enabled: morningEmailEnabled,
                morning_email_time: morningEmailTime + ':00',
                eod_email_enabled: eodEmailEnabled,
                eod_email_time: eodEmailTime + ':00',
                motivational_quotes_enabled: motivationalQuotesEnabled,
                ai_personalization_enabled: aiPersonalizationEnabled,
            })
            .eq('id', user.id)

        if (error) {
            console.error('Error updating email preferences:', error)
            setSaveStatus('error')
        } else {
            setSaveStatus('success')
            await refreshProfile()
            setTimeout(() => setSaveStatus('idle'), 3000)
        }

        setSaving(false)
    }

    const handleSendTestEmail = async (type: 'morning' | 'eod') => {
        if (!user) return

        setSendingTestEmail(true)
        setTestEmailStatus('idle')
        setTestEmailMessage('')

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type }),
            })

            const responseText = await response.text()
            let data: { success?: boolean; error?: string } = {}
            try {
                data = responseText ? JSON.parse(responseText) : {}
            } catch {
                data = {
                    success: false,
                    error: 'Server returned non-JSON response. Check terminal logs for the real error.',
                }
            }

            if (response.ok && data.success) {
                setTestEmailStatus('success')
                setTestEmailMessage(`Test ${type === 'morning' ? 'morning' : 'EOD'} email sent successfully! Check your inbox.`)
            } else {
                setTestEmailStatus('error')
                setTestEmailMessage(data.error || 'Failed to send test email. Check console for details.')
                console.error('Test email error:', data)
            }
        } catch (error) {
            setTestEmailStatus('error')
            setTestEmailMessage('Network error. Please check your connection.')
            console.error('Test email error:', error)
        } finally {
            setSendingTestEmail(false)
            setTimeout(() => {
                setTestEmailStatus('idle')
                setTestEmailMessage('')
            }, 5000)
        }
    }

    const handleRunScheduledNow = async (type: 'morning' | 'eod') => {
        setSendingTestEmail(true)
        setTestEmailStatus('idle')
        setTestEmailMessage('')

        try {
            const response = await fetch(`/api/cron/send-daily-emails?type=${type}&force=1`)
            const responseText = await response.text()
            let data: { success?: boolean; error?: string; results?: { sent?: number; skipped?: number; failed?: number } } = {}

            try {
                data = responseText ? JSON.parse(responseText) : {}
            } catch {
                data = { success: false, error: 'Server returned non-JSON response.' }
            }

            if (response.ok && data.success) {
                setTestEmailStatus('success')
                setTestEmailMessage(
                    `Scheduled ${type.toUpperCase()} run: sent ${data.results?.sent ?? 0}, skipped ${data.results?.skipped ?? 0}, failed ${data.results?.failed ?? 0}.`
                )
            } else {
                setTestEmailStatus('error')
                setTestEmailMessage(data.error || 'Scheduled run failed.')
            }
        } catch (error) {
            setTestEmailStatus('error')
            setTestEmailMessage('Failed to run scheduled job.')
            console.error('Scheduled run error:', error)
        } finally {
            setSendingTestEmail(false)
        }
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

            {/* Email Notifications */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Email Notifications</CardTitle>
                    </div>
                    <CardDescription>Get daily summaries and motivation delivered to your inbox</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="email-notifications">Enable Email Notifications</Label>
                            <p className="text-xs text-muted-foreground">Master toggle for all email notifications</p>
                        </div>
                        <Switch
                            id="email-notifications"
                            checked={emailNotificationsEnabled}
                            onCheckedChange={setEmailNotificationsEnabled}
                            disabled={saving}
                        />
                    </div>

                    {emailNotificationsEnabled && (
                        <>
                            <Separator />
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="morning-email">Morning Motivation Email</Label>
                                        <p className="text-xs text-muted-foreground">Start your day with inspiration and reminders</p>
                                    </div>
                                    <Switch
                                        id="morning-email"
                                        checked={morningEmailEnabled}
                                        onCheckedChange={setMorningEmailEnabled}
                                        disabled={saving}
                                    />
                                </div>
                                
                                {morningEmailEnabled && (
                                    <div className="ml-6 space-y-2">
                                        <Label htmlFor="morning-time">Send at</Label>
                                        <Input
                                            id="morning-time"
                                            type="time"
                                            value={morningEmailTime}
                                            onChange={(e) => setMorningEmailTime(e.target.value)}
                                            disabled={saving}
                                            className="w-32"
                                        />
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="eod-email">End-of-Day Summary Email</Label>
                                        <p className="text-xs text-muted-foreground">Review your progress and celebrate wins</p>
                                    </div>
                                    <Switch
                                        id="eod-email"
                                        checked={eodEmailEnabled}
                                        onCheckedChange={setEodEmailEnabled}
                                        disabled={saving}
                                    />
                                </div>
                                
                                {eodEmailEnabled && (
                                    <div className="ml-6 space-y-2">
                                        <Label htmlFor="eod-time">Send at</Label>
                                        <Input
                                            id="eod-time"
                                            type="time"
                                            value={eodEmailTime}
                                            onChange={(e) => setEodEmailTime(e.target.value)}
                                            disabled={saving}
                                            className="w-32"
                                        />
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="quotes">Motivational Quotes</Label>
                                    <p className="text-xs text-muted-foreground">Include inspiring quotes in your emails</p>
                                </div>
                                <Switch
                                    id="quotes"
                                    checked={motivationalQuotesEnabled}
                                    onCheckedChange={setMotivationalQuotesEnabled}
                                    disabled={saving}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-purple-500" />
                                    <div>
                                        <Label htmlFor="ai-personalization">AI Personalization</Label>
                                        <p className="text-xs text-muted-foreground">Use AI to create personalized motivational messages</p>
                                    </div>
                                </div>
                                <Switch
                                    id="ai-personalization"
                                    checked={aiPersonalizationEnabled}
                                    onCheckedChange={setAiPersonalizationEnabled}
                                    disabled={saving}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <Label>Test Email Delivery</Label>
                                <p className="text-xs text-muted-foreground">Send a test email to verify your configuration</p>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleSendTestEmail('morning')}
                                        disabled={sendingTestEmail || !emailNotificationsEnabled}
                                        className="flex-1"
                                    >
                                        {sendingTestEmail ? 'Sending...' : 'Test Morning Email'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleSendTestEmail('eod')}
                                        disabled={sendingTestEmail || !emailNotificationsEnabled}
                                        className="flex-1"
                                    >
                                        {sendingTestEmail ? 'Sending...' : 'Test EOD Email'}
                                    </Button>
                                </div>
                                {testEmailStatus === 'success' && (
                                    <p className="text-sm text-green-600 dark:text-green-400">{testEmailMessage}</p>
                                )}
                                {testEmailStatus === 'error' && (
                                    <p className="text-sm text-destructive">{testEmailMessage}</p>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <Label>Run Scheduled Job Now</Label>
                                <p className="text-xs text-muted-foreground">Runs the same morning/EOD automation logic used by cron</p>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleRunScheduledNow('morning')}
                                        disabled={sendingTestEmail || !emailNotificationsEnabled}
                                        className="flex-1"
                                    >
                                        Run Morning Job
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleRunScheduledNow('eod')}
                                        disabled={sendingTestEmail || !emailNotificationsEnabled}
                                        className="flex-1"
                                    >
                                        Run EOD Job
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            {saveStatus === 'success' && (
                                <p className="text-sm text-green-600 dark:text-green-400">Email preferences saved successfully!</p>
                            )}
                            {saveStatus === 'error' && (
                                <p className="text-sm text-destructive">Failed to save preferences. Please try again.</p>
                            )}

                            <Button onClick={handleSaveEmailPreferences} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Email Preferences'}
                            </Button>
                        </>
                    )}
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
