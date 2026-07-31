<script setup>
import { computed } from 'vue'
import { store } from '../store'
import LucideIcon from './LucideIcon.vue'

// Generate list of the last 7 days
const weekDays = computed(() => {
  const list = []
  for (let i = -6; i <= 0; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`
    
    const label = d.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3).toUpperCase()
    
    list.push({
      dateStr,
      dayNum: d.getDate(),
      dayLabel: label
    })
  }
  return list
})

// Current completion rate for the selected date
const currentRate = computed(() => {
  return store.getCompletionRate(store.selectedDate)
})

const isSelectedDateToday = computed(() => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return store.selectedDate === `${yyyy}-${mm}-${dd}`
})

const formatSelectedDateText = computed(() => {
  const parts = store.selectedDate.split('-')
  const d = new Date(parts[0], parts[1] - 1, parts[2])
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
})
</script>

<template>
  <div class="habits-view">
    <!-- Header -->
    <header class="habits-header" style="display: flex; justify-content: space-between; align-items: center;">
      <h1 class="text-gradient">Seus Hábitos</h1>
      <button class="fab" style="position: static; width: 40px; height: 40px; border-radius: 12px; box-shadow: none;" @click="store.showAddHabitModal = true">
        <LucideIcon name="Plus" size="20" />
      </button>
    </header>

    <!-- Date selector -->
    <div class="glass-card" style="margin-top: 16px; padding: 12px 16px;">
      <div class="date-selector">
        <button v-for="day in weekDays" :key="day.dateStr"
                :class="['date-dot-btn', { active: store.selectedDate === day.dateStr }]"
                @click="store.setSelectedDate(day.dateStr)">
          <span class="date-dot-day">{{ day.dayLabel }}</span>
          <span class="date-dot-num">{{ day.dayNum }}</span>
        </button>
      </div>
      
      <!-- Date label and daily progress bar -->
      <div style="margin-top: 14px; border-top: 1px solid var(--border-glass); padding-top: 12px;">
        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
          <span style="font-weight: 500;">{{ isSelectedDateToday ? 'Hoje' : formatSelectedDateText }}</span>
          <span class="text-secondary">{{ currentRate }}% concluído</span>
        </div>
        <div style="height: 6px; background: rgba(255,255,255,0.03); border-radius: 3px; overflow: hidden; position: relative;">
          <div :style="{ width: currentRate + '%', background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-pink))' }" 
               style="height: 100%; border-radius: 3px; transition: width 0.4s ease;">
          </div>
        </div>
      </div>
    </div>

    <!-- Habits List -->
    <div class="habits-section" style="margin-top: 8px;">
      <div v-if="store.habits.length > 0" class="habits-list">
        <div v-for="habit in store.habits" :key="habit.id" 
             :class="['habit-card', { completed: habit.history.includes(store.selectedDate) }]">
          <div class="habit-info">
            <div class="habit-icon-wrapper" :style="{ backgroundColor: habit.color }">
              <LucideIcon :name="habit.icon" size="20" />
            </div>
            <div class="habit-details">
              <span class="habit-name">{{ habit.name }}</span>
              <p class="text-secondary" style="font-size: 12px; margin-top: 2px;">{{ habit.description }}</p>
              <span class="habit-streak" v-if="habit.streak > 0" style="margin-top: 4px;">
                <LucideIcon name="Sparkles" /> {{ habit.streak }} {{ habit.streak === 1 ? 'dia seguido' : 'dias seguidos' }}
              </span>
            </div>
          </div>
          <button class="habit-check-btn" @click="store.toggleHabit(habit.id)">
            <LucideIcon name="Check" size="16" />
          </button>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="glass-card" style="text-align: center; padding: 48px 24px; color: var(--text-secondary);">
        <LucideIcon name="Dumbbell" size="48" style="margin: 0 auto 16px auto; color: var(--text-muted); opacity: 0.6;" />
        <h3 style="color: var(--text-primary); margin-bottom: 8px;">Nenhum hábito cadastrado</h3>
        <p style="font-size: 13px; line-height: 1.4; margin-bottom: 20px;">Adicione hábitos diários para começar a rastrear sua consistência e analisar seu humor.</p>
        <button class="btn-primary" style="padding: 10px 24px;" @click="store.showAddHabitModal = true">
          Cadastrar Hábito
        </button>
      </div>
    </div>
  </div>
</template>
