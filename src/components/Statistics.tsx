import { useState, useEffect, useCallback } from 'react'
import { blink } from '../blink/client'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  CheckCircle2,
  Clock,
  BarChart3,
  PieChart
} from 'lucide-react'

interface Task {
  id: string
  title: string
  priority: 'high' | 'medium' | 'low'
  category: string
  completed: number
  createdAt: string
  userId: string
}

export function Statistics() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const loadTasks = useCallback(async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const tasksData = await blink.db.tasks.list({
        where: { userId: user.id }
      })
      
      setTasks(tasksData)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadTasks()
      }
    })
    return unsubscribe
  }, [loadTasks])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
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

  // Calculate statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => Number(task.completed) > 0)
  const pendingTasks = tasks.filter(task => Number(task.completed) === 0)
  const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0

  // Weekly statistics
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thisWeekTasks = tasks.filter(task => new Date(task.createdAt) >= weekAgo)
  const thisWeekCompleted = thisWeekTasks.filter(task => Number(task.completed) > 0)

  // Monthly statistics
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const thisMonthTasks = tasks.filter(task => new Date(task.createdAt) >= monthAgo)
  const thisMonthCompleted = thisMonthTasks.filter(task => Number(task.completed) > 0)

  // Priority breakdown
  const priorityStats = {
    high: tasks.filter(task => task.priority === 'high'),
    medium: tasks.filter(task => task.priority === 'medium'),
    low: tasks.filter(task => task.priority === 'low')
  }

  // Category breakdown
  const categoryStats = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Daily completion trend (last 7 days)
  const dailyStats = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dayStart = new Date(date.setHours(0, 0, 0, 0))
    const dayEnd = new Date(date.setHours(23, 59, 59, 999))
    
    const dayCompleted = completedTasks.filter(task => {
      const taskDate = new Date(task.createdAt)
      return taskDate >= dayStart && taskDate <= dayEnd
    }).length

    dailyStats.push({
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      completed: dayCompleted
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Statistics</h2>
        <p className="text-muted-foreground">
          Track your productivity and task completion trends
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              All time tasks created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisWeekCompleted.length}</div>
            <p className="text-xs text-muted-foreground">
              {thisWeekTasks.length} tasks created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthCompleted.length}</div>
            <p className="text-xs text-muted-foreground">
              {thisMonthTasks.length} tasks created
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Breakdowns */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Priority Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(priorityStats).map(([priority, tasks]) => {
              const completed = tasks.filter(task => Number(task.completed) > 0).length
              const percentage = tasks.length > 0 ? (completed / tasks.length) * 100 : 0
              const colors = {
                high: 'bg-red-500',
                medium: 'bg-yellow-500',
                low: 'bg-green-500'
              }
              
              return (
                <div key={priority} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${colors[priority as keyof typeof colors]}`}></div>
                      <span className="capitalize font-medium">{priority} Priority</span>
                    </div>
                    <Badge variant="secondary">
                      {completed}/{tasks.length}
                    </Badge>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>Category Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(categoryStats).map(([category, count]) => {
              const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0
              const colors = {
                work: 'bg-blue-500',
                personal: 'bg-green-500',
                study: 'bg-yellow-500',
                home: 'bg-red-500'
              }
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${colors[category as keyof typeof colors] || 'bg-gray-500'}`}></div>
                      <span className="capitalize font-medium">{category}</span>
                    </div>
                    <Badge variant="secondary">
                      {count} ({Math.round(percentage)}%)
                    </Badge>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Daily Completion Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Daily Completion Trend (Last 7 Days)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-32 space-x-2">
            {dailyStats.map((day, index) => {
              const maxCompleted = Math.max(...dailyStats.map(d => d.completed), 1)
              const height = (day.completed / maxCompleted) * 100
              
              return (
                <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                  <div 
                    className="bg-primary rounded-t w-full min-h-[4px] transition-all"
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="text-xs text-muted-foreground">{day.day}</div>
                  <div className="text-xs font-medium">{day.completed}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Productivity Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Productivity Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Most Productive Category</h4>
              <p className="text-sm text-muted-foreground">
                {Object.entries(categoryStats).length > 0 
                  ? Object.entries(categoryStats).reduce((a, b) => a[1] > b[1] ? a : b)[0]
                  : 'No data yet'
                }
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Average Daily Tasks</h4>
              <p className="text-sm text-muted-foreground">
                {totalTasks > 0 ? Math.round(totalTasks / 30) : 0} tasks per day
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Pending Tasks</h4>
              <p className="text-sm text-muted-foreground">
                {pendingTasks.length} tasks remaining
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">High Priority Pending</h4>
              <p className="text-sm text-muted-foreground">
                {pendingTasks.filter(task => task.priority === 'high').length} urgent tasks
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}