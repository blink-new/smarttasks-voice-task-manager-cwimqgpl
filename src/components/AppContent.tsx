import { useState, useEffect } from 'react'
import { blink } from '../blink/client'
import { useLanguage } from '../contexts/LanguageContext'
import { Dashboard } from './Dashboard'
import { VoiceRecorder } from './VoiceRecorder'
import { TaskList } from './TaskList'
import { Statistics } from './Statistics'
import { Settings } from './Settings'
import { SmartReminders } from './SmartReminders'
import { AdvancedAnalytics } from './AdvancedAnalytics'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Moon, 
  Sun, 
  Mic, 
  Home, 
  CheckSquare, 
  BarChart3, 
  Settings as SettingsIcon,
  Globe,
  Bell,
  TrendingUp
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { getLanguageName } from '../lib/i18n'

interface User {
  id: string
  email: string
  displayName?: string
}

export function AppContent() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  
  const { language, setLanguage, t, isRTL } = useLanguage()

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading SmartTasks...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-primary">SmartTasks</h1>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'إدارة المهام المتقدمة بالأوامر الصوتية'
                : 'Advanced voice-enabled task management'
              }
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto">
              <Mic className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">
                {language === 'ar' ? 'مرحباً بك في SmartTasks' : 'Welcome to SmartTasks'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' 
                  ? 'نظم مهامك بالأوامر الصوتية والميزات الذكية'
                  : 'Organize your tasks with voice commands and smart features'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Globe className="w-4 h-4 mr-2" />
                  {getLanguageName(language)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ar')}>
                  العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button 
            onClick={() => blink.auth.login()} 
            className="w-full"
            size="lg"
          >
            {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">SmartTasks</h1>
                <p className="text-xs text-muted-foreground">
                  {t('welcomeBack')}, {user.displayName || user.email}
                </p>
              </div>
            </div>

            <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Globe className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setLanguage('en')}>
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('ar')}>
                    العربية
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              <Button
                onClick={() => setShowVoiceRecorder(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Mic className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('voiceCommand')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">{t('dashboard')}</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4" />
              <span className="hidden sm:inline">{t('tasks')}</span>
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Reminders</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">{t('statistics')}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <SettingsIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{t('settings')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <TaskList />
          </TabsContent>

          <TabsContent value="reminders" className="space-y-6">
            <SmartReminders />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AdvancedAnalytics />
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <Statistics />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Settings />
          </TabsContent>
        </Tabs>
      </main>

      {/* Voice Recorder Modal */}
      {showVoiceRecorder && (
        <VoiceRecorder onClose={() => setShowVoiceRecorder(false)} />
      )}

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowVoiceRecorder(true)}
        className={`fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg`}
        size="icon"
      >
        <Mic className="w-6 h-6" />
      </Button>
    </div>
  )
}