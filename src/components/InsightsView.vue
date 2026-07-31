<script setup>
import { computed } from 'vue'
import { store, MOODS } from '../store'
import LucideIcon from './LucideIcon.vue'

// Get calculated insights from the store
const insights = computed(() => {
  return store.getInsights()
})

const totalHabitsCount = computed(() => {
  return store.habits.length
})

const activeStreaksMax = computed(() => {
  if (store.habits.length === 0) return 0
  return Math.max(...store.habits.map(h => h.streak), 0)
})

// Generate data for the 7-day mood trend chart
const last7DaysChartData = computed(() => {
  const chartDays = []
  
  // Mapping mood to fill height percentage and color
  const moodScale = {
    happy: { height: '100%', color: 'var(--mood-happy)' },
    productive: { height: '80%', color: 'var(--mood-productive)' },
    calm: { height: '60%', color: 'var(--mood-calm)' },
    tired: { height: '40%', color: 'var(--mood-tired)' },
    anxious: { height: '30%', color: 'var(--mood-anxious)' },
    sad: { height: '20%', color: 'var(--mood-sad)' }
  }
  
  for (let i = -6; i <= 0; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`
    
    // Find entry on this date
    const dayEntry = store.entries.find(entry => entry.date.split('T')[0] === dateStr)
    const label = d.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3).toUpperCase()
    
    if (dayEntry) {
      chartDays.push({
        dayLabel: label,
        hasData: true,
        height: moodScale[dayEntry.mood].height,
        color: moodScale[dayEntry.mood].color,
        emoji: MOODS[dayEntry.mood].emoji,
        moodLabel: MOODS[dayEntry.mood].label
      })
    } else {
      chartDays.push({
        dayLabel: label,
        hasData: false,
        height: '0%',
        color: 'transparent',
        emoji: '•',
        moodLabel: 'Nenhum'
      })
    }
  }
  return chartDays
})
</script>

<template>
  <div class="insights-view">
    <!-- Header -->
    <header class="insights-header">
      <h1 class="text-gradient">Insights de Mente</h1>
    </header>

    <!-- Stats Grid -->
    <div class="stats-grid" style="margin-top: 16px;">
      <div class="glass-card">
        <span class="text-secondary" style="font-size: 11px; font-weight: 600; text-transform: uppercase;">Humor Frequente</span>
        <div v-if="insights.topMood !== 'Nenhum'" style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
          <span style="font-size: 26px;">{{ MOODS[insights.topMood]?.emoji }}</span>
          <span style="font-size: 18px; font-weight: 700;" :style="{ color: MOODS[insights.topMood]?.color }">
            {{ MOODS[insights.topMood]?.label }}
          </span>
        </div>
        <div v-else style="font-size: 15px; font-weight: 600; margin-top: 10px; color: var(--text-secondary);">
          Sem registros
        </div>
      </div>
      
      <div class="glass-card">
        <span class="text-secondary" style="font-size: 11px; font-weight: 600; text-transform: uppercase;">Maior Streak</span>
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
          <span style="font-size: 26px;">🔥</span>
          <span class="stat-value" style="margin-top: 0;">{{ activeStreaksMax }} <span style="font-size: 14px; font-weight: 500; color: var(--text-secondary);">dias</span></span>
        </div>
      </div>
    </div>
    
    <div class="stats-grid" style="margin-top: 12px;">
      <div class="glass-card">
        <span class="text-secondary" style="font-size: 11px; font-weight: 600; text-transform: uppercase;">Notas no Diário</span>
        <div class="stat-value">{{ insights.totalEntries }}</div>
      </div>
      <div class="glass-card">
        <span class="text-secondary" style="font-size: 11px; font-weight: 600; text-transform: uppercase;">Hábitos Feitos</span>
        <div class="stat-value" style="color: var(--success);">{{ insights.totalHabitCompletions }}</div>
      </div>
    </div>

    <!-- Mood Fluctuation Chart (7 Days) -->
    <div class="glass-card" style="margin-top: 16px;">
      <h3>Evolução de Humor (7 dias)</h3>
      
      <div class="chart-container">
        <div v-for="(day, index) in last7DaysChartData" :key="index" class="chart-bar-wrapper">
          <span style="font-size: 12px; margin-bottom: 2px;">{{ day.emoji }}</span>
          <div class="chart-bar-bg">
            <div class="chart-bar-fill" :style="{ height: day.height, backgroundColor: day.color }"></div>
          </div>
          <span class="chart-label">{{ day.dayLabel }}</span>
        </div>
      </div>
    </div>

    <!-- Habit Correlations -->
    <div class="glass-card" style="margin-top: 16px; margin-bottom: 20px;">
      <h3>Padrões e Correlações</h3>
      <p class="text-secondary" style="font-size: 12px; margin-top: 4px; margin-bottom: 12px;">Correlação entre os hábitos que você conclui e os humores que registra.</p>
      
      <div v-if="insights.correlations.length > 0" class="correlation-list">
        <div v-for="corr in insights.correlations" :key="corr.habitName" class="correlation-item">
          <div style="font-size: 20px;">{{ MOODS[corr.bestMood]?.emoji }}</div>
          <div style="flex: 1; font-size: 13px; line-height: 1.4;">
            Você se sente mais <strong :style="{ color: MOODS[corr.bestMood]?.color }">{{ MOODS[corr.bestMood]?.label }}</strong> 
            nos dias em que completa <strong>{{ corr.habitName }}</strong>.
          </div>
        </div>
      </div>
      
      <div v-else style="text-align: center; padding: 20px 10px; color: var(--text-secondary); border: 1px dashed var(--border-glass); border-radius: 16px;">
        <LucideIcon name="Sparkles" size="24" style="margin: 0 auto 8px auto; opacity: 0.5; color: var(--accent-purple);" />
        <p style="font-size: 12px; line-height: 1.4;">
          Continue registrando seus hábitos e diários para obtermos correlações de comportamento inteligentes!
        </p>
      </div>
    </div>
  </div>
</template>
