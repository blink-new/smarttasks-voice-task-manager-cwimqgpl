import { useState, useEffect, useCallback } from 'react'
import { blink } from '../blink/client'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { useLanguage } from '../contexts/LanguageContext'
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Zap,
  Brain,
  Timer,
  CheckCircle2
} from 'lucide-react'

interface AnalyticsData {
  totalTasks: number
  completedTasks: number
  completionRate: number
  averageCompletionTime: number
  productivityScore: number
  streakDays: number
  mostProductiveHour: number
  categoryBreakdown: { [key: string]: number }
  priorityBreakdown: { [key: string]: number }
  weeklyTrend: number[]
  monthlyGoal: number
  monthlyProgress: number
}

export function AdvancedAnalytics() {
  const { t } = useLanguage()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

  const calculateAnalytics = useCallback(async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      
      // Get all tasks for the user
      const tasks = await blink.db.tasks.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      
      const now = new Date()
      const timeRangeMs = {
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        year: 365 * 24 * 60 * 60 * 1000
      }
      
      const cutoffDate = new Date(now.getTime() - timeRangeMs[timeRange])
      const filteredTasks = tasks.filter(task => 
        new Date(task.createdAt) >= cutoffDate
      )
      
      const completedTasks = filteredTasks.filter(task => Number(task.completed) > 0)
      const completionRate = filteredTasks.length > 0 
        ? (completedTasks.length / filteredTasks.length) * 100 
        : 0
      
      // Calculate category breakdown
      const categoryBreakdown: { [key: string]: number } = {}
      filteredTasks.forEach(task => {
        categoryBreakdown[task.category] = (categoryBreakdown[task.category] || 0) + 1
      })
      
      // Calculate priority breakdown
      const priorityBreakdown: { [key: string]: number } = {}
      filteredTasks.forEach(task => {
        priorityBreakdown[task.priority] = (priorityBreakdown[task.priority] || 0) + 1
      })
      
      // Calculate productivity score (0-100)
      const productivityScore = Math.min(100, Math.round(
        (completionRate * 0.4) + 
        (Math.min(filteredTasks.length / 10, 1) * 30) + 
        (Math.min(completedTasks.length / 7, 1) * 30)
      ))
      
      // Calculate streak days (simplified)
      let streakDays = 0
      const today = new Date()
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000))
        const dayTasks = completedTasks.filter(task => {
          const taskDate = new Date(task.updatedAt || task.createdAt)
          return taskDate.toDateString() === checkDate.toDateString()
        })
        
        if (dayTasks.length > 0) {
          streakDays++
        } else if (i > 0) {
          break
        }
      }
      
      // Generate weekly trend (last 7 days)
      const weeklyTrend = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000))
        const dayCompleted = completedTasks.filter(task => {
          const taskDate = new Date(task.updatedAt || task.createdAt)
          return taskDate.toDateString() === date.toDateString()
        }).length
        weeklyTrend.push(dayCompleted)
      }
      
      const analyticsData: AnalyticsData = {
        totalTasks: filteredTasks.length,
        completedTasks: completedTasks.length,
        completionRate,
        averageCompletionTime: 45, // Mock data
        productivityScore,
        streakDays,
        mostProductiveHour: 14, // Mock data (2 PM)
        categoryBreakdown,
        priorityBreakdown,
        weeklyTrend,
        monthlyGoal: 50,
        monthlyProgress: completedTasks.length
      }
      
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error calculating analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id, timeRange])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        calculateAnalytics()
      }
    })
    return unsubscribe
  }, [calculateAnalytics])

  if (loading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-blue-500" />
            Advanced Analytics
          </h2>
          <p className="text-muted-foreground">
            Deep insights into your productivity patterns
          </p>
        </div>
        
        <div className="flex space-x-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="capitalize"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Productivity Score</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.productivityScore}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Progress value={analytics.productivityScore} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics.completionRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <Progress value={analytics.completionRate} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.streakDays}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Completion</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.averageCompletionTime}m</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Timer className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Weekly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.weeklyTrend.map((count, index) => {
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                const dayIndex = (new Date().getDay() - 6 + index + 7) % 7
                const maxCount = Math.max(...analytics.weeklyTrend, 1)
                
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-sm font-medium w-8">{days[dayIndex]}</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-6">{count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Tasks by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.categoryBreakdown).map(([category, count]) => {
                const percentage = (count / analytics.totalTasks) * 100
                const categoryIcons: { [key: string]: string } = {
                  work: '💼',
                  personal: '👤',
                  study: '📚',
                  home: '🏠',
                  health: '🏥',
                  shopping: '🛒'
                }
                
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>{categoryIcons[category] || '📋'}</span>
                      <span className="capitalize font-medium">{category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Goal Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Monthly Goal Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {analytics.monthlyProgress} / {analytics.monthlyGoal} tasks completed
              </span>
              <Badge variant={analytics.monthlyProgress >= analytics.monthlyGoal ? 'default' : 'secondary'}>
                {((analytics.monthlyProgress / analytics.monthlyGoal) * 100).toFixed(0)}%
              </Badge>
            </div>
            <Progress 
              value={(analytics.monthlyProgress / analytics.monthlyGoal) * 100} 
              className="h-3"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {analytics.monthlyGoal - analytics.monthlyProgress > 0 
                  ? `${analytics.monthlyGoal - analytics.monthlyProgress} tasks remaining`
                  : 'Goal achieved! 🎉'
                }
              </span>
              <span>
                {Math.ceil((analytics.monthlyGoal - analytics.monthlyProgress) / 
                  (30 - new Date().getDate()))} per day needed
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-500" />
            AI Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Peak Productivity</h4>
                  <p className="text-sm text-blue-700">
                    Your most productive hour is {analytics.mostProductiveHour}:00. 
                    Schedule important tasks during this time for better results.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-green-900">Completion Pattern</h4>
                  <p className="text-sm text-green-700">
                    You complete {analytics.completionRate.toFixed(0)}% of your tasks. 
                    Try breaking larger tasks into smaller, manageable chunks.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-amber-100 rounded-full">
                  <Activity className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-medium text-amber-900">Streak Motivation</h4>
                  <p className="text-sm text-amber-700">
                    Great job on your {analytics.streakDays}-day streak! 
                    Keep it up by completing at least one task daily.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}