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

// Empty initial arrays for user data
const initialHabits = []
const initialEntries = []

// Load from localStorage or use mock
const savedHabits = localStorage.getItem('mindflow_habits')
const savedEntries = localStorage.getItem('mindflow_entries')
const savedUser = localStorage.getItem('mindflow_user')

export const store = reactive({
  activeTab: 'dashboard',
  selectedDate: getTodayString(0),
  habits: savedHabits ? JSON.parse(savedHabits) : initialHabits,
  entries: savedEntries ? JSON.parse(savedEntries) : initialEntries,
  user: savedUser ? JSON.parse(savedUser) : { name: 'Ariel' },
  
  // Modals
  showAddHabitModal: false,
  showAddEntryModal: false,
  preselectedMood: null, // to pass a quick initial mood value
  
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
    
    const index = habit.history.indexOf(dateStr)
    if (index > -1) {
      habit.history.splice(index, 1)
    } else {
      habit.history.push(dateStr)
    }
    
    this.recalculateStreak(habit)
    this.saveToStorage()
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
  
  addHabit(name, description, icon, color) {
    const newHabit = {
      id: 'h_' + Date.now(),
      name,
      description,
      icon,
      color,
      history: [],
      streak: 0
    }
    this.habits.push(newHabit)
    this.saveToStorage()
  },
  
  addEntry(content, moodsMap, tagsString) {
    const tags = tagsString
      .split(/[\s,#]+/)
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0)
      
    // Calculate dominant mood based on highest score
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
      mood: dominantMood, // dominant for backward compatibility
      moods: { ...moodsMap }, // detailed dictionary
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
