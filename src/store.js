import { reactive, watch } from 'vue'

export const MOODS = {
  happy: { emoji: '😊', label: 'Feliz', color: 'var(--mood-happy)', gradient: 'var(--happy-gradient)' },
  calm: { emoji: '🧘', label: 'Calmo', color: 'var(--mood-calm)', gradient: 'var(--calm-gradient)' },
  productive: { emoji: '⚡', label: 'Produtivo', color: 'var(--mood-productive)', gradient: 'var(--productive-gradient)' },
  anxious: { emoji: '🥺', label: 'Ansioso', color: 'var(--mood-anxious)', gradient: 'var(--anxious-gradient)' },
  tired: { emoji: '😴', label: 'Cansado', color: 'var(--mood-tired)', gradient: 'var(--tired-gradient)' },
  sad: { emoji: '😢', label: 'Triste', color: 'var(--mood-sad)', gradient: 'var(--sad-gradient)' }
}

export const HABIT_ICONS = [
  { name: 'Brain', label: 'Mente' },
  { name: 'Droplet', label: 'Água' },
  { name: 'Dumbbell', label: 'Exercício' },
  { name: 'BookOpen', label: 'Leitura' },
  { name: 'Coffee', label: 'Foco' },
  { name: 'Bed', label: 'Sono' },
  { name: 'Heart', label: 'Saúde' },
  { name: 'Apple', label: 'Alimentação' }
]

export const HABIT_COLORS = [
  { hex: '#8b5cf6', name: 'Roxo' },
  { hex: '#3b82f6', name: 'Azul' },
  { hex: '#ec4899', name: 'Rosa' },
  { hex: '#10b981', name: 'Verde' },
  { hex: '#f59e0b', name: 'Laranja' },
  { hex: '#06b6d4', name: 'Ciano' }
]

// Date helpers
const getTodayString = (offsetDays = 0) => {
  const d = new Date()
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays)
  }
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// 10-day history dates
const d0 = getTodayString(0)
const d1 = getTodayString(-1)
const d2 = getTodayString(-2)
const d3 = getTodayString(-3)
const d4 = getTodayString(-4)
const d5 = getTodayString(-5)
const d6 = getTodayString(-6)
const d7 = getTodayString(-7)
const d8 = getTodayString(-8)
const d9 = getTodayString(-9)

// Default habits aligned with Ariel's 6 pillars and custom requirements
const initialHabits = [
  {
    id: 'h_cigarro',
    name: '🚬 Reduzir Cigarro',
    description: 'Meta máxima de 4 cigarros no dia',
    prompt: 'Fumei 1 cigarro desde a última vez?',
    unit: 'cigarros',
    target: 4,
    step: 1,
    type: 'negativo',
    frequency: 'diaria',
    icon: 'Droplet',
    color: '#ef4444',
    history: [],
    progressMap: {},
    streak: 0
  },
  {
    id: 'h_agua',
    name: '💧 Beber Água (2,1L)',
    description: 'Meta de 2100ml em copos de 300ml',
    prompt: 'Bebi +300ml de água agora?',
    unit: 'ml',
    target: 2100,
    step: 300,
    type: 'positivo',
    frequency: 'diaria',
    icon: 'Droplet',
    color: '#06b6d4',
    history: [],
    progressMap: {},
    streak: 0
  },
  {
    id: 'h_plantas',
    name: '🌿 Avaliar & Regar Plantas',
    description: 'Verificar umidade/temp e regar (2x/dia com intervalo)',
    prompt: 'Avaliei umidade/temp e/ou reguei as plantas agora?',
    unit: 'chetagens',
    target: 2,
    step: 1,
    type: 'positivo',
    frequency: 'diaria',
    minIntervalHours: 4, // intervalo mínimo de 4 horas entre checagens
    lastCheckTimestamp: null,
    lastWateredDate: new Date().toISOString().split('T')[0],
    icon: 'Apple',
    color: '#10b981',
    history: [],
    progressMap: {},
    streak: 0
  },
  {
    id: 'h_alimentacao',
    name: '🥗 Alimentação Equilibrada',
    description: 'Fazer as 3 refeições principais como gostaria',
    prompt: 'Fiz uma refeição saudável e equilibrada agora?',
    unit: 'refeições',
    target: 3,
    step: 1,
    type: 'positivo',
    frequency: 'diaria',
    icon: 'Apple',
    color: '#f59e0b',
    history: [],
    progressMap: {},
    streak: 0
  },
  {
    id: 'h_1',
    name: '🎸 Tocar Guitarra/Baixo',
    description: 'Prática de instrumento & desestresse diário',
    prompt: 'Toquei 15 min de guitarra/baixo?',
    unit: 'minutos',
    target: 15,
    step: 15,
    type: 'positivo',
    frequency: 'diaria',
    icon: 'Coffee',
    color: '#ec4899',
    history: [],
    progressMap: {},
    streak: 0
  },
  {
    id: 'h_2',
    name: '🏋️ Calistenia & Movimento',
    description: 'Exercício físico e rotina do Motion App',
    prompt: 'Realizei meu treino do dia?',
    unit: 'treino',
    target: 1,
    step: 1,
    type: 'positivo',
    frequency: 'diaria',
    icon: 'Dumbbell',
    color: '#10b981',
    history: [],
    progressMap: {},
    streak: 0
  },
  {
    id: 'h_3',
    name: '📚 Estudo Mestrado USP',
    description: 'Lógica, Ontologias ou Pesquisa IME-USP',
    prompt: 'Estudei 15 min de Mestrado/Lógica?',
    unit: 'minutos',
    target: 30,
    step: 15,
    type: 'positivo',
    frequency: 'diaria',
    icon: 'BookOpen',
    color: '#8b5cf6',
    history: [],
    progressMap: {},
    streak: 0
  }
]

const initialEntries = [
  {
    id: 'e_init_1',
    date: new Date().toISOString(),
    mood: 'calm',
    moods: { happy: 8, calm: 9, productive: 8, anxious: 2, tired: 3, sad: 1 },
    category: 'reflexao',
    content: 'Estruturando a rotina pessoal no Antigravity integrada ao MindFlow Journaling.',
    tags: ['antigravity', 'rotina', 'foco']
  }
]

// Load from localStorage or use defaults
const savedHabits = localStorage.getItem('mindflow_habits')
const savedEntries = localStorage.getItem('mindflow_entries')
const savedUser = localStorage.getItem('mindflow_user')

export const store = reactive({
  activeTab: 'dashboard',
  selectedDate: getTodayString(0),
  habits: savedHabits ? JSON.parse(savedHabits) : initialHabits,
  entries: savedEntries ? JSON.parse(savedEntries) : initialEntries,
  user: savedUser ? JSON.parse(savedUser) : { name: 'Ariel' },
  
  // Modals & UI States
  showAddHabitModal: false,
  showAddEntryModal: false,
  showSyncModal: false,
  preselectedMood: null,
  
  // Methods
  setTab(tab) {
    this.activeTab = tab
  },
  
  setSelectedDate(dateStr) {
    this.selectedDate = dateStr
  },
  
  // Toggle habit check-in
  toggleHabit(habitId, dateStr = this.selectedDate) {
    const habit = this.habits.find(h => h.id === habitId)
    if (!habit) return
    
    if (!habit.progressMap) habit.progressMap = {}

    const index = habit.history.indexOf(dateStr)
    if (index > -1) {
      habit.history.splice(index, 1)
      habit.progressMap[dateStr] = 0
    } else {
      habit.history.push(dateStr)
      habit.progressMap[dateStr] = habit.target || 1
    }
    
    this.recalculateStreak(habit)
    this.saveToStorage()
  },

  // Increment habit numerical progress (Tinder Swipe Mode)
  incrementHabitProgress(habitId, stepAmount = null, dateStr = getTodayString(0)) {
    const habit = this.habits.find(h => h.id === habitId)
    if (!habit) return

    if (!habit.progressMap) habit.progressMap = {}
    const currentVal = habit.progressMap[dateStr] || 0
    const addVal = stepAmount !== null ? Number(stepAmount) : Number(habit.step || 1)
    const newVal = currentVal + addVal
    habit.progressMap[dateStr] = newVal

    // For positive habits, check if target is met
    if (habit.type !== 'negativo') {
      if (newVal >= (habit.target || 1)) {
        if (!habit.history.includes(dateStr)) {
          habit.history.push(dateStr)
        }
      }
    } else {
      // Negative habit tracking
      if (!habit.history.includes(dateStr)) {
        habit.history.push(dateStr)
      }
    }

    this.recalculateStreak(habit)
    this.saveToStorage()
    return newVal
  },

  // Get current progress for a date
  getHabitProgress(habit, dateStr = getTodayString(0)) {
    if (!habit.progressMap) return habit.history.includes(dateStr) ? (habit.target || 1) : 0
    return habit.progressMap[dateStr] || (habit.history.includes(dateStr) ? (habit.target || 1) : 0)
  },

  // Shuffle habits for the Tinder Game mode
  getRandomizedHabitDeck() {
    const deck = [...this.habits]
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]]
    }
    return deck
  },
  
  // Recalculate streak
  recalculateStreak(habit) {
    let streak = 0
    let checkDate = getTodayString(0)
    
    if (!habit.history.includes(checkDate)) {
      checkDate = getTodayString(-1)
    }
    
    while (habit.history.includes(checkDate)) {
      streak++
      const parts = checkDate.split('-')
      const d = new Date(parts[0], parts[1] - 1, parts[2])
      d.setDate(d.getDate() - 1)
      
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      checkDate = `${yyyy}-${mm}-${dd}`
    }
    
    habit.streak = streak
  },
  
  addHabit(name, description, icon, color, unit = 'vezes', target = 1, step = 1, type = 'positivo', frequency = 'diaria') {
    const newHabit = {
      id: 'h_' + Date.now(),
      name,
      description,
      icon,
      color,
      unit,
      target: Number(target) || 1,
      step: Number(step) || 1,
      type,
      frequency,
      history: [],
      progressMap: {},
      streak: 0
    }
    this.habits.push(newHabit)
    this.saveToStorage()
  },
  
  // Low friction quick add entry (Micro-Journaling)
  quickAddEntry(content, category = 'reflexao', moodKey = 'calm') {
    if (!content || !content.trim()) return
    
    const defaultMoods = {
      happy: moodKey === 'happy' ? 8 : 5,
      calm: moodKey === 'calm' ? 9 : 5,
      productive: moodKey === 'productive' ? 8 : 5,
      anxious: moodKey === 'anxious' ? 7 : 2,
      tired: moodKey === 'tired' ? 7 : 3,
      sad: moodKey === 'sad' ? 7 : 1
    }
    
    // Auto extract #tags from content
    const extractedTags = (content.match(/#[\wáàâãéèêíïóôõöúçñ]+/gi) || []).map(t => t.replace('#', '').toLowerCase())
    if (!extractedTags.includes(category)) {
      extractedTags.push(category)
    }
    
    const newEntry = {
      id: 'e_' + Date.now(),
      date: new Date().toISOString(),
      mood: moodKey,
      moods: defaultMoods,
      category,
      content,
      tags: extractedTags
    }
    
    this.entries.unshift(newEntry)
    this.saveToStorage()
    return newEntry
  },
  
  addEntry(content, moodsMap, tagsString, category = 'reflexao') {
    const tags = tagsString
      .split(/[\s,#]+/)
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0)
      
    let dominantMood = 'happy'
    let maxVal = -1
    Object.keys(moodsMap).forEach(m => {
      if (moodsMap[m] > maxVal) {
        maxVal = moodsMap[m]
        dominantMood = m
      }
    })
      
    const newEntry = {
      id: 'e_' + Date.now(),
      date: new Date().toISOString(),
      mood: dominantMood,
      moods: { ...moodsMap },
      category,
      content,
      tags
    }
    
    this.entries.unshift(newEntry)
    this.saveToStorage()
  },
  
  deleteEntry(entryId) {
    const index = this.entries.findIndex(e => e.id === entryId)
    if (index > -1) {
      this.entries.splice(index, 1)
      this.saveToStorage()
    }
  },
  
  // Backup & Export JSON
  exportData() {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: this.user,
      habits: this.habits,
      entries: this.entries
    }, null, 2)
  },

  importData(jsonString) {
    try {
      const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString
      if (data.habits && Array.isArray(data.habits)) {
        this.habits = data.habits
      }
      if (data.entries && Array.isArray(data.entries)) {
        this.entries = data.entries
      }
      if (data.user) {
        this.user = data.user
      }
      this.saveToStorage()
      return true
    } catch (err) {
      console.error('Erro ao importar dados JSON:', err)
      return false
    }
  },
  
  getCompletionRate(dateStr) {
    if (this.habits.length === 0) return 0
    const completed = this.habits.filter(h => h.history.includes(dateStr)).length
    return Math.round((completed / this.habits.length) * 100)
  },
  
  // Calculate summary statistics specifically for the last 10 days
  getLast10DaysStats() {
    const last10Days = []
    for (let i = -9; i <= 0; i++) {
      last10Days.push(getTodayString(i))
    }
    
    // 1. Habit completion rate
    let totalPossible = this.habits.length * 10
    let totalCompleted = 0
    this.habits.forEach(h => {
      h.history.forEach(dateStr => {
        if (last10Days.includes(dateStr)) {
          totalCompleted++
        }
      })
    })
    const habitRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0
    
    // 2. Entries count
    const entriesInPeriod = this.entries.filter(e => {
      const entryDateStr = e.date.split('T')[0]
      return last10Days.includes(entryDateStr)
    })
    
    // 3. Top mood in last 10 days
    const moodCounts = {}
    entriesInPeriod.forEach(e => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1
    })
    let topMood = 'Nenhum'
    let maxCount = 0
    Object.keys(moodCounts).forEach(m => {
      if (moodCounts[m] > maxCount) {
        maxCount = moodCounts[m]
        topMood = m
      }
    })
    
    // 4. Max active streak
    let maxStreak = 0
    if (this.habits.length > 0) {
      maxStreak = Math.max(...this.habits.map(h => h.streak), 0)
    }
    
    return {
      habitRate,
      entryCount: entriesInPeriod.length,
      topMood,
      maxStreak
    }
  },
  
  getInsights() {
    const totalEntries = this.entries.length
    const totalHabitCompletions = this.habits.reduce((acc, h) => acc + h.history.length, 0)
    
    const moodCounts = {}
    this.entries.forEach(e => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1
    })
    
    let topMood = 'Nenhum'
    let topMoodCount = 0
    Object.keys(moodCounts).forEach(m => {
      if (moodCounts[m] > topMoodCount) {
        topMoodCount = moodCounts[m]
        topMood = m
      }
    })
    
    const correlations = []
    this.habits.forEach(habit => {
      const completionDates = habit.history
      if (completionDates.length === 0) return
      
      const moodsOnCompletionDays = []
      
      this.entries.forEach(entry => {
        const entryDateStr = entry.date.split('T')[0]
        if (completionDates.includes(entryDateStr)) {
          moodsOnCompletionDays.push(entry.mood)
        }
      })
      
      if (moodsOnCompletionDays.length > 0) {
        const counts = {}
        moodsOnCompletionDays.forEach(m => {
          counts[m] = (counts[m] || 0) + 1
        })
        
        let bestMood = 'happy'
        let maxCount = 0
        Object.keys(counts).forEach(m => {
          if (counts[m] > maxCount) {
            maxCount = counts[m]
            bestMood = m
          }
        })
        
        correlations.push({
          habitName: habit.name,
          bestMood: bestMood,
          count: maxCount
        })
      }
    })
    
    correlations.sort((a, b) => b.count - a.count)
    
    return {
      totalEntries,
      totalHabitCompletions,
      topMood,
      correlations: correlations.slice(0, 3)
    }
  },
  
  saveToStorage() {
    localStorage.setItem('mindflow_habits', JSON.stringify(this.habits))
    localStorage.setItem('mindflow_entries', JSON.stringify(this.entries))
    localStorage.setItem('mindflow_user', JSON.stringify(this.user))
  }
})

// Auto-sync watch
watch(() => store.habits, () => store.saveToStorage(), { deep: true })
watch(() => store.entries, () => store.saveToStorage(), { deep: true })
watch(() => store.user, () => store.saveToStorage(), { deep: true })
export { getTodayString }
