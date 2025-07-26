export type Language = 'en' | 'ar';

export interface Translations {
  // Navigation
  dashboard: string;
  tasks: string;
  statistics: string;
  settings: string;
  
  // Dashboard
  welcomeBack: string;
  todaysTasks: string;
  completedTasks: string;
  pendingTasks: string;
  highPriority: string;
  recentTasks: string;
  noRecentTasks: string;
  
  // Voice
  voiceCommand: string;
  listening: string;
  processing: string;
  speakNow: string;
  voiceCommandPlaceholder: string;
  
  // Tasks
  addTask: string;
  taskTitle: string;
  priority: string;
  category: string;
  dueDate: string;
  high: string;
  medium: string;
  low: string;
  work: string;
  study: string;
  home: string;
  personal: string;
  all: string;
  completed: string;
  pending: string;
  overdue: string;
  markComplete: string;
  markIncomplete: string;
  editTask: string;
  deleteTask: string;
  noTasks: string;
  
  // New Task Features
  searchTasks: string;
  starred: string;
  allTasks: string;
  addNewTask: string;
  enterTaskTitle: string;
  description: string;
  taskDescription: string;
  taskLocation: string;
  estimatedTime: string;
  minutes: string;
  notes: string;
  additionalNotes: string;
  updateTask: string;
  createTask: string;
  noTasksFound: string;
  noTasksYet: string;
  noTasksMatchFilter: string;
  showAllTasks: string;
  total: string;
  dateCreated: string;
  
  // Statistics
  weeklyStats: string;
  monthlyStats: string;
  completionRate: string;
  totalTasks: string;
  averageDaily: string;
  mostProductiveDay: string;
  tasksByPriority: string;
  tasksByCategory: string;
  
  // Settings
  profile: string;
  displayName: string;
  language: string;
  voiceSettings: string;
  defaultCategory: string;
  defaultPriority: string;
  notifications: string;
  theme: string;
  light: string;
  dark: string;
  system: string;
  saveChanges: string;
  
  // Common
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  search: string;
  filter: string;
  sort: string;
  today: string;
  tomorrow: string;
  thisWeek: string;
  nextWeek: string;
  
  // Voice Commands Examples
  voiceExamples: string;
  example1: string;
  example2: string;
  example3: string;
  example4: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    tasks: 'Tasks',
    statistics: 'Statistics',
    settings: 'Settings',
    
    // Dashboard
    welcomeBack: 'Welcome back',
    todaysTasks: "Today's Tasks",
    completedTasks: 'Completed Tasks',
    pendingTasks: 'Pending Tasks',
    highPriority: 'High Priority',
    recentTasks: 'Recent Tasks',
    noRecentTasks: 'No recent tasks',
    
    // Voice
    voiceCommand: 'Voice Command',
    listening: 'Listening...',
    processing: 'Processing...',
    speakNow: 'Speak now',
    voiceCommandPlaceholder: 'Try saying: "Add shopping task at 5 PM"',
    
    // Tasks
    addTask: 'Add Task',
    taskTitle: 'Task Title',
    priority: 'Priority',
    category: 'Category',
    dueDate: 'Due Date',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    work: 'Work',
    study: 'Study',
    home: 'Home',
    personal: 'Personal',
    all: 'All',
    completed: 'Completed',
    pending: 'Pending',
    overdue: 'Overdue',
    markComplete: 'Mark Complete',
    markIncomplete: 'Mark Incomplete',
    editTask: 'Edit Task',
    deleteTask: 'Delete Task',
    noTasks: 'No tasks found',
    
    // New Task Features
    searchTasks: 'Search tasks...',
    starred: 'Starred',
    allTasks: 'All Tasks',
    addNewTask: 'Add New Task',
    enterTaskTitle: 'Enter task title...',
    description: 'Description',
    taskDescription: 'Task description...',
    taskLocation: 'Task location...',
    estimatedTime: 'Estimated Time',
    minutes: 'minutes',
    notes: 'Notes',
    additionalNotes: 'Additional notes...',
    updateTask: 'Update Task',
    createTask: 'Create Task',
    noTasksFound: 'No tasks found',
    noTasksYet: "You haven't created any tasks yet. Use voice commands or the add button to get started!",
    noTasksMatchFilter: 'No tasks match the current filter',
    showAllTasks: 'Show All Tasks',
    total: 'total',
    dateCreated: 'Date Created',
    
    // Statistics
    weeklyStats: 'Weekly Statistics',
    monthlyStats: 'Monthly Statistics',
    completionRate: 'Completion Rate',
    totalTasks: 'Total Tasks',
    averageDaily: 'Average Daily',
    mostProductiveDay: 'Most Productive Day',
    tasksByPriority: 'Tasks by Priority',
    tasksByCategory: 'Tasks by Category',
    
    // Settings
    profile: 'Profile',
    displayName: 'Display Name',
    language: 'Language',
    voiceSettings: 'Voice Settings',
    defaultCategory: 'Default Category',
    defaultPriority: 'Default Priority',
    notifications: 'Notifications',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    saveChanges: 'Save Changes',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    today: 'Today',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    nextWeek: 'Next Week',
    
    // Voice Commands Examples
    voiceExamples: 'Voice Command Examples:',
    example1: '"Add shopping task at 5 PM"',
    example2: '"High priority work meeting tomorrow"',
    example3: '"Study for exam next week"',
    example4: '"Call mom this evening"',
  },
  
  ar: {
    // Navigation
    dashboard: 'لوحة التحكم',
    tasks: 'المهام',
    statistics: 'الإحصائيات',
    settings: 'الإعدادات',
    
    // Dashboard
    welcomeBack: 'مرحباً بعودتك',
    todaysTasks: 'مهام اليوم',
    completedTasks: 'المهام المكتملة',
    pendingTasks: 'المهام المعلقة',
    highPriority: 'أولوية عالية',
    recentTasks: 'المهام الأخيرة',
    noRecentTasks: 'لا توجد مهام حديثة',
    
    // Voice
    voiceCommand: 'الأوامر الصوتية',
    listening: 'جاري الاستماع...',
    processing: 'جاري المعالجة...',
    speakNow: 'تحدث الآن',
    voiceCommandPlaceholder: 'جرب قول: "أضف مهمة التسوق في الساعة 5 مساءً"',
    
    // Tasks
    addTask: 'إضافة مهمة',
    taskTitle: 'عنوان المهمة',
    priority: 'الأولوية',
    category: 'الفئة',
    dueDate: 'تاريخ الاستحقاق',
    high: 'عالية',
    medium: 'متوسطة',
    low: 'منخفضة',
    work: 'العمل',
    study: 'الدراسة',
    home: 'المنزل',
    personal: 'شخصي',
    all: 'الكل',
    completed: 'مكتملة',
    pending: 'معلقة',
    overdue: 'متأخرة',
    markComplete: 'تحديد كمكتملة',
    markIncomplete: 'تحديد كغير مكتملة',
    editTask: 'تعديل المهمة',
    deleteTask: 'حذف المهمة',
    noTasks: 'لا توجد مهام',
    
    // New Task Features
    searchTasks: 'البحث في المهام...',
    starred: 'المفضلة',
    allTasks: 'جميع المهام',
    addNewTask: 'إضافة مهمة جديدة',
    enterTaskTitle: 'أدخل عنوان المهمة...',
    description: 'الوصف',
    taskDescription: 'وصف المهمة...',
    taskLocation: 'موقع المهمة...',
    estimatedTime: 'الوقت المقدر',
    minutes: 'دقائق',
    notes: 'ملاحظات',
    additionalNotes: 'ملاحظات إضافية...',
    updateTask: 'تحديث المهمة',
    createTask: 'إنشاء المهمة',
    noTasksFound: 'لم يتم العثور على مهام',
    noTasksYet: 'لم تقم بإنشاء أي مهام بعد. استخدم الأوامر الصوتية أو زر الإضافة للبدء!',
    noTasksMatchFilter: 'لا توجد مهام تطابق المرشح الحالي',
    showAllTasks: 'عرض جميع المهام',
    total: 'المجموع',
    dateCreated: 'تاريخ الإنشاء',
    
    // Statistics
    weeklyStats: 'الإحصائيات الأسبوعية',
    monthlyStats: 'الإحصائيات الشهرية',
    completionRate: 'معدل الإنجاز',
    totalTasks: 'إجمالي المهام',
    averageDaily: 'المتوسط اليومي',
    mostProductiveDay: 'اليوم الأكثر إنتاجية',
    tasksByPriority: 'المهام حسب الأولوية',
    tasksByCategory: 'المهام حسب الفئة',
    
    // Settings
    profile: 'الملف الشخصي',
    displayName: 'اسم العرض',
    language: 'اللغة',
    voiceSettings: 'إعدادات الصوت',
    defaultCategory: 'الفئة الافتراضية',
    defaultPriority: 'الأولوية الافتراضية',
    notifications: 'الإشعارات',
    theme: 'المظهر',
    light: 'فاتح',
    dark: 'داكن',
    system: 'النظام',
    saveChanges: 'حفظ التغييرات',
    
    // Common
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    search: 'بحث',
    filter: 'تصفية',
    sort: 'ترتيب',
    today: 'اليوم',
    tomorrow: 'غداً',
    thisWeek: 'هذا الأسبوع',
    nextWeek: 'الأسبوع القادم',
    
    // Voice Commands Examples
    voiceExamples: 'أمثلة على الأوامر الصوتية:',
    example1: '"أضف مهمة التسوق في الساعة 5 مساءً"',
    example2: '"اجتماع عمل أولوية عالية غداً"',
    example3: '"مذاكرة للامتحان الأسبوع القادم"',
    example4: '"اتصال بماما هذا المساء"',
  }
};

export const useTranslation = (language: Language) => {
  return {
    t: (key: keyof Translations): string => {
      return translations[language][key] || key;
    },
    language,
    isRTL: language === 'ar'
  };
};

export const getLanguageDirection = (language: Language): 'ltr' | 'rtl' => {
  return language === 'ar' ? 'rtl' : 'ltr';
};

export const getLanguageName = (language: Language): string => {
  return language === 'ar' ? 'العربية' : 'English';
};