import { useState, useEffect, useCallback } from 'react'
import { blink } from '../blink/client'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Switch } from './ui/switch'
import { useLanguage } from '../contexts/LanguageContext'
import { 
  Bell, 
  Clock, 
  MapPin, 
  Calendar,
  Smartphone,
  Mail,
  Volume2,
  Settings,
  Plus,
  Trash2
} from 'lucide-react'

interface Reminder {
  id: string
  taskId: string
  taskTitle: string
  type: 'time' | 'location' | 'recurring'
  enabled: boolean
  timeReminder?: string
  locationReminder?: string
  recurringPattern?: 'daily' | 'weekly' | 'monthly'
  notificationMethods: ('push' | 'email' | 'sound')[]
  createdAt: string
  userId: string
}

export function SmartReminders() {
  const { t } = useLanguage()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const loadData = useCallback(async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      
      // Load tasks and reminders
      const [tasksData, remindersData] = await Promise.all([
        blink.db.tasks.list({
          where: { userId: user.id, completed: 0 },
          orderBy: { createdAt: 'desc' }
        }),
        blink.db.reminders?.list?.({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        }) || []
      ])
      
      setTasks(tasksData)
      setReminders(remindersData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadData()
      }
    })
    return unsubscribe
  }, [loadData])

  const toggleReminder = async (reminderId: string, enabled: boolean) => {
    try {
      await blink.db.reminders.update(reminderId, {
        enabled: !enabled,
        updatedAt: new Date().toISOString()
      })
      
      setReminders(prev => prev.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, enabled: !enabled }
          : reminder
      ))
    } catch (error) {
      console.error('Error updating reminder:', error)
    }
  }

  const createSmartReminder = async (taskId: string, type: 'time' | 'location') => {
    try {
      const task = tasks.find(t => t.id === taskId)
      if (!task) return

      const reminderId = `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const newReminder = {
        id: reminderId,
        taskId,
        taskTitle: task.title,
        type,
        enabled: true,
        timeReminder: type === 'time' ? task.dueDate : undefined,
        locationReminder: type === 'location' ? task.location : undefined,
        notificationMethods: ['push', 'sound'] as ('push' | 'email' | 'sound')[],
        createdAt: new Date().toISOString(),
        userId: user.id
      }
      
      await blink.db.reminders.create(newReminder)
      setReminders(prev => [newReminder, ...prev])
    } catch (error) {
      console.error('Error creating reminder:', error)
    }
  }

  const deleteReminder = async (reminderId: string) => {
    try {
      await blink.db.reminders.delete(reminderId)
      setReminders(prev => prev.filter(r => r.id !== reminderId))
    } catch (error) {
      console.error('Error deleting reminder:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Bell className="w-6 h-6 mr-2 text-blue-500" />
            Smart Reminders
          </h2>
          <p className="text-muted-foreground">
            Intelligent notifications for your tasks
          </p>
        </div>
        
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Quick Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Quick Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.slice(0, 4).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {task.category} • {task.priority} priority
                  </p>
                </div>
                <div className="flex space-x-2">
                  {task.dueDate && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => createSmartReminder(task.id, 'time')}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Time
                    </Button>
                  )}
                  {task.location && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => createSmartReminder(task.id, 'location')}
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      Location
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Reminders */}
      <Card>
        <CardHeader>
          <CardTitle>Active Reminders ({reminders.filter(r => r.enabled).length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Switch
                    checked={reminder.enabled}
                    onCheckedChange={() => toggleReminder(reminder.id, reminder.enabled)}
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-medium">{reminder.taskTitle}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge variant="outline" className="capitalize">
                        {reminder.type === 'time' && <Clock className="w-3 h-3 mr-1" />}
                        {reminder.type === 'location' && <MapPin className="w-3 h-3 mr-1" />}
                        {reminder.type === 'recurring' && <Calendar className="w-3 h-3 mr-1" />}
                        {reminder.type}
                      </Badge>
                      
                      {reminder.timeReminder && (
                        <span className="text-sm text-muted-foreground">
                          {new Date(reminder.timeReminder).toLocaleString()}
                        </span>
                      )}
                      
                      {reminder.locationReminder && (
                        <span className="text-sm text-muted-foreground">
                          📍 {reminder.locationReminder}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      {reminder.notificationMethods.map((method) => (
                        <Badge key={method} variant="secondary" className="text-xs">
                          {method === 'push' && <Smartphone className="w-3 h-3 mr-1" />}
                          {method === 'email' && <Mail className="w-3 h-3 mr-1" />}
                          {method === 'sound' && <Volume2 className="w-3 h-3 mr-1" />}
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteReminder(reminder.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            {reminders.length === 0 && (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-medium mb-2">No reminders set</h3>
                <p className="text-sm text-muted-foreground">
                  Create smart reminders for your tasks to never miss important deadlines
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Smart Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2 text-amber-500" />
            Smart Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">Location-based reminders</h4>
                  <p className="text-sm text-blue-700">
                    Get notified when you arrive at or leave specific locations
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Enable
                </Button>
              </div>
            </div>
            
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-green-900">Smart scheduling</h4>
                  <p className="text-sm text-green-700">
                    AI suggests optimal times for your tasks based on your patterns
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Try Now
                </Button>
              </div>
            </div>
            
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-purple-900">Recurring reminders</h4>
                  <p className="text-sm text-purple-700">
                    Set up daily, weekly, or monthly reminders for routine tasks
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Setup
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}