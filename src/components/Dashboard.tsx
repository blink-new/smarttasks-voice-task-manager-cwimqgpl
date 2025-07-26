import { useState, useEffect, useCallback } from 'react'
import { blink } from '../blink/client'
import { useLanguage } from '../contexts/LanguageContext'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Briefcase,
  User,
  Book,
  Home,
  Plus
} from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  priority: 'high' | 'medium' | 'low'
  category: string
  completed: number
  dueDate?: string
  createdAt: string
  userId: string
}

interface TaskList {
  id: string
  name: string
  color: string
  icon: string
  userId: string
}

const categoryIcons = {
  work: Briefcase,
  personal: User,
  study: Book,
  home: Home,
  default: User
}

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500'
}

export function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskLists, setTaskLists] = useState<TaskList[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const { t, isRTL } = useLanguage()

  const loadData = useCallback(async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const [tasksData, listsData] = await Promise.all([
        blink.db.tasks.list({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          limit: 10
        }),
        blink.db.taskLists.list({
          where: { userId: user.id }
        })
      ])
      
      setTasks(tasksData)
      setTaskLists(listsData)
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

  const toggleTaskComplete = async (taskId: string, completed: number) => {
    try {
      await blink.db.tasks.update(taskId, {
        completed: completed ? 0 : 1,
        updatedAt: new Date().toISOString()
      })
      
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: completed ? 0 : 1 }
          : task
      ))
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const completedTasks = tasks.filter(task => Number(task.completed) > 0)
  const pendingTasks = tasks.filter(task => Number(task.completed) === 0)
  const highPriorityTasks = tasks.filter(task => task.priority === 'high' && Number(task.completed) === 0)
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false
    const today = new Date().toDateString()
    const taskDate = new Date(task.dueDate).toDateString()
    return today === taskDate && Number(task.completed) === 0
  })

  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalTasks')}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks.length} {t('completed')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pending')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('pendingTasks')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('highPriority')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('high')} {t('priority')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('completionRate')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t('recentTasks')}
              <Button variant="outline" size="sm">
                <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('addTask')}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.slice(0, 5).map((task) => {
              const IconComponent = categoryIcons[task.category as keyof typeof categoryIcons] || categoryIcons.default
              return (
                <div key={task.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTaskComplete(task.id, task.completed)}
                    className="p-0 h-auto"
                  >
                    <CheckCircle2 
                      className={`w-5 h-5 ${
                        Number(task.completed) > 0 
                          ? 'text-green-500 fill-green-500' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </Button>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      Number(task.completed) > 0 ? 'line-through text-muted-foreground' : ''
                    }`}>
                      {task.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <IconComponent className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground capitalize">
                        {task.category}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`}></div>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {tasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('noTasks')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Lists */}
        <Card>
          <CardHeader>
            <CardTitle>{t('tasks')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {taskLists.map((list) => {
              const IconComponent = categoryIcons[list.icon as keyof typeof categoryIcons] || categoryIcons.default
              const listTasks = tasks.filter(task => task.category === list.id)
              const completedCount = listTasks.filter(task => Number(task.completed) > 0).length
              
              return (
                <div key={list.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: list.color + '20' }}
                    >
                      <IconComponent 
                        className="w-4 h-4" 
                        style={{ color: list.color }}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{list.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {completedCount}/{listTasks.length} {t('completed')}
                      </p>
                    </div>
                  </div>
                  
                  <Badge variant="secondary">
                    {listTasks.length}
                  </Badge>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}