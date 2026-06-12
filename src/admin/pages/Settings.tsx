import React, { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Switch } from '../components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Separator } from '../components/ui/separator'
import { LoadingSpinner } from '../components/LoadingState'
import { useSettings, useUpdateSetting } from '../hooks/useSettings'

// Define the shape of our local settings state
interface SiteSettings {
  general: {
    siteName: string
    tagline: string
    email: string
    phone: string
    address: string
    timezone: string
    currency: string
    language: string
  }
  seo: {
    metaTitle: string
    metaDescription: string
    metaKeywords: string
    googleAnalyticsId: string
    googleTagManagerId: string
  }
  social: {
    instagram: string
    facebook: string
    twitter: string
    youtube: string
    linkedin: string
    tiktok: string
  }
  notifications: {
    bookingConfirmation: boolean
    bookingReminder: boolean
    bookingCancellation: boolean
    marketingEmails: boolean
    smsEnabled: boolean
    emailFrom: string
    emailReplyTo: string
  }
  appearance: {
    primaryColor: string
    accentColor: string
    maintenanceMode: boolean
    comingSoon: boolean
  }
}

const defaultSettings: SiteSettings = {
  general: {
    siteName: '', tagline: '', email: '', phone: '', address: '', timezone: 'UTC', currency: 'USD', language: 'en',
  },
  seo: { metaTitle: '', metaDescription: '', metaKeywords: '', googleAnalyticsId: '', googleTagManagerId: '' },
  social: { instagram: '', facebook: '', twitter: '', youtube: '', linkedin: '', tiktok: '' },
  notifications: { bookingConfirmation: true, bookingReminder: true, bookingCancellation: true, marketingEmails: false, smsEnabled: false, emailFrom: '', emailReplyTo: '' },
  appearance: { primaryColor: '#D4AF37', accentColor: '#1A1A1A', maintenanceMode: false, comingSoon: false },
}

export default function Settings() {
  const { data: settingsArray, isLoading } = useSettings()
  const updateMut = useUpdateSetting()

  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settingsArray) {
      const merged = JSON.parse(JSON.stringify(defaultSettings)) as SiteSettings
      for (const item of settingsArray) {
        if (item.key in merged) {
          merged[item.key as keyof SiteSettings] = { ...merged[item.key as keyof SiteSettings], ...item.value }
        }
      }
      setSettings(merged)
    }
  }, [settingsArray])

  const updateGeneral = (key: keyof SiteSettings['general'], value: string) =>
    setSettings((s) => s ? { ...s, general: { ...s.general, [key]: value } } : s)

  const updateSeo = (key: keyof SiteSettings['seo'], value: string) =>
    setSettings((s) => s ? { ...s, seo: { ...s.seo, [key]: value } } : s)

  const updateSocial = (key: keyof SiteSettings['social'], value: string) =>
    setSettings((s) => s ? { ...s, social: { ...s.social, [key]: value } } : s)

  const updateNotifications = (key: keyof SiteSettings['notifications'], value: boolean | string) =>
    setSettings((s) => s ? { ...s, notifications: { ...s.notifications, [key]: value } } : s)

  const updateAppearance = (key: keyof SiteSettings['appearance'], value: string | boolean) =>
    setSettings((s) => s ? { ...s, appearance: { ...s.appearance, [key]: value } } : s)

  const handleSave = async () => {
    if (!settings) return
    
    // Save each section
    await Promise.all([
      updateMut.mutateAsync({ key: 'general', value: settings.general }),
      updateMut.mutateAsync({ key: 'seo', value: settings.seo }),
      updateMut.mutateAsync({ key: 'social', value: settings.social }),
      updateMut.mutateAsync({ key: 'notifications', value: settings.notifications }),
      updateMut.mutateAsync({ key: 'appearance', value: settings.appearance }),
    ])

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (isLoading || !settings) return <LoadingSpinner />

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Site Settings"
        description="Configure your clinic website and system preferences"
        actions={
          <Button onClick={handleSave} loading={updateMut.isPending}>
            <Save className="h-4 w-4" />
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        }
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general">
          <Card>
            <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Site Name</Label><Input value={settings.general.siteName || ''} onChange={(e) => updateGeneral('siteName', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Tagline</Label><Input value={settings.general.tagline || ''} onChange={(e) => updateGeneral('tagline', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Contact Email</Label><Input type="email" value={settings.general.email || ''} onChange={(e) => updateGeneral('email', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input value={settings.general.phone || ''} onChange={(e) => updateGeneral('phone', e.target.value)} /></div>
              <div className="col-span-2 space-y-1.5"><Label>Address</Label><Input value={settings.general.address || ''} onChange={(e) => updateGeneral('address', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Timezone</Label><Input value={settings.general.timezone || ''} onChange={(e) => updateGeneral('timezone', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Currency</Label><Input value={settings.general.currency || ''} onChange={(e) => updateGeneral('currency', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Language</Label><Input value={settings.general.language || ''} onChange={(e) => updateGeneral('language', e.target.value)} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo">
          <Card>
            <CardHeader><CardTitle>SEO Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5"><Label>Meta Title</Label><Input value={settings.seo.metaTitle || ''} onChange={(e) => updateSeo('metaTitle', e.target.value)} /><p className="text-[10px] text-admin-subtle">{(settings.seo.metaTitle || '').length}/60 characters</p></div>
              <div className="space-y-1.5"><Label>Meta Description</Label><Textarea value={settings.seo.metaDescription || ''} onChange={(e) => updateSeo('metaDescription', e.target.value)} rows={3} /><p className="text-[10px] text-admin-subtle">{(settings.seo.metaDescription || '').length}/160 characters</p></div>
              <div className="space-y-1.5"><Label>Meta Keywords</Label><Input value={settings.seo.metaKeywords || ''} onChange={(e) => updateSeo('metaKeywords', e.target.value)} /></div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Google Analytics ID</Label><Input placeholder="G-XXXXXXXXXX" value={settings.seo.googleAnalyticsId || ''} onChange={(e) => updateSeo('googleAnalyticsId', e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Google Tag Manager ID</Label><Input placeholder="GTM-XXXXXXX" value={settings.seo.googleTagManagerId || ''} onChange={(e) => updateSeo('googleTagManagerId', e.target.value)} /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social */}
        <TabsContent value="social">
          <Card>
            <CardHeader><CardTitle>Social Media Links</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.keys(settings.social) as (keyof SiteSettings['social'])[]).map((key) => (
                <div key={key} className="space-y-1.5">
                  <Label className="capitalize">{key}</Label>
                  <Input placeholder={`https://${key}.com/...`} value={settings.social[key] || ''} onChange={(e) => updateSocial(key, e.target.value)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle>Notification Settings</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-4">
                {([
                  ['bookingConfirmation', 'Booking Confirmation', 'Send email confirmation when a booking is made'],
                  ['bookingReminder', 'Booking Reminder', 'Send reminder email 24 hours before appointment'],
                  ['bookingCancellation', 'Booking Cancellation', 'Send email when a booking is cancelled'],
                  ['marketingEmails', 'Marketing Emails', 'Allow sending promotional and marketing emails'],
                  ['smsEnabled', 'SMS Notifications', 'Enable SMS notifications alongside email'],
                ] as const).map(([key, label, desc]) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-admin-text">{label}</p>
                      <p className="text-xs text-admin-muted">{desc}</p>
                    </div>
                    <Switch
                      checked={!!settings.notifications[key as keyof SiteSettings['notifications']]}
                      onCheckedChange={(v) => updateNotifications(key as keyof SiteSettings['notifications'], v)}
                    />
                  </div>
                ))}
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>From Email</Label><Input value={settings.notifications.emailFrom || ''} onChange={(e) => updateNotifications('emailFrom', e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Reply-to Email</Label><Input value={settings.notifications.emailReplyTo || ''} onChange={(e) => updateNotifications('emailReplyTo', e.target.value)} /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader><CardTitle>Appearance Settings</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.appearance.primaryColor || '#D4AF37'}
                      onChange={(e) => updateAppearance('primaryColor', e.target.value)}
                      className="h-9 w-12 rounded-lg border border-admin-border bg-transparent cursor-pointer"
                    />
                    <Input value={settings.appearance.primaryColor || '#D4AF37'} onChange={(e) => updateAppearance('primaryColor', e.target.value)} className="font-mono" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Accent Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.appearance.accentColor || '#1A1A1A'}
                      onChange={(e) => updateAppearance('accentColor', e.target.value)}
                      className="h-9 w-12 rounded-lg border border-admin-border bg-transparent cursor-pointer"
                    />
                    <Input value={settings.appearance.accentColor || '#1A1A1A'} onChange={(e) => updateAppearance('accentColor', e.target.value)} className="font-mono" />
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-admin-text">Maintenance Mode</p>
                    <p className="text-xs text-admin-muted">When enabled, the site shows a maintenance page to visitors</p>
                  </div>
                  <Switch
                    checked={!!settings.appearance.maintenanceMode}
                    onCheckedChange={(v) => updateAppearance('maintenanceMode', v)}
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-admin-text">Coming Soon Mode</p>
                    <p className="text-xs text-admin-muted">Display a coming soon page instead of the full site</p>
                  </div>
                  <Switch
                    checked={!!settings.appearance.comingSoon}
                    onCheckedChange={(v) => updateAppearance('comingSoon', v)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
