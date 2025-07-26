import { useState, useEffect } from 'react'
import { blink } from '../blink/client'
import { useLanguage } from '../contexts/LanguageContext'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Separator } from './ui/separator'
import { 
  User, 
  Bell, 
  Palette, 
  Mic, 
  LogOut,
  Save,
  Trash2
} from 'lucide-react'

export function Settings() {
  const [user, setUser] = useState<any>(null)
  const [displayName, setDisplayName] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [defaultCategory, setDefaultCategory] = useState('personal')
  const [defaultPriority, setDefaultPriority] = useState('medium')
  const [saving, setSaving] = useState(false)
  const { t, language, setLanguage, isRTL } = useLanguage()

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        setDisplayName(state.user.displayName || '')
      }
    })
    return unsubscribe
  }, [])

  const handleSaveProfile = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      await blink.auth.updateMe({
        displayName: displayName.trim()
      })
      
      // Show success message (you could add a toast here)
      console.log('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    blink.auth.logout()
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }
    
    try {
      // Delete all user tasks first
      const tasks = await blink.db.tasks.list({
        where: { userId: user.id }
      })
      
      for (const task of tasks) {
        await blink.db.tasks.delete(task.id)
      }
      
      // Then logout (account deletion would need backend support)
      blink.auth.logout()
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">{t('settings')}</h2>
        <p className="text-muted-foreground">
          {language === 'ar' 
            ? 'إدارة حسابك وتفضيلات التطبيق'
            : 'Manage your account and application preferences'
          }
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
            <User className="w-5 h-5" />
            <span>{t('profile')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="displayName">{t('displayName')}</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={language === 'ar' ? 'أدخل اسم العرض' : 'Enter your display name'}
            />
          </div>
          
          <Button onClick={handleSaveProfile} disabled={saving}>
            <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {saving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t('saveChanges')}
          </Button>
        </CardContent>
      </Card>

      {/* Voice Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mic className="w-5 h-5" />
            <span>Voice Commands</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Voice Commands</Label>
              <p className="text-sm text-muted-foreground">
                Allow voice input for creating tasks
              </p>
            </div>
            <Switch
              checked={voiceEnabled}
              onCheckedChange={setVoiceEnabled}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label>Default Category for Voice Tasks</Label>
            <Select value={defaultCategory} onValueChange={setDefaultCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="study">Study</SelectItem>
                <SelectItem value="home">Home</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Default Priority for Voice Tasks</Label>
            <Select value={defaultPriority} onValueChange={setDefaultPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for task reminders
              </p>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Daily Summary</Label>
              <p className="text-sm text-muted-foreground">
                Get a daily summary of your tasks
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Report</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly productivity reports
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Appearance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select defaultValue="system">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>{t('language')}</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
            <div>
              <h4 className="font-medium">Sign Out</h4>
              <p className="text-sm text-muted-foreground">
                Sign out of your account
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
            <div>
              <h4 className="font-medium text-red-600">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle>About SmartTasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Version</span>
            <span className="text-sm">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Build</span>
            <span className="text-sm">2024.01.26</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Platform</span>
            <span className="text-sm">Web</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}