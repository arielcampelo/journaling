<script setup>
import { computed } from 'vue'
import { store, MOODS } from '../store'
import LucideIcon from './LucideIcon.vue'

// Format current date
const formattedDate = computed(() => {
  const options = { weekday: 'long', day: 'numeric', month: 'long' }
  const date = new Date()
  const rawStr = date.toLocaleDateString('pt-BR', options)
  return rawStr.charAt(0).toUpperCase() + rawStr.slice(1)
})

// Retrieve 10-day summary stats
const stats = computed(() => store.getLast10DaysStats())
</script>

<template>
  <div class="dashboard-view" style="display: flex; flex-direction: column; justify-content: center; min-height: 70vh; gap: 28px; padding: 10px 0;">
    <!-- Date Header -->
    <header style="text-align: center; margin-top: 5px;">
      <span class="text-secondary" style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; opacity: 0.8;">
        Hoje é
      </span>
      <h1 class="text-gradient" style="font-size: 28px; font-weight: 700; margin-top: 8px; letter-spacing: -0.5px;">
        {{ formattedDate }}
      </h1>
      <p class="text-secondary" style="font-size: 13px; margin-top: 6px; opacity: 0.6; font-style: italic;">
        "O que vamos cultivar hoje?"
      </p>
    </header>

    <!-- Navigation Menu Cards -->
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <!-- Menu Item: Diário -->
      <button class="glass-card menu-card" @click="store.setTab('journal')">
        <div class="menu-card-left">
          <div class="menu-icon-wrapper journal-theme">
            <LucideIcon name="BookOpen" size="22" />
          </div>
          <div class="menu-details">
            <h3>Diário de Pensamentos</h3>
            <p>Escreva e organize suas reflexões</p>
          </div>
        </div>
        <LucideIcon name="ChevronRight" size="18" class="chevron-icon" />
      </button>

      <!-- Menu Item: Hábitos -->
      <button class="glass-card menu-card" @click="store.setTab('habits')">
        <div class="menu-card-left">
          <div class="menu-icon-wrapper habits-theme">
            <LucideIcon name="Calendar" size="22" />
          </div>
          <div class="menu-details">
            <h3>Rastreador de Hábitos</h3>
            <p>Monitore suas metas e consistência</p>
          </div>
        </div>
        <LucideIcon name="ChevronRight" size="18" class="chevron-icon" />
      </button>

      <!-- Menu Item: Insights -->
      <button class="glass-card menu-card" @click="store.setTab('insights')">
        <div class="menu-card-left">
          <div class="menu-icon-wrapper insights-theme">
            <LucideIcon name="Sparkles" size="22" />
          </div>
          <div class="menu-details">
            <h3>Métricas & Insights</h3>
            <p>Analise a correlação de humor e rotina</p>
          </div>
        </div>
        <LucideIcon name="ChevronRight" size="18" class="chevron-icon" />
      </button>
    </div>

    <!-- Stats Summary Card (10 Days Overview) -->
    <div class="glass-card stats-summary-card">
      <h3 class="stats-summary-title">Resumo dos Últimos 10 Dias</h3>
      <div class="stats-summary-grid">
        <div class="stats-summary-item">
          <span class="stats-summary-label">Hábitos</span>
          <span class="stats-summary-val">{{ stats.habitRate }}%</span>
        </div>
        <div class="stats-summary-item">
          <span class="stats-summary-label">Humor</span>
          <span class="stats-summary-val" style="font-size: 13px;">
            {{ MOODS[stats.topMood] ? MOODS[stats.topMood].emoji + ' ' + MOODS[stats.topMood].label : 'Nenhum' }}
          </span>
        </div>
        <div class="stats-summary-item">
          <span class="stats-summary-label">Diários</span>
          <span class="stats-summary-val">{{ stats.entryCount }} notas</span>
        </div>
        <div class="stats-summary-item">
          <span class="stats-summary-label">Streak</span>
          <span class="stats-summary-val">🔥 {{ stats.maxStreak }}d</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.menu-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  border-radius: 24px;
  padding: 18px 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  color: inherit;
}

.menu-card:hover, .menu-card:active {
  transform: translateY(-3px);
  background: var(--bg-card-hover);
  border-color: var(--border-focus);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.2);
}

.menu-card-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-icon-wrapper {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  color: #fff;
}

.journal-theme {
  background: linear-gradient(135deg, var(--accent-purple), var(--accent-pink));
}

.habits-theme {
  background: linear-gradient(135deg, var(--mood-tired), var(--accent-purple));
}

.insights-theme {
  background: linear-gradient(135deg, var(--mood-happy), var(--accent-pink));
}

.menu-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.menu-details h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.menu-details p {
  font-size: 11px;
  color: var(--text-secondary);
}

.chevron-icon {
  color: var(--text-muted);
  transition: transform 0.3s ease;
}

.menu-card:hover .chevron-icon {
  transform: translateX(3px);
  color: var(--text-primary);
}

/* Stats Summary Card styles */
.stats-summary-card {
  padding: 16px 20px;
  background: rgba(151, 234, 210, 0.05); /* very subtle mint tint */
  border: 1px dashed var(--border-glass);
}

.stats-summary-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
  text-align: center;
}

.stats-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  text-align: center;
}

.stats-summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.stats-summary-label {
  font-size: 9px;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
}

.stats-summary-val {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}
</style>
