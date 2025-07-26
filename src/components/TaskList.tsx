import { useState, useEffect, useCallback } from 'react'
import { blink } from '../blink/client'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { useLanguage } from '../contexts/LanguageContext'
import { 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Edit3,
  Calendar,
  MapPin,
  AlertTriangle,
  Clock,
  Filter,
  Star,
  Copy,
  Archive,
  Tag,
  Bell,
  Zap,
  Target,
  Timer,
  Bookmark
} from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  priority: 'high' | 'medium' | 'low'
  category: string
  completed: number
  dueDate?: string
  reminderTime?: string
  location?: string
  createdAt: string
  userId: string
  tags?: string[]
  isStarred?: number
  estimatedTime?: number
  actualTime?: number
  subtasks?: string[]
  notes?: string
}

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500'
}

const priorityLabels = {
  high: 'High Priority',
  medium: 'Medium Priority',
  low: 'Low Priority'
}

const categories = [
  { value: 'work', label: 'Work', icon: '💼' },
  { value: 'personal', label: 'Personal', icon: '👤' },
  { value: 'study', label: 'Study', icon: '📚' },
  { value: 'health', label: 'Health', icon: '🏥' },
  { value: 'shopping', label: 'Shopping', icon: '🛒' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'home', label: 'Home', icon: '🏠' }
]

export function TaskList() {
  const { t, language } = useLanguage()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Add/Edit Task States
  const [showAddTask, setShowAddTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    category: 'personal',
    dueDate: '',
    reminderTime: '',
    location: '',
    tags: [] as string[],
    estimatedTime: 0,
    notes: ''
  })

  const loadTasks = useCallback(async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const tasksData = await blink.db.tasks.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
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

  const resetForm = () => {
    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      category: 'personal',
      dueDate: '',
      reminderTime: '',
      location: '',
      tags: [],
      estimatedTime: 0,
      notes: ''
    })
  }

  const startEditTask = (task: Task) => {
    setEditingTask(task)
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category,
      dueDate: task.dueDate || '',
      reminderTime: task.reminderTime || '',
      location: task.location || '',
      tags: task.tags || [],
      estimatedTime: task.estimatedTime || 0,
      notes: task.notes || ''
    })
  }

  const saveTask = async () => {
    if (!taskForm.title.trim() || !user?.id) return
    
    try {
      const taskData = {
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        priority: taskForm.priority,
        category: taskForm.category,
        dueDate: taskForm.dueDate || null,
        reminderTime: taskForm.reminderTime || null,
        location: taskForm.location.trim() || null,
        tags: taskForm.tags,
        estimatedTime: taskForm.estimatedTime,
        notes: taskForm.notes.trim(),
        updatedAt: new Date().toISOString()
      }

      if (editingTask) {
        // Update existing task
        await blink.db.tasks.update(editingTask.id, taskData)
        setTasks(prev => prev.map(task => 
          task.id === editingTask.id 
            ? { ...task, ...taskData }
            : task
        ))
        setEditingTask(null)
      } else {
        // Create new task
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newTask = {
          id: taskId,
          ...taskData,
          completed: 0,
          isStarred: 0,
          createdAt: new Date().toISOString(),
          userId: user.id
        }
        
        await blink.db.tasks.create(newTask)
        setTasks(prev => [newTask, ...prev])
        setShowAddTask(false)
      }
      
      resetForm()
    } catch (error) {
      console.error('Error saving task:', error)
    }
  }

  const toggleTaskComplete = async (taskId: string, completed: number) => {
    try {
      const updateData = {
        completed: completed ? 0 : 1,
        updatedAt: new Date().toISOString()
      }
      
      // If completing task, record actual time
      if (!completed) {
        const task = tasks.find(t => t.id === taskId)
        if (task?.estimatedTime) {
          updateData.actualTime = task.estimatedTime // For demo, using estimated time
        }
      }
      
      await blink.db.tasks.update(taskId, updateData)
      
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, ...updateData }
          : task
      ))
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const toggleStarTask = async (taskId: string, isStarred: number) => {
    try {
      await blink.db.tasks.update(taskId, {
        isStarred: isStarred ? 0 : 1,
        updatedAt: new Date().toISOString()
      })
      
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, isStarred: isStarred ? 0 : 1 }
          : task
      ))
    } catch (error) {
      console.error('Error starring task:', error)
    }
  }

  const duplicateTask = async (task: Task) => {
    try {
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const duplicatedTask = {
        ...task,
        id: taskId,
        title: `${task.title} (Copy)`,
        completed: 0,
        isStarred: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await blink.db.tasks.create(duplicatedTask)
      setTasks(prev => [duplicatedTask, ...prev])
    } catch (error) {
      console.error('Error duplicating task:', error)
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      await blink.db.tasks.delete(taskId)
      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query) ||
        task.tags?.some(tag => tag.toLowerCase().includes(query))
      
      if (!matchesSearch) return false
    }

    // Status filter
    switch (filter) {
      case 'completed':
        return Number(task.completed) > 0
      case 'pending':
        return Number(task.completed) === 0
      case 'high':
        return task.priority === 'high' && Number(task.completed) === 0
      case 'starred':
        return Number(task.isStarred) > 0
      case 'today': {
        if (!task.dueDate) return false
        const today = new Date().toDateString()
        return new Date(task.dueDate).toDateString() === today
      }
      case 'overdue':
        if (!task.dueDate) return false
        return new Date(task.dueDate) < new Date() && Number(task.completed) === 0
      default:
        return true
    }
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'priority': {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      case 'due':
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      case 'starred':
        return (Number(b.isStarred) || 0) - (Number(a.isStarred) || 0)
      case 'category':
        return a.category.localeCompare(b.category)
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-muted rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">{t('tasks')}</h2>
          <p className="text-muted-foreground">
            {tasks.length} {t('total')}, {tasks.filter(t => Number(t.completed) === 0).length} {t('pending')}
          </p>
        </div>
        
        <Button onClick={() => setShowAddTask(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('addTask')}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder={t('searchTasks')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allTasks')}</SelectItem>
            <SelectItem value="pending">{t('pending')}</SelectItem>
            <SelectItem value="completed">{t('completed')}</SelectItem>
            <SelectItem value="starred">⭐ {t('starred')}</SelectItem>
            <SelectItem value="today">📅 {t('today')}</SelectItem>
            <SelectItem value="overdue">⚠️ {t('overdue')}</SelectItem>
            <SelectItem value="high">🔴 {t('highPriority')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">{t('dateCreated')}</SelectItem>
            <SelectItem value="priority">{t('priority')}</SelectItem>
            <SelectItem value="due">{t('dueDate')}</SelectItem>
            <SelectItem value="starred">{t('starred')}</SelectItem>
            <SelectItem value="category">{t('category')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Add/Edit Task Dialog */}
      <Dialog open={showAddTask || !!editingTask} onOpenChange={(open) => {
        if (!open) {
          setShowAddTask(false)
          setEditingTask(null)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? t('editTask') : t('addNewTask')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">{t('taskTitle')} *</Label>
              <Input
                id="title"
                value={taskForm.title}
                onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t('enterTaskTitle')}
              />
            </div>

            <div>
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description"
                value={taskForm.description}
                onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('taskDescription')}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">{t('priority')}</Label>
                <Select value={taskForm.priority} onValueChange={(value: 'high' | 'medium' | 'low') => 
                  setTaskForm(prev => ({ ...prev, priority: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">🔴 {t('high')}</SelectItem>
                    <SelectItem value="medium">🟡 {t('medium')}</SelectItem>
                    <SelectItem value="low">🟢 {t('low')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">{t('category')}</Label>
                <Select value={taskForm.category} onValueChange={(value) => 
                  setTaskForm(prev => ({ ...prev, category: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueDate">{t('dueDate')}</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="estimatedTime">{t('estimatedTime')} ({t('minutes')})</Label>
                <Input
                  id="estimatedTime"
                  type="number"
                  min="0"
                  value={taskForm.estimatedTime}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 0 }))}
                  placeholder="30"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">{t('location')}</Label>
              <Input
                id="location"
                value={taskForm.location}
                onChange={(e) => setTaskForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder={t('taskLocation')}
              />
            </div>

            <div>
              <Label htmlFor="notes">{t('notes')}</Label>
              <Textarea
                id="notes"
                value={taskForm.notes}
                onChange={(e) => setTaskForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={t('additionalNotes')}
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => {
                setShowAddTask(false)
                setEditingTask(null)
                resetForm()
              }}>
                {t('cancel')}
              </Button>
              <Button onClick={saveTask} disabled={!taskForm.title.trim()}>
                {editingTask ? t('updateTask') : t('createTask')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tasks List */}
      <div className="space-y-3">
        {sortedTasks.map((task) => {
          const isCompleted = Number(task.completed) > 0
          const isStarred = Number(task.isStarred) > 0
          const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted
          const category = categories.find(c => c.value === task.category)
          
          return (
            <Card key={task.id} className={`transition-all hover:shadow-md ${
              isCompleted ? 'opacity-60' : ''
            } ${isOverdue ? 'border-red-200 bg-red-50/50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTaskComplete(task.id, task.completed)}
                    className="p-0 h-auto mt-1"
                  >
                    <CheckCircle2 
                      className={`w-5 h-5 ${
                        isCompleted
                          ? 'text-green-500 fill-green-500' 
                          : 'text-muted-foreground hover:text-green-500'
                      }`} 
                    />
                  </Button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`font-medium ${
                            isCompleted ? 'line-through text-muted-foreground' : ''
                          }`}>
                            {task.title}
                          </h3>
                          {isStarred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                          {isOverdue && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <Badge 
                            variant="secondary" 
                            className={`${priorityColors[task.priority]} text-white`}
                          >
                            {task.priority.toUpperCase()}
                          </Badge>
                          
                          <Badge variant="outline" className="capitalize">
                            {category?.icon} {category?.label || task.category}
                          </Badge>
                          
                          {task.estimatedTime && (
                            <Badge variant="outline">
                              <Timer className="w-3 h-3 mr-1" />
                              {task.estimatedTime}m
                            </Badge>
                          )}
                          
                          {task.dueDate && (
                            <div className={`flex items-center text-xs ${
                              isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'
                            }`}>
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}
                          
                          {task.location && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3 mr-1" />
                              {task.location}
                            </div>
                          )}
                        </div>

                        {task.tags && task.tags.length > 0 && (
                          <div className="flex items-center space-x-1 mb-2">
                            <Tag className="w-3 h-3 text-muted-foreground" />
                            {task.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleStarTask(task.id, task.isStarred || 0)}
                          className={isStarred ? 'text-yellow-500' : ''}
                        >
                          <Star className={`w-4 h-4 ${isStarred ? 'fill-yellow-500' : ''}`} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => duplicateTask(task)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => startEditTask(task)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        
        {sortedTasks.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-medium mb-2">{t('noTasksFound')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {filter === 'all' 
                  ? t('noTasksYet')
                  : t('noTasksMatchFilter')
                }
              </p>
              {filter !== 'all' && (
                <Button variant="outline" onClick={() => setFilter('all')}>
                  {t('showAllTasks')}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}